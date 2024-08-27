import { signInSchema } from '$lib/schemas/sign-in-schema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
export * as actions from '$lib/actions/auth';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(signInSchema))
	};
};
