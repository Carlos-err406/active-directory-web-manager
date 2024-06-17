import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getEntryByDn } from '$lib/ldap';
import type { Group } from '$lib/types/group';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { v4 } from 'uuid';
import { deleteGroup, updateGroup } from '$lib/actions/groups';
export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap } = auth;
	const { dn } = params;
	const [group, setMembersForm, deleteGroupForm] = await Promise.all([
		getEntryByDn<Group>(ldap, dn),
		superValidate(zod(setMembersSchema)),
		superValidate(zod(deleteGroupSchema))
	]);
	const errorId = v4();
	console.log({ errorId });
	if (!group) throw error(404, { message: 'Group not found', errorId });
	if (!Array.isArray(group.member) && group.member !== undefined) group.member = [group.member];
	return { group, setMembersForm, deleteGroupForm };
};

export const actions = {
	deleteGroup,
	updateGroup
};
