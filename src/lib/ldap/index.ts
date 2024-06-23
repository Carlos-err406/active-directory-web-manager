import config from '$config';
import { ADMIN_GROUP, SAMBA_DC_ADMIN_PASSWD } from '$env/static/private';
import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import type { Group } from '$lib/types/group';
import type { User } from '$lib/types/user';
import {
	AndFilter,
	Attribute,
	Change,
	Client,
	EqualityFilter,
	NotFilter,
	OrFilter,
	type AttributeOptions,
	type Entry,
	type Filter,
	type SearchOptions
} from 'ldapts';
import { getLDAPClient } from './client';
/**
 * Encodes password for ldap unicodePwd attribute
 * @param password
 * @returns encoded password in utf16le
 */
export const encodePassword = (password: string) => Buffer.from(`"${password}"`, 'utf16le');

type GetEntryOpts = {
	base?: string;
	extraFilters?: Filter[];
	searchOpts?: Partial<Omit<SearchOptions, 'filter'>>;
};

export const getEntryByAttribute = async <T = Entry>(
	ldap: Client,
	attribute: string,
	value: string,
	{ base = PUBLIC_BASE_DN, extraFilters, searchOpts }: GetEntryOpts
) => {
	let filters: Filter[] = [new EqualityFilter({ attribute, value })];
	if (extraFilters) filters = filters.concat(...extraFilters);
	const filter = new AndFilter({ filters }).toString();
	const { searchEntries } = await ldap.search(base, { filter, ...searchOpts });
	return searchEntries[0] as T;
};

export const getEntryByDn = async <T = Entry>(ldap: Client, dn: string, opts?: GetEntryOpts) =>
	getEntryByAttribute<T>(ldap, 'distinguishedName', dn, { ...opts });

export const getEntryBySAMAccountName = async <T = Entry>(
	ldap: Client,
	sAMAccountName: string,
	opts?: GetEntryOpts
) => getEntryByAttribute<T>(ldap, 'sAMAccountName', sAMAccountName, { ...opts });

export const entryBelongsToGroup = async (ldap: Client, entryDn: string, groupName: string) => {
	const entry = await getEntryByDn(ldap, entryDn);
	if (!entry) return false;
	const { memberOf } = entry;
	if (!memberOf || memberOf.length === 0) return false;

	const group = await getEntryBySAMAccountName(ldap, groupName);
	if (!group) return false;
	const { distinguishedName: groupDn } = group;

	return (memberOf as string[]).includes(groupDn as string);
};

export const getUserGroups = async (ldap: Client, dn: string) => {
	const entry = await getEntryByDn(ldap, dn);
	if (!entry) return [];
	const { memberOf } = entry;
	if (!memberOf || memberOf.length === 0) return [];
	else return Array.isArray(memberOf) ? memberOf : [memberOf];
};

export const getGroupMembers = async (ldap: Client, groupDn: string) => {
	const group = await getEntryByDn<{ dn: string; member: string[] }>(ldap, groupDn, {
		searchOpts: { attributes: ['member'] }
	});
	if (!group?.member?.length) return [];

	return Array.isArray(group.member) ? group.member : [group.member];
};

export const replaceAttribute = (opts: AttributeOptions) =>
	new Change({ modification: new Attribute(opts), operation: 'replace' });

export const deleteAttribute = (type: AttributeOptions['type']) =>
	new Change({ modification: new Attribute({ type }), operation: 'delete' });

export const addAttribute = (opts: AttributeOptions) =>
	new Change({ modification: new Attribute(opts), operation: 'add' });

export const inferChange = <T>(entry: T, attribute: keyof T, value?: string | string[]) => {
	const values = typeof value === 'string' ? [value] : value;
	const att = attribute as string;
	//if a value is passed and the entry does not have the attribute
	if (value && !entry[attribute]) return addAttribute({ type: att, values });
	//if no value is passed but the entry has the attribute
	else if (!value && entry[attribute]) return deleteAttribute(att);
	//if a value is passed but is different from the one pressent on the entrie's attribute
	else if (value) {
		if (typeof value === 'string' && value !== entry[attribute])
			return replaceAttribute({ type: att, values });
		else if (JSON.stringify(value) !== JSON.stringify(entry[attribute]))
			return replaceAttribute({ type: att, values });
	}
};

export const extractBase = (dn: string) => {
	const [, ...base] = dn.split(',');
	return base.join(',');
};

export const isAdmin = (ldap: Client, dn: string) => entryBelongsToGroup(ldap, dn, ADMIN_GROUP);

export const sudo = async (sudoOperation: (ldap: Client) => Promise<void>) => {
	const ldap = getLDAPClient();
	await ldap.bind(`administrator@${PUBLIC_LDAP_DOMAIN}`, SAMBA_DC_ADMIN_PASSWD);
	await sudoOperation(ldap);
	await ldap.unbind();
};

export const getAllUsers = (ldap: Client, extraFilters: Filter[] = []): Promise<User[]> =>
	ldap
		.search(PUBLIC_BASE_DN, {
			filter: new AndFilter({
				filters: [
					new NotFilter({
						filter: new EqualityFilter({ attribute: 'objectClass', value: 'computer' })
					}),
					...['top', 'person', 'organizationalPerson', 'user'].map(
						(value) => new EqualityFilter({ attribute: 'objectClass', value })
					),
					...extraFilters
				]
			})
		})
		.then(({ searchEntries }) => searchEntries as User[]);

export const getAllGroups = (ldap: Client, extraFilters: Filter[] = []): Promise<Group[]> =>
	ldap
		.search(PUBLIC_BASE_DN, {
			filter: new AndFilter({
				filters: [new EqualityFilter({ attribute: 'objectClass', value: 'group' }), ...extraFilters]
			})
		})
		.then(({ searchEntries }) => searchEntries as Group[]);

export const validateUserAmount = async (ldap: Client) => {
	const { limit } = config.directory.users;
	if (!limit) return;
	const users = await getAllUsers(ldap);
	return users.length < limit;
};

export const validateGroupAmount = async (ldap: Client) => {
	const { limit } = config.directory.groups;
	if (!limit) return;
	const groups = await getAllGroups(ldap);
	return groups.length < limit;
};

export const getFilteredUsers = (ldap: Client, extraFilters: Filter[] = []) =>
	getAllUsers(ldap, [...getHideFilters(config.directory.users.hide), ...extraFilters]);

export const getFilteredGroups = (ldap: Client, extraFilters: Filter[] = []) =>
	getAllGroups(ldap, [...getHideFilters(config.directory.groups.hide), ...extraFilters]);

export const getHideFilters = (hide: string[] = []) =>
	hide.map(
		(q) =>
			new NotFilter({
				filter: new OrFilter({
					filters: [
						new EqualityFilter({ attribute: 'distinguishedName', value: q }),
						new EqualityFilter({ attribute: 'sAMAccountName', value: q })
					]
				})
			})
	);
