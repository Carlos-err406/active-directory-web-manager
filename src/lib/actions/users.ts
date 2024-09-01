import config from '$config';
import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import {
	encodePassword,
	getBaseEntry,
	getEntryByDn,
	getEntryBySAMAccountName,
	getGroupMembers,
	inferChange,
	replaceAttribute,
	sudo,
	validateUserAmount
} from '$lib/ldap';
import { getLDAPClient } from '$lib/ldap/client';
import { extractBase, getCNFromDN } from '$lib/ldap/utils';
import { deleteManySchema } from '$lib/schemas/delete-many-schema';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { createUserSchema } from '$lib/schemas/user/create-user-schema';
import { deleteUserSchema } from '$lib/schemas/user/delete-user-schema';
import { updateMembershipSchema } from '$lib/schemas/user/update-membership';
import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
import {
	generateAccessToken,
	generateSessionToken,
	getAccessToken,
	setAccessCookie,
	setSessionCookie,
	verifyAccessToken
} from '$lib/server';
import { appLog, errorLog } from '$lib/server/logs';
import type { Group } from '$lib/types/group';
import { SESSION_ENTRY_ATTRIBUTES } from '$lib/types/session';
import { type User } from '$lib/types/user';
import { error, fail, redirect, type Action } from '@sveltejs/kit';
import {
	AlreadyExistsError,
	Attribute,
	Change,
	EqualityFilter,
	InsufficientAccessError,
	InvalidCredentialsError,
	OrFilter,
	UnknownStatusCodeError
} from 'ldapts';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const createUser: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');

	const form = await superValidate(event, zod(createUserSchema));
	if (!form.valid) return fail(400, withFiles({ form }));
	const { ldap, session } = auth;

	const canCreate = await validateUserAmount(ldap);
	if (!canCreate) {
		appLog(
			`(ReachedUserLimit) User ${session.sAMAccountName} tried creating a user but can not create more users in this directory. Maximum amount reached.`,
			'Error'
		);
		throw error(403, 'Can not create more users in this directory');
	}
	const {
		sAMAccountName,
		base,
		givenName,
		sn,
		mail,
		password,
		description,
		jpegPhotoBase64,
		...uacFlags
	} = form.data;
	const uac = Object.entries(uacFlags).reduce((acc, [key, value]) => {
		if (!key.startsWith('uac.') || !value) return acc;
		const flag = Number(key.slice(4));
		return (acc += flag);
	}, 0);

	const attributes: Attribute[] = [
		new Attribute({
			type: 'objectClass',
			values: ['top', 'person', 'organizationalPerson', 'user']
		}),
		new Attribute({ type: 'displayName', values: [givenName] }),
		new Attribute({ type: 'sAMAccountName', values: [sAMAccountName] }),
		new Attribute({ type: 'givenName', values: [givenName] }),
		new Attribute({ type: 'mail', values: [mail] }),
		new Attribute({ type: 'unicodePwd', values: [encodePassword(password)] })
	];
	if (uac > 0)
		attributes.push(new Attribute({ type: 'userAccountControl', values: [String(uac)] }));

	if (sn) {
		attributes.push(new Attribute({ type: 'sn', values: [sn] }));
		const displayNameIndex = attributes.findIndex((att) => att.type === 'displayName');
		attributes[displayNameIndex].values = [`${givenName} ${sn}`];
	}
	if (description) attributes.push(new Attribute({ type: 'description', values: [description] }));
	if (jpegPhotoBase64) {
		const [, content] = jpegPhotoBase64.split('base64,');
		attributes.push(
			new Attribute({
				type: 'jpegPhoto',
				values: [Buffer.from(content, 'base64').toString('base64')]
			})
		);
	}

	const baseEntry = await getBaseEntry(ldap, base);
	let dn = `CN=${sAMAccountName},`;
	const baseIsGroup = baseEntry.objectClass.includes('group');
	if (baseIsGroup) {
		dn += extractBase(baseEntry.distinguishedName); //so the user is actually created at the same level as the group
	} else {
		dn += base;
	}
	//create the user
	try {
		await ldap.add(dn, attributes);
	} catch (e) {
		if (e instanceof AlreadyExistsError) {
			return setError(form, 'sAMAccountName', 'sAMAccountName already in use!');
		} else if (e instanceof InsufficientAccessError) {
			appLog(
				`(InsufficientAccessError) User ${session.sAMAccountName} tried creating a user without having enough access`,
				'Error'
			);
			throw error(403, "You don't have permission to create users!");
		}
		const message = 'Something unexpected happened while creating the user';
		const errorId = errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	appLog(`${session.sAMAccountName} created user: ${dn}`);

	//add to group
	if (baseIsGroup) {
		const group = await getEntryByDn(ldap, baseEntry.distinguishedName, {
			searchOpts: { attributes: ['dn', 'distinguishedName', 'member', 'sAMAccountName'] }
		});
		const members = await getGroupMembers(ldap, baseEntry.distinguishedName);
		const change = inferChange(group, 'member', [...members, dn]);

		try {
			await ldap.modify(baseEntry.distinguishedName, change!);
		} catch (e) {
			const message = `Something went wrong adding the user to ${group.sAMAccountName}'s members`;
			const errorId = errorLog(e, { message });
			throw error(500, { message, errorId });
		}
	}
	return withFiles({ form });
};

