import { Attribute, Change, EqualityFilter, type Client } from 'ldapts';
import { dn, password, sAMAccountName } from './mock-data';
import { encodePassword } from '$lib/ldap';
import { UAC } from '$lib/types/user';
import { PUBLIC_BASE_DN } from '$env/static/public';

export const addTestUser = (ldap: Client) =>
	ldap
		.add(dn, {
			sAMAccountName: sAMAccountName,
			objectClass: ['user', 'top', 'person', 'organizationalPerson'],
			userAccountControl: [UAC['Normal Account']]
		})
		.then(() =>
			ldap.modify(dn, [
				new Change({
					operation: 'replace',
					modification: new Attribute({
						type: 'unicodePwd',
						values: [encodePassword(password)]
					})
				})
			])
		);

export const delTestUser = (ldap: Client, otherDn?: string) => ldap.del(otherDn ? otherDn : dn);

export const getTestUser = (ldap: Client) =>
	ldap
		.search(PUBLIC_BASE_DN, {
			filter: new EqualityFilter({ attribute: 'sAMAccountName', value: sAMAccountName })
		})
		.then(({ searchEntries }) => searchEntries[0]);

export const safe = async (method: () => Promise<void>) => {
	try {
		await method();
	} catch {
		// ignore
	}
};
