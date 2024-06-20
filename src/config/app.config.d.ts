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
	 * Interface configuration settings
	 */
	app: {
		/**
		 * Length of the captcha shown in the authentication page, recommended to use a low value for development.
		 *
		 * @default 5
		 */
		captcha_length?: number;
		[k: string]: unknown;
	};
	/**
	 * Directory management configuration settings
	 */
	directory: {
		users: Users;
		groups: Groups;
		[k: string]: unknown;
	};
	[k: string]: unknown;
}
/**
 * Directory settings reggarding user management
 */
export interface Users {
	/**
	 * The list of user DNs or sAMaccountNames that should not be shown in the list view and dropdowns
	 *
	 * @default []
	 */
	hide: string[];
	/**
	 * The maximum amount of users allowed in the directory. If set to null the limit will be ignored.
	 *
	 * @default null
	 */
	limit: number | null;
	[k: string]: unknown;
}
/**
 * Directory settings reggarding group management
 */
export interface Groups {
	/**
	 * The list of group DNs or sAMaccountNames that should not be shown in the list view and dropdowns
	 *
	 * @default []
	 */
	hide: string[];
	/**
	 * The maximum amount of groups allowed in the directory. If set to null the limit will be ignored.
	 *
	 * @default null
	 */
	limit: number | null;
	[k: string]: unknown;
}
