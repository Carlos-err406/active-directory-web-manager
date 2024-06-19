import { PUBLIC_API_KEY, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { SYSTEM_LOGS_DIR } from '$lib';
import { getLDAPClient } from '$lib/ldap/client';
import {
	getAccessToken,
	getSessionToken,
	verifyAccessToken,
	verifySessionToken
} from '$lib/server';
import { errorLog } from '$lib/utils';
import { error, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import jsonSchema from 'json-schema-library';
import { getLoggerHook } from 'sveltekit-logger-hook';
import { v4 } from 'uuid';
import config from './config/app.config.json';
import schema from './config/app.config.schema.json';

const { Draft07 } = jsonSchema;
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

/** hander hook for logging all requests
 *
 * if LOGGER enviroment variable is 1 the `logHandler` hook is included on the sequence
 * else `logHadler` is not included
 */
const logHandler = getLoggerHook({
	template: '[{date}] {url}{urlSearchParams} {method} {status}',
	dateTemplate: 'YYYY-MM-DD HH:mm:ss A',
	fileOptions: { basePath: SYSTEM_LOGS_DIR },
	decodeSearchParams: true,
	colorOptions: {
		date: ({ status }) => (status >= 400 ? 'redBold' : 'yellow'),
		method: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
		status: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
		url: ({ status }) => (status >= 400 ? 'redBold' : 'cyanBold'),
		urlSearchParams: ({ status }) => (status >= 400 ? 'redBold' : 'default')
	}
});

const configSetHandler: Handle = ({ event, resolve }) => {
	let errors: jsonSchema.JsonError[] = [];
	try {
		const mySchema: jsonSchema.Draft = new Draft07(schema);
		errors = mySchema.validate(config);
	} catch (e) {
		const message = 'Something went wrong while loading configuration';
		const errorId = errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	if (errors.length > 0) {
		console.log(errors[0]);
		const errorId = v4();
		errors.map((error) => {
			errorLog('Invalid Config file', {
				errorId,
				message: error.message,
				errorName: 'Invalid Config file'
			});
		});
		throw error(500, { message: 'Something went wrong loading the configuration file', errorId });
	}
	event.locals.config = config as App.Config;
	return resolve(event);
};
export const handle = sequence(
	logHandler,
	configSetHandler,
	apiProtectionHandler,
	authenticationSetHandler,
	ldapUnbindHandler
);
