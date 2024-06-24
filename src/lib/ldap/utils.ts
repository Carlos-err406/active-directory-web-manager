import { UserAccountControlTypes, type UserAccountControl } from '$lib/types/user';
import { GroupTypes, type GroupType } from '$lib/types/group';

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

export const getCNFromDN = (dn: string) => dn.split(',')[0].split('=')[1];
