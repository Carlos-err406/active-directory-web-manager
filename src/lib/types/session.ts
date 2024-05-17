export type Session = {
	isAdmin: boolean;
	memberOf: string[];
	jpegPhoto: string;
	dn: string;
	distinguishedName: string;
	cn: string;
	sn: string;
	displayName: string;
	name: string;
	mail: string;
	whenCreated: string;
	whenChanged: string;
	userAccountControl: string;
	sAMAccountName: string;
	isCriticalSystemObject: string;
	givenName: string;
	description: string;
};

export type SessionEntryAttribute =
	| 'memberOf'
	| 'dn'
	| 'distinguishedName'
	| 'dn'
	| 'sAMAccountName'
	| 'cn'
	| 'sn'
	| 'mail'
	| 'givenName'
	| 'displayName'
	| 'whenCreated'
	| 'whenChanged'
	| 'userAccountControl'
	| 'email'
	| 'isCriticalSystemObject'
	| 'jpegPhoto'
	| 'description';

export const SESSION_ENTRY_ATTRIBUTES: SessionEntryAttribute[] = [
	'memberOf',
	'dn',
	'distinguishedName',
	'dn',
	'sAMAccountName',
	'cn',
	'sn',
	'mail',
	'givenName',
	'displayName',
	'whenCreated',
	'whenChanged',
	'userAccountControl',
	'email',
	'isCriticalSystemObject',
	'jpegPhoto',
	'description'
];