export const deleteUser: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const form = await superValidate(event, zod(deleteUserSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap } = auth;
	const { dn } = form.data;

	const user = await getEntryByDn<User>(ldap, dn);
	if (!user) throw error(404, 'User not found!');
	else if (user.isCriticalSystemObject === 'TRUE') {
		appLog(
			`(CriticalSystemObject) User ${auth.session.sAMAccountName} tried deleting ${dn} but is a critical system object and can not be deleted!`,
			'Error'
		);
		throw error(403, `User ${user.sAMAccountName} can not be deleted!`);
	}
	try {
		await ldap.del(dn);
	} catch (e) {
		console.log(e);
		if (e instanceof InsufficientAccessError) {
			appLog(
				`(InsufficientAccessError) User ${auth.session.sAMAccountName} tried deleting a user (${dn}) but does not have enough access`,
				'Error'
			);
			throw error(403, "You don't have permission to delete users!");
		}
		const message = `Something unexpected happened while trying to delete ${user.sAMAccountName}`;
		const errorId = errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	appLog(`User ${auth.session.sAMAccountName} deleted user ${dn}`);
	return { form };
};

export const deleteManyUsers: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const form = await superValidate(event, zod(deleteManySchema));
	if (!form.valid) return fail(400, { form });
	const { ldap } = auth;
	const { dns } = form.data;
	if (!dns.length) throw error(400, 'No users selected!');
	const filter = new OrFilter({
		filters: dns.map((dn) => new EqualityFilter({ attribute: 'distinguishedName', value: dn }))
	});

	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, { filter });
	const promises = searchEntries.map(async (entry) => {
		if (entry['isCriticalSystemObject'] === 'TRUE') {
			appLog(
				`(CriticalSystemObject) User ${auth.session.sAMAccountName} tried deleting ${entry.dn} but is a critical system object and can not be deleted!`,
				'Error'
			);
			throw error(403, `Entry ${entry.sAMAccountName} can not be deleted!`);
		}
		return ldap.del(entry.dn).catch((e) => {
			const message = `Something unexpected happened while deleting the user ${entry.sAMAccountName}`;
			const errorId = errorLog(e, { message });
			throw error(500, { message, errorId });
		});
	});

	await Promise.all(promises);
	if (dns.length === 1) appLog(`User ${auth.session.sAMAccountName} deleted user ${dns[0]}`);
	else
		appLog(
			`User ${auth.session.sAMAccountName} deleted several users: ${dns.map(getCNFromDN).join(', ')}`
		);
	return { form };
};

