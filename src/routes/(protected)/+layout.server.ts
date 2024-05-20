import { getEntryByDn } from '$lib/ldap';
import { searchSchema } from '$lib/schemas/search-schema';
import { jpegPhotoToB64 } from '$lib/transforms';
import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap, session } = auth;
	const user = await getEntryByDn<{ jpegPhoto?: string }>(ldap, session.dn, {
		searchOpts: { attributes: ['jpegPhoto'] }
	}).then(jpegPhotoToB64);
	if (!user) throw redirect(302, '/');
	await ldap.unbind();
	return { session, jpegPhoto: user.jpegPhoto, searchForm: await superValidate(zod(searchSchema)) };
};
