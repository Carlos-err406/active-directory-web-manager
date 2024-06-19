import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q');
	console.log({ ous: q });
	return {
		searchForm: true
	};
};
