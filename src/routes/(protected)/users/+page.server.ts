import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { search } from '$lib/actions';
import {
	deleteAttribute,
	encodePassword,
	extractBase,
	getEntryByDn,
	getEntryBySAMAccountName,
	replaceAttribute
} from '$lib/ldap';
import { extractPagination, type PaginationWithUrls } from '$lib/pagination';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { createUserSchema } from '$lib/schemas/user/create-user-schema';
import { deleteManyUsersSchema, deleteUserSchema } from '$lib/schemas/user/delete-user.schema';
import { updateUserSchema } from '$lib/schemas/user/update-user.schema';
import {
	generateAccessToken,
	generateSessionToken,
	getAccessToken,
	setAccessCookie,
	setSessionCookie,
	verifyAccessToken
} from '$lib/server';
import { jpegPhotoToB64 } from '$lib/transforms';
import { SESSION_ENTRY_ATTRIBUTES } from '$lib/types/session';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import {
	AlreadyExistsError,
	AndFilter,
	Attribute,
	Change,
	EqualityFilter,
	InvalidCredentialsError,
	NotFilter,
	OrFilter,
	SubstringFilter,
	type Filter
} from 'ldapts';
import { fail, setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 } from 'uuid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals, depends }) => {
	depends('protected:users');
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap } = auth;
	const { searchParams, pathname } = url;

	const sAMAccountNameQuery = searchParams.get('q');
	const page = Number(searchParams.get('page') || 1);
	const pageSize = Number(searchParams.get('pageSize') || 10);
	const sortAttribute = searchParams.get('sort') || 'sAMAccountName';
	const order = searchParams.get('order') || 'asc';

	const filters: Filter[] = [
		new NotFilter({
			filter: new EqualityFilter({ attribute: 'objectClass', value: 'computer' })
		}),
		...['top', 'person', 'organizationalPerson', 'user'].map(
			(objectClass) => new EqualityFilter({ attribute: 'objectClass', value: objectClass })
		)
	];
	sAMAccountNameQuery &&
		filters.push(new SubstringFilter({ attribute: 'sAMAccountName', any: [sAMAccountNameQuery] }));

	const filter = new AndFilter({ filters });
	try {
		const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
			filter: filter.toString()
		});

		searchEntries.sort((a, b) => {
			if ((a[sortAttribute] || '-') < (b[sortAttribute] || '-')) return order === 'asc' ? -1 : 1;
			if ((a[sortAttribute] || '-') > (b[sortAttribute] || '-')) return order === 'asc' ? 1 : -1;
			return 0;
		});
		const pagination = extractPagination<User>(searchEntries as User[], page, pageSize);

		pagination.data.map(jpegPhotoToB64);

		const previousPageSearchParams = new URLSearchParams(searchParams);
		if (page - 1 > 0) previousPageSearchParams.set('page', (page - 1).toString());

		const nextPageSearchParams = new URLSearchParams(searchParams);
		if (page < pagination.totalPages) nextPageSearchParams.set('page', (page + 1).toString());

		const paginationWithURLs: PaginationWithUrls<User> = {
			...pagination,
			nextPage:
				page >= pagination.totalPages ? null : `${pathname}?${nextPageSearchParams.toString()}`,
			previousPage: page <= 1 ? null : `${pathname}?${previousPageSearchParams.toString()}`
		};

		const [
			deleteManyUsersForm,
			deleteUserForm,
			createUserForm,
			updateUserForm,
			changePasswordForm
		] = await Promise.all([
			superValidate(zod(deleteManyUsersSchema)),
			superValidate(zod(deleteUserSchema)),
			superValidate(zod(createUserSchema)),
			superValidate(zod(updateUserSchema)),
			superValidate(zod(changePasswordSchema))
		]);

		return {
			pagination: paginationWithURLs,
			deleteManyUsersForm,
			deleteUserForm,
			createUserForm,
			updateUserForm,
			changePasswordForm
		};
	} catch (e) {
		const errorId = v4();
		console.log({ errorId, e });
		throw error(500, {
			message: 'Something unexpected happened while retrieving the users, try again later',
			errorId
		});
	} finally {
		await ldap.unbind();
	}
};

