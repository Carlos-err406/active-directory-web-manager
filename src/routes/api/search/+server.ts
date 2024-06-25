import config from '$config';
import { PUBLIC_BASE_DN } from '$env/static/public';
import { getHideFilters } from '$lib/ldap';
import { urlFilterToLdapFilter } from '$lib/ldap/filter';
import { error, json, redirect, type RequestHandler } from '@sveltejs/kit';
import { AndFilter, FilterParser } from 'ldapts';

export const GET: RequestHandler = async ({ url, locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const { ldap } = auth;
	const urlFilter = url.searchParams.get('filter');
	if (!urlFilter) throw error(400, 'No filter provided');
	const { groups, users } = config.directory;
	const ldapFilter = urlFilterToLdapFilter(urlFilter);

	const filter = new AndFilter({
		filters: [
			FilterParser.parseString(ldapFilter),
			...getHideFilters(groups.hide),
			...getHideFilters(users.hide)
		]
	});
	const { searchEntries } = await ldap.search(PUBLIC_BASE_DN, { filter });
	return json(searchEntries);
};
