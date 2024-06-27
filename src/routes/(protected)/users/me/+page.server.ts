import { getEntryByDn } from '$lib/ldap';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
import { jpegPhotoToB64 } from '$lib/transforms';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const { ldap, session } = auth;
	const user = await getEntryByDn<User>(ldap, session.dn).then(jpegPhotoToB64);
	if (!user) throw error(404, 'User not found');
	const [changePasswordForm, updateUserForm] = await Promise.all([
		superValidate(zod(changePasswordSchema)),
		superValidate(zod(updateUserSchema))
	]);
	if (!user) throw error(404, 'User not found');
	return {
		user,
		searchForm: null,
		changePasswordForm,
		updateUserForm
	};
};
