import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/');

	return { session: auth.session };
};
