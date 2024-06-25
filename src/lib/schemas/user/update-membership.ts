import { z } from 'zod';
import { dn } from '../dn-schema';

export const updateMembershipSchema = z.object({
	dns: z.array(dn)
});

export type UpdateMembershipSchema = typeof updateMembershipSchema;
