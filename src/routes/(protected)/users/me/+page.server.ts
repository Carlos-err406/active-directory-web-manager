import { getEntryByDn } from '$lib/ldap';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
import { protectedAccessControl } from '$lib/server/utils';
import { jpegPhotoToB64 } from '$lib/transforms';
import type { User } from '$lib/types/user';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { ldap, session } = await protectedAccessControl({ locals, url });
	const [user, changePasswordForm, updateUserForm] = await Promise.all([
		getEntryByDn<User>(ldap, session.dn).then(jpegPhotoToB64),
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
