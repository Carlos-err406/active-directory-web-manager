import getConfig from '$config';
import deepmerge from 'deepmerge';
import { Client, type ClientOptions } from 'ldapts';

export const getLDAPClient = async (options?: ClientOptions) => {
	const config = await getConfig();
	const { ldapURL: url, strictDN, tlsOptions } = config.directory.ldap;
	const opts = deepmerge({ url, strictDN, tlsOptions }, options || {});
	return new Client({ ...opts });
};
