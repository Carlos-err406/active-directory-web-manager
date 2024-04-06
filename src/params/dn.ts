import { PUBLIC_BASE_DN } from '$env/static/public';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	return param.endsWith(PUBLIC_BASE_DN);
};
