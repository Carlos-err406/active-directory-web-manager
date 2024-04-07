export const paths = {
	auth: '/',
	users: {
		list: '/users',
		me: '/users/me',
		dn: (dn: string) => `/users/${dn}`
	},
	groups: {
		list: '/groups',
		dn: (dn: string) => `/groups/${dn}`
	},
	ous: {
		list: '/ous',
		dn: (dn: string) => `/ous/${dn}`
	},
	settings: '/settings',
	logs: { list: '/logs' }
};
