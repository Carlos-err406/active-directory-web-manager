import { PUBLIC_BASE_DN } from '$env/static/public';
import { AndFilter, Client, EqualityFilter, type Filter } from 'ldapts';

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

export const getEntryByAttribute = async (
	ldap: Client,
	attribute: string,
	value: string,
	{ base = PUBLIC_BASE_DN, extraFilters }: GetEntryOpts
) => {
	let filters: Filter[] = [new EqualityFilter({ attribute, value })];
	if (extraFilters) filters = filters.concat(extraFilters);
	const filter = new AndFilter({ filters }).toString();
	const { searchEntries } = await ldap.search(base, { filter });
	return searchEntries;
};

export const getEntryByDn = async (ldap: Client, dn: string, opts?: GetEntryOpts) =>
	getEntryByAttribute(ldap, 'distinguishedName', dn, { ...opts });

export const getEntryBySAMAccountName = async (
	ldap: Client,
	sAMAccountName: string,
	opts?: GetEntryOpts
) => getEntryByAttribute(ldap, 'sAMAccountName', sAMAccountName, { ...opts });
