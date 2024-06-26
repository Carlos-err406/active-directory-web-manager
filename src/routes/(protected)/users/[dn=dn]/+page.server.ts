export * as actions from '$lib/actions/users';
import { getEntryByDn } from '$lib/ldap';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { deleteUserSchema } from '$lib/schemas/user/delete-user-schema';
import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
import { specificResourceAccessControl } from '$lib/server/utils';
import { jpegPhotoToB64 } from '$lib/transforms';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const { dn } = params;
	const auth = await specificResourceAccessControl({
		locals,
		url,
		dn,
		beforeLog: (session) => {
			if (session.dn === params.dn) throw redirect(302, '/users/me');
		}
	});
	const { ldap } = auth;
	const [user, changePasswordForm, updateUserForm, deleteUserForm] = await Promise.all([
		getEntryByDn<User>(ldap, dn).then(jpegPhotoToB64),
		superValidate(zod(changePasswordSchema)),
		superValidate(zod(updateUserSchema)),
		superValidate(zod(deleteUserSchema))
	]);
	if (!user) throw error(404, 'User not found');
	return {
		user,
		searchForm: null,
		changePasswordForm,
		updateUserForm,
		deleteUserForm
	};
};
