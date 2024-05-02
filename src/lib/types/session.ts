export type Session = {
	memberOf: string[];
	jpegPhoto: string;
	distinguishedName: string;
	cn: string;
	sn: string;
	displayName: string;
	name: string;
	whenCreated: string;
	whenChanged: string;
	userAccountControl: string;
	sAMAccountName: string;
	isCriticalSystemObject: string;
	givenName: string;
};

export type SessionEntryAttribute =
	| 'memberOf'
	| 'distinguishedName'
	| 'dn'
	| 'sAMAccountName'
	| 'cn'
	| 'sn'
	| 'givenName'
	| 'displayName'
	| 'whenCreated'
	| 'whenChanged'
	| 'userAccountControl'
	| 'email'
	| 'isCriticalSystemObject'
	| 'jpegPhoto';

export const SESSION_ENTRY_ATTRIBUTES: SessionEntryAttribute[] = [
	'memberOf',
	'distinguishedName',
	'dn',
	'sAMAccountName',
	'cn',
	'sn',
	'givenName',
	'displayName',
	'whenCreated',
	'whenChanged',
	'userAccountControl',
	'email',
	'isCriticalSystemObject',
	'jpegPhoto'
];
