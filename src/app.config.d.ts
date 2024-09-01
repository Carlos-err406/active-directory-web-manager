/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Configuration settings
 */
export interface Config {
	app?: AppConfig;
	directory?: DirectoryConfig;
	system?: SystemConfig;
	[k: string]: unknown;
}
/**
 * Application configuration settings
 */
export interface AppConfig {
	nonAdmin?: AppNonAdminSchemaJson;
	captcha?: CaptchaConfig;
	views?: ViewsConfig;
}
/**
 * Settings regarding non-admin users
 */
export interface AppNonAdminSchemaJson {
	/**
	 * Allow non-admin users to edit their own profiles and change their passwords. In the server this is done using the administrator credentials since in a directory only administrators have edit access (administrator@{PUBLIC_LDAP_DOMAIN}, ADMIN_PASSWD, PUBLIC_LDAP_DOMAIN and ADMIN_PASSWD are .env variables). @default false
	 */
	allowSelfEdit?: boolean;
	/**
	 * Allow non-admin users to access the "/users" and "/users/[dn]" pages. @default false
	 */
	allowAccessToUsersPage?: boolean;
	/**
	 * Allow non-admin users to access the "/groups" and "/groups/[dn]" pages. @default false
	 */
	allowAccessToGroupsPage?: boolean;
	/**
	 * Allow non-admin users to access the "/ous" and "/ous/[dn]" pages. @default false
	 */
	allowAccessToOUsPage?: boolean;
	/**
	 * Allow non-admin users to access the "/tree" page. @default false
	 */
	allowAccessToTreePage?: boolean;
	/**
	 * Allow non-admin users to access the "/logs" page. @default false
	 */
	allowAccessToLogsPage?: boolean;
}
/**
 * Captcha personalization options. Uses @link https://www.npmjs.com/package/svg-captcha
 */
export interface CaptchaConfig {
	/**
	 * Length of the captcha shown in the authentication page, recommended to use a low value for development. @default 5
	 */
	size?: number;
	/**
	 * Height of the captcha image. @default 96
	 */
	height?: number;
	/**
	 * Width of the captcha image. @default 345
	 */
	width?: number;
	/**
	 * Font size of the characters in the captcha. @default 30
	 */
	fontSize?: number;
	/**
	 * Characters used to generate the random string in the captcha. @default "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	 */
	charPreset?: string;
	/**
	 * If false, captcha will be black and white otherwise, it will be randomly colorized @default false
	 */
	color?: boolean;
	/**
	 * Characters that will be ignored in the captcha. @default ""
	 */
	ignoreChars?: string;
	/**
	 * Number of noise lines in the captcha. @default 5
	 */
	noise?: number;
	/**
	 * CSS color of the captcha background. Can use other css variants other than hex. @default "#FFFFFF"
	 */
	background?: string;
}
/**
 * Configuration regarding de different pages of the web app
 */
export interface ViewsConfig {
	groupsPage?: GroupsPageConfig;
	logsPage?: LogsPageConfig;
	ousPage?: OrganizationalUnitsPageConfig;
	settingsPage?: SettingsPageConfig;
	treePage?: TreePageConfig;
	usersPage?: UsersPageConfig;
}
/**
 * Configuration regarding the groups page
 */
export interface GroupsPageConfig {
	details?: GroupDetailsConfig;
	/**
	 * Weather or not to show the "/groups" page in navigation. Accessing directly to this route will result on a "403 This page has been disabled by configuration" error. @default true
	 */
	show?: boolean;
	table?: GroupsTableConfig;
}
/**
 * Configuration regarding the detailed view of a group ("/groups/[dn]")
 */
