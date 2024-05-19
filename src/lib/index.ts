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
			create: '/users?/createUser',
			update: '/users?/updateUser',
			delete: '/users?/deleteUser',
			deleteMany: '/users?/deleteManyUsers',
			changePassword: '/users?/changeUserPassword'
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
	tree: {
		list: '/tree'
	},
	settings: '/settings',
	logs: { list: '/logs' }
};
