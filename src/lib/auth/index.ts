import { AUTH_SECRET, NODE_ENV } from '$env/static/private';
import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/sveltekit/providers/credentials';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Credentials({
			credentials: {
				email: { type: 'email' },
				password: { type: 'password' }
			},
			authorize: async (credentials) => {
				if (!credentials || !credentials.email || !credentials.password) return null;
				const { email, password } = credentials as { email: string; password: string };

				if (email === 'admin@mail.com' && password === 'admin12345678') {
					return { id: '1', name: 'admin' };
				}

				return null;
			}
		})
	],
	debug: NODE_ENV === 'development',
	trustHost: true,
	secret: AUTH_SECRET,
	session: {
		strategy: 'jwt'
	}
});
