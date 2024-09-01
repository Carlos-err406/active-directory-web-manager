import config from '$config';
import { getEntryByDn } from '$lib/ldap';
import { extractBase } from '$lib/ldap/utils';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import { deleteUserSchema } from '$lib/schemas/user/delete-user-schema';
import { updateUserSchema } from '$lib/schemas/user/update-user-schema';
import { errorLog } from '$lib/server/logs';
import { specificResourceAccessControl } from '$lib/server/utils';
import { jpegPhotoToB64 } from '$lib/transforms';
import type { User } from '$lib/types/user';
import type { EntryWithObjectClass } from '$lib/utils';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

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
		const user = await getEntryByDn<User>(ldap, paramDN).then(jpegPhotoToB64);
		if (!user) throw error(404, 'User not found');
		const baseParent = extractBase(user.dn);
		let parent: null | Promise<EntryWithObjectClass> = null;
		if (config.app.views.usersPage.details.parent.show) {
			parent = getEntryByDn<EntryWithObjectClass>(ldap, baseParent, {
				searchOpts: { attributes: ['dn', 'distinguishedName', 'objectClass'] }
			});
		}
		return {
			user,
			parent,
			searchForm: null,
			changePasswordForm: await superValidate(zod(changePasswordSchema)),
			updateUserForm: await superValidate(zod(updateUserSchema)),
			deleteUserForm: await superValidate(zod(deleteUserSchema))
		};
	} catch (e) {
		if (isHttpError(e)) throw e;
		const errorId = errorLog(e, { message: `Error loading user ${dn} page` });
		throw error(500, { message: 'Something went wrong while loading the page', errorId });
	}
};

export * as actions from '$lib/actions/users';
