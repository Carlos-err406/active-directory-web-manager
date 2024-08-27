import { z } from 'zod';
import { base } from '../dn-schema';

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_MB = 6;

export const createUserSchema = z
	.object({
		base,
		jpegPhoto: z
			.instanceof(File)
			.optional()
			.refine(
				(file) => !file || (file && ALLOWED_FILE_TYPES.includes(file.type)),
				'Allowed image types are jpeg, png, webp'
			)
			.refine(
				(file) => !file || (file && file.size < MAX_FILE_SIZE_MB * 1024 * 1024),
				'File too large, max 6MB'
			),
		jpegPhotoBase64: z.string().optional(),
		sAMAccountName: z
			.string({ required_error: 'sAMAccountName is required' })
			.regex(/^[^\s]+$/, 'sAMAccountName cannot contain spaces')
			.trim()
			.min(1, 'sAMAccountName is required'),
		givenName: z
			.string({ required_error: 'givenName is required' })
			.trim()
			.min(1, 'givenName is required'),
		sn: z.string().trim().optional(),
		mail: z.string().email().trim().min(1, 'mail is required'),
		description: z.string().max(100, 'description cannot be longer than 100 characters').optional(),
		password: z
			.string({ required_error: 'password is required' })
			.min(8, 'Password must be at least 8 characters long')
			.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
			.regex(/[A-Z]/, 'Password must contain at least one capital letter')
			.regex(/[0-9]/, 'Password must contain at least one number')
			.regex(
				/[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/,
				'Password must contain at least one special character'
			),
		passwordConfirmation: z.string().min(1, 'Password confirmation is required')
	})
	.refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
		message: 'Passwords do not match',
		path: ['passwordConfirmation']
	})
	.refine(
		({ jpegPhoto, jpegPhotoBase64 }) =>
			(!jpegPhoto && !jpegPhotoBase64) || (jpegPhoto && jpegPhotoBase64),
		{ message: 'Error in photo', path: ['jpegPhoto'] }
	);
export type CreateUserSchema = typeof createUserSchema;
