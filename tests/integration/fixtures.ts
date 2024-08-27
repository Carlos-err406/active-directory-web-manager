import { UAC } from '$lib/types/user';
import deepmerge from 'deepmerge';
import { Attribute, Change, Client, type ClientOptions } from 'ldapts';
import config from '../config';
import {
	description,
	displayName,
	dn,
	givenName,
	mail,
	password,
	sAMAccountName,
	sn
} from './mock-data';

const { ldapURL: url, strictDN, tlsOptions } = config.directory.ldap;

export const sudo = async (sudoOperation: (ldap: Client) => Promise<void>) => {
	const ldap = getLDAPClient();
	await ldap.bind(`administrator@${process.env.PUBLIC_LDAP_DOMAIN}`, process.env.ADMIN_PASSWD);
	await sudoOperation(ldap);
	await ldap.unbind();
};

export const getLDAPClient = (options?: ClientOptions) => {
	const opts = deepmerge({ url, strictDN, tlsOptions }, options || {});
	return new Client({ ...opts });
};
export const addTestUser = (ldap: Client) =>
	ldap
		.add(dn, {
			sAMAccountName,
			objectClass: ['user', 'top', 'person', 'organizationalPerson'],
			userAccountControl: [UAC['Normal Account']],
			displayName,
			givenName,
			sn,
			mail,
			description
		})
		.then(() =>
			ldap.modify(dn, [
				new Change({
					operation: 'replace',
					modification: new Attribute({
						type: 'unicodePwd',
						values: [Buffer.from(`"${password}"`, 'utf16le')]
					})
				})
			])
		);

export const delTestUser = (ldap: Client) => ldap.del(dn);