export const changeUserPassword: Action = async (event) => {
	const { locals, cookies } = event;
	const auth = await locals.auth();
	const access = getAccessToken(cookies);
	if (!access || !auth) throw redirect(302, '/auth'); //type narrowing

	const form = await superValidate(event, zod(changePasswordSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;
	const { dn, password, oldPassword } = form.data;

	const isUpdatingSelfPassword = session.distinguishedName === dn;

	const user = await getEntryByDn<User>(ldap, dn);
	if (!user) throw error(404, 'User not found');
	if (!session.isAdmin) {
		try {
			const { sAMAccountName } = user;
			const testPasswordLdap = getLDAPClient();
			await testPasswordLdap.bind(`${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`, oldPassword);
			await testPasswordLdap.unbind();
		} catch (e) {
			if (e instanceof InvalidCredentialsError) {
				if (isUpdatingSelfPassword)
					appLog(
						`(InvalidCredentialsError) User ${auth.session.sAMAccountName} tried changing its own password but old password was incorrect`,
						'Error'
					);
				else
					appLog(
						`(InvalidCredentialsError) User ${auth.session.sAMAccountName} tried changing ${user.sAMAccountName}'s password but old password was incorrect`,
						'Error'
					);

				return setError(form, 'oldPassword', 'Incorrect password');
			} else {
				const message = `Something unexpected happened while validating the password`;
				const errorId = errorLog(e, { message });
				throw error(500, { message, errorId });
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
		const message = `Something unexpected happened while changing ${user.sAMAccountName}'s password`;
		const errorId = errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	if (isUpdatingSelfPassword) {
		appLog(`User ${auth.session.sAMAccountName} changed its own password`);
		//update access token
		const { email } = verifyAccessToken(access);
		const newAccess = generateAccessToken({ email, password });
		setAccessCookie(cookies, newAccess);
	} else {
		appLog(`User ${auth.session.sAMAccountName} changed ${user.sAMAccountName}'s password`);
	}
	return { form };
};

export const updateUser: Action = async (event) => {
	const { locals, cookies, params } = event;
	const auth = await locals.auth();
	const access = getAccessToken(cookies);
	if (!access || !auth) throw redirect(302, '/auth'); //type narrowing
	const { dn } = params;

	if (!dn) throw error(400, 'No user DN provided');

	const { ldap, session } = auth;

	const isSelfUpdating = dn === session.dn;

	if (isSelfUpdating && !session.isAdmin && !config.app.nonAdmin.allowSelfEdit) {
		appLog(
			`User ${session.sAMAccountName} tried updating its own profile but non-admin self-update is disabled by configuration`,
			'Error'
		);
		throw error(403, 'Non-Admin self-update is disabled by configuration');
	}

	const form = await superValidate(event, zod(updateUserSchema));
	if (!form.valid) return fail(400, withFiles({ form }));

	const { sAMAccountName, givenName, sn, mail, description, jpegPhotoBase64, ...uacFlags } =
		form.data;
	const user = await getEntryByDn<User>(ldap, dn);
	if (!user) throw error(404, 'User not found');

	const uac = Object.entries(uacFlags).reduce((acc, [key, value]) => {
		if (!key.startsWith('uac.') || !value) return acc;
		const flag = Number(key.slice(4));
		return (acc += flag);
	}, 0);
	const displayName = `${givenName}` + (sn ? ` ${sn}` : '');
	const [, content] = jpegPhotoBase64?.split('base64,') || [];
	const jpegPhoto = content ? Buffer.from(content, 'base64').toString('base64') : undefined;
	const sAMAccountNameChange = inferChange(user, 'sAMAccountName', sAMAccountName);
	const uacChange = uac > 0 ? inferChange(user, 'userAccountControl', String(uac)) : undefined;
	const changes = [
		sAMAccountNameChange,
		uacChange,
		inferChange(user, 'givenName', givenName),
		inferChange(user, 'sn', sn),
		inferChange(user, 'mail', mail),
		inferChange(user, 'description', description),
		inferChange(user, 'displayName', displayName),
		inferChange(user, 'jpegPhoto', jpegPhoto)
	].filter(Boolean) as Change[];

	if (!changes.length) throw error(400, 'No changes to apply');

	try {
		if (isSelfUpdating && !session.isAdmin) {
			await sudo((ldap) => ldap.modify(dn, changes));
		} else {
			await ldap.modify(dn, changes);
		}
	} catch (e) {
		if (e instanceof AlreadyExistsError) {
			return setError(form, 'sAMAccountName', 'sAMAccountName already in use!');
		} else if (e instanceof InsufficientAccessError) {
			appLog(
				`(InsufficientAccessError) User ${session.sAMAccountName} tried updating user ${dn} but does not have enough access`,
				'Error'
			);
			throw error(403, { message: "You don't have permission to edit this user!" });
		} else if (e instanceof UnknownStatusCodeError) {
			const { message } = e;
			appLog(
				`(UnknownStatusCodeError) User ${session.sAMAccountName} tried updating user ${dn} but ldap server returned: ${message}`,
				'Error'
			);
			const parsedMessage = message.split(':')[1].slice(0, -5).trim();
			throw error(400, parsedMessage);
		}
		const message = `Something unexpected happened while updating ${user.sAMAccountName}`;
		const errorId = errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	if (sAMAccountNameChange) {
		const base = extractBase(user.dn);
		const newDN = `CN=${sAMAccountName},${base}`;
		try {
			if (isSelfUpdating && !session.isAdmin) {
				await sudo((ldap) => ldap.modifyDN(dn, newDN));
			} else {
				await ldap.modifyDN(dn, newDN);
			}
		} catch (e) {
			const message = `Something unexpected happened while updating ${user.sAMAccountName}'s distinguishedName`;
			const errorId = errorLog(e, { message });
			throw error(500, { message, errorId });
		}
	}
	const updatedUser = await getEntryBySAMAccountName<User>(ldap, sAMAccountName, {
		searchOpts: { attributes: SESSION_ENTRY_ATTRIBUTES }
	});
	if (isSelfUpdating) {
		appLog(`User ${session.sAMAccountName} updated its own profile`);

		const newSession = await generateSessionToken(ldap, updatedUser);
		setSessionCookie(cookies, newSession);
		const { password } = verifyAccessToken(access);
		const newAccess = generateAccessToken({
			email: `${updatedUser.sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`,
			password
		});
		setAccessCookie(cookies, newAccess);
	} else {
		appLog(`User ${session.sAMAccountName} updated ${updatedUser.sAMAccountName}'s profile`);
	}
	return withFiles({
		form,
		nameChange: { oldDn: user.dn, newDn: `CN=${sAMAccountName},${extractBase(user.dn)}` }
	});
};

export const updateMembership: Action = async (event) => {
	const { locals, params } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth'); //type narrowing
	const { dn: userDn } = params;
	if (!userDn) throw error(400, 'No user DN was provided');
	const form = await superValidate(event, zod(updateMembershipSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap } = auth;
	const { dns } = form.data;
	const user = await getEntryByDn<User>(ldap, userDn);
	const currentUserGroups = new Set(user.memberOf);
	const newGroups = new Set(dns);
	const groupsToAdd = Array.from(newGroups).filter((dn) => !currentUserGroups.has(dn));
	const groupsToRemove = Array.from(currentUserGroups).filter((dn) => !newGroups.has(dn));
	const filter = new OrFilter({
		filters: [...groupsToAdd, ...groupsToRemove].map(
			(dn) => new EqualityFilter({ attribute: 'distinguishedName', value: dn })
		)
	}).toString();

	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, { filter });
	const promises = searchEntries.map(async (group) => {
		const { member, distinguishedName } = group as Group;
		const members = new Set(!member ? [] : Array.isArray(member) ? member : [member]);
		if (groupsToAdd.includes(distinguishedName)) {
			members.add(user.dn);
		} else if (groupsToRemove.includes(distinguishedName)) {
			members.delete(user.dn);
		}
		const change = inferChange(group, 'member', Array.from(members));
		if (!change) return;
		return ldap.modify(distinguishedName, change);
	});
	try {
		await Promise.all(promises);
	} catch (e) {
		const message = `Something went wrong updating ${user.sAMAccountName}'s groups`;
		const errorId = errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	appLog(
		`User ${auth.session.sAMAccountName} set ${user.sAMAccountName}'s group membership to: ${dns.map(getCNFromDN).join(', ')}`
	);
	return { form };
};
