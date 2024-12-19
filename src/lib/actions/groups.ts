import { PUBLIC_BASE_DN } from '$env/static/public';
import {
	getBaseEntry,
	getEntryByDn,
	getGroupMembers,
	inferChange,
	validateGroupAmount
} from '$lib/ldap';
import { extractBase, getCNFromDN } from '$lib/ldap/utils';
import { deleteManySchema } from '$lib/schemas/delete-many-schema';
import { createGroupSchema } from '$lib/schemas/group/create-group-schema';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { updateGroupSchema } from '$lib/schemas/group/update-group-schema';
import { appLog, errorLog } from '$lib/server/logs';
import { GroupFlags, type Group } from '$lib/types/group';
import { error, fail, redirect, type Action } from '@sveltejs/kit';
import {
	AlreadyExistsError,
	Change,
	EqualityFilter,
	InsufficientAccessError,
	OrFilter
} from 'ldapts';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const createGroup: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');

	const form = await superValidate(event, zod(createGroupSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap } = auth;

	const canCreate = await validateGroupAmount(ldap);
	if (!canCreate) {
		await appLog(
			`(ReachedGroupLimit) User ${auth.session.sAMAccountName} tried creating a group but can not create more groups in this directory. Maximum amount reached.`,
			'Error'
		);
		throw error(403, 'Can not create more groups in this directory');
	}
	const { base, groupType, mail, sAMAccountName, description } = form.data;

	const attributes: Record<string, string[] | string> = {
		objectClass: ['group'],
		sAMAccountName
	};
	if (description) attributes['description'] = description;
	if (mail) attributes['mail'] = mail;

	//add global scope to group (+2)
	const withGlobalScope = groupType + 2;

	attributes['groupType'] = withGlobalScope.toString();

	const baseEntry = await getBaseEntry(ldap, base);
	let dn = `CN=${sAMAccountName}`;
	const baseIsGroup = baseEntry.objectClass.includes('group');

	if (baseIsGroup) {
		dn += `,CN=Users,${PUBLIC_BASE_DN}`;
	} else {
		dn += `,${base}`;
	}

	try {
		await ldap.add(dn, attributes);
	} catch (e) {
		if (e instanceof AlreadyExistsError) {
			return setError(form, 'sAMAccountName', 'sAMAccountName already in use!');
		} else if (e instanceof InsufficientAccessError) {
			await appLog(
				`(InsufficientAccessError) User ${auth.session.sAMAccountName} tried creating a group without having enough access`,
				'Error'
			);
			throw error(403, "You don't have permission to create groups");
		}
		const message = 'Something unexpected happened while creating the group';
		const errorId = await errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	await appLog(`${auth.session.sAMAccountName} created group: ${dn}`);

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
			const message = `Something went wrong adding the group to ${group.sAMAccountName}'s members`;
			const errorId = await errorLog(e, { message });
			throw error(500, { message, errorId });
		}
	}

	const group = await getEntryByDn<Group>(ldap, dn);
	return { form, group };
};

export const deleteGroup: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const form = await superValidate(event, zod(deleteGroupSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;
	const { dn } = form.data;

	const group = await getEntryByDn<Group>(ldap, dn);
	if (!group) throw error(404, 'Group not found!');
	else if (group.isCriticalSystemObject === 'TRUE') {
		await appLog(
			`(CriticalSystemObject) User ${session.sAMAccountName} tried deleting group ${dn} but is a critical system object and can not be deleted!`,
			'Error'
		);
		throw error(403, `Group ${group.sAMAccountName} can not be deleted!`);
	}
	try {
		await ldap.del(dn);
	} catch (e) {
		if (e instanceof InsufficientAccessError) {
			await appLog(
				`(InsufficientAccessError) User ${session.sAMAccountName} tried deleting a group (${dn}) but does not have enough access`,
				'Error'
			);
			throw error(403, "You don't have permission to delete groups!");
		}
		const message = `Something unexpected happened while trying to delete ${group.sAMAccountName}`;
		const errorId = await errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	await appLog(`User ${session.sAMAccountName} deleted group ${dn}`);

	return { form };
};

export const deleteManyGroups: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const form = await superValidate(event, zod(deleteManySchema));
	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;
	const { dns } = form.data;
	const filter = new OrFilter({
		filters: dns.map((dn) => new EqualityFilter({ attribute: 'distinguishedName', value: dn }))
	});

	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, { filter });
	const promises = searchEntries.map(async (entry) => {
		if (entry['isCriticalSystemObject'] === 'TRUE') {
			await appLog(
				`(CriticalSystemObject) User ${session.sAMAccountName} tried deleting ${entry.dn} but is a critical system object and can not be deleted!`,
				'Error'
			);
			throw error(403, `Entry ${entry.sAMAccountName} can not be deleted!`);
		}
		return ldap.del(entry.dn).catch(async (e) => {
			const message = `Something unexpected happened while deleting the group ${entry.sAMAccountName}`;
			const errorId = await errorLog(e, { message });
			throw error(500, { message, errorId });
		});
	});

	await Promise.all(promises);
	if (dns.length === 1) await appLog(`User ${session.sAMAccountName} deleted group ${dns[0]}`);
	else
		await appLog(
			`User ${session.sAMAccountName} deleted several groups: ${dns.map(getCNFromDN).join(', ')}`
		);
	return { form };
};

