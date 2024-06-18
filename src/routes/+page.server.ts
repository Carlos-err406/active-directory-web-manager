import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { getEntryBySAMAccountName } from '$lib/ldap';
import { getLDAPClient } from '$lib/ldap/client';
import { signUpSchema } from '$lib/schemas/signup-schema';
import {
	generateAccessToken,
	generateSessionToken,
	getCaptchaToken,
	setAccessCookie,
	setSessionCookie,
	verifyCaptchaToken
} from '$lib/server';
import { SESSION_ENTRY_ATTRIBUTES } from '$lib/types/session';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import { InvalidCredentialsError } from 'ldapts';
import { log } from 'sveltekit-logger-hook';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 } from 'uuid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(signUpSchema))
	};
};

export const actions: Actions = {
	signIn: async (event) => {
		const form = await superValidate(event, zod(signUpSchema));
		if (!form.valid) return fail(400, { form });
		const { cookies } = event;
		const captchaToken = getCaptchaToken(cookies);
		if (!captchaToken) return setError(form, 'captcha', 'This captcha has expired');
		const { password, email, captcha } = form.data;
		const { answer } = verifyCaptchaToken(captchaToken);

		if (!answer) return setError(form, 'captcha', 'This captcha has expired');
		if (answer !== captcha) return setError(form, 'captcha', 'Invalid captcha');
		cookies.delete('ad-captcha', { path: '/' });

		const [sAMAccountName] = email.split('@');
		const ldap = getLDAPClient();
		try {
			await ldap.bind(`${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`, password);
		} catch (e) {
			const errorId = v4();
			log({ errorId, error: `${e}` }, { basePath: './logs' });
			if (e instanceof InvalidCredentialsError)
				throw error(401, { message: 'Invalid Credentials', errorId });
			else {
				throw error(500, { message: 'Something unexpected happened, try again later', errorId });
			}
		}
		const user = await getEntryBySAMAccountName<User>(ldap, sAMAccountName, {
			base: PUBLIC_BASE_DN,
			searchOpts: { attributes: SESSION_ENTRY_ATTRIBUTES }
		});

		if (!user) {
			throw error(401, 'Invalid Credentials');
		}
		try {
			const session = await generateSessionToken(ldap, user);
			const access = generateAccessToken({ email, password });
			const { cookies } = event;
			setSessionCookie(cookies, session);
			setAccessCookie(cookies, access);
		} catch (e) {
			const errorId = v4();
			log({ errorId, error: `${e}` }, { basePath: './logs' });
			throw error(500, { message: 'Something unexpected happened, try again later', errorId });
		}
		return redirect(302, '/users/me');
	},
	signOut: async ({ cookies, locals }) => {
		const auth = await locals.auth();
		cookies.delete('ad-session', { path: '/' });
		cookies.delete('ad-access', { path: '/' });
		if (!auth) return redirect(302, '/');
		return redirect(302, '/');
	}
};
