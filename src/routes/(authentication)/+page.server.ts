import { loginSchema } from '$lib/components/form/schemas/login-schema';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(loginSchema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(loginSchema));
		if (!form.valid) return fail(400, { form, success: false });
		// TODO check in ldap

		return { form, success: true };
	}
};
