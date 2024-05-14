import { PUBLIC_BASE_DN } from '$env/static/public';
import { search } from '$lib/actions';
import { encodePassword, getEntryByDn, getEntryBySAMAccountName } from '$lib/ldap';
import { extractPagination, type PaginationWithUrls } from '$lib/pagination';
import { createUserSchema } from '$lib/schemas/user/create-user-schema';
import { deleteManyUsersSchema, deleteUserSchema } from '$lib/schemas/user/delete-user.schema';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import {
	AndFilter,
	Attribute,
	Change,
	EqualityFilter,
	NotFilter,
	OrFilter,
	SubstringFilter,
	type Filter
} from 'ldapts';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 } from 'uuid';
import type { Actions, PageServerLoad } from './$types';

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

	const filter = new AndFilter({ filters });
	try {
		const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
			filter: filter.toString()
		});
		await ldap.unbind();

		searchEntries.sort((a, b) => {
			if ((a[sortAttribute] || '-') < (b[sortAttribute] || '-')) return order === 'asc' ? -1 : 1;
			if ((a[sortAttribute] || '-') > (b[sortAttribute] || '-')) return order === 'asc' ? 1 : -1;
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

		return {
			pagination: paginationWithURLs,
			createUserForm: await superValidate(zod(createUserSchema))
		};
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
	search,
	create: async (event) => {
		const { locals } = event;
		const auth = await locals.auth();
		if (!auth) throw redirect(302, '/');

		const form = await superValidate(event, zod(createUserSchema));
		if (!form.valid) return fail(400, { form });
		const { ldap } = auth;
		const { sAMAccountName, base, givenName, sn, mail, password, description } = form.data;

		const [entry] = await getEntryBySAMAccountName(ldap, sAMAccountName);

		if (entry) return setError(form, 'sAMAccountName', 'User already exists');

		const attributes: Record<string, string | string[]> = {
			objectClass: ['top', 'person', 'organizationalPerson', 'user'],
			sAMAccountName,
			userAccountControl: ['512'],
			givenName,
			mail
		};
		if (sn) attributes['sn'] = sn;
		if (description) attributes['description'] = description;

		const dn = `CN=${sAMAccountName},${base}`;

		await ldap.add(dn, attributes);

		const encodedPassword = encodePassword(password);
		const passwordChange: Change = new Change({
			operation: 'replace',
			modification: new Attribute({ type: 'unicodePwd', values: [encodedPassword] })
		});

		try {
			await ldap.modify(dn, passwordChange);
		} catch (e) {
			console.log(e);
			console.log('deleting created user');
			await ldap.del(dn);
			throw error(500, "Something unexpected happened while creating setting the user's password");
		}
		const [createdEntry] = await getEntryByDn(ldap, dn);
		console.log({ createdEntry });
		await ldap.unbind();
		return {
			form,
			success: true
		};
	},
	delete: async (event) => {
		const { locals } = event;
		const auth = await locals.auth();
		if (!auth) throw redirect(302, '/');
		const form = await superValidate(event, zod(deleteUserSchema));
		if (!form.valid) return fail(400, { form });
		const { ldap } = auth;
		const { dn } = form.data;

		const filter = new EqualityFilter({ attribute: 'distinguishedName', value: dn });
		const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
			filter: filter.toString()
		});
		const [entry] = searchEntries;
		if (!entry) {
			throw error(404, 'User not found');
		} else if (entry['isCriticalSystemObject'] === 'TRUE') {
			throw error(403, 'This entry can not be deleted!');
		}
		await ldap.del(dn);
		await ldap.unbind();
		return {
			success: true
		};
	},
	deleteMany: async (event) => {
		const { locals } = event;
		const auth = await locals.auth();
		if (!auth) throw redirect(302, '/');
		const form = await superValidate(event, zod(deleteManyUsersSchema));
		if (!form.valid) return fail(400, { form });
		const { ldap } = auth;
		const { dns } = form.data;
		const filter = new OrFilter({
			filters: dns.map((dn) => new EqualityFilter({ attribute: 'distinguishedName', value: dn }))
		});

		const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
			filter: filter.toString()
		});
		const promises = searchEntries.map(async (entry) => {
			if (entry['isCriticalSystemObject'] === 'TRUE') {
				throw error(403, `Entry ${entry.sAMAccountName} can not be deleted!`);
			}
			return ldap.del(entry.dn).catch((e) => {
				console.log(e);
				throw error(
					500,
					`Something unexpected happened while deleting the user ${entry.sAMAccountName}`
				);
			});
		});

		await Promise.all(promises);

		await ldap.unbind();
		return {
			form,
			success: true
		};
	}
};
