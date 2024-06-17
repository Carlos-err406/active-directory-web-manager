import { PUBLIC_BASE_DN } from '$env/static/public';
// import * as userActions from '$lib/actions/users';
import { extractPagination, type PaginationWithUrls } from '$lib/pagination';
import { deleteManySchema } from '$lib/schemas/delete-many-schema';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { createUserSchema } from '$lib/schemas/user/create-user-schema';
import { deleteUserSchema } from '$lib/schemas/user/delete-user-schema';
import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
import { jpegPhotoToB64 } from '$lib/transforms';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import { AndFilter, EqualityFilter, NotFilter, SubstringFilter, type Filter } from 'ldapts';
import { log } from 'sveltekit-logger-hook';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 } from 'uuid';
import type { PageServerLoad } from './$types';
export * as actions from '$lib/actions/users';

export const load: PageServerLoad = async ({ url, locals, depends }) => {
	depends('protected:users');
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap } = auth;
	const { searchParams, pathname } = url;

	const sAMAccountNameQuery = searchParams.get('q');
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
		const pagination = extractPagination<User>(searchEntries as User[], page, pageSize);

		pagination.data.map(jpegPhotoToB64);

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

		const [
			deleteManyUsersForm,
			deleteUserForm,
			createUserForm,
			updateUserForm,
			changePasswordForm
		] = await Promise.all([
			superValidate(zod(deleteManySchema)),
			superValidate(zod(deleteUserSchema)),
			superValidate(zod(createUserSchema)),
			superValidate(zod(updateUserSchema)),
			superValidate(zod(changePasswordSchema))
		]);

		return {
			pagination: paginationWithURLs,
			deleteManyUsersForm,
			deleteUserForm,
			createUserForm,
			updateUserForm,
			changePasswordForm
		};
	} catch (e) {
		const errorId = v4();
		log({ errorId, e });
		throw error(500, {
			message: 'Something unexpected happened while retrieving the users, try again later',
			errorId
		});
	}
};

// export const actions: Actions = {
// 	...userActions
// };
