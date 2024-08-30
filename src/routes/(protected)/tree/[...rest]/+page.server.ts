import config from '$config';
import { PUBLIC_BASE_DN } from '$env/static/public';
import { getBaseEntry, getGroupMembers, getHideFilters } from '$lib/ldap';
import { deleteManySchema } from '$lib/schemas/delete-many-schema';
import { createGroupSchema } from '$lib/schemas/group/create-group-schema';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { updateGroupSchema } from '$lib/schemas/group/update-group-schema';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { createUserSchema } from '$lib/schemas/user/create-user-schema';
import { deleteUserSchema } from '$lib/schemas/user/delete-user-schema';
import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
import { protectedAccessControl } from '$lib/server/utils';
import type { TreeEntry } from '$lib/types/tree';
import { AndFilter, Client } from 'ldapts';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import {
	getMembersFilter,
	getObjectClassFilter,
	getQueryFilter,
	throwIfIsHiddenEntry,
	treeSearch
} from './utils.server';

export const load = async ({ url, locals, params }: Parameters<PageServerLoad>[0]) => {
	const auth = await protectedAccessControl({ locals, url });
	const { ldap, session } = auth;
	const splittedDn = params.rest.split('/').filter(Boolean).reverse();
	const activeDns = splittedDn
		.map((_, index) => `${splittedDn.slice(index).join(',')},${PUBLIC_BASE_DN}`)
		.reverse();
	throwIfIsHiddenEntry(`${splittedDn.join(',')},${PUBLIC_BASE_DN}`, session, url);
	const dns = [PUBLIC_BASE_DN, ...activeDns];
	const q = url.searchParams.get('q');
	return {
		searchForm: true,
		withoutPages: true,
		entries: dns.map((dn) => getChildren(ldap, dn, q)),
		activeDns,
		deleteManyUsersForm: await superValidate(zod(deleteManySchema)),
		deleteUserForm: await superValidate(zod(deleteUserSchema)),
		createUserForm: await superValidate(zod(createUserSchema)),
		updateUserForm: await superValidate(zod(updateUserSchema)),
		changePasswordForm: await superValidate(zod(changePasswordSchema)),
		deleteManyGroupsForm: await superValidate(zod(deleteManySchema)),
		deleteGroupForm: await superValidate(zod(deleteGroupSchema)),
		createGroupForm: await superValidate(zod(createGroupSchema)),
		updateGroupForm: await superValidate(zod(updateGroupSchema)),
		setMembersForm: await superValidate(zod(setMembersSchema))
	};
};

const getChildren = async (ldap: Client, base = PUBLIC_BASE_DN, query: string | null = null) => {
	let treeEntries: Promise<TreeEntry[]> = Promise.resolve([]);
	const mainFilter: AndFilter = new AndFilter({
		filters: [
			...getHideFilters(config.directory.groups.hide),
			...getHideFilters(config.directory.users.hide),
			...getHideFilters(config.directory.ous.hide),
			...getHideFilters(config.directory.tree.hide)
		]
	});

	if (query) {
		mainFilter.filters.push(getQueryFilter(query));
	}
	const entry = await getBaseEntry(ldap, base);
	if (entry?.objectClass.includes('group')) {
		const members = await getGroupMembers(ldap, entry.distinguishedName);
		mainFilter.filters.push(getObjectClassFilter(), getMembersFilter(members));
		treeEntries = treeSearch(ldap, PUBLIC_BASE_DN, mainFilter, 'sub');
	} else {
		mainFilter.filters.push(getObjectClassFilter());
		treeEntries = treeSearch(ldap, base, mainFilter, 'one');
	}
	return { entry, treeEntries };
};
