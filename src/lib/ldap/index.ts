import config from '$config';
import { ADMIN_PASSWD } from '$env/static/private';
import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import type { Group } from '$lib/types/group';
import type { OrganizationalUnit } from '$lib/types/ou';
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
import _ from 'lodash';
import { getLDAPClient } from './client';
import { ARRAY_ATTRIBUTES } from './utils';
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
	return setArrayAttributes(searchEntries[0]) as T;
};

export const setArrayAttributes = (entry: Entry): Entry => {
	if (!entry) return entry;
	const copy = Object.entries(entry).map(([key, value]) => {
		if (ARRAY_ATTRIBUTES.includes(key)) {
			if (value && !Array.isArray(value)) return { [key]: [value] };
		}
		return { [key]: value };
	});

	return Object.assign({}, ...copy);
};

export const getEntryByDn = async <T = Entry>(ldap: Client, dn: string, opts?: GetEntryOpts) =>
	getEntryByAttribute<T>(ldap, 'distinguishedName', dn, { ...opts });

export const getEntryBySAMAccountName = async <T = Entry>(
	ldap: Client,
	sAMAccountName: string,
	opts?: GetEntryOpts
) => getEntryByAttribute<T>(ldap, 'sAMAccountName', sAMAccountName, { ...opts });

export const entryBelongsToGroup = async (ldap: Client, entryDn: string, groupName: string) => {
	const group = await getEntryBySAMAccountName<Group>(ldap, groupName);
	const { member } = group;
	if (!member) return false;
	return member.includes(entryDn);
};

export const getUserGroups = async (ldap: Client, dn: string) => {
	const entry = await getEntryByDn(ldap, dn);
	if (!entry) return [] as string[];
	const { memberOf } = entry;
	return (memberOf || []) as string[];
};

export const getGroupMembers = async (ldap: Client, groupDn: string, opts?: GetEntryOpts) => {
	const group = await getEntryByDn<{ dn: string; member: string[] }>(ldap, groupDn, {
		searchOpts: { attributes: ['member'], ...opts?.searchOpts }
	});
	return group?.member ?? [];
};

export const getGroupMemberEntries = async <T extends Entry>(
	ldap: Client,
	members: string[],
	opts?: GetEntryOpts
) => {
	if (!members || members?.length === 0) return [] as T[];
	const filter = new AndFilter({
		filters: [
			new OrFilter({
				filters: members.map(
					(member) => new EqualityFilter({ attribute: 'distinguishedName', value: member })
				)
			}),
			...(opts?.extraFilters ?? [])
		]
	});
	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, { filter, ...opts?.searchOpts });
	return (searchEntries ?? []) as T[];
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
	//if a value is passed but is different from the one present on the entry's attribute
	else if (value && !_.isEqual(value, entry[attribute])) {
		return replaceAttribute({ type: att, values });
	}
};

export const isAdmin = (ldap: Client, dn: string) =>
	entryBelongsToGroup(ldap, dn, config.directory.adminGroup);

export const sudo = async (sudoOperation: (ldap: Client) => Promise<void>) => {
	const ldap = getLDAPClient();
	await ldap.bind(`administrator@${PUBLIC_LDAP_DOMAIN}`, ADMIN_PASSWD);
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

export const getAllOrganizationalUnits = (
	ldap: Client,
	extraFilters: Filter[] = []
): Promise<OrganizationalUnit[]> =>
	ldap
		.search(PUBLIC_BASE_DN, {
			filter: new AndFilter({
				filters: [
					new EqualityFilter({ attribute: 'objectClass', value: 'organizationalUnit' }),
					...extraFilters
				]
			})
		})
		.then(({ searchEntries }) => searchEntries as Group[]);

export const validateUserAmount = async (ldap: Client) => {
	const { limit } = config.directory.users;
	if (!limit) return true;
	const users = await getAllUsers(ldap);
	return users.length < limit;
};

export const validateGroupAmount = async (ldap: Client) => {
	const { limit } = config.directory.groups;
	if (!limit) return true;
	const groups = await getAllGroups(ldap);
	return groups.length < limit;
};

export const validateOuAmount = async (ldap: Client) => {
	const { limit } = config.directory.ous;
	if (!limit) return true;
	const ous = await getAllOrganizationalUnits(ldap);
	return ous.length < limit;
};

export const getFilteredUsers = (ldap: Client, extraFilters: Filter[] = []) =>
	getAllUsers(ldap, [...getHideFilters(config.directory.users.hide), ...extraFilters]);

export const getFilteredGroups = (ldap: Client, extraFilters: Filter[] = []) =>
	getAllGroups(ldap, [...getHideFilters(config.directory.groups.hide), ...extraFilters]);

export const getFilteredOrganizationalUnits = (ldap: Client, extraFilters: Filter[] = []) =>
	getAllOrganizationalUnits(ldap, [...getHideFilters(config.directory.ous.hide), ...extraFilters]);

export const getHideFilters = (hide: string[] = []) =>
	hide.map(
		(q) =>
			new NotFilter({
				filter: new OrFilter({
					filters: [
						new EqualityFilter({ attribute: 'distinguishedName', value: q }),
						new EqualityFilter({ attribute: 'sAMAccountName', value: q }),
						new EqualityFilter({ attribute: 'cn', value: q })
					]
				})
			})
	);

export const getBaseEntry = (ldap: Client, base: string) =>
	getEntryByDn<{ objectClass: string[]; distinguishedName: string; dn: string }>(ldap, base, {
		searchOpts: { attributes: ['objectClass', 'dn', 'distinguishedName'] }
	});

export const getDirectChildren = <T extends Entry>(
	ldap: Client,
	base: string,
	opts?: SearchOptions
) => ldap.search(base, { scope: 'one', ...opts }).then(({ searchEntries }) => searchEntries as T[]);
