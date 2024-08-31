import config from '$config';
import { appLog } from '$lib/server/logs';
import { jpegPhotoToB64 } from '$lib/transforms';
import type { Session } from '$lib/types/session';
import type { TreeEntry } from '$lib/types/tree';
import { error } from '@sveltejs/kit';
import {
	Client,
	EqualityFilter,
	OrFilter,
	SubstringFilter,
	type Filter,
	type SearchOptions
} from 'ldapts';

export const TREE_ENTRY_ATTRIBUTES = [
	'dn',
	'distinguishedName',
	'sAMAccountName',
	'cn',
	'objectClass',
	'name',
	'description',
	'mail',
	'jpegPhoto',
	'sn',
	'givenName'
];

export const getQueryFilter = (query: string) =>
	new OrFilter({
		filters: ['name', 'sAMAccountName', 'cn'].map(
			(attribute) =>
				new SubstringFilter({
					attribute,
					any: [query]
				})
		)
	});

export const getMembersFilter = (members: string[]) =>
	new OrFilter({
		filters: members.map((dn) => new EqualityFilter({ attribute: 'distinguishedName', value: dn }))
	});

export const getObjectClassFilter = () =>
	new OrFilter({
		filters: [
			new EqualityFilter({ attribute: 'objectClass', value: 'organizationalUnit' }),
			new EqualityFilter({ attribute: 'objectClass', value: 'organizationalPerson' }),
			new EqualityFilter({ attribute: 'objectClass', value: 'container' }),
			new EqualityFilter({ attribute: 'objectClass', value: 'computer' }),
			new EqualityFilter({ attribute: 'objectClass', value: 'group' })
		]
	});

export const treeSearch = (
	ldap: Client,
	base: string,
	filter: Filter,
	scope: SearchOptions['scope'] = 'one'
) =>
	ldap
		.search(base, {
			scope,
			attributes: TREE_ENTRY_ATTRIBUTES,
			filter
		})
		.then(({ searchEntries }) => searchEntries.map(jpegPhotoToB64) as TreeEntry[]);

export const throwIfIsHiddenEntry = (dn: string, session: Session, url: URL) => {
	const { users, ous, groups, tree } = config.directory;
	const hiddenEntries = tree.hide.concat(groups.hide, ous.hide, users.hide);
	if (hiddenEntries.some((hidden) => dn.endsWith(hidden))) {
		appLog(
			`User ${session.sAMAccountName} tried accessing ${decodeURIComponent(url.pathname)} but resource is hidden by configuration.`,
			'Error'
		);
		throw error(403, 'This resource is hidden by configuration');
	}
};
