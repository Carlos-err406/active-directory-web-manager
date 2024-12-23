import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { getEntryBySAMAccountName } from '$lib/ldap';
import { getLDAPClient } from '$lib/ldap/client';
import { signInSchema } from '$lib/schemas/sign-in-schema';
import {
	generateAccessToken,
	generateSessionToken,
	getCaptchaToken,
	setAccessCookie,
	setSessionCookie,
	verifyCaptchaToken
} from '$lib/server';
import { appLog, errorLog } from '$lib/server/logs';
import { SESSION_ENTRY_ATTRIBUTES } from '$lib/types/session';
import type { User } from '$lib/types/user';
import { error, redirect, type Action } from '@sveltejs/kit';
import { InvalidCredentialsError } from 'ldapts';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const signIn: Action = async (event) => {
	const form = await superValidate(event, zod(signInSchema));
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
	const ldap = await getLDAPClient();
	try {
		await ldap.bind(`${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`, password);
	} catch (e) {
		const errorId = await errorLog(e, { message: 'Sign in attempt failed for user ' + email });
		if (e instanceof InvalidCredentialsError) {
			const dataCode = e.message.split('data ')[1].split(',')[0];
			if (dataCode === '52e') throw error(401, { message: 'Invalid Credentials', errorId });
			else if (dataCode === '530')
				throw error(401, { message: 'Not permitted to logon at this time', errorId });
			else if (dataCode === '532') throw error(401, { message: 'Password has expired!', errorId });
			else if (dataCode === '533') throw error(401, { message: 'Account is disabled!', errorId });
			else if (dataCode === '701') throw error(401, { message: 'Account has expired!', errorId });
			else
				throw error(401, {
					message: 'Something unexpected happened. Consider consulting your administrator',
					errorId
				});
		} else if (e instanceof AggregateError) {
			console.log({ e, errorId });
			throw error(500, { message: 'Error trying to connect to directory', errorId });
		} else {
			console.log({ e, errorId });
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
		const errorId = await errorLog(e);
		throw error(500, { message: 'Something unexpected happened, try again later', errorId });
	}
	await appLog(`User ${user.sAMAccountName} signed in`, 'Info');
	return redirect(302, '/users/me');
};

export const signOut: Action = async ({ cookies, locals }) => {
	const auth = await locals.auth();
	if (!auth) return redirect(302, '/');
	cookies.delete('ad-session', { path: '/' });
	cookies.delete('ad-access', { path: '/' });
	await appLog(`User ${auth.session.sAMAccountName} signed out`, 'Info');
	return redirect(302, '/');
};
