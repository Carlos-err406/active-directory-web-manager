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
  app?: AppConfig;
  directory?: DirectoryConfig;
  system?: SystemConfig;
  [k: string]: unknown;
}
/**
 * Application configuration settings
 */
export interface AppConfig {
  captcha?: CaptchaConfig;
  views?: ViewsConfig;
}
/**
 * Captcha personalization options. You can test these live in @link https://vanilla-captcha-demo.vercel.app/server-captcha
 */
export interface CaptchaConfig {
  /**
   * CSS color of the captcha background. Can use other css variants other than hex. @default "#FFFFFF"
   */
  backgroundColor?: string;
  /**
   * Font of the characters in the captcha. @default "Arial"
   */
  font?: string;
  /**
   * CSS color of the captcha text. Can use other css variants other than hex. @default "#777777"
   */
  fontColor?: string;
  /**
   * Font size of the characters in the captcha. @default 30
   */
  fontSize?: number;
  /**
   * Font size of the characters in the captcha. @default 600
   */
  fontWeight?: number;
  /**
   * Height of the captcha image. @default 96
   */
  height?: number;
  /**
   * Length of the captcha shown in the authentication page, recommended to use a low value for development. @default 5
   */
  length?: number;
  /**
   * Number of lines that strike over the captcha. @default 10
   */
  lineAmount?: number;
  /**
   * CSS color of the lines that strike the captcha text. Can use other css variants other than hex. @default "#777777"
   */
  lineColor?: string;
  /**
   * Width of lines that strike over the captcha. @default 1
   */
  lineWidth?: number;
  /**
   * Width of the captcha image. @default 345
   */
  width?: number;
}
/**
 * Configuration reggarding de different pages of the web app
 */
export interface ViewsConfig {
  groupsPage?: GroupsPageConfig;
  logsPage?: LogsPageConfig;
  ousPage?: OusPageConfig;
  settingsPage?: SettingsPageConfig;
  treePage?: TreePageConfig;
  usersPage?: UsersPageConfig;
  [k: string]: unknown;
}
/**
 * Configuration reggarding the groups page
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
 * Configuration reggarding the detailed view of a group ("/groups/[dn]")
 */
export interface GroupDetailsConfig {
  /**
   * Configuration reggarding the "cn" attribute of the group
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
   * Configuration reggarding the "description" attribute of the group
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
   * Configuration reggarding the "distinguishedName" attribute of the group
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
   * Configuration reggarding the "groupType" attribute of the group
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
   * Configuration reggarding the "mail" attribute of the group
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
  /**
   * Configuration reggarding the "member" attribute of the group
   */
  member?: {
    /**
     * @default "member"
     */
    label?: string;
    /**
     * If false the attribute "member" of the group will be shown as the full distinguishedName, else only the CN is shown. @default false
     */
    shortMember?: boolean;
    /**
     * Wether or not to show the "member" attribute in the "/groups/[dn]" page. If false "shortMember" will be ignored @default true
     */
    show?: boolean;
  };
  /**
   * Configuration reggarding the "sAMAccountName" attribute of the group
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
   * Configuration reggarding the "whenChanged" attribute of the group
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
   * Configuration reggarding the "whenCreated" attribute of the group
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
 * Groups table view configuration
 */
export interface GroupsTableConfig {
  /**
   * Groups table column settings
   */
  columns?: {
    /**
     * Configure groups table "description" clolumn.
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
     * Configure groups table "dn" clolumn.
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
     * Configure groups table "groupType" clolumn.
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
     * Configure groups table "mail" clolumn.
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
     * Configure groups table "sAMAccountName" clolumn.
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
     * Configure groups table "whenCreated" clolumn.
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
 * configuration reggarding the logs page
 */
export interface LogsPageConfig {
  /**
   * Weather or not to show the /logs page in navigation. Accessing directly to this route will result on a '403 This page has been disabled by configuration' error
   */
  show?: boolean;
}
/**
 * Configuration reggarding the ous page
 */
export interface OusPageConfig {
  /**
   * Weather or not to show the /ous page in navigation. Accessing directly to this route will result on a '403 This page has been disabled by configuration' error. @defaults true
   */
  show?: boolean;
}
/**
 * Configuration reggarding the settings page
 */
export interface SettingsPageConfig {
  /**
   * Weather or not to allow the user to change the configuration. @default false
   */
  showConfigurationForm?: boolean;
}
/**
 * Configuration reggarding the tree page
 */
export interface TreePageConfig {
  /**
   * Wether or not to show the /tree page in navigation. Accessing directly to this route will result on a '403 This page has been disabled by configuration' error. @default true
   */
  show?: boolean;
}
/**
 * Configuration reggarding the users page
 */
export interface UsersPageConfig {
  details?: UserDetailsConfig;
  table?: UsersTableConfig;
}
/**
 * Configuration reggarding the detailed view of a user ("/users/[dn]" or "/users/me")
 */
export interface UserDetailsConfig {
  /**
   * Configuration reggarding the "description" attribute of the user
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
   * Configuration reggarding the "displayName" attribute of the user
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
   * Configuration reggarding the "distinguishedName" attribute of the user
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
   * Configuration reggarding the "givenName" attribute of the user
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
   * Configuration reggarding the "jpegPhoto" attribute of the user. If "showFallback" and "show" are false then nothing will be shown
   */
  jpegPhoto?: {
    /**
     * Wether or not to show the "jpegPhoto" in the detail pages ("/users/[dn]" or "/users/me"). @default true
     */
    show?: boolean;
  };
  /**
   * Configuration reggarding the "mail" attribute of the user
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
  /**
   * Configuration reggarding the "memberOf" attribute of the user
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
     * Wether or not to show the "memberOf" attribute in the detail pages ("/users/[dn]" or "/users/me"). If false "shortMemberOf" will be ignored @default true
     */
    show?: boolean;
  };
  /**
   * Configuration reggarding the "sAMAccountName" attribute of the user
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
   * Configuration reggarding the "sn" attribute of the user
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
   * Configuration reggarding the "userAccountControl" attribute of the user
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
   * Configuration reggarding the "whenChanged" attribute of the user
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
   * Configuration reggarding the "whenCreated" attribute of the user
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
       * Wether or not the "sAMAccountName" is hidable or not. @default falses
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
