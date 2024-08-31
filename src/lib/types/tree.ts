export type TreeEntry = {
	[key: string]: unknown;
	dn: string;
	objectClass: string[];
	cn: string;
	description: string;
	name: string;
	groupType: string;
	mail: string;
	sAMAccountName: string;
	distinguishedName: string;
	jpegPhoto?: string;
};
