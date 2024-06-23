export * as actions from '$lib/actions/users';
import config from '$config';
import { getEntryByDn } from '$lib/ldap';
import { getCNFromDN } from '$lib/ldap/utils';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { deleteUserSchema } from '$lib/schemas/user/delete-user-schema';
import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
import { jpegPhotoToB64 } from '$lib/transforms';
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
	const { hide } = config.directory.users;
	if (hide.includes(dn) || hide.includes(getCNFromDN(dn)))
		throw error(403, 'This user is hidden by configuration');
	const user = await getEntryByDn<User>(ldap, dn).then(jpegPhotoToB64);
	if (!user) throw error(404, 'User not found');

	const [changePasswordForm, updateUserForm, deleteUserForm] = await Promise.all([
		superValidate(zod(changePasswordSchema)),
		superValidate(zod(updateUserSchema)),
		superValidate(zod(deleteUserSchema))
	]);
	if (!Array.isArray(user.memberOf) && user.memberOf !== undefined) user.memberOf = [user.memberOf];
	return {
		user,
		searchForm: null,
		changePasswordForm,
		updateUserForm,
		deleteUserForm
	};
};

// export const actions = { deleteUser, updateUser };
