import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
// import { paths } from '$lib';
import {
	encodePassword,
	extractBase,
	getEntryByDn,
	getEntryBySAMAccountName,
	inferChange,
	replaceAttribute,
	sudo
} from '$lib/ldap';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { createUserSchema } from '$lib/schemas/user/create-user-schema';
import { deleteManyUsersSchema, deleteUserSchema } from '$lib/schemas/user/delete-user-schema';
import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
import {
	generateAccessToken,
	generateSessionToken,
	getAccessToken,
	setAccessCookie,
	setSessionCookie,
	verifyAccessToken
} from '$lib/server';
import { SESSION_ENTRY_ATTRIBUTES } from '$lib/types/session';
import type { User } from '$lib/types/user';
import { error, fail, redirect, type Action } from '@sveltejs/kit';
import {
	AlreadyExistsError,
	Attribute,
	Change,
	EqualityFilter,
	InsufficientAccessError,
	InvalidCredentialsError,
	OrFilter
} from 'ldapts';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const createUser: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');

	const form = await superValidate(event, zod(createUserSchema));
	if (!form.valid) return fail(400, withFiles({ form }));
	const { ldap } = auth;
	const { sAMAccountName, base, givenName, sn, mail, password, description, jpegPhotoBase64 } =
		form.data;
	const entry = await getEntryBySAMAccountName(ldap, sAMAccountName);

	if (entry) return setError(form, 'sAMAccountName', 'User already exists');
	const attributes: Record<string, string[] | string> = {
		objectClass: ['top', 'person', 'organizationalPerson', 'user'],
		userAccountControl: ['512'],
		displayName: givenName,
		sAMAccountName,
		givenName,
		mail
	};
	if (sn) {
		attributes['sn'] = sn;
		attributes['displayName'] = `${givenName} ${sn}`;
	}
	if (description) attributes['description'] = description;
	if (jpegPhotoBase64) {
		const [, content] = jpegPhotoBase64.split('base64,');
		attributes['jpegPhoto'] = Buffer.from(content, 'base64').toString('base64');
	}
	const dn = `CN=${sAMAccountName},${base}`;

	await ldap.add(dn, attributes);

	const encodedPassword = encodePassword(password);
	const passwordChange: Change = new Change({
		operation: 'replace',
		modification: new Attribute({ type: 'unicodePwd', values: [encodedPassword] })
	});

	try {
		await ldap.modify(dn, passwordChange);
	} catch (e) {
		console.log(e);
		if (e instanceof InsufficientAccessError) {
			console.log('deleting created user');
			await sudo((sudoLdap) => sudoLdap.del(dn));
			throw error(403, 'You dont have permission to perform this opperation!');
		}
		await ldap.del(dn);
		throw error(500, "Something unexpected happened while creating setting the user's password");
	}

	return withFiles({ form });
};
export const deleteUser: Action = async (event) => {
	const {
		locals
		// , params
	} = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const form = await superValidate(event, zod(deleteUserSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap } = auth;
	const { dn } = form.data;

	const user = await getEntryByDn<User>(ldap, dn);
	if (!user) throw error(404, 'User not found!');
	else if (user.isCriticalSystemObject === 'TRUE') {
		throw error(403, `User ${user.sAMAccountName} can not be deleted!`);
	}
	try {
		await ldap.del(dn);
	} catch (e) {
		console.log(e);
		throw error(500, 'Something unexpected happened while trying to delete ');
	}

	return { form };
};
export const deleteManyUsers: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const form = await superValidate(event, zod(deleteManyUsersSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap } = auth;
	const { dns } = form.data;
	const filter = new OrFilter({
		filters: dns.map((dn) => new EqualityFilter({ attribute: 'distinguishedName', value: dn }))
	});

	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
		filter: filter.toString()
	});
	const promises = searchEntries.map(async (entry) => {
		if (entry['isCriticalSystemObject'] === 'TRUE') {
			throw error(403, `Entry ${entry.sAMAccountName} can not be deleted!`);
		}
		return ldap.del(entry.dn).catch((e) => {
			console.log(e);
			throw error(
				500,
				`Something unexpected happened while deleting the user ${entry.sAMAccountName}`
			);
		});
	});

	await Promise.all(promises);

	return {
		form,
		success: true
	};
};
export const changeUserPassword: Action = async (event) => {
	const { locals, cookies } = event;
	const auth = await locals.auth();
	const access = getAccessToken(cookies);
	if (!access || !auth) throw redirect(302, '/'); //type narrowing

	const form = await superValidate(event, zod(changePasswordSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;
	const { dn, password, oldPassword } = form.data;

	const isUpdatingSelfPassword = session.distinguishedName === dn;

	const user = await getEntryByDn(ldap, dn);
	if (!user) throw error(404, 'User not found');
	console.log({ session });
	if (!session.isAdmin) {
		try {
			const { sAMAccountName } = user;
			await ldap.bind(`${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`, oldPassword);
		} catch (e) {
			console.log('Update password failed', { e });
			if (e instanceof InvalidCredentialsError) {
				return setError(form, 'oldPassword', 'Incorrect password');
			} else {
				throw error(500, 'Something unexpected happened while validating your password');
			}
		}
	}
	const encodedPassword = encodePassword(password);
	const passwordChange: Change = replaceAttribute({
		type: 'unicodePwd',
		values: [encodedPassword]
	});

	try {
		await ldap.modify(dn, passwordChange);
	} catch (e) {
		console.log(e);
		throw error(500, 'Something unexpected happened while changing the password');
	}
	if (isUpdatingSelfPassword) {
		//update access token
		const { email } = verifyAccessToken(access);
		const newAccess = generateAccessToken({ email, password });
		setAccessCookie(cookies, newAccess);
	}

	return { form };
};
export const updateUser: Action = async (event) => {
	const { locals, cookies } = event;
	const auth = await locals.auth();
	const access = getAccessToken(cookies);
	if (!access || !auth) throw redirect(302, '/'); //type narrowing

	const form = await superValidate(event, zod(updateUserSchema));
	if (!form.valid) return fail(400, withFiles({ form }));
	const { ldap, session } = auth;

	const { sAMAccountName, givenName, sn, mail, description, jpegPhotoBase64, dn } = form.data;

	const user = await getEntryByDn<User>(ldap, dn);
	if (!user) throw error(404, 'User not found');

	const displayName = `${givenName}` + (sn ? ` ${sn}` : '');

	const [, content] = jpegPhotoBase64?.split('base64,') || [];
	const jpegPhoto = content ? Buffer.from(content, 'base64').toString('base64') : undefined;

	const changes = [
		inferChange(user, 'sAMAccountName', sAMAccountName),
		inferChange(user, 'givenName', givenName),
		inferChange(user, 'sn', sn),
		inferChange(user, 'mail', mail),
		inferChange(user, 'description', description),
		inferChange(user, 'displayName', displayName),
		inferChange(user, 'jpegPhoto', jpegPhoto)
	].filter(Boolean) as Change[];

	if (!changes.length) throw error(400, 'No changes to apply');

	try {
		await ldap.modify(dn, changes);
	} catch (e) {
		console.log(e);
		if (e instanceof AlreadyExistsError) {
			return setError(form, 'sAMAccountName', 'sAMAccountName already in use!');
		} else if (e instanceof InsufficientAccessError) {
			throw error(403, "You don't have permission to edit this user!");
		}
		throw error(500, 'Something unexpected happened while updating the user');
	}
	if (sAMAccountName && sAMAccountName !== user.sAMAccountName) {
		const base = extractBase(user.dn);
		const newDN = `CN=${sAMAccountName},${base}`;
		try {
			await ldap.modifyDN(dn, newDN);
		} catch (e) {
			console.log(e);
			throw error(500, 'Something unexpected happened while updating the distinguishedName');
		}
	}
	const isSelfUpdating = session.distinguishedName === dn;
	if (isSelfUpdating) {
		const updatedUser = await getEntryBySAMAccountName<User>(ldap, sAMAccountName, {
			searchOpts: { attributes: SESSION_ENTRY_ATTRIBUTES }
		});
		const newSession = await generateSessionToken(ldap, updatedUser);
		setSessionCookie(cookies, newSession);
		const { password } = verifyAccessToken(access);
		const newAccess = generateAccessToken({
			email: `${updatedUser.sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`,
			password
		});
		setAccessCookie(cookies, newAccess);
	}

	return withFiles({ form });
};
