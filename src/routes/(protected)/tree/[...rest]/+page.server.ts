import { PUBLIC_BASE_DN } from '$env/static/public';
import { getEntryByDn, getGroupMembers } from '$lib/ldap';
import { protectedAccessControl } from '$lib/server/utils';
import type { TreeEntry } from '$lib/types/tree';
import { Client, EqualityFilter, OrFilter } from 'ldapts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals, params }) => {
	const auth = await protectedAccessControl({ locals, url });
	const { ldap } = auth;
	const urlDns = params.rest.split('/').filter(Boolean);
	const dns = [PUBLIC_BASE_DN, ...urlDns];

	/*const q =*/ url.searchParams.get('q');
	return {
		searchForm: true,
		entries: dns.map((dn) => getTreeEntries(ldap, dn)),
		activeDns: urlDns
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
	if (entry.objectClass.includes('group')) {
		const members = await getGroupMembers(ldap, entry.distinguishedName);
		treeEntries = Promise.all(
			members.map((member) =>
				getEntryByDn<TreeEntry>(ldap, member, {
					searchOpts: { attributes: TREE_ENTRY_ATTRIBUTES }
				})
			)
		);
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
						new EqualityFilter({ attribute: 'objectClass', value: 'group' })
					]
				})
			})
			.then(({ searchEntries }) => searchEntries as TreeEntry[]);
	}
	return treeEntries;
};
