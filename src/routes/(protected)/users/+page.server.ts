import { PUBLIC_BASE_DN } from '$env/static/public';
import { search } from '$lib/actions';
import { extractPagination, type PaginationWithUrls } from '$lib/pagination';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import { AndFilter, EqualityFilter, NotFilter, type Filter } from 'ldapts';
import { v4 } from 'uuid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap } = auth;
	const { searchParams, pathname } = url;
	const sAMAccountNameQuery = searchParams.get('sAMAccountName');
	const page = Number(searchParams.get('page') || 1);
	const pageSize = Number(searchParams.get('pageSize') || 10);
	const sortAttribute = searchParams.get('sort') || 'sAMAccountName';
	const order = searchParams.get('order') || 'asc';
	const filters: Filter[] = [
		new NotFilter({
			filter: new EqualityFilter({ attribute: 'objectClass', value: 'computer' })
		}),
		...['top', 'person', 'organizationalPerson', 'user'].map(
			(objectClass) => new EqualityFilter({ attribute: 'objectClass', value: objectClass })
		)
	];
	sAMAccountNameQuery &&
		filters.push(new EqualityFilter({ attribute: 'sAMAccountName', value: sAMAccountNameQuery }));

	const filter = new AndFilter({ filters });
	try {
		const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
			filter: filter.toString()
		});
		await ldap.unbind();

		searchEntries.sort((a, b) => {
			if (a[sortAttribute] < b[sortAttribute]) return order === 'asc' ? -1 : 1;
			if (a[sortAttribute] > b[sortAttribute]) return order === 'asc' ? 1 : -1;
			return 0;
		});
		const pagination = extractPagination<User>(searchEntries as User[], page, pageSize);

		const previousPageSearchParams = new URLSearchParams(searchParams);
		if (page - 1 > 0) previousPageSearchParams.set('page', (page - 1).toString());

		const nextPageSearchParams = new URLSearchParams(searchParams);
		if (page < pagination.totalPages) nextPageSearchParams.set('page', (page + 1).toString());

		const paginationWithURLs: PaginationWithUrls<User> = {
			...pagination,
			nextPage:
				page >= pagination.totalPages ? null : `${pathname}?${nextPageSearchParams.toString()}`,
			previousPage: page <= 1 ? null : `${pathname}?${previousPageSearchParams.toString()}`
		};
		return { pagination: paginationWithURLs };
	} catch (e) {
		const errorId = v4();
		console.log({ errorId, e });
		throw error(500, {
			message: 'Something unexpected happened while retrieving the users, try again later',
			errorId
		});
	}
};

export const actions: Actions = {
	search
};
