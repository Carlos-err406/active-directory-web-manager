import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await locals.auth();
	if (auth) throw redirect(302, '/users/me');
	else throw redirect(302, '/auth');
};
