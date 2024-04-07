import { handle as authorizationHandler } from '$lib/auth';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(authorizationHandler);
