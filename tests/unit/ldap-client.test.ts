import { ADMIN_PASSWD } from '$env/static/private';
import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { inferChange, sudo } from '$lib/ldap';
import { getLDAPClient } from '$lib/ldap/client';
import { Attribute, Change, InvalidCredentialsError } from 'ldapts';
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { addTestUser, delTestUser, getTestUser, safe } from './fixtures';
import { dn, password, sAMAccountName } from './mock-data';

describe('ldap-ts auth test', () => {
	const ldap = getLDAPClient();
	afterEach(async () => await ldap.unbind());
	beforeAll(async () => {
		await safe(() => sudo(addTestUser));
	});
	afterAll(async () => {
		await safe(() => sudo(delTestUser));
	});

	it('throws exception when binding with wrong password', async () => {
		await expect(ldap.bind(`administrator@${PUBLIC_LDAP_DOMAIN}`, 'bad password')).rejects.toThrow(
			InvalidCredentialsError
		);
	});

	it('throws exception when binding with wrong user', async () => {
		await expect(ldap.bind(`badUser@${PUBLIC_LDAP_DOMAIN}`, ADMIN_PASSWD)).rejects.toThrow(
			InvalidCredentialsError
		);
	});

	it('correctly binds with admin credentials', async () => {
		await expect(
			ldap.bind(`administrator@${PUBLIC_LDAP_DOMAIN}`, ADMIN_PASSWD)
		).resolves.not.toThrow(InvalidCredentialsError);
	});

	it('binds with non-admin user credentials', async () => {
		await expect(
			ldap.bind(`${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`, password)
		).resolves.not.toThrow(InvalidCredentialsError);
	});
});

describe('ldap-ts operations on a user', () => {
	beforeAll(async () => {
		await safe(() => sudo(delTestUser));
	});

	describe('user creation', () => {
		it('creates a user', async () => {
			await sudo(async (ldap) => {
				await addTestUser(ldap);
				const user = await getTestUser(ldap);
				expect(user.dn).toBe(dn);
			});
		});
		it('throws error if user exist', async () => {
			await expect(sudo(addTestUser)).rejects.toThrow();
		});
	});

	describe('user deletion', () => {
		beforeEach(async () => {
			await safe(() => sudo(addTestUser));
		});
		afterAll(async () => {
			await safe(() => sudo(delTestUser));
		});
		it('deletes a user', async () => {
			await expect(sudo(delTestUser)).resolves.not.toThrow();
		});
		it('throws if user does not exist', async () => {
			await expect(sudo(delTestUser)).resolves.not.toThrow();
			await expect(sudo(delTestUser)).rejects.toThrow();
		});
		it('throws if deleting a critical system object', async () => {
			await expect(
				sudo(async (ldap) => await ldap.del(`CN=administrator,CN=Users,${PUBLIC_BASE_DN}`))
			).rejects.toThrow();
		});
	});
	describe('user updates', () => {
		beforeEach(async () => {
			await safe(() => sudo(addTestUser));
		});
		afterEach(async () => {
			await safe(() => sudo(delTestUser));
		});
		const newMail = `${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`;
		it('adds mail to the user user mail', async () => {
			await sudo(async (ldap) => {
				const user = await getTestUser(ldap);
				expect(user).toBeDefined();
				expect(user.mail).toBeUndefined();
				const change = inferChange(user, 'mail', newMail);
				expect(change).not.toBeUndefined();
				expect(change).toBeInstanceOf(Change);
				assert(change);
				await ldap.modify(user.dn, [change]);
				const editedUser = await getTestUser(ldap);
				expect(editedUser.mail).toBeDefined();
				expect(editedUser.mail).toBe(newMail);
			});
		});
		it('removes mail from the user', async () => {
			await sudo(async (ldap) => {
				let user = await getTestUser(ldap);
				expect(user).toBeDefined();
				const addMailChange = inferChange(user, 'mail', newMail);
				expect(addMailChange).not.toBeUndefined();
				expect(addMailChange).toBeInstanceOf(Change);
				assert(addMailChange);
				await ldap.modify(user.dn, [addMailChange]);
				user = await getTestUser(ldap);
				expect(user.mail).toBeDefined();

				const change = new Change({
					operation: 'delete',
					modification: new Attribute({ type: 'mail' })
				});
				await ldap.modify(user.dn, change);
				const editedUser = await getTestUser(ldap);
				expect(editedUser).toBeDefined();
				expect(editedUser.mail).toBeUndefined();
			});
		});
		// it('updates user distinguishedName', async () => {
		// 	await sudo(async (ldap) => {
		// 		const user = await getTestUser(ldap);
		// 		expect(user).toBeDefined();
		// 		expect(user.dn).toBe(dn);
		// 		expect(user.sAMAccountName).toBe(sAMAccountName);
		// 		const newDn = `CN=testUser2,${PUBLIC_BASE_DN}`;
		// 		await ldap.modifyDN(dn, newDn);
		// 		const editedUser = await getTestUser(ldap);
		// 		expect(editedUser).toBeDefined();
		// 		expect(editedUser.dn).toBe(newDn);
		// 		expect(editedUser.sAMAccountName).toBe(sAMAccountName);
		// 	});
		// });
	});
});
