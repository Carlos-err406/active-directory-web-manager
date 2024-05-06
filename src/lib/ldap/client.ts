import { LDAP_URL } from '$env/static/private';
import { Client, type ClientOptions } from 'ldapts';

export const getLDAPClient = (options?: ClientOptions) => {
	return new Client({
		url: LDAP_URL,
		strictDN: true,
		tlsOptions: {
			// requestCert:false,
			rejectUnauthorized: false
		},
		...options
	});
};
