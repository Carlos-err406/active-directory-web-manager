import type { Entry } from 'ldapts';

export type TreeEntry = Entry & {
	[key: string]: unknown;
	dn: string;
	objectClass: string[];
	cn: string;
	description: string;
	name: string;
	groupType: string;
	mail: string;
	sAMAccountName: string;
	userAccountControl?: string;
	distinguishedName: string;
	jpegPhoto?: string;
};