export const actions: Actions = {
	search,
	create: async (event) => {
		const { locals } = event;
		const auth = await locals.auth();
		if (!auth) throw redirect(302, '/');

		const form = await superValidate(event, zod(createUserSchema));
		if (!form.valid) return fail(400, { form });
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
			console.log('deleting created user');
			await ldap.del(dn);
			throw error(500, "Something unexpected happened while creating setting the user's password");
		}

		await ldap.unbind();
		return withFiles({ form });
	},
	delete: async (event) => {
		const { locals } = event;
		const auth = await locals.auth();
		if (!auth) throw redirect(302, '/');
		const form = await superValidate(event, zod(deleteUserSchema));
		if (!form.valid) return fail(400, { form });
		const { ldap } = auth;
		const { dn } = form.data;

		const filter = new EqualityFilter({ attribute: 'distinguishedName', value: dn });
		const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
			filter: filter.toString()
		});
		const [entry] = searchEntries;
		if (!entry) {
			throw error(404, 'User not found');
		} else if (entry['isCriticalSystemObject'] === 'TRUE') {
			throw error(403, 'This entry can not be deleted!');
		}
		await ldap.del(dn);
		await ldap.unbind();
		return {
			success: true
		};
	},
	deleteMany: async (event) => {
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

		await ldap.unbind();
		return {
			form,
			success: true
		};
	},
	changePassword: async (event) => {
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
		await ldap.unbind();
		return { form };
	},
	update: async (event) => {
		const { locals, cookies } = event;
		const auth = await locals.auth();
		const access = getAccessToken(cookies);
		if (!access || !auth) throw redirect(302, '/'); //type narrowing

		const form = await superValidate(event, zod(updateUserSchema));
		if (!form.valid) return fail(400, { form });
		const { ldap, session } = auth;

		const { sAMAccountName, givenName, sn, mail, description, jpegPhotoBase64, dn } = form.data;

		const user = await getEntryByDn<User>(ldap, dn);
		if (!user) throw error(404, 'User not found');

		const changes: Change[] = [];

		if (sAMAccountName && sAMAccountName !== user.sAMAccountName)
			changes.push(replaceAttribute({ type: 'sAMAccountName', values: [sAMAccountName] }));

		if (givenName && givenName !== user.givenName)
			changes.push(replaceAttribute({ type: 'givenName', values: [givenName] }));

		if (description && description !== user.description)
			changes.push(replaceAttribute({ type: 'description', values: [description] }));
		else changes.push(deleteAttribute('description'));

		if (sn && sn !== user.sn) changes.push(replaceAttribute({ type: 'sn', values: [sn] }));
		else changes.push(deleteAttribute('sn'));

		if (mail && mail !== user.mail)
			changes.push(replaceAttribute({ type: 'mail', values: [mail] }));
		else changes.push(deleteAttribute('mail'));

		const displayNamePlaceholder = `${givenName} ${sn}`;
		if (displayNamePlaceholder !== user.displayName)
			changes.push(replaceAttribute({ type: 'displayName', values: [displayNamePlaceholder] }));

		if (jpegPhotoBase64) {
			const [, content] = jpegPhotoBase64.split('base64,');
			const jpegPhoto = Buffer.from(content, 'base64').toString('base64');
			changes.push(replaceAttribute({ type: 'jpegPhoto', values: [jpegPhoto] }));
		} else {
			changes.push(deleteAttribute('jpegPhoto'));
		}

		try {
			await ldap.modify(dn, changes);
		} catch (e) {
			console.log(e);
			if (e instanceof AlreadyExistsError) {
				return setError(form, 'sAMAccountName', 'sAMAccountName already in use!');
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

		await ldap.unbind();
		return withFiles({ form });
	}
};
