import { getEntryByDn } from '$lib/ldap';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap, session } = auth;
	if (!session.isAdmin) throw error(403, 'You dont have access to this resource');
	const { dn } = params;
	const user: User = await getEntryByDn<User>(ldap, dn);
	await ldap.unbind();
	if (!user) throw error(404, 'User not found');

	if (user.jpegPhoto) {
		const base64String = Buffer.from(user.jpegPhoto, 'base64').toString('base64');
		user.jpegPhoto = `data:image/jpeg;base64,${base64String}`;
	}
	return {
		user,
		searchForm: null,
		changePasswordForm: await superValidate(zod(changePasswordSchema))
	};
};
