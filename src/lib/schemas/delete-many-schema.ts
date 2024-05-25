import { z } from 'zod';
import { dn } from './dn-schema';

export const deleteManySchema = z.object({
	dns: z.array(dn)
});

export type DeleteManySchema = typeof deleteManySchema;
