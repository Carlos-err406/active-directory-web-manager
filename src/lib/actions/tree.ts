import config from '$config';
import { PUBLIC_BASE_DN } from '$env/static/public';
import type { Action } from '@sveltejs/kit';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import {
	EqualityFilter,
	NotAllowedOnNonLeafError,
	OrFilter,
	UnwillingToPerformError
} from 'ldapts';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { recursiveDelete, type RecursiveDeleteEntry } from '../ldap';
import { getCNFromDN, getRDNFromDN } from '../ldap/utils';
import { deleteManySchema } from '../schemas/delete-many-schema';
import { appLog, errorLog } from '../server/logs';
import { moveSchema } from '../types/tree/move-schema';

export const deleteMany: Action = async (event) => {
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

	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
		filter,
		attributes: ['dn', 'distinguishedName', 'objectClass', 'isCriticalSystemObject']
	});
	const entries = searchEntries as RecursiveDeleteEntry[];
	const deletedEntries: string[] = [];
	const promises = entries.map(async (entry) => {
		try {
			if (entry.isCriticalSystemObject === 'TRUE') {
				appLog(
					`(CriticalSystemObject) User ${session.sAMAccountName} tried deleting ${entry.dn} but is a critical system object and can not be deleted!`,
					'Error'
				);
				throw error(403, `Entry ${entry.dn} can not be deleted!`);
			}
			return ldap.del(entry.dn);
		} catch (e) {
			if (isHttpError(e)) throw e;
			else if (e instanceof NotAllowedOnNonLeafError) {
				const { allowNonLeafDelete } = config.directory.ous;
				if (!allowNonLeafDelete) {
					appLog(
						`(NotAllowedOnNonLeafError) User ${session.sAMAccountName} tried deleting an entry (${entry.dn}) but operation is not allowed on non-leaf entries`,
						'Error'
					);
					throw error(403, 'This Organizational Unit is not empty!');
				} else {
					await recursiveDelete(ldap, entry, deletedEntries);
				}
			} else {
				console.log(e);
				const message = `Something unexpected happened while deleting the entry ${getCNFromDN(entry.dn)}`;
				const errorId = errorLog(e, { message });
				throw error(500, { message, errorId });
			}
		}
	});

	await Promise.all(promises);
	deletedEntries.map((dn) => appLog(`User ${session.sAMAccountName} deleted entry ${dn}`));
	return { form };
};

export const move: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const form = await superValidate(event, zod(moveSchema));
	if (!form.valid) return fail(400, { form });
	const { ldap, session } = auth;
	const { dns, base } = form.data;
	const promises = dns.map(async (dn) => {
		const rdn = getRDNFromDN(dn);
		const newDn = `${rdn},${base}`;
		try {
			return await ldap.modifyDN(dn, newDn);
		} catch (e) {
			if (e instanceof UnwillingToPerformError) {
				const { message } = e;
				if (message.includes('to be a child of itself')) {
					appLog(
						`User ${session.sAMAccountName} tried moving ${dn} to be a child of itself`,
						'Error'
					);
					throw error(400, { message: `Cannot move ${getCNFromDN(dn)} to be a child of itself` });
				} else if (message.includes('DISALLOW_MOVE')) {
					appLog(
						`User ${session.sAMAccountName} tried moving ${dn} but is not allowed to move it`,
						'Error'
					);
					throw error(400, { message: `Movement of ${getRDNFromDN(dn)} is not allowed!` });
				}
			}
			console.log(e);
			const message = `Something unexpected happened while moving ${dn}`;
			const errorId = errorLog(e, { message });
			throw error(500, { message, errorId });
		}
	});
	try {
		await Promise.all(promises);
	} catch (e) {
		if (isHttpError(e)) throw e;
		else {
			const message = `Something unexpected happened while performing the move operation`;
			const errorId = errorLog(e, { message });
			throw error(500, { message, errorId });
		}
	}

	appLog(
		`User ${session.sAMAccountName} moved ${dns.map(getRDNFromDN).join(', ')} to ${base}`,
		'Info'
	);
	return { ok: true };
};
