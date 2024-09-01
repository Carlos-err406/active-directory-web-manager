import { GroupTypes, type GroupType } from '$lib/types/group';
import { UserAccountControlTypes, type UserAccountControl } from '$lib/types/user';

export const getGroupTypes = (groupType: number | string) => {
	const types = Object.keys(GroupTypes).map(Number);
	const _groupType = Number(groupType);
	let match = types.filter((gt) => gt & _groupType) as GroupType[];

	//according to
	/**@link https://learn.microsoft.com/en-us/windows/win32/adschema/a-grouptype#remarks*/
	// if is not a security group (2147483648) then is a distribution list (0)
	!match.includes(2147483648) && (match = [...match, 0]);
	return match;
};

export const getUserAccountControls = (userAccountControl: number | string) => {
	const flags = Object.keys(UserAccountControlTypes).map(Number);
	const _userAccountControl = Number(userAccountControl);
	const match = flags.filter((uac) => uac & _userAccountControl) as UserAccountControl[];
	return match;
};

/**
 *
 * @param dn  eg OU=Hello,DC=local,DC=com
 * @returns eg CN=Hello
 */
export const getRDNFromDN = (dn: string) => dn.split(',')[0];

/**
 *
 * @param dn eg OU=Hello,DC=local,DC=com
 * @returns eg Hello
 */
export const getCNFromDN = (dn: string) => getRDNFromDN(dn).split('=')[1];

/**
 *
 * @param dn eg OU=Hello,DC=local,DC=com
 * @returns eg DC=local,DC=com
 */
export const extractBase = (dn: string) => {
	const [, ...base] = dn.split(',');
	return base.join(',');
};

/** If an entry has any of these attributes it should be an array. LDAP sets them as a string if attribute.length === 1 */
export const ARRAY_ATTRIBUTES = ['objectClass', 'member', 'memberOf'];

export const getUserAccountControlMatches = (userAccountControl: number | string) => {
	const flags = Object.keys(UserAccountControlTypes).map(Number);
	const match = flags.filter((uac) => uac & Number(userAccountControl)) as UserAccountControl[];
	return match;
};
