import { extractBase } from '$/lib/ldap/utils';
import type { EntryWithObjectClass } from '$/lib/utils';
import { getEntryByDn, getMemberEntries } from '$lib/ldap';
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
	const { config } = locals;
	const user = await getEntryByDn<User>(ldap, session.dn).then(jpegPhotoToB64);
	if (!user) throw error(404, 'User not found');
	const baseParent = extractBase(user.dn);
	let parent: null | Promise<EntryWithObjectClass> = null;
	let memberOf: null | Promise<EntryWithObjectClass[]> = null;
	if (config.app.views.usersPage.details.parent.show) {
		parent = getEntryByDn<EntryWithObjectClass>(ldap, baseParent, {
			searchOpts: { attributes: ['dn', 'distinguishedName', 'objectClass'] }
		});
	}

	if (config.app.views.usersPage.details.memberOf.show) {
		memberOf = getMemberEntries<EntryWithObjectClass>(ldap, user.memberOf, {
			searchOpts: { attributes: ['dn', 'distinguishedName', 'objectClass'] }
		});
	}

	return {
		user,
		memberOf,
		parent,
		searchForm: null,
		changePasswordForm: await superValidate(zod(changePasswordSchema)),
		updateUserForm: await superValidate(zod(updateUserSchema))
	};
};
