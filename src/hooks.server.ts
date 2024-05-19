import { LOGGER } from '$env/static/private';
import { PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { getLDAPClient } from '$lib/ldap/client';
import {
	getAccessToken,
	getSessionToken,
	verifyAccessToken,
	verifySessionToken
} from '$lib/server';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getLoggerHook } from 'sveltekit-logger-hook';

const authenticationSetter: Handle = async ({ event, resolve }) => {
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
		} catch (err) {
			console.log(err);
			return null;
		}
	};

	event.locals.auth ??= () => auth(event);

	return resolve(event);
};

const getSequence = () => {
	const seq = [];
	if (LOGGER && LOGGER === '1') {
		console.log('LOGGING is enabled, set LOGGER .env variable to 0 to disable');
		const logger = getLoggerHook({
			template: '[{date}] {url}{urlSearchParams} {method} {status}',
			decodeSearchParams: true,
			colorOptions: {
				date: ({ status }) => (status >= 400 ? 'redBold' : 'yellow'),
				method: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
				status: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
				url: ({ status }) => (status >= 400 ? 'redBold' : 'cyanBold'),
				urlSearchParams: ({ status }) => (status >= 400 ? 'redBold' : 'cyan')
			}
		});
		seq.push(logger);
	} else {
		console.log('LOGGING is disabled, set LOGGER .env variable to 1 to enable');
	}
	seq.push(authenticationSetter);
	return seq;
};

export const handle = sequence(...getSequence());
