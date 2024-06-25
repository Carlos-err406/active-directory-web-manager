import type { RecursiveRequired } from '@sveltejs/kit';

/** default values to be overridden by the values in Config*/
const defaults: RecursiveRequired<App.Config> = {
	app: {
		captcha: {
			backgroundColor: '#FFFFFF',
			font: 'Arial',
			fontColor: '#777777',
			fontSize: 30,
			fontWeight: 600,
			height: 96,
			length: 5,
			lineAmount: 10,
			lineColor: '#777777',
			lineWidth: 1,
			width: 345
		},
		nonAdmin: {
			allowAccessToGroupsPage: false,
			allowAccessToLogsPage: false,
			allowAccessToOUsPage: false,
			allowAccessToTreePage: false,
			allowAccessToUsersPage: false,
			allowSelfEdit: false
		},
		views: {
			groupsPage: {
				details: {
					cn: {
						label: 'cn',
						show: true
					},
					description: {
						label: 'description',
						show: true
					},
					distinguishedName: {
						label: 'distinguishedName',
						show: true
					},
					groupType: {
						label: 'groupType',
						show: true
					},
					mail: {
						label: 'mail',
						show: true
					},
					member: {
						label: 'member',
						shortMember: false,
						show: true
					},
					sAMAccountName: {
						label: 'sAMAccountName',
						show: true
					},
					whenChanged: {
						label: 'whenChanged',
						show: true
					},
					whenCreated: {
						label: 'whenCreated',
						show: true
					}
				},
				show: true,
				table: {
					columns: {
						description: {
							header: 'description',
							hidable: true,
							show: true
						},
						dn: {
							header: 'distinguishedName',
							hidable: true,
							show: true
						},
						groupType: {
							header: 'groupType',
							hidable: true,
							show: true
						},
						mail: {
							header: 'mail',
							hidable: true,
							show: true
						},
						sAMAccountName: {
							header: 'sAMAccountName',
							hidable: true,
							show: true
						},
						whenCreated: {
							header: 'whenCreated',
							hidable: true,
							show: true
						}
					}
				}
			},
			logsPage: {
				show: true
			},
			ousPage: {
				show: true
			},
			settingsPage: {
				allowToChangeTheme: false,
				showConfigurationForm: true
			},
			treePage: {
				show: true
			},
			usersPage: {
				details: {
					description: {
						label: 'description',
						show: true
					},
					displayName: {
						label: 'displayName',
						show: true
					},
					distinguishedName: {
						label: 'distinguishedName',
						show: true
					},
					givenName: {
						label: 'givenName',
						show: true
					},
					jpegPhoto: {
						show: true
					},
					mail: {
						label: 'mail',
						show: true
					},
					memberOf: {
						label: 'memberOf',
						shortMemberOf: false,
						show: true
					},
					sAMAccountName: {
						label: 'sAMAccountName',
						show: true
					},
					sn: {
						label: 'sn',
						show: true
					},
					userAccountControl: {
						label: 'userAccountControl',
						show: true
					},
					whenChanged: {
						label: 'whenChanged',
						show: true
					},
					whenCreated: {
						label: 'whenCreated',
						show: true
					}
				},
				table: {
					columns: {
						description: {
							header: 'description',
							hidable: true,
							show: true
						},
						displayName: {
							header: 'displayName',
							hidable: true,
							show: true
						},
						dn: {
							header: 'distinguishedName',
							hidable: true,
							show: true
						},
						givenName: {
							header: 'givenName',
							hidable: true,
							show: true
						},
						jpegPhoto: {
							header: 'jpegPhoto',
							hidable: true,
							show: true
						},
						mail: {
							header: 'mail',
							hidable: true,
							show: true
						},
						sAMAccountName: {
							header: 'sAMAccountName',
							hidable: true,
							show: true
						},
						sn: {
							header: 'sn',
							hidable: true,
							show: true
						},
						userAccountControl: {
							header: 'userAccountControl',
							hidable: true,
							show: true
						},
						whenCreated: {
							header: 'whenCreated',
							hidable: true,
							show: true
						}
					}
				}
			}
		}
	},
	directory: {
		adminGroup: 'Domain Admins',
		groups: {
			hide: [],
			limit: null
		},
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
		users: {
			hide: [],
			limit: null
		}
	},
	recyclebin: {},
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
