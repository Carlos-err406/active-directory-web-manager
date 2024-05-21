import { CAPTCHA_LENGTH } from '$env/static/private';
import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { paths } from '$lib';
import { getEntryBySAMAccountName } from '$lib/ldap';
import { getLDAPClient } from '$lib/ldap/client';
import { signUpSchema } from '$lib/schemas/signup-schema';
import {
	generateAccessToken,
	generateCaptchaToken,
	generateSessionToken,
	getCaptchaToken,
	setAccessCookie,
	setCaptchaCookie,
	setSessionCookie,
	verifyCaptchaToken
} from '$lib/server';
import { SESSION_ENTRY_ATTRIBUTES } from '$lib/types/session';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import { InvalidCredentialsError } from 'ldapts';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 } from 'uuid';
import generate from 'vanilla-captcha';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, depends }) => {
	depends(paths.auth.dependencies.captcha);
	const { answer, captcha } = await generate(Number(CAPTCHA_LENGTH) || 5);
	try {
		const captchaToken = generateCaptchaToken(answer);
		setCaptchaCookie(cookies, captchaToken);
	} catch (e) {
		const errorId = v4();
		console.log({ errorId, e });
		throw error(500, {
			message: 'Something went wrong while generating the captcha, please try refreshing the page',
			errorId
		});
	}
	return {
		form: await superValidate(zod(signUpSchema)),
		captcha: 'data:image/png;charset=utf-8;base64,' + captcha.toString('base64')
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
			console.log(e);
			if (e instanceof InvalidCredentialsError) throw error(401, 'Invalid Credentials');
			else {
				throw error(500, 'Something unexpected happened, try again later');
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
			console.log(e);
			throw error(500, 'Something unexpected happened, try again later');
		}
		return redirect(302, paths.users.me);
	},
	signOut: async ({ cookies, locals }) => {
		const auth = await locals.auth();
		cookies.delete('ad-session', { path: '/' });
		cookies.delete('ad-access', { path: '/' });
		if (!auth) return redirect(302, '/');
		return redirect(302, '/');
	}
};
