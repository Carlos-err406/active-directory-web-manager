import { getEntryByDn } from '$lib/ldap';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { jpegPhotoToB64 } from '$lib/transforms';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap, session } = auth;
	const user = await getEntryByDn<User>(ldap, session.dn).then(jpegPhotoToB64);
	if (!user) throw error(404, 'User not found');

	return {
		user: user as User,
		searchForm: null,
		changePasswordForm: await superValidate(zod(changePasswordSchema))
	};
};
