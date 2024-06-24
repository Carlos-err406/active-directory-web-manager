import config from '$config';
import deepmerge from 'deepmerge';
import { Client, type ClientOptions } from 'ldapts';

const { ldapURL: url, strictDN, tlsOptions } = config.directory.ldap;

export const getLDAPClient = (options?: ClientOptions) => {
	const opts = deepmerge({ url, strictDN, tlsOptions }, options || {});
	return new Client({ ...opts });
};
