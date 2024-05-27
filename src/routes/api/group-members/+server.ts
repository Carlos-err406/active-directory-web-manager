import { PUBLIC_BASE_DN } from '$env/static/public';
import { getGroupMembers } from '$lib/ldap';
import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { EqualityFilter, OrFilter, type Filter } from 'ldapts';

export const GET: RequestHandler = async ({ locals, url }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const dn = url.searchParams.get('dn');
	if (!dn) return json([]);
	const { ldap } = auth;
	const members = await getGroupMembers(ldap, dn);
	if (!members.length) return json([]);
	const filters: Filter[] = members.map(
		(value) => new EqualityFilter({ attribute: 'distinguishedName', value })
	);
	const filter = new OrFilter({ filters }).toString();
	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, { filter });

	return json(searchEntries);
};
