import config from '$config';
import { getFilteredGroups } from '$lib/ldap';
import { extractPagination, type PaginationWithUrls } from '$lib/pagination';
import { deleteManySchema } from '$lib/schemas/delete-many-schema';
import { createGroupSchema } from '$lib/schemas/group/create-group-schema';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { updateGroupSchema } from '$lib/schemas/group/update-group-schema';
import { appLog, errorLog } from '$lib/server/logs';
import type { Group } from '$lib/types/group';
import { error, redirect } from '@sveltejs/kit';
import { EqualityFilter, SubstringFilter, type Filter } from 'ldapts';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
export * as actions from '$lib/actions/groups';

export const load: PageServerLoad = async ({ url, locals, depends }) => {
	depends('protected:groups');
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const { ldap, session } = auth;
	if (!config.app.views.groupsPage.show) {
		appLog(
			`User ${session.sAMAccountName} tried accessing /groups page but is disabled by configuration.`,
			'Error'
		);
		throw error(403, 'This page is disabled in the app configuration');
	}
	if (!session.isAdmin && !config.app.nonAdmin.allowAccessToGroupsPage) {
		appLog(
			`User ${session.sAMAccountName} tried accessing /groups page but Non-Admin access is disabled by configuration.`,
			'Error'
		);
		throw error(403, 'Non-Admin access to this resource is disabled by configuration');
	}
	const { searchParams, pathname } = url;
	const sAMAccountNameQuery = searchParams.get('q');
	const page = Number(searchParams.get('page') || 1);
	const pageSize = Number(searchParams.get('pageSize') || 10);
	const sortAttribute = searchParams.get('sort') || 'sAMAccountName';
	const order = searchParams.get('order') || 'asc';

	const extraFilters: Filter[] = [new EqualityFilter({ attribute: 'objectClass', value: 'group' })];

	sAMAccountNameQuery &&
		extraFilters.push(
			new SubstringFilter({ attribute: 'sAMAccountName', any: [sAMAccountNameQuery] })
		);

	try {
		const groups = await getFilteredGroups(ldap, extraFilters);
		groups.sort((a, b) => {
			if (
				(a[sortAttribute] || '-').toString().toLowerCase() <
				(b[sortAttribute] || '-').toString().toLowerCase()
			)
				return order === 'asc' ? -1 : 1;
			if (
				(a[sortAttribute] || '-').toString().toLowerCase() >
				(b[sortAttribute] || '-').toString().toLowerCase()
			)
				return order === 'asc' ? 1 : -1;
			return 0;
		});
		const pagination = extractPagination<Group>(groups as Group[], page, pageSize);

		const previousPageSearchParams = new URLSearchParams(searchParams);
		if (page - 1 > 0) previousPageSearchParams.set('page', (page - 1).toString());

		const nextPageSearchParams = new URLSearchParams(searchParams);
		if (page < pagination.totalPages) nextPageSearchParams.set('page', (page + 1).toString());

		const paginationWithURLs: PaginationWithUrls<Group> = {
			...pagination,
			nextPage:
				page >= pagination.totalPages ? null : `${pathname}?${nextPageSearchParams.toString()}`,
			previousPage: page <= 1 ? null : `${pathname}?${previousPageSearchParams.toString()}`
		};
		const [
			deleteManyGroupsForm,
			deleteGroupForm,
			createGroupForm,
			updateGroupForm,
			setMembersForm
		] = await Promise.all([
			superValidate(zod(deleteManySchema)),
			superValidate(zod(deleteGroupSchema)),
			superValidate(zod(createGroupSchema)),
			superValidate(zod(updateGroupSchema)),
			superValidate(zod(setMembersSchema))
		]);

		return {
			pagination: paginationWithURLs,
			deleteManyGroupsForm,
			deleteGroupForm,
			createGroupForm,
			updateGroupForm,
			setMembersForm
		};
	} catch (e) {
		const errorId = errorLog(e, { message: 'Error loading groups page' });
		throw error(500, {
			message: 'Something unexpected happened while retrieving the groups, try again later',
			errorId
		});
	}
};
