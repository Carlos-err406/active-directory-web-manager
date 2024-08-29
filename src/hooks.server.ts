import config, { LOGGING_SYSTEM_BASE } from '$config';
import { PUBLIC_API_KEY, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { getLDAPClient } from '$lib/ldap/client';
import {
	getAccessToken,
	getSessionToken,
	verifyAccessToken,
	verifySessionToken
} from '$lib/server';
import { errorLog } from '$lib/server/logs';
import { error, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getLoggerHook } from 'sveltekit-logger-hook';

const apiProtectionHandler: Handle = ({ event, resolve }) => {
	const { url, request } = event;
	if (!url.pathname.startsWith('/api')) return resolve(event);
	const headerApiKey = request.headers.get('Authorization');
	if (headerApiKey !== `Bearer ${PUBLIC_API_KEY}`) {
		throw error(401, 'Invalid authorization header');
	}
	return resolve(event);
};

/**
 * sets the auth function in the locals, which returns the session and a binded ldap client instance
 */
const authenticationSetHandler: Handle = async ({ event, resolve }) => {
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
			errorLog(e);
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
		errorLog(e, { message: 'error at ldapUnbindHandler hook' });
	}
	return response;
};

const { decodeSearchParams, logDateTemplate, logTemplate, useLogging, decodePathname } =
	config.system.logging;
/** handler hook for logging all requests
 *
 * if LOGGER environment variable is 1 the `logHandler` hook is included on the sequence
 * else `logHandler` is not included
 */
const logHandler = getLoggerHook({
	template: logTemplate,
	dateTemplate: logDateTemplate,
	fileOptions: { basePath: LOGGING_SYSTEM_BASE },
	decodeSearchParams,
	decodePathname,
	colorOptions: {
		date: ({ status }) => (status >= 400 ? 'redBold' : 'yellow'),
		method: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
		status: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
		url: ({ status }) => (status >= 400 ? 'redBold' : 'cyanBold'),
		urlSearchParams: ({ status }) => (status >= 400 ? 'redBold' : 'default')
	}
});

const getSequence = () => {
	const sequence: Handle[] = [apiProtectionHandler, authenticationSetHandler, ldapUnbindHandler];
	if (useLogging) {
		sequence.unshift(logHandler);
		console.log('Logging is enabled');
	} else console.log('Logging is disabled');
	return sequence;
};

export const handle = sequence(...getSequence());
