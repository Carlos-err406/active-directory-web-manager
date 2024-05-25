import { z } from 'zod';
import { base } from '../dn-schema';
import { GroupTypes } from '$lib/types/group';

export const createGroupSchema = z.object({
	base,
	sAMAccountName: z
		.string({ required_error: 'sAMAccountName is required' })
		.trim()
		.min(1, 'sAMAccountName is required'),
	groupType: z
		.number({ required_error: 'groupType is required', coerce: true })
		.default(-1)
		.refine(
			(value) => value === 0 || Object.keys(GroupTypes).includes(String(value)),
			'groupType is invalid'
		),
	description: z
		.string()
		.trim()
		.max(100, 'description can not be longer than 100 characters')
		.optional(),
	mail: z.string().email().trim().optional()
});

export type CreateGroupSchema = typeof createGroupSchema;
