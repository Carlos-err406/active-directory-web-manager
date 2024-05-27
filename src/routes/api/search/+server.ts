import { PUBLIC_BASE_DN } from '$env/static/public';
import { urlFilterToLdapFilter } from '$lib/ldap/filter';
import { error, json, redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap } = auth;
	const filter = url.searchParams.get('filter');
	if (!filter) throw error(400, 'No filter provided');
	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
		filter: urlFilterToLdapFilter(filter)
	});
	return json(searchEntries);
};
