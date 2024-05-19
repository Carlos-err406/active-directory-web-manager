import { ADMIN_GROUP, CAPTCHA_LENGTH, NODE_ENV } from '$env/static/private';
import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { paths } from '$lib';
import { entryBelongsToGroup } from '$lib/ldap';
import { getLDAPClient } from '$lib/ldap/client';
import { signUpSchema } from '$lib/schemas/signup-schema';
import { getPublicKey } from '$lib/server';
import { SESSION_ENTRY_ATTRIBUTES } from '$lib/types/session';
import { error, redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
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
		const captchaAnswerSigned = jwt.sign({ answer }, getPublicKey(), {
			algorithm: 'RS512',
			expiresIn: 60 * 5
		});
		cookies.set('ad-captcha', captchaAnswerSigned, {
			path: '/',
			httpOnly: true,
			secure: NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 5
		});
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
		const signedCaptchaAnswer = cookies.get('ad-captcha');
		if (!signedCaptchaAnswer) return setError(form, 'captcha', 'This captcha has expired');

		const { answer } = jwt.verify(signedCaptchaAnswer, getPublicKey(), {
			algorithms: ['RS512']
		}) as { answer: string };
		if (!answer) return setError(form, 'captcha', 'This captcha has expired');
		if (answer !== form.data.captcha) {
			return setError(form, 'captcha', 'Invalid captcha');
		}
		cookies.delete('ad-captcha', { path: '/' });
		const { password, email } = form.data;
		const [sAMAccountName] = email.split('@');
		const ldap = getLDAPClient();
		try {
			await ldap.bind(`${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`, password);
		} catch (e) {
			await ldap.unbind();
			console.log(e);
			if (e instanceof InvalidCredentialsError) throw error(401, 'Invalid Credentials');
			else {
				throw error(500, 'Something unexpected happened, try again later');
			}
		}
		const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
			filter: `(sAMAccountName=${sAMAccountName})`,
			attributes: SESSION_ENTRY_ATTRIBUTES
		});
		if (searchEntries.length === 0) {
			await ldap.unbind();
			throw error(401, 'Invalid Credentials');
		}
		const [user] = searchEntries;
		const isAdmin = await entryBelongsToGroup(ldap, user.distinguishedName as string, ADMIN_GROUP);
		try {
			const session = jwt.sign({ ...user, isAdmin }, getPublicKey(), {
				algorithm: 'RS512',
				expiresIn: '2h'
			});
			const access = jwt.sign({ email, password }, getPublicKey(), {
				algorithm: 'RS512',
				expiresIn: '2h'
			});
			const { cookies } = event;
			cookies.set('ad-session', session, {
				path: '/',
				expires: new Date(Date.now() + 60 * 60 * 2 * 1000),
				httpOnly: true,
				sameSite: 'strict',
				secure: NODE_ENV === 'production'
			});
			cookies.set('ad-access', access, {
				path: '/',
				expires: new Date(Date.now() + 60 * 60 * 2 * 1000),
				httpOnly: true,
				sameSite: 'strict',
				secure: NODE_ENV === 'production'
			});
		} catch (e) {
			await ldap.unbind();
			console.log(e);
			throw error(500, 'Something unexpected happened, try again later');
		}
		return redirect(302, '/users/me');
	},
	signOut: async ({ cookies, locals }) => {
		const auth = await locals.auth();
		cookies.delete('ad-session', { path: '/' });
		cookies.delete('ad-access', { path: '/' });
		if (!auth) {
			return redirect(302, '/');
		}
		const { ldap } = auth;
		await ldap.unbind();
		return redirect(302, '/');
	}
};
