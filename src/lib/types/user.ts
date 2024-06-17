export type User = {
	jpegPhoto?: string;
	dn: string;
	objectClass: string[];
	cn: string;
	description: string;
	instanceType: string;
	whenCreated: string;
	uSNCreated: string;
	name: string;
	givenName: string;
	sn: string;
	displayName: string;
	userAccountControl: string;
	badPwdCount: string;
	countryCode: string;
	badPasswordTime: string;
	lastLogoff: string;
	lastLogon: string;
	pwdLastSet: string;
	mail: string;
	primaryGroupID: string;
	adminCount: string;
	accountExpires: string;
	logonCount: string;
	sAMAccountName: string;
	sAMAccountType: string;
	objectCategory: string;
	isCriticalSystemObject: string;
	memberOf: string[];
	lastLogonTimestamp: string;
	whenChanged: string;
	uSNChanged: string;
	distinguishedName: string;
};

export enum UAC {
	'Script' = '1',
	'Account Disabled' = '2',
	'Home Directory Required' = '8',
	'Account Locked Out' = '16',
	'Password Not Required' = '32',
	'Password Cannot Change' = '64',
	'Encrypted Text Password Allowed' = '128',
	'Temporary Duplicate Account' = '256',
	'Normal Account' = '512',
	'Interdomain Trust Account' = '2048',
	'Workstation Trust Account' = '4096',
	'Server Trust Account' = '8192',
	'Password Never Expires' = '65536',
	'MNS Logon Account' = '131072',
	'Smart Card Required' = '262144',
	'Trusted for Delegation' = '524288',
	'Not Delegated' = '1048576',
	'Use DES Keys only' = '2097152',
	"Don't Require Preauthentication" = '4194304',
	'Password Expired' = '8388608',
	'Trusted to Authenticate for Delegation' = '16777216'
}

/**
 * @link https://learn.microsoft.com/en-us/windows/win32/adschema/a-useraccountcontrol#remarks
 */
export const UserAccountControlTypes = {
	1: 'Script' as const,
	2: 'Account Disabled' as const,
	8: 'Home Directory Required' as const,
	16: 'Account Locked Out' as const,
	32: 'Password Not Required' as const,
	64: 'Password Cannot Change' as const,
	128: 'Encrypted Text Password Allowed' as const,
	256: 'Temporary Duplicate Account' as const,
	512: 'Normal Account' as const,
	2048: 'Interdomain Trusted Account' as const,
	4096: 'Workstation Trusted Account' as const,
	8192: 'Server Trust Account' as const,
	65536: 'Password Never Expires' as const,
	131072: 'MNS Logon Account' as const,
	262144: 'Smart Card Required' as const,
	524288: 'Trusted for Delegation' as const,
	1048576: 'Not Delegated' as const,
	2097152: 'Use DES Keys only' as const,
	4194304: "Don't Require Preauthentication" as const,
	8388608: 'Password Expired' as const,
	16777216: 'Trusted to Authenticate for Delegation' as const
};
/**
 *  1: 'Script',
 *
 * 	2: 'Account Disabled',
 *
 * 	4: 'Home Directory Required',
 *
 * 	8: 'Account Locked Out',
 *
 * 	16: 'Password Not Required',
 *
 * 	32: 'Password Cannot Change',
 *
 * 	64: 'Encrypted Text Password Allowed',
 *
 * 	128: 'Temporary Duplicate Account',
 *
 * 	256: 'Normal Account',
 *
 * 	512: 'MNS Logon Account',
 *
 * 	1024: 'Interdomain Trust Account',
 *
 * 	2048: 'Workstation Trust Account',
 *
 * 	4096: 'Server Trust Account',
 *
 * 	8192: 'Password Never Expires',
 *
 * 	16384: 'Smart Card Required',
 *
 * 	32768: 'Trusted for Delegation',
 *
 * 	65536: 'Not Delegated',
 *
 * 	131072: 'Use DES Key Only',
 *
 * 	262144: "Don't Require Preauthentication",
 *
 * 	524288: 'Password Expired',
 *
 * 	1048576: 'Trusted to Authenticate for Delegation',
 *
 * 	2097152: 'Partial Secrets Account',
 *
 * 	4194304: 'Use AES Keys'
 */
export type UserAccountControl = keyof typeof UserAccountControlTypes;
