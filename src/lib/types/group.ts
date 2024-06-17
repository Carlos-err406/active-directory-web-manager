import { getSelectOptions } from '$lib/components/form/select-input.svelte';

export type Group = {
	dn: string;
	objectClass: string[];
	cn: string;
	description: string;
	instanceType: string;
	whenCreated: string;
	whenChanged: string;
	uSNCreated: string;
	uSNChanged: string;
	name: string;
	mail: string;
	objectGUID: string;
	objectSid: string;
	adminCount: string;
	sAMAccountName: string;
	sAMAccountType: string;
	systemFlags: string;
	groupType: string;
	objectCategory: string;
	isCriticalSystemObject: string;
	member: string[];
	distinguishedName: string;
};

/**
 * @link https://learn.microsoft.com/en-us/windows/win32/adschema/a-grouptype#remarks
 */
export const GroupTypes = {
	0: 'Distribution List' as const,
	1: 'Created by the System' as const,
	2: 'Global Scope' as const,
	4: 'Domain Local Scope' as const,
	8: 'Universal Scope' as const,
	16: 'APP_BASIC Group for Windows Server Authorization Manager' as const,
	32: 'APP_QUERY Group for Windows Server Authorization Manager' as const,
	2147483648: 'Security Group' as const
};

export const SelectableGroupTypes = {
	0: GroupTypes[0],
	2147483648: GroupTypes[2147483648]
};

export type GroupType = keyof typeof GroupTypes;
export type SelectableGroupType = keyof typeof SelectableGroupTypes;

export const GroupTypeSelect = getSelectOptions(SelectableGroupTypes);
