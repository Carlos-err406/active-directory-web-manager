/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Application configuration settings
 */
export interface Config {
	/**
	 * System settings
	 */
	system?: {
		/**
		 * Logging settings
		 */
		logging?: {
			/**
			 * Enable or disable logging. If `false` `basePath` is ignored. If `true` `basePath` is required @default ./logs
			 */
			useLogging?: boolean;
			/**
			 * Log template as indicated by @link https://www.npmjs.com/package/sveltekit-logger-hook @default "[{date}] {url}{urlSearchParams} {method} {status}"
			 */
			logTemplate?: string;
			/**
			 * Log date template as indicated by @link https://day.js.org/docs/en/display/format @default "YYYY-MM-DD HH:mm:ss A"
			 */
			logDateTemplate?: string;
			/**
			 * Enable or disable url search params decoding. @default false
			 */
			decodeSearchParams?: boolean;
			/**
			 * Logging paths. Where the app and system logs will be stored
			 */
			basePath?: string;
		};
	};
	/**
	 * Interface configuration settings
	 */
	app?: {
		/**
		 * configuration reggarding de different pages of the web app
		 */
		views?: {
			/**
			 * configuration reggarding the users page
			 */
			usersPage?: {
				table?: {
					columns?: {
						jpegPhoto?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						sAMAccountName?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						displayName?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						givenName?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						sn?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						mail?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						description?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						dn?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						userAccountControl?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						whenCreated?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
					};
				};
			};
			/**
			 * configuration reggarding the groups page
			 */
			groupsPage?: {
				/**
				 * Weather or not to show the /groups page in navigation. Accessing directly to this route will result on a '403 This page has been disabled by configuration' error
				 */
				show?: boolean;
				table?: {
					columns?: {
						sAMAccountName?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						mail?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						dn?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						description?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						groupType?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
						whenCreated?: {
							show?: boolean;
							header?: string;
							hidable?: boolean;
						};
					};
				};
			};
			/**
			 * configuration reggarding the ous page
			 */
			ousPage?: {
				/**
				 * Weather or not to show the /ous page in navigation. Accessing directly to this route will result on a '403 This page has been disabled by configuration' error
				 */
				show?: boolean;
			};
			/**
			 * configuration reggarding the tree page
			 */
			treePage?: {
				/**
				 * Weather or not to show the /tree page in navigation. Accessing directly to this route will result on a '403 This page has been disabled by configuration' error
				 */
				show?: boolean;
			};
			/**
			 * configuration reggarding the logs page
			 */
			logsPage?: {
				/**
				 * Weather or not to show the /logs page in navigation. Accessing directly to this route will result on a '403 This page has been disabled by configuration' error
				 */
				show?: boolean;
			};
			/**
			 * configuration reggarding the settings page
			 */
			settingsPage?: {
				/**
				 * Weather or not to allow the user to change the configuration. @default false
				 */
				showConfigurationForm?: boolean;
			};
		};
		/**
		 * Length of the captcha shown in the authentication page, recommended to use a low value for development.5
		 */
		captchaLength?: number;
	};
	/**
	 * Directory management configuration settings
	 */
	directory?: {
		/**
		 * Directory settings reggarding user management
		 */
		users?: {
			/**
			 * The list of user distinguishedNames or sAMAccountNames that should not be shown in the /users view dropdowns and search. Accessing directly to /users/[dn] of a user that is listed here will result on a '403 This user is hidden by configuration' error, however, signing in as a listed user will not result in error. @default []
			 */
			hide?: string[];
			/**
			 * The maximum amount of users allowed in the directory. If set to null the limit will be ignored. Default users are included in the count. @default null
			 */
			limit?: number | null;
		};
		/**
		 * Directory settings reggarding group management
		 */
		groups?: {
			/**
			 * The list of group distinguishedNames or sAMAccountNames that should not be shown in the /groups view dropdowns and search. Accessing directly to /groups/[dn] of a user that is listed here will result on a '403 This user is hidden by configuration' error. @default []
			 */
			hide?: string[];
			/**
			 * The maximum amount of groups allowed in the directory. If set to null the limit will be ignored. Default groups are included in the count. @default null
			 */
			limit?: number | null;
		};
	};
	[k: string]: unknown;
}
