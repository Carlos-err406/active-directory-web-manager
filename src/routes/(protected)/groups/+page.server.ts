import { PUBLIC_BASE_DN } from '$env/static/public';
import { extractPagination, type PaginationWithUrls } from '$lib/pagination';
import { deleteManySchema } from '$lib/schemas/delete-many-schema';
import { createGroupSchema } from '$lib/schemas/group/create-group-schema';
import { deleteGroupSchema } from '$lib/schemas/group/delete-group-schema';
import { setMembersSchema } from '$lib/schemas/group/set-members-schema';
import { updateGroupSchema } from '$lib/schemas/group/update-group-schema';
import type { Group } from '$lib/types/group';
import { error, redirect } from '@sveltejs/kit';
import { AndFilter, EqualityFilter, SubstringFilter, type Filter } from 'ldapts';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 } from 'uuid';
import type { PageServerLoad } from './$types';
export * as actions from '$lib/actions/groups';

export const load: PageServerLoad = async ({ url, locals, depends }) => {
	depends('protected:groups');
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap } = auth;
	const { searchParams, pathname } = url;
	const sAMAccountNameQuery = searchParams.get('q');
	const page = Number(searchParams.get('page') || 1);
	const pageSize = Number(searchParams.get('pageSize') || 10);
	const sortAttribute = searchParams.get('sort') || 'sAMAccountName';
	const order = searchParams.get('order') || 'asc';

	const filters: Filter[] = [new EqualityFilter({ attribute: 'objectClass', value: 'group' })];
	sAMAccountNameQuery &&
		filters.push(new SubstringFilter({ attribute: 'sAMAccountName', any: [sAMAccountNameQuery] }));

	const filter = new AndFilter({ filters }).toString();
	try {
		const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, { filter });

		searchEntries.sort((a, b) => {
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
		const pagination = extractPagination<Group>(searchEntries as Group[], page, pageSize);

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
		const errorId = v4();
		console.log({ errorId, e });
		throw error(500, {
			message: 'Something unexpected happened while retrieving the groups, try again later',
			errorId
		});
	}
};
