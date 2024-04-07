import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { searchSchema } from '$lib/schemas/search-schema';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q');
	console.log({ ous: q });
	return {};
};

export const actions: Actions = {
	search: async (event) => {
		const form = await superValidate(event, zod(searchSchema));
		return { form };
	}
};
