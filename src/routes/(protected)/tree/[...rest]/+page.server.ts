import { PUBLIC_BASE_DN } from '$env/static/public';
import { getEntryByDn, getGroupMembers } from '$lib/ldap';
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
import { Client, EqualityFilter, OrFilter } from 'ldapts';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals, params }) => {
	const auth = await protectedAccessControl({ locals, url });
	const { ldap } = auth;
	const splittedDn = params.rest.split('/').filter(Boolean).reverse();
	const activeDns = splittedDn
		.map((_, index) => splittedDn.slice(index).join(',') + `,${PUBLIC_BASE_DN}`)
		.reverse();
	const dns = [PUBLIC_BASE_DN, ...activeDns];
	// const q = url.searchParams.get('q');
	// console.log({ tree: q });
	return {
		searchForm: true,
		withoutPages: true,
		entries: dns.map((dn) => getTreeEntries(ldap, dn)),
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

const TREE_ENTRY_ATTRIBUTES = [
	'dn',
	'distinguishedName',
	'sAMAccountName',
	'cn',
	'objectClass',
	'name'
];

const getTreeEntries = async (ldap: Client, base = PUBLIC_BASE_DN): Promise<TreeEntry[]> => {
	let treeEntries: Promise<TreeEntry[]> = Promise.resolve([]);
	const entry = await getEntryByDn<{ objectClass: string[]; distinguishedName: string }>(
		ldap,
		base,
		{
			searchOpts: { attributes: ['objectClass', 'dn', 'distinguishedName'] }
		}
	);
	if (entry?.objectClass.includes('group')) {
		const members = await getGroupMembers(ldap, entry.distinguishedName);
		treeEntries = ldap
			.search(PUBLIC_BASE_DN, {
				attributes: TREE_ENTRY_ATTRIBUTES,
				filter: new OrFilter({
					filters: members.map(
						(dn) => new EqualityFilter({ attribute: 'distinguishedName', value: dn })
					)
				})
			})
			.then(({ searchEntries }) => searchEntries as TreeEntry[]);
	} else {
		treeEntries = ldap
			.search(base, {
				scope: 'one',
				attributes: TREE_ENTRY_ATTRIBUTES,
				filter: new OrFilter({
					filters: [
						new EqualityFilter({ attribute: 'objectClass', value: 'organizationalUnit' }),
						new EqualityFilter({ attribute: 'objectClass', value: 'organizationalPerson' }),
						new EqualityFilter({ attribute: 'objectClass', value: 'container' }),
						new EqualityFilter({ attribute: 'objectClass', value: 'computer' }),
						new EqualityFilter({ attribute: 'objectClass', value: 'group' })
					]
				})
			})
			.then(({ searchEntries }) => searchEntries as TreeEntry[]);
	}
	return treeEntries;
};
