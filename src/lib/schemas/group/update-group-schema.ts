import { z } from 'zod';
import { base, dn } from '../dn-schema';

export const updateGroupSchema = z.object({
	dn,
	base,
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
	description: z.string().max(100, 'description can not be longer than 100 characters').optional()
});
export type UpdateGroupSchema = typeof updateGroupSchema;
