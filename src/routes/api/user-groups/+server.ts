import config from '$config';
import { PUBLIC_BASE_DN } from '$env/static/public';
import { getHideFilters, getUserGroups } from '$lib/ldap';
import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { EqualityFilter, OrFilter, type Filter } from 'ldapts';

export const GET: RequestHandler = async ({ locals, url }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const dn = url.searchParams.get('dn');
	if (!dn) return json([]);
	const { ldap } = auth;
	const { directory } = config;
	const groups = await getUserGroups(ldap, dn);
	if (!groups.length) return json([]);
	const filters: Filter[] = groups.map(
		(value) => new EqualityFilter({ attribute: 'distinguishedName', value })
	);
	filters.concat(...getHideFilters(directory.groups.hide));
	const filter = new OrFilter({ filters }).toString();
	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, { filter });

	return json(searchEntries);
};
