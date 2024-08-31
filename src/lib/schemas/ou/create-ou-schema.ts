import { z } from 'zod';
import { base } from '../dn-schema';

export const createOuSchema = z.object({
	base,
	name: z.string({ required_error: 'name is required' }).trim().min(1, 'name is required'),
	description: z
		.string()
		.trim()
		.max(100, 'description can not be longer than 100 characters')
		.optional()
});

export type CreateOuSchema = typeof createOuSchema;
