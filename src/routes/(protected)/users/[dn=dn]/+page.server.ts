import { PUBLIC_BASE_DN } from '$env/static/public';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import { EqualityFilter } from 'ldapts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');

	const { ldap } = auth;
	const { dn } = params;
	const filter = new EqualityFilter({ attribute: 'distinguishedName', value: dn });
	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
		filter: filter.toString()
	});
	await ldap.unbind();
	if (searchEntries.length === 0) throw error(404, 'User not found');

	return { user: searchEntries[0] as User };
};
