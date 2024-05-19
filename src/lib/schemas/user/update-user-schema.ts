import { z } from 'zod';
import { base, dn } from '../dn-schema';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from './create-user-schema';

export const updateUserSchema = z
	.object({
		dn,
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
		description: z.string().max(100, 'description cannot be longer than 100 characters').optional()
	})
	.refine(
		({ jpegPhoto, jpegPhotoBase64 }) =>
			(!jpegPhoto && !jpegPhotoBase64) || (jpegPhoto && jpegPhotoBase64),
		{ message: 'Error in photo', path: ['jpegPhoto'] }
	);
export type UpdateUserSchema = typeof updateUserSchema;
