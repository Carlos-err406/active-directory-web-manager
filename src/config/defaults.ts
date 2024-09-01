import type { RecursiveRequired } from '@sveltejs/kit';

/** default values to be overridden by the values in Config*/
const defaults: RecursiveRequired<App.Config> = {
	app: {
		captcha: {
			background: '#FFFFFF',
			charPreset: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
			color: false,
			fontSize: 90,
			height: 96,
			ignoreChars: '',
			noise: 5,
			size: 5,
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
					parent: {
						asLink: false,
						label: 'parent',
						shortParent: false,
						show: true
					},
					member: {
						label: 'member',
						shortMember: false,
						show: true,
						asLinks: false
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
				details: {
					name: {
						label: 'name',
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
					whenChanged: {
						label: 'whenChanged',
						show: true
					},
					whenCreated: {
						label: 'whenCreated',
						show: true
					},
					parent: {
						asLink: false,
						label: 'parent',
						shortParent: false,
						show: true
					},
					member: {
						label: 'member',
						show: true,
						shortMember: false,
						asLinks: false
					}
				},
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
						name: {
							header: 'name',
							hidable: false,
							show: true
						},
						whenCreated: {
							header: 'whenCreated',
							hidable: true,
							show: true
						}
					}
				},
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
					parent: {
						asLink: false,
						label: 'parent',
						shortParent: false,
						show: true
					},
					memberOf: {
						label: 'memberOf',
						shortMemberOf: false,
						show: true,
						asLinks: false
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
		tree: {
			hide: []
		},
		ldap: {
			ldapURL: 'ldaps://localhost:636',
			strictDN: true,
			tlsOptions: {
				clientCertEngine: null,
				enableTrace: false,
				rejectUnauthorized: false,
				requestCert: false
			}
		},
		ous: {
			hide: [],
			allowNonLeafDelete: false,
			limit: null
		},
		users: {
			hide: [],
			limit: null
		}
	},
	system: {
		logging: {
			basePath: './logs',
			decodePathname: false,
			decodeSearchParams: false,
			logDateTemplate: 'YYYY-MM-DD HH:mm:ss A',
			logTemplate: '[{date}] {url}{urlSearchParams} {method} {status}',
			useLogging: true
		}
	}
};

export default defaults;
