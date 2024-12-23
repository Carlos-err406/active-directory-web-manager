import { getEntryByDn, getMemberEntries } from '$lib/ldap';
import { extractBase } from '$lib/ldap/utils';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { updateGroupSchema } from '$lib/schemas/group/update-group-schema';
import { errorLog } from '$lib/server/logs';
import { specificResourceAccessControl } from '$lib/server/utils';
import type { Group } from '$lib/types/group';
import type { EntryWithObjectClass } from '$lib/utils';
import { error, isHttpError } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, params }) => {
	const dn = decodeURIComponent(params.dn);
	const { ldap } = await specificResourceAccessControl({ locals, url, dn });
	const { config } = locals;
	try {
		const group = await getEntryByDn<Group>(ldap, dn);
		if (!group) {
			throw error(404, { message: 'Group not found' });
		}
		const baseParent = extractBase(group.dn);
		let parent: null | Promise<EntryWithObjectClass> = null;
		let members: null | Promise<EntryWithObjectClass[]> = null;
		if (config.app.views.groupsPage.details.parent.show) {
			parent = getEntryByDn<EntryWithObjectClass>(ldap, baseParent, {
				searchOpts: { attributes: ['dn', 'distinguishedName', 'objectClass'] }
			});
		}

		if (config.app.views.groupsPage.details.member.show) {
			members = getMemberEntries<EntryWithObjectClass>(ldap, group.member, {
				searchOpts: {
					attributes: ['dn', 'distinguishedName', 'name', 'objectClass']
				}
			});
		}
		return {
			group,
			parent,
			members,
			setMembersForm: await superValidate(zod(setMembersSchema)),
			updateGroupForm: await superValidate(zod(updateGroupSchema)),
			deleteGroupForm: await superValidate(zod(deleteGroupSchema)),
			searchForm: null
		};
	} catch (e) {
		if (isHttpError(e)) throw e;
		const errorId = await errorLog(e, { message: `Error loading group ${dn} page` });
		throw error(500, { message: 'Something went wrong while loading the page', errorId });
	}
};

export * as actions from '$lib/actions/groups';
