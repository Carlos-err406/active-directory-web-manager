import { protectedAccessControl } from '$lib/server/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	/*const auth =*/ await protectedAccessControl({ locals, url });

	const q = url.searchParams.get('q');
	console.log({ tree: q });
	return { searchForm: true };
};
