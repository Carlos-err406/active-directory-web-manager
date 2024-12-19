import { PUBLIC_BASE_DN } from '$env/static/public';
import {
	getBaseEntry,
	getEntryByDn,
	inferChange,
	recursiveDelete,
	validateOuAmount
} from '$lib/ldap';
import { extractBase, getCNFromDN } from '$lib/ldap/utils';
import { deleteManySchema } from '$lib/schemas/delete-many-schema';
import { createOuSchema } from '$lib/schemas/ou/create-ou-schema';
import { deleteOuSchema } from '$lib/schemas/ou/delete-ou-schema';
import { updateOuSchema } from '$lib/schemas/ou/update-ou-schema';
import { appLog, errorLog } from '$lib/server/logs';
import type { OrganizationalUnit } from '$lib/types/ou';
import { error, fail, redirect, type Action } from '@sveltejs/kit';
import {
	AlreadyExistsError,
	Attribute,
	EqualityFilter,
	InsufficientAccessError,
	NotAllowedOnNonLeafError,
	OrFilter
} from 'ldapts';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const createOu: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');

	const form = await superValidate(event, zod(createOuSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;

	const canCreate = await validateOuAmount(ldap);
	if (!canCreate) {
		await appLog(
			`(ReachedOULimit) User ${session.sAMAccountName} tried creating an Organizational Unit but can not create more Organizational Units in this directory. Maximum amount reached.`,
			'Error'
		);
		throw error(403, 'Can not create more Organizational Units in this directory');
	}
	const { base, name, description } = form.data;

	const attributes: Attribute[] = [
		new Attribute({ type: 'objectClass', values: ['organizationalUnit'] }),
		new Attribute({ type: 'name', values: [name] })
	];
	if (description) attributes.push(new Attribute({ type: 'description', values: [description] }));

	const baseEntry = await getBaseEntry(ldap, base);
	let dn = `OU=${name}`;
	const baseIsGroup = baseEntry.objectClass.includes('group');

	if (baseIsGroup) {
		throw error(400, 'Groups can not have Organizational Units as members!');
	}
	dn += `,${base}`;

	try {
		await ldap.add(dn, attributes);
	} catch (e) {
		if (e instanceof AlreadyExistsError) {
			return setError(form, 'name', 'name already in use!');
		} else if (e instanceof InsufficientAccessError) {
			await appLog(
				`(InsufficientAccessError) User ${session.sAMAccountName} tried creating an Organizational Unit without having enough access`,
				'Error'
			);
			throw error(403, "You don't have permission to create Organizational Units");
		}
		const message = 'Something unexpected happened while creating the Organizational Unit';
		const errorId = await errorLog(e, { message });
		throw error(500, { message, errorId });
	}
	await appLog(`${auth.session.sAMAccountName} created Organizational Unit: ${dn}`);

	return { form };
};

export const deleteOu: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const form = await superValidate(event, zod(deleteOuSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;
	const { config } = locals;
	const { dn } = form.data;

	const ou = await getEntryByDn<OrganizationalUnit>(ldap, dn);
	if (!ou) throw error(404, 'Organizational Unit not found!');
	else if (ou.isCriticalSystemObject === 'TRUE') {
		await appLog(
			`(CriticalSystemObject) User ${session.sAMAccountName} tried deleting ${dn} but is a critical system object and can not be deleted!`,
			'Error'
		);
		throw error(403, `Organizational Unit ${ou.name} can not be deleted!`);
	}
	const deletedEntries: string[] = [];
	try {
		await ldap.del(dn);
	} catch (e) {
		if (e instanceof InsufficientAccessError) {
			await appLog(
				`(InsufficientAccessError) User ${session.sAMAccountName} tried deleting an Organizational Unit (${dn}) but does not have enough access`,
				'Error'
			);
			throw error(403, "You don't have permission to delete Organizational Units!");
		} else if (e instanceof NotAllowedOnNonLeafError) {
			const { allowNonLeafDelete } = config;
			if (!allowNonLeafDelete) {
				await appLog(
					`(NotAllowedOnNonLeafError) User ${session.sAMAccountName} tried deleting an Organizational Unit (${dn}) but operation is not allowed on non-leaf entries`,
					'Error'
				);
				throw error(403, 'This Organizational Unit is not empty!');
			} else {
				await recursiveDelete(ldap, ou, deletedEntries);
			}
		} else {
			const message = `Something unexpected happened while trying to delete ${ou.name}`;
			const errorId = await errorLog(e, { message });
			throw error(500, { message, errorId });
		}
	}
	await Promise.all(
		deletedEntries.map(
			async (dn) => await appLog(`User ${session.sAMAccountName} deleted entry: ${dn}`)
		)
	);
	return { form };
};

export const deleteManyOus: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const form = await superValidate(event, zod(deleteManySchema));
	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;
	const { dns } = form.data;
	const filter = new OrFilter({
		filters: dns.map((dn) => new EqualityFilter({ attribute: 'distinguishedName', value: dn }))
	});

	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, { filter });
	const promises = searchEntries.map(async (entry) => {
		if (entry['isCriticalSystemObject'] === 'TRUE') {
			await appLog(
				`(CriticalSystemObject) User ${session.sAMAccountName} tried deleting ${entry.dn} but is a critical system object and can not be deleted!`,
				'Error'
			);
			throw error(403, `Entry ${entry.sAMAccountName || entry.name} can not be deleted!`);
		}
		return ldap.del(entry.dn).catch(async (e) => {
			const message = `Something unexpected happened while deleting the Organizational Unit ${entry.name}`;
			const errorId = await errorLog(e, { message });
			throw error(500, { message, errorId });
		});
	});

	await Promise.all(promises);
	if (dns.length === 1)
		await appLog(`User ${session.sAMAccountName} deleted Organizational Unit ${dns[0]}`);
	else
		await appLog(
			`User ${session.sAMAccountName} deleted several Organizational Units: ${dns.map(getCNFromDN).join(', ')}`
		);
	return { form };
};

export const updateOu: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth'); //type narrowing
	const form = await superValidate(event, zod(updateOuSchema));

	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;

	const { description, dn, name } = form.data;

	const ou = await getEntryByDn<OrganizationalUnit>(ldap, dn);
	if (!ou) throw error(404, 'Organizational Unit not found');

	const changedName = inferChange(ou, 'name', name);
	const changedDescription = inferChange(ou, 'description', description);

	if (!changedDescription && !changedName) throw error(400, 'No changes to apply');

	try {
		if (changedDescription) await ldap.modify(dn, [changedDescription]);

		if (changedName) {
			await ldap.modifyDN(ou.dn, `OU=${name},${extractBase(ou.dn)}`);
		}

		return { form, nameChange: { oldDn: dn, newDn: `OU=${name},${extractBase(ou.dn)}` } };
	} catch (e) {
		if (e instanceof AlreadyExistsError) {
			return setError(form, 'name', 'name already in use!');
		} else if (e instanceof InsufficientAccessError) {
			await appLog(
				`(InsufficientAccessError) User ${session.sAMAccountName} tried updating Organizational Unit ${dn} but does not have enough access`,
				'Error'
			);
			throw error(403, { message: "You don't have permission to edit Organizational Units!" });
		}
		const message = `Something unexpected happened while updating ${ou.name}`;
		const errorId = await errorLog(e, { message });
		throw error(500, { message, errorId });
	}
};
