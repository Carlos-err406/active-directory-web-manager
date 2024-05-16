import { search } from '$lib/actions';
import { searchSchema } from '$lib/schemas/search-schema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q');
	console.log({ groups: q });
	return {
		searchForm: await superValidate(zod(searchSchema))
	};
};

export const actions: Actions = {
	search
};
