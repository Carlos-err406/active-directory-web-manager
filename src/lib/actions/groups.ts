import { PUBLIC_BASE_DN } from '$env/static/public';
import { getEntryByDn, inferChange } from '$lib/ldap';
import { deleteManySchema } from '$lib/schemas/delete-many-schema';
import { createGroupSchema } from '$lib/schemas/group/create-group-schema';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { updateGroupSchema } from '$lib/schemas/group/update-group-schema';
import type { Group } from '$lib/types/group';
import { error, fail, redirect, type Action } from '@sveltejs/kit';
import { AlreadyExistsError, EqualityFilter, InsufficientAccessError, OrFilter } from 'ldapts';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const createGroup: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const form = await superValidate(event, zod(createGroupSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap } = auth;
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

	const dn = `CN=${sAMAccountName},${base}`;
	try {
		await ldap.add(dn, attributes);
	} catch (e) {
		console.log(e);
		if (e instanceof AlreadyExistsError) {
			return setError(form, 'sAMAccountName', 'sAMAccountName already in use!');
		} else if (e instanceof InsufficientAccessError) {
			throw error(403, "You don't have permission to create groups!");
		}
		throw error(500, 'Something unexpected happened while creating the group');
	}
	const group = await getEntryByDn<Group>(ldap, dn);

	return { form, group };
};

export const deleteGroup: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const form = await superValidate(event, zod(deleteGroupSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap } = auth;
	const { dn } = form.data;

	const group = await getEntryByDn<Group>(ldap, dn);
	if (!group) throw error(404, 'Group not found!');
	else if (group.isCriticalSystemObject === 'TRUE') {
		throw error(403, `Group ${group.sAMAccountName} can not be deleted!`);
	}
	try {
		await ldap.del(dn);
	} catch (e) {
		console.log(e);
		throw error(
			500,
			`Something unexpected happened while trying to delete ${group.sAMAccountName}`
		);
	}
	return { form };
};

export const deleteManyGroups: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const form = await superValidate(event, zod(deleteManySchema));
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
				`Something unexpected happened while deleting the group ${entry.sAMAccountName}`
			);
		});
	});

	await Promise.all(promises);

	return { form };
};

export const updateGroup: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/'); //type narrowing
	const form = await superValidate(event, zod(updateGroupSchema));
	if (!form.valid) return fail(400, { form });

	return { form };
};

export const setMembers: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/'); //type narrowing
	const form = await superValidate(event, zod(setMembersSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap } = auth;
	const { dns, groupDn } = form.data;

	const group = await getEntryByDn(ldap, groupDn);
	const change = inferChange(group, 'member', dns);
	if (!change) return { form };

	try {
		await ldap.modify(groupDn, change);
	} catch (e) {
		console.log(e);
		throw error(500, "Something went wrong setting the group's members");
	}

	return { form };
};
