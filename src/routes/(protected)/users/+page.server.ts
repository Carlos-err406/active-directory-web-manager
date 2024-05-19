import { NODE_ENV } from '$env/static/private';
import { PUBLIC_BASE_DN, PUBLIC_LDAP_DOMAIN } from '$env/static/public';
import { search } from '$lib/actions';
import { encodePassword, getEntryByDn, getEntryBySAMAccountName } from '$lib/ldap';
import { extractPagination, type PaginationWithUrls } from '$lib/pagination';
import { searchSchema } from '$lib/schemas/search-schema';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { createUserSchema } from '$lib/schemas/user/create-user-schema';
import { deleteManyUsersSchema, deleteUserSchema } from '$lib/schemas/user/delete-user.schema';
import { getPublicKey } from '$lib/server';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import {
	AndFilter,
	Attribute,
	Change,
	EqualityFilter,
	InvalidCredentialsError,
	NotFilter,
	OrFilter,
	SubstringFilter,
	type Filter
} from 'ldapts';
import { fail, setError, superValidate, withFiles } from 'sveltekit-superforms';
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
			deleteManyUsersForm: await superValidate(zod(deleteManyUsersSchema)),
			deleteUserForm: await superValidate(zod(deleteUserSchema)),
			createUserForm: await superValidate(zod(createUserSchema)),
			changePasswordForm: await superValidate(zod(changePasswordSchema)),
			searchForm: await superValidate(zod(searchSchema))
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
		const { sAMAccountName, base, givenName, sn, mail, password, description, jpegPhotoBase64 } =
			form.data;
		const entry = await getEntryBySAMAccountName(ldap, sAMAccountName);

		if (entry) return setError(form, 'sAMAccountName', 'User already exists');
		const attributes: Record<string, string[] | string> = {
			objectClass: ['top', 'person', 'organizationalPerson', 'user'],
			userAccountControl: ['512'],
			displayName: givenName,
			sAMAccountName,
			givenName,
			mail
		};
		if (sn) {
			attributes['sn'] = sn;
			attributes['displayName'] = `${givenName} ${sn}`;
		}
		if (description) attributes['description'] = description;
		if (jpegPhotoBase64) {
			const [, content] = jpegPhotoBase64.split('base64,');
			attributes['jpegPhoto'] = Buffer.from(content, 'base64').toString('base64');
		}
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

		await ldap.unbind();
		return withFiles({ form });
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
	},
	changePassword: async (event) => {
		const { locals, cookies } = event;
		const auth = await locals.auth();
		const access = cookies.get('ad-access');
		if (!access || !auth) throw redirect(302, '/'); //type narrowing

		const form = await superValidate(event, zod(changePasswordSchema));
		if (!form.valid) return fail(400, { form });
		const { ldap, session } = auth;
		const { dn, password, oldPassword } = form.data;

		const isUpdatingSelfPassword = session.distinguishedName === dn;

		const user = await getEntryByDn(ldap, dn);
		if (!user) throw error(404, 'User not found');
		console.log({ session });
		if (!session.isAdmin) {
			try {
				const { sAMAccountName } = user;
				await ldap.bind(`${sAMAccountName}@${PUBLIC_LDAP_DOMAIN}`, oldPassword);
			} catch (e) {
				console.log('Update password failed', { e });
				if (e instanceof InvalidCredentialsError) {
					return setError(form, 'oldPassword', 'Invalid password');
				} else {
					throw error(500, 'Something unexpected happened while validating your password');
				}
			}
		}
		const encodedPassword = encodePassword(password);
		const passwordChange: Change = new Change({
			operation: 'replace',
			modification: new Attribute({ type: 'unicodePwd', values: [encodedPassword] })
		});

		try {
			await ldap.modify(dn, passwordChange);
		} catch (e) {
			console.log(e);
			throw error(500, 'Something unexpected happened while changing the password');
		}
		if (isUpdatingSelfPassword) {
			//update access token
			const { email } = jwt.verify(access, getPublicKey(), {
				algorithms: ['RS512']
			}) as { email: string };
			const newAccess = jwt.sign({ email, password }, getPublicKey(), {
				algorithm: 'RS512',
				expiresIn: '2h'
			});
			cookies.set('ad-access', newAccess, {
				path: '/',
				expires: new Date(Date.now() + 60 * 60 * 2 * 1000),
				httpOnly: true,
				sameSite: 'strict',
				secure: NODE_ENV === 'production'
			});
		}
		await ldap.unbind();

		return { form };
	}
};
