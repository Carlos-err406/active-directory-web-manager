import { getEntryByDn } from '$lib/ldap';
import { errorLog } from '$lib/server/logs';
import { specificResourceAccessControl } from '$lib/server/utils';
import { error } from '@sveltejs/kit';
import type { Entry } from 'ldapts';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals, url, params }) => {
	const { dn } = params;
	const { ldap } = await specificResourceAccessControl({ locals, url, dn });

	try {
		const [ou] = await Promise.all([getEntryByDn<Entry>(ldap, dn)]);
		if (!ou) {
			throw error(404, { message: 'Ou not found' });
		}
		return { ou };
	} catch (e) {
		const errorId = errorLog(e, { message: `Error loading Organizational Unit ${dn} page` });
		throw error(500, { message: 'Something went wrong while loading the page', errorId });
	}
};
