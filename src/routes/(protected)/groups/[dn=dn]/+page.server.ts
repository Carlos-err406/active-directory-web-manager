export * as actions from '$lib/actions/groups';
import config from '$config';
import { getEntryByDn } from '$lib/ldap';
import { getCNFromDN } from '$lib/ldap/utils';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { updateGroupSchema } from '$lib/schemas/group/update-group-schema';
import { appLog, errorLog } from '$lib/server/logs';
import type { Group } from '$lib/types/group';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const { ldap, session } = auth;
	const { dn } = params;
	if (!session.isAdmin && !config.app.nonAdmin.allowAccessToGroupsPage) {
		appLog(
			`User ${session.sAMAccountName} tried accessing /groups/${dn}, but Non-Admin access to this resource is disabled by configuration`
		);
		throw error(403, 'Non-Admin access to this resource is disabled by configuration.');
	}
	const { hide } = config.directory.groups;
	if (hide.includes(dn) || hide.includes(getCNFromDN(dn))) {
		appLog(
			`User ${session.sAMAccountName} tried to access group ${dn}, but is hidden by configuration.`,
			'Error'
		);
		throw error(403, 'This group is hidden by configuration');
	}

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
		const errorId = errorLog(e, { message: `Error loading group ${dn} page` });
		throw error(500, { message: 'Something went wrong while loading the page', errorId });
	}
};