export interface GroupDetailsConfig {
	/**
	 * Configuration regarding the "cn" attribute of the group
	 */
	cn?: {
		/**
		 * @default "cn"
		 */
		label?: string;
		/**
		 * Wether or not to show the "cn" attribute in the "/groups/[dn]" page. @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "description" attribute of the group
	 */
	description?: {
		/**
		 * @default "description"
		 */
		label?: string;
		/**
		 * Wether or not to show the "description" attribute in the "/groups/[dn]" page. @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "distinguishedName" attribute of the group
	 */
	distinguishedName?: {
		/**
		 * @default "distinguishedName"
		 */
		label?: string;
		/**
		 * Wether or not to show the "distinguishedName" attribute in the "/groups/[dn]" page. @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "groupType" attribute of the group
	 */
	groupType?: {
		/**
		 * @default "groupType"
		 */
		label?: string;
		/**
		 * Wether or not to show the "groupType" attribute in the "/groups/[dn]" page. @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "mail" attribute of the group
	 */
	mail?: {
		/**
		 * @default "mail"
		 */
		label?: string;
		/**
		 * Wether or not to show the "mail" attribute in the "/groups/[dn]" page. @default true
		 */
		show?: boolean;
	};
	parent?: ParentDetailsConfig;
	member?: MemberDetailsConfig;
	/**
	 * Configuration regarding the "sAMAccountName" attribute of the group
	 */
	sAMAccountName?: {
		/**
		 * @default "sAMAccountName"
		 */
		label?: string;
		/**
		 * Wether or not to show the "sAMAccountName" attribute in the "/groups/[dn]" page. @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "whenChanged" attribute of the group
	 */
	whenChanged?: {
		/**
		 * @default "whenChanged"
		 */
		label?: string;
		/**
		 * Wether or not to show the "whenChanged" attribute in the "/groups/[dn]" page. @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "whenCreated" attribute of the group
	 */
	whenCreated?: {
		/**
		 * @default "whenCreated"
		 */
		label?: string;
		/**
		 * Wether or not to show the "whenCreated" attribute in the "/groups/[dn]" page. @default true
		 */
		show?: boolean;
	};
}
/**
 * Configuration regarding the parent entry of the group
 */
export interface ParentDetailsConfig {
	/**
	 * @default "parent"
	 */
	label?: string;
	/**
	 * Wether or not to show the parent of the group in the "/groups/[dn]" page. @default true
	 */
	show?: boolean;
	/**
	 * Show parent as link to to the parent entry. @default false
	 */
	asLink?: boolean;
	/**
	 * If false the parent of the group will be shown as the full distinguishedName, else only the CN is shown. @default false
	 */
	shortParent?: boolean;
}
/**
 * Configuration regarding the "member(s)" of the entry
 */
export interface MemberDetailsConfig {
	/**
	 * @default "member"
	 */
	label?: string;
	/**
	 * Show members as links to each member detailed page. @default false
	 */
	asLinks?: boolean;
	/**
	 * If false the each member will be shown as the full distinguishedName, else only the name will be shown. @default false
	 */
	shortMember?: boolean;
	/**
	 * Wether or not to show the "member(s)" of the entry in the details view. If false "shortMember" will be ignored @default true
	 */
	show?: boolean;
}
/**
 * Groups table view configuration
 */
export interface GroupsTableConfig {
	/**
	 * Groups table column settings
	 */
	columns?: {
		/**
		 * Configure groups table "description" column.
		 */
		description?: {
			/**
			 * Header for the "description" column of the groups table. @default "description"
			 */
			header?: string;
			/**
			 * Wether or not allow the "description" column to be hidable. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "description" group table column. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure groups table "dn" column.
		 */
		dn?: {
			/**
			 * Header for the "dn" column of the groups table. @default "dn"
			 */
			header?: string;
			/**
			 * Wether or not allow the "dn" column to be hidable. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "dn" group table column. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure groups table "groupType" column.
		 */
		groupType?: {
			/**
			 * Header for the "groupType" column of the groups table. @default "groupType"
			 */
			header?: string;
			/**
			 * Wether or not allow the "groupType" column to be hidable. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "groupType" group table column. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure groups table "mail" column.
		 */
		mail?: {
			/**
			 * Header for the "mail" column of the groups table. @default "mail"
			 */
			header?: string;
			/**
			 * Wether or not allow the "mail" column to be hidable. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "mail" group table column. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure groups table "sAMAccountName" column.
		 */
		sAMAccountName?: {
			/**
			 * Header for the "sAMAccountName" column of the groups table. @default "sAMAccountName"
			 */
			header?: string;
			/**
			 * Wether or not allow the "sAMAccountName" column to be hidable. @default false
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "sAMAccountName" group table column. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure groups table "whenCreated" column.
		 */
		whenCreated?: {
			/**
			 * Header for the "whenCreated" column of the groups table. @default "whenCreated"
			 */
			header?: string;
			/**
			 * Wether or not allow the "whenCreated" column to be hidable. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "whenCreated" group table column. @default true
			 */
			show?: boolean;
		};
	};
}
/**
 * configuration regarding the logs page
 */
export interface LogsPageConfig {
	/**
	 * Weather or not to show the /logs page in navigation. Accessing directly to this route will result on a '403 This page has been disabled by configuration' error
	 */
	show?: boolean;
}
/**
 * Configuration regarding the organizational units page
 */
export interface OrganizationalUnitsPageConfig {
	details?: OuDetailsConfig;
	/**
	 * Weather or not to show the "/ous" page in navigation. Accessing directly to this route will result on a "403 This page has been disabled by configuration" error. @default true
	 */
	show?: boolean;
	table?: OusTableConfig;
}
/**
 * Configuration regarding the detailed view of a OU ("/ous/[dn]")
 */
export interface OuDetailsConfig {
	/**
	 * Configuration regarding the "name" attribute of the OU
	 */
	name?: {
		/**
		 * @default "name"
		 */
		label?: string;
		/**
		 * Wether or not to show the "name" attribute in the "/ous/[dn]" page. @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "description" attribute of the OU
	 */
	description?: {
		/**
		 * @default "description"
		 */
		label?: string;
		/**
		 * Wether or not to show the "description" attribute in the "/ous/[dn]" page. @default true
		 */
		show?: boolean;
	};
	parent?: ParentDetailsConfig;
	member?: MemberDetailsConfig;
	/**
	 * Configuration regarding the "distinguishedName" attribute of the ou
	 */
	distinguishedName?: {
		/**
		 * @default "distinguishedName"
		 */
		label?: string;
		/**
		 * Wether or not to show the "distinguishedName" attribute in the "/ous/[dn]" page. @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "whenChanged" attribute of the ou
	 */
	whenChanged?: {
		/**
		 * @default "whenChanged"
		 */
		label?: string;
		/**
		 * Wether or not to show the "whenChanged" attribute in the "/ous/[dn]" page. @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "whenCreated" attribute of the ou
	 */
	whenCreated?: {
		/**
		 * @default "whenCreated"
		 */
		label?: string;
		/**
		 * Wether or not to show the "whenCreated" attribute in the "/ous/[dn]" page. @default true
		 */
		show?: boolean;
	};
}
/**
 * Ous table view configuration
 */
export interface OusTableConfig {
	/**
	 * Ous table column settings
	 */
	columns?: {
		/**
		 * Configure ous table "description" column.
		 */
		description?: {
			/**
			 * Header for the "description" column of the ous table. @default "description"
			 */
			header?: string;
			/**
			 * Wether or not allow the "description" column to be hidable. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "description" ou table column. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure ous table "dn" column.
		 */
		dn?: {
			/**
			 * Header for the "dn" column of the ous table. @default "dn"
			 */
			header?: string;
			/**
			 * Wether or not allow the "dn" column to be hidable. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "dn" ou table column. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure ous table "name" column.
		 */
		name?: {
			/**
			 * Header for the "name" column of the ous table. @default "name"
			 */
			header?: string;
			/**
			 * Wether or not allow the "name" column to be hidable. @default false
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "name" ou table column. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure ous table "whenCreated" column.
		 */
		whenCreated?: {
			/**
			 * Header for the "whenCreated" column of the ous table. @default "whenCreated"
			 */
			header?: string;
			/**
			 * Wether or not allow the "whenCreated" column to be hidable. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "whenCreated" ou table column. @default true
			 */
			show?: boolean;
		};
	};
}
/**
 * Configuration regarding the settings page
 */
export interface SettingsPageConfig {
	/**
	 * Weather or not to allow the user to change the configuration. @default false
	 */
	showConfigurationForm?: boolean;
	/**
	 * Allow to toggle dark/light modes. @default false
	 */
	allowToChangeTheme?: boolean;
}
/**
 * Configuration regarding the tree page
 */
export interface TreePageConfig {
	/**
	 * Wether or not to show the /tree page in navigation. Accessing directly to this route will result on a '403 This page has been disabled by configuration' error. @default true
	 */
	show?: boolean;
}
/**
 * Configuration regarding the users page
 */
export interface UsersPageConfig {
	details?: UserDetailsConfig;
	table?: UsersTableConfig;
}
/**
 * Configuration regarding the detailed view of a user ("/users/[dn]" or "/users/me")
 */
export interface UserDetailsConfig {
	/**
	 * Configuration regarding the "description" attribute of the user
	 */
	description?: {
		/**
		 * @default "description"
		 */
		label?: string;
		/**
		 * Wether or not to show the "description" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "displayName" attribute of the user
	 */
	displayName?: {
		/**
		 * @default "displayName"
		 */
		label?: string;
		/**
		 * Wether or not to show the "displayName" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "distinguishedName" attribute of the user
	 */
	distinguishedName?: {
		/**
		 * @default "distinguishedName"
		 */
		label?: string;
		/**
		 * Wether or not to show the "distinguishedName" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "givenName" attribute of the user
	 */
	givenName?: {
		/**
		 * @default "givenName"
		 */
		label?: string;
		/**
		 * Wether or not to show the "givenName" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "jpegPhoto" attribute of the user. If "showFallback" and "show" are false then nothing will be shown
	 */
	jpegPhoto?: {
		/**
		 * Wether or not to show the "jpegPhoto" in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "mail" attribute of the user
	 */
	mail?: {
		/**
		 * @default "mail"
		 */
		label?: string;
		/**
		 * Wether or not to show the "mail" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	parent?: ParentDetailsConfig;
	/**
	 * Configuration regarding the "memberOf" attribute of the user
	 */
	memberOf?: {
		/**
		 * @default "memberOf"
		 */
		label?: string;
		/**
		 * If false the attribute "memberOf" of the user will be shown as the full distinguishedName, else only the CN is shown. @default false
		 */
		shortMemberOf?: boolean;
		/**
		 * Show groups as links to each group description
		 */
		asLinks?: boolean;
		/**
		 * Wether or not to show the "memberOf" attribute in the detail pages ("/users/[dn]" or "/users/me"). If false "shortMemberOf" will be ignored @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "sAMAccountName" attribute of the user
	 */
	sAMAccountName?: {
		/**
		 * @default "sAMAccountName"
		 */
		label?: string;
		/**
		 * Wether or not to show the "sAMAccountName" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "sn" attribute of the user
	 */
	sn?: {
		/**
		 * @default "sn"
		 */
		label?: string;
		/**
		 * Wether or not to show the "sn" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "userAccountControl" attribute of the user
	 */
	userAccountControl?: {
		/**
		 * @default "userAccountControl"
		 */
		label?: string;
		/**
		 * Wether or not to show the "userAccountControl" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "whenChanged" attribute of the user
	 */
	whenChanged?: {
		/**
		 * @default "whenChanged"
		 */
		label?: string;
		/**
		 * Wether or not to show the "whenChanged" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
	/**
	 * Configuration regarding the "whenCreated" attribute of the user
	 */
	whenCreated?: {
		/**
		 * @default "whenCreated"
		 */
		label?: string;
		/**
		 * Wether or not to show the "whenCreated" attribute in the detail pages ("/users/[dn]" or "/users/me"). @default true
		 */
		show?: boolean;
	};
}
/**
 * Users table view configuration
 */
export interface UsersTableConfig {
	/**
	 * Users table columns configuration
	 */
	columns?: {
		/**
		 * Configure the users table description column
		 */
		description?: {
			/**
			 * Name of the table header for the description column. @default "description"
			 */
			header?: string;
			/**
			 * Wether or not the "description" is hidable or not. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the description column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure the users table displayName column
		 */
		displayName?: {
			/**
			 * Name of the table header for the displayName column. @default "displayName"
			 */
			header?: string;
			/**
			 * Wether or not the "displayName" is hidable or not. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the displayName column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure the users table dn column
		 */
		dn?: {
			/**
			 * Name of the table header for the dn column. @default "dn"
			 */
			header?: string;
			/**
			 * Wether or not the "dn" is hidable or not. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the dn column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure the users table givenName column
		 */
		givenName?: {
			/**
			 * Name of the table header for the givenName column. @default "givenName"
			 */
			header?: string;
			/**
			 * Wether or not the "givenName" is hidable or not. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the givenName column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure the users table jpegPhoto column
		 */
		jpegPhoto?: {
			/**
			 * Name of the table header for the jpegPhoto column. @default "jpegPhoto"
			 */
			header?: string;
			/**
			 * Wether or not the "jpegPhoto" is hidable or not. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the jpegPhoto column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure the users table mail column
		 */
		mail?: {
			/**
			 * Name of the table header for the mail column. @default "mail"
			 */
			header?: string;
			/**
			 * Wether or not the "mail" is hidable or not. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the mail column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure the users table "sAMAccountName" column
		 */
		sAMAccountName?: {
			/**
			 * Name of the table header for the "sAMAccountName" column. @default "sAMAccountName"
			 */
			header?: string;
			/**
			 * Wether or not the "sAMAccountName" is hidable or not. @default false
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the "sAMAccountName" column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure the users table sn column
		 */
		sn?: {
			/**
			 * Name of the table header for the sn column. @default "sn"
			 */
			header?: string;
			/**
			 * Wether or not the "sn" is hidable or not. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the sn column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure the users table userAccountControl column
		 */
		userAccountControl?: {
			/**
			 * Name of the table header for the userAccountControl column. @default "userAccountControl"
			 */
			header?: string;
			/**
			 * Wether or not the "userAccountControl" is hidable or not. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the userAccountControl column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
		/**
		 * Configure the users table whenCreated column
		 */
		whenCreated?: {
			/**
			 * Name of the table header for the whenCreated column. @default "whenCreated"
			 */
			header?: string;
			/**
			 * Wether or not the "whenCreated" is hidable or not. @default true
			 */
			hidable?: boolean;
			/**
			 * Wether or not to show the whenCreated column. If false "hidable" is ignored. @default true
			 */
			show?: boolean;
		};
	};
}
/**
 * Directory management configuration settings
 */
export interface DirectoryConfig {
	ldap?: LDAPClientConfig;
	/**
	 * CN of the directory's administrators group. @default Domain Admins
	 */
	adminGroup?: string;
	/**
	 * Directory settings regarding group management
	 */
	groups?: {
		/**
		 * The list of group distinguishedNames, sAMAccountNames, or cn that should not be shown in the /groups view dropdowns and search. Accessing directly to /groups/[dn] of a group that is listed here will result on a '403 This group is hidden by configuration' error. @default []
		 */
		hide?: string[];
		/**
		 * The maximum amount of groups allowed in the directory. If set to null the limit will be ignored. Default groups are included in the count. @default null
		 */
		limit?: number | null;
	};
	/**
	 * Directory settings regarding ou management
	 */
	ous?: {
		/**
		 * The list of ou distinguishedNames, sAMAccountNames, or cn that should not be shown in the /ous view dropdowns and search. Accessing directly to /ous/[dn] of a ou that is listed here will result on a '403 This ou is hidden by configuration' error. @default []
		 */
		hide?: string[];
		/**
		 * [Dangerous] Allows the deletion of non-leaf Organizational Units. This will recursively delete all entries in the Organizational Unit. @default false
		 */
		allowNonLeafDelete?: boolean;
		/**
		 * The maximum amount of ous allowed in the directory. If set to null the limit will be ignored. Default ous are included in the count. @default null
		 */
		limit?: number | null;
	};
	/**
	 * Directory settings regarding tree view
	 */
	tree?: {
		/**
		 * The list of entry distinguishedNames, sAMAccountNames, or cn that should not be shown in the /tree view panels and search. Accessing directly to /tree/[dn] of an entry that is listed here will result on a '403 This resource is hidden by configuration' error. Hiding containers or ous will also throw the error if trying to access any of the children directly. All hidden entries from users, groups, and ous will also be hidden in the tree view. Hiding the root entry will hide the whole tree, throwing the error always. @default []
		 */
		hide?: string[];
	};
	/**
	 * Directory settings regarding user management
	 */
	users?: {
		/**
		 * The list of user distinguishedNames, sAMAccountNames, or cn that should not be shown in the /users view dropdowns and search. Accessing directly to /users/[dn] of a user that is listed here will result on a '403 This user is hidden by configuration' error, however, signing in as a listed user will not result in error. @default []
		 */
		hide?: string[];
		/**
		 * The maximum amount of users allowed in the directory. If set to null the limit will be ignored. Default users are included in the count. @default null
		 */
		limit?: number | null;
	};
}
/**
 * LDAP client configuration
 */
export interface LDAPClientConfig {
	/**
	 * LDAP connection string. @default ldaps://localhost:636
	 */
	ldapURL: string;
	/**
	 * Force strict DN parsing for client methods @default true
	 */
	strictDN?: boolean;
	tlsOptions?: TLSOptions;
}
/**
 * Additional options passed to TLS connection layer when connecting via ldaps://
 */
export interface TLSOptions {
	/**
	 * Name of an OpenSSL engine which can provide the client certificate. @default null
	 */
	clientCertEngine?: string | null;
	/**
	 * When enabled, TLS packet trace information is written to stderr. This can be used to debug TLS connection problems. @default false
	 */
	enableTrace?: boolean;
	/**
	 * If true the server will reject any connection which is not authorized with the list of supplied CAs. This option only has an effect if requestCert is true. @default false
	 */
	rejectUnauthorized?: boolean;
	/**
	 * If true the server will request a certificate from clients that connect and attempt to verify that certificate. @default false
	 */
	requestCert?: boolean;
}
/**
 * System settings
 */
export interface SystemConfig {
	logging?: LoggingConfig;
}
/**
 * Logging configuration according to @link https://www.npmjs.com/package/sveltekit-logger-hook
 */
export interface LoggingConfig {
	/**
	 * Logging paths. Where the app and system logs will be stored. @default "./logs/"
	 */
	basePath?: string;
	/**
	 * Enable or disable url search params decoding. @default false
	 */
	decodeSearchParams?: boolean;
	/**
	 * Enable or disable pathname decoding. @default false
	 */
	decodePathname?: boolean;
	/**
	 * Log date template as indicated by @link https://day.js.org/docs/en/display/format @default "YYYY-MM-DD HH:mm:ss A"
	 */
	logDateTemplate?: string;
	/**
	 * Log template as indicated by @link https://www.npmjs.com/package/sveltekit-logger-hook @default "[{date}] {url}{urlSearchParams} {method} {status}"
	 */
	logTemplate?: string;
	/**
	 * Enable or disable logging. If `false` `basePath` is ignored. If `true` `basePath` is required @default false
	 */
	useLogging?: boolean;
}
