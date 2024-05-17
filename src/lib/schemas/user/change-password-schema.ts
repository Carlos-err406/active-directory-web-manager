import { z } from 'zod';
import { dn } from '../dn-schema';

const oldPassword = z.string().optional();
const password = z
	.string()
	.min(8, 'Password must be at least 8 characters long')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[A-Z]/, 'Password must contain at least one capital letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(
		/[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/,
		'Password must contain at leat one special character'
	);

export const changePasswordSchema = z
	.object({
		dn,
		oldPassword,
		password,
		passwordConfirmation: z.string().min(1, 'Password confirmation is required')
	})
	.refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
		message: 'Passwords do not match',
		path: ['passwordConfirmation']
	});

export type ChangePasswordSchema = typeof changePasswordSchema;
