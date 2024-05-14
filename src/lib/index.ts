export const paths = {
	auth: {
		signIn: '/',
		dependencies: { captcha: 'auth:captcha' },
		actions: { signIn: '/?/signIn', signOut: '/?/signOut' }
	},
	users: {
		list: '/users',
		me: '/users/me',
		dn: (dn: string) => `/users/${dn}`,
		actions: {
			create: '/users?/create',
			update: '/users?/update',
			delete: '/users?/delete',
			deleteMany: '/users?/deleteMany'
		}
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
