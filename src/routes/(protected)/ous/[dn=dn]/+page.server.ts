import { getDirectChildren, getEntryByDn } from '$lib/ldap';
import { extractBase } from '$lib/ldap/utils';
import { createOuSchema } from '$lib/schemas/ou/create-ou-schema';
import { deleteOuSchema } from '$lib/schemas/ou/delete-ou-schema';
import { updateOuSchema } from '$lib/schemas/ou/update-ou-schema';
import { errorLog } from '$lib/server/logs';
import { specificResourceAccessControl } from '$lib/server/utils';
import type { OrganizationalUnit } from '$lib/types/ou';
import type { EntryWithObjectClass } from '$lib/utils';
import { error, isHttpError } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, params }) => {
	const { dn } = params;
	const { ldap } = await specificResourceAccessControl({ locals, url, dn });
	const { config } = locals;
	try {
		const ou = await getEntryByDn<OrganizationalUnit>(ldap, dn);
		if (!ou) {
			throw error(404, { message: 'Organizational Unit not found' });
		}

		const baseParent = extractBase(ou.dn);
		let parent: null | Promise<EntryWithObjectClass> = null;
		let members: null | Promise<EntryWithObjectClass[]> = null;
		if (config.app.views.ousPage.details.parent.show) {
			parent = getEntryByDn<EntryWithObjectClass>(ldap, baseParent, {
				searchOpts: { attributes: ['dn', 'distinguishedName', 'objectClass'] }
			});
		}
		if (config.app.views.ousPage.details.member.show) {
			members = getDirectChildren<EntryWithObjectClass>(ldap, ou.distinguishedName, {
				attributes: ['dn', 'distinguishedName', 'name', 'objectClass']
			});
		}
		return {
			ou,
			members,
			parent,
			searchForm: null,
			deleteOuForm: await superValidate(zod(deleteOuSchema)),
			createOuForm: await superValidate(zod(createOuSchema)),
			updateOuForm: await superValidate(zod(updateOuSchema))
		};
	} catch (e) {
		if (isHttpError(e)) throw e;
		const errorId = await errorLog(e, { message: `Error loading Organizational Unit ${dn} page` });
		throw error(500, { message: 'Something went wrong while loading the page', errorId });
	}
};

export * as actions from '$lib/actions/ous';
