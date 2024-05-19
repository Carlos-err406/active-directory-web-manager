import { PUBLIC_BASE_DN } from '$env/static/public';
import { AndFilter, Client, EqualityFilter, type Entry, type Filter } from 'ldapts';

/**
 * Encodes password for ldap unicodePwd attribute
 * @param password
 * @returns encoded password in utf16le
 */
export const encodePassword = (password: string) => Buffer.from(`"${password}"`, 'utf16le');

type GetEntryOpts = {
	base?: string;
	extraFilters?: Filter[];
};

export const getEntryByAttribute = async <T = Entry>(
	ldap: Client,
	attribute: string,
	value: string,
	{ base = PUBLIC_BASE_DN, extraFilters }: GetEntryOpts
) => {
	let filters: Filter[] = [new EqualityFilter({ attribute, value })];
	if (extraFilters) filters = filters.concat(...extraFilters);
	const filter = new AndFilter({ filters }).toString();
	const { searchEntries } = await ldap.search(base, { filter });
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
