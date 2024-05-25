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

/**
 * @link https://learn.microsoft.com/en-us/windows/win32/adschema/a-useraccountcontrol#remarks
 */
export const UserAccountControlTypes = {
	1: 'Script',
	2: 'Account Disabled',
	4: 'Home Directory Required',
	8: 'Account Locked Out',
	16: 'Password Not Required',
	32: 'Password Cannot Change',
	64: 'Encrypted Text Password Allowed',
	128: 'Temporary Duplicate Account',
	256: 'Normal Account',
	512: 'MNS Logon Account',
	1024: 'Interdomain Trust Account',
	2048: 'Workstation Trust Account',
	4096: 'Server Trust Account',
	8192: 'Password Never Expires',
	16384: 'Smart Card Required',
	32768: 'Trusted for Delegation',
	65536: 'Not Delegated',
	131072: 'Use DES Key Only',
	262144: "Don't Require Preauthentication",
	524288: 'Password Expired',
	1048576: 'Trusted to Authenticate for Delegation',
	2097152: 'Partial Secrets Account',
	4194304: 'Use AES Keys'
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
