export * as actions from '$lib/actions/groups';
import { getEntryByDn } from '$lib/ldap';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { updateGroupSchema } from '$lib/schemas/group/update-group-schema';
import { errorLog } from '$lib/server/logs';
import { specificResourceAccessControl } from '$lib/server/utils';
import type { Group } from '$lib/types/group';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals, url, params }) => {
	const { dn } = params;
	const { ldap } = await specificResourceAccessControl({ locals, url, dn });

	try {
		const [group, setMembersForm, updateGroupForm, deleteGroupForm] = await Promise.all([
			getEntryByDn<Group>(ldap, dn),
			superValidate(zod(setMembersSchema)),
			superValidate(zod(updateGroupSchema)),
			superValidate(zod(deleteGroupSchema))
		]);
		if (!group) {
			throw error(404, { message: 'Group not found' });
		}
		return { group, setMembersForm, updateGroupForm, deleteGroupForm };
	} catch (e) {
		const errorId = errorLog(e, { message: `Error loading group ${dn} page` });
		throw error(500, { message: 'Something went wrong while loading the page', errorId });
	}
};
