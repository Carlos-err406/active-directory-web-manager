import { LOGGER } from '$env/static/private';
import { PUBLIC_API_KEY, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { getLDAPClient } from '$lib/ldap/client';
import {
	getAccessToken,
	getSessionToken,
	verifyAccessToken,
	verifySessionToken
} from '$lib/server';
import { error, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getLoggerHook, log } from 'sveltekit-logger-hook';
import { v4 } from 'uuid';

const apiProtectionHandler: Handle = ({ event, resolve }) => {
	const { url, request } = event;
	if (!url.pathname.startsWith('/api')) {
		return resolve(event);
	}
	const headerApiKey = request.headers.get('Authorization');
	if (headerApiKey !== `Bearer ${PUBLIC_API_KEY}`) {
		throw error(401, 'Invalid authorization header');
	}
	return resolve(event);
};

/**
 * sets the auth function in the locals, wich returns the session and a binded ldap client instance
 */
const authenticationSetterHandler: Handle = async ({ event, resolve }) => {
	const auth = async ({ cookies }: typeof event) => {
		const access = getAccessToken(cookies);
		if (!access) return null;
		const session = getSessionToken(cookies);
		if (!session) return null;
		try {
			const ldap = getLDAPClient();
			const { email, password } = verifyAccessToken(access);
			const [sAMAccountName] = email.split('@');
			await ldap.bind(`${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`, password);
			return {
				ldap,
				session: verifySessionToken(session)
			};
		} catch (e) {
			const errorId = v4();
			log({ errorId, error: `${e}` }, { basePath: './logs' });
			return null;
		}
	};

	event.locals.auth ??= () => auth(event);

	return resolve(event);
};

/**
 * Runs ldap.unbind() after resolve
 */
const ldapUnbindHandler: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) return response;
	const { ldap } = auth;
	try {
		await ldap.unbind();
	} catch (e) {
		const errorId = v4();
		log(
			{ errorId, error: `${e}`, message: 'error at ldapUnbindHandler hook' },
			{ basePath: './logs' }
		);
	}
	return response;
};

/** hander hook for logging all requests
 *
 * if LOGGER enviroment variable is 1 the `logHandler` hook is included on the sequence
 * else `logHadler` is not included
 */
const logHandler = getLoggerHook({
	template: '[{date}] {url}{urlSearchParams} {method} {status}',
	dateTemplate: 'YYYY-MM-DD HH:mm:ss A',
	fileOptions: { basePath: './logs/' },
	decodeSearchParams: true,
	colorOptions: {
		date: ({ status }) => (status >= 400 ? 'redBold' : 'yellow'),
		method: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
		status: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
		url: ({ status }) => (status >= 400 ? 'redBold' : 'cyanBold'),
		urlSearchParams: ({ status }) => (status >= 400 ? 'redBold' : 'default')
	}
});

/** returns the sequence of handlers
 *
 *  depending on the LOGGER enviroment variable, the `logHandler` hook is included on the sequence or not */
const getSequence = () => {
	const seq = [];
	if (LOGGER && LOGGER === '1') {
		log('LOGGING is enabled, set LOGGER .env variable to 0 to disable');
		seq.push(logHandler);
	} else {
		log('LOGGING is disabled, set LOGGER .env variable to 1 to enable');
	}
	seq.push(apiProtectionHandler, authenticationSetterHandler, ldapUnbindHandler);
	return seq;
};

export const handle = sequence(...getSequence());
