export * as actions from '$lib/actions/groups';
import { getEntryByDn } from '$lib/ldap';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { updateGroupSchema } from '$lib/schemas/group/update-group-schema';
import type { Group } from '$lib/types/group';
import { error, redirect } from '@sveltejs/kit';
import { log } from 'sveltekit-logger-hook';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 } from 'uuid';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap } = auth;
	const { dn } = params;
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
		if (!Array.isArray(group.member) && group.member !== undefined) group.member = [group.member];

		return { group, setMembersForm, updateGroupForm, deleteGroupForm };
	} catch (e) {
		const errorId = v4();
		log({ errorId, error: `${e}` }, { basePath: './logs' });
		throw error(500, { message: 'Something went wrong while loading the page', errorId });
	}
};