export const updateGroup: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth'); //type narrowing
	const form = await superValidate(event, zod(updateGroupSchema));

	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;

	const { groupType, mail, sAMAccountName, description, dn } = form.data;

	const group = await getEntryByDn<Group>(ldap, dn);
	if (!group) throw error(404, 'Group not found');

	//add global scope to group (+2)
	const withGlobalScope = groupType + GroupFlags['Global Scope'];
	const sAMAccountNameChange = inferChange(group, 'sAMAccountName', sAMAccountName);

	const changes = [
		sAMAccountNameChange,
		inferChange(group, 'groupType', withGlobalScope.toString()),
		inferChange(group, 'mail', mail),
		inferChange(group, 'description', description)
	].filter(Boolean) as Change[];

	if (!changes.length) throw error(400, 'No changes to apply');

	try {
		await ldap.modify(dn, changes);
	} catch (e) {
		if (e instanceof AlreadyExistsError) {
			return setError(form, 'sAMAccountName', 'sAMAccountName already in use!');
		} else if (e instanceof InsufficientAccessError) {
			await appLog(
				`(InsufficientAccessError) User ${session.sAMAccountName} tried updating group ${dn} but does not have enough access`,
				'Error'
			);
			throw error(403, { message: "You don't have permission to edit groups!" });
		}
		const message = `Something unexpected happened while updating ${group.sAMAccountName}`;
		const errorId = await errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	if (sAMAccountNameChange) {
		const base = extractBase(group.dn);
		const newDn = `CN=${sAMAccountName},${base}`;
		await appLog(`User ${session.sAMAccountName} updated group ${dn} -> ${newDn}`);
		try {
			await ldap.modifyDN(dn, newDn);
		} catch (e) {
			const message = `Something unexpected happened while updating ${group.sAMAccountName}'s distinguishedName`;
			const errorId = await errorLog(e, { message });
			throw error(500, { message, errorId });
		}
	} else {
		await appLog(`User ${session.sAMAccountName} updated group ${dn}`);
	}
	return {
		form,
		nameChange: { oldDn: group.dn, newDn: `CN=${sAMAccountName},${extractBase(group.dn)}` }
	};
};

export const setMembers: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth'); //type narrowing
	const form = await superValidate(event, zod(setMembersSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;
	const { dns, groupDn } = form.data;

	const group = await getEntryByDn<Group>(ldap, groupDn);
	const change = inferChange(group, 'member', dns);
	if (!change) return { form };

	try {
		await ldap.modify(groupDn, change);
	} catch (e) {
		if (e instanceof InsufficientAccessError) {
			await appLog(
				`(InsufficientAccessError) User ${session.sAMAccountName} tried setting the members of ${groupDn} but does not have enough access`,
				'Error'
			);
			throw error(403, { message: "You don't have permission to edit groups!" });
		}
		const message = `Something went wrong setting the ${group.sAMAccountName} members`;
		const errorId = await errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	await appLog(`User ${session.sAMAccountName} set the members of ${groupDn}`);
	return { form };
};
