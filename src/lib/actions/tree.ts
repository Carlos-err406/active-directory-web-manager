import config from '$config';
import { PUBLIC_BASE_DN } from '$env/static/public';
import type { Action } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
import { EqualityFilter, NotAllowedOnNonLeafError, OrFilter } from 'ldapts';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { recursiveDelete, type RecursiveDeleteEntry } from '../ldap';
import { getCNFromDN } from '../ldap/utils';
import { deleteManySchema } from '../schemas/delete-many-schema';
import { appLog, errorLog } from '../server/logs';

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
		return ldap.del(entry.dn).catch(async (e) => {
			if (e instanceof NotAllowedOnNonLeafError) {
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
				const message = `Something unexpected happened while deleting the entry ${getCNFromDN(entry.dn)}`;
				const errorId = errorLog(e, { message });
				throw error(500, { message, errorId });
			}
		});
	});

	await Promise.all(promises);
	deletedEntries.map((dn) => appLog(`User ${session.sAMAccountName} deleted entry ${dn}`));
	return { form };
};
