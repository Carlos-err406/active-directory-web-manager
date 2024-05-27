import { z } from 'zod';
import { dn } from '../dn-schema';

export const setMembersSchema = z.object({
	groupDn: dn,
	dns: z.array(dn)
});

export type SetMembersShema = typeof setMembersSchema;
