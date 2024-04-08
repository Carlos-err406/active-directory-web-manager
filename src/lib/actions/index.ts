import { searchSchema } from '$lib/schemas/search-schema';
import type { Action } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const search: Action = async (event) => {
	const form = await superValidate(event, zod(searchSchema));
	return { form };
};
