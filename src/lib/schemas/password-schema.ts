import { z } from 'zod';

export const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters long')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[A-Z]/, 'Password must contain at least one capital letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(
		/[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/,
		'Password must contain at leat one special character'
	);

export type PasswordSchema = typeof passwordSchema;
