import { dn } from '$/lib/schemas/dn-schema';
import { z } from 'zod';

export const moveSchema = z.object({
	base: dn,
	dns: z.array(dn)
});
