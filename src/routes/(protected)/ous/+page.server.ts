import { getFilteredOrganizationalUnits } from '$lib/ldap';
import { extractPagination, type PaginationWithUrls } from '$lib/pagination';
import { deleteManySchema } from '$lib/schemas/delete-many-schema';
import { createOuSchema } from '$lib/schemas/ou/create-ou-schema';
import { deleteOuSchema } from '$lib/schemas/ou/delete-ou-schema';
import { updateOuSchema } from '$lib/schemas/ou/update-ou-schema';
import { errorLog } from '$lib/server/logs';
import { protectedAccessControl } from '$lib/server/utils';
import type { OrganizationalUnit } from '$lib/types/ou';
import { error } from '@sveltejs/kit';
import { SubstringFilter, type Filter } from 'ldapts';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals, depends }) => {
	depends('protected:ous');
	const { ldap } = await protectedAccessControl({ locals, url });
	const { searchParams, pathname } = url;
	const nameQuery = searchParams.get('q');
	const page = Number(searchParams.get('page') || 1);
	const pageSize = Number(searchParams.get('pageSize') || 10);
	const sortAttribute = searchParams.get('sort') || 'name';
	const order = searchParams.get('order') || 'asc';

	const extraFilters: Filter[] = [];
	if (nameQuery) {
		extraFilters.push(new SubstringFilter({ attribute: 'sAMAccountName', any: [nameQuery] }));
	}
	try {
		const ous = await getFilteredOrganizationalUnits(ldap, extraFilters);

		ous.sort((a, b) => {
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
		const pagination = extractPagination<OrganizationalUnit>(ous, page, pageSize);

		const previousPageSearchParams = new URLSearchParams(searchParams);
		if (page - 1 > 0) previousPageSearchParams.set('page', (page - 1).toString());

		const nextPageSearchParams = new URLSearchParams(searchParams);
		if (page < pagination.totalPages) nextPageSearchParams.set('page', (page + 1).toString());

		const paginationWithURLs: PaginationWithUrls<OrganizationalUnit> = {
			...pagination,
			nextPage:
				page >= pagination.totalPages ? null : `${pathname}?${nextPageSearchParams.toString()}`,
			previousPage: page <= 1 ? null : `${pathname}?${previousPageSearchParams.toString()}`
		};

		return {
			pagination: paginationWithURLs,
			deleteManyOusForm: await superValidate(zod(deleteManySchema)),
			deleteOuForm: await superValidate(zod(deleteOuSchema)),
			createOuForm: await superValidate(zod(createOuSchema)),
			updateOuForm: await superValidate(zod(updateOuSchema))
		};
	} catch (e) {
		const errorId = errorLog(e, { message: 'Error loading Organizational Units page' });
		throw error(500, {
			message:
				'Something unexpected happened while retrieving the Organizational Units, try again later',
			errorId
		});
	}
};

export * as actions from '$lib/actions/ous';
