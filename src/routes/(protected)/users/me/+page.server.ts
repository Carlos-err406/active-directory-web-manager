import { PUBLIC_BASE_DN } from '$env/static/public';
import { changePasswordSchema } from '$lib/schemas/user/change-password-schema';
import type { User } from '$lib/types/user';
import { error, redirect } from '@sveltejs/kit';
import type { Entry } from 'ldapts';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 } from 'uuid';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');
	const { ldap, session } = auth;
	let searchEntries: Entry[];
	try {
		({ searchEntries } = await ldap.search(PUBLIC_BASE_DN, {
			filter: `(distinguishedName=${session.dn})`,
			sizeLimit: 1
		}));
		await ldap.unbind();
	} catch (e) {
		const errorId = v4();
		console.log({ errorId, e });
		throw error(500, {
			message: 'Something unexpected happened while getting your user data',
			errorId
		});
	}
	if (searchEntries.length === 0) throw error(404, 'User not found');
	const [user] = searchEntries;
	if (!user) throw error(404, 'User not found');
	return {
		user: user as User,
		searchForm: null,
		changePasswordForm: await superValidate(zod(changePasswordSchema))
	};
};
