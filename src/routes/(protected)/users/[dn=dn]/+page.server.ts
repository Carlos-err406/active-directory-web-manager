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
import { isHttpError } from '@sveltejs/kit';
import { errorLog } from '$lib/server/logs';

export const load: PageServerLoad = async ({ params, url, locals, depends }) => {
	depends('protected:users:dn');
	const { dn } = params;
	const paramDN = decodeURIComponent(dn);
	const auth = await specificResourceAccessControl({
		locals,
		url,
		dn: paramDN
	});
	const { ldap, session } = auth;
	if (session.dn === paramDN) throw redirect(303, '/users/me');
	try {
		const [user, changePasswordForm, updateUserForm, deleteUserForm] = await Promise.all([
			getEntryByDn<User>(ldap, paramDN).then(jpegPhotoToB64),
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
	} catch (e) {
		if (isHttpError(e)) throw e;
		const errorId = errorLog(e, { message: `Error loading user ${dn} page` });
		throw error(500, { message: 'Something went wrong while loading the page', errorId });
	}
};

export * as actions from '$lib/actions/users';
