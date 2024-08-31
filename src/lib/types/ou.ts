export type OrganizationalUnit = {
	[key: string]: unknown;
	dn: string;
	objectClass: string[];
	description: string;
	whenCreated: string;
	whenChanged: string;
	name: string;
	sAMAccountName: string;
	isCriticalSystemObject: string;
	distinguishedName: string;
};
