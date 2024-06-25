import { getEntryByDn } from '$lib/ldap';
import { jpegPhotoToB64 } from '$lib/transforms';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const { ldap, session } = auth;
	const user = await getEntryByDn<{ jpegPhoto?: string }>(ldap, session.dn, {
		searchOpts: { attributes: ['jpegPhoto'] }
	}).then(jpegPhotoToB64);
	if (!user) throw redirect(302, '/');
	return { session, jpegPhoto: user.jpegPhoto, searchForm: true };
};
