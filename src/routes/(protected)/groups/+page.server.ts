import { search } from '$lib/actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q');
	console.log({ groups: q });
	return {};
};

export const actions: Actions = {
	search
};
