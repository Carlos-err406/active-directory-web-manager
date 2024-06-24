import type { RecursiveRequired } from '@sveltejs/kit';

/** default values to be overriden by the values in Config*/
const defaults: RecursiveRequired<App.Config> = {
	app: {
		captcha: {
			length: 5,
			backgroundColor: '#FFFFFF',
			width: 345,
			height: 96,
			font: 'Arial',
			fontSize: 30,
			fontWeight: 600,
			fontColor: '#777777',
			lineColor: '#777777',
			lineAmount: 10,
			lineWidth: 1
		},
		views: {
			logsPage: { show: true },
			ousPage: { show: true },
			settingsPage: { showConfigurationForm: true, allowToChangeTheme: false },
			treePage: { show: true },
			usersPage: {
				details: {
					jpegPhoto: { show: true },
					description: { label: 'description', show: true },
					displayName: { label: 'displayName', show: true },
					distinguishedName: { label: 'distinguishedName', show: true },
					givenName: { label: 'givenName', show: true },
					mail: { label: 'mail', show: true },
					memberOf: { label: 'memberOf', shortMemberOf: false, show: true },
					sAMAccountName: { label: 'sAMAccountName', show: true },
					sn: { label: 'sn', show: true },
					userAccountControl: { label: 'userAccountControl', show: true },
					whenChanged: { label: 'whenChanged', show: true },
					whenCreated: { label: 'whenCreated', show: true }
				},
				table: {
					columns: {
						description: { header: 'description', hidable: true, show: true },
						displayName: { header: 'displayName', hidable: true, show: true },
						dn: { header: 'distinguishedName', hidable: true, show: true },
						givenName: { header: 'givenName', hidable: true, show: true },
						jpegPhoto: { header: 'jpegPhoto', hidable: true, show: true },
						mail: { header: 'mail', hidable: true, show: true },
						sAMAccountName: { header: 'sAMAccountName', hidable: true, show: true },
						sn: { header: 'sn', hidable: true, show: true },
						userAccountControl: { header: 'userAccountControl', hidable: true, show: true },
						whenCreated: { header: 'whenCreated', hidable: true, show: true }
					}
				}
			},
			groupsPage: {
				show: true,
				details: {
					cn: { show: true, label: 'cn' },
					description: { show: true, label: 'description' },
					distinguishedName: { show: true, label: 'distinguishedName' },
					groupType: { show: true, label: 'groupType' },
					mail: { show: true, label: 'mail' },
					member: { shortMember: false, show: true, label: 'member' },
					sAMAccountName: { show: true, label: 'sAMAccountName' },
					whenChanged: { show: true, label: 'whenChanged' },
					whenCreated: { show: true, label: 'whenCreated' }
				},
				table: {
					columns: {
						description: { header: 'description', hidable: true, show: true },
						dn: { header: 'distinguishedName', hidable: true, show: true },
						mail: { header: 'mail', hidable: true, show: true },
						sAMAccountName: { header: 'sAMAccountName', hidable: true, show: true },
						groupType: { header: 'groupType', hidable: true, show: true },
						whenCreated: { header: 'whenCreated', hidable: true, show: true }
					}
				}
			}
		}
	},
	directory: {
		ldap: {
			ldapURL: 'ldaps://localhost:636',
			strictDN: true,
			tlsOptions: {
				clientCertEngine: null,
				enableTrace: false,
				rejectUnauthorized: true,
				requestCert: false
			}
		},
		adminGroup: 'Domain Admins',
		groups: { hide: [], limit: null },
		users: { hide: [], limit: null }
	},
	system: {
		logging: {
			basePath: './logs',
			decodeSearchParams: false,
			logDateTemplate: 'YYYY-MM-DD HH:mm:ss A',
			logTemplate: '[{date}] {url}{urlSearchParams} {method} {status}',
			useLogging: true
		}
	}
};

export default defaults;
