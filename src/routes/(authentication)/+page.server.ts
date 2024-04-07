import { loginSchema } from '$lib/schemas/login-schema';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { signOut } from '$lib/auth';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod(loginSchema)) };
};

export const actions: Actions = {
	signIn: async (event) => {
		const form = await superValidate(event, zod(loginSchema));
		if (!form.valid) return fail(400, { form, success: false });
		return { form };
	},
	signOut
};
