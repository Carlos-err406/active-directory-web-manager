import { z } from 'zod';
import { dn } from '../dn-schema';

export const deleteUserSchema = z.object({ dn });
export type DeleteUserSchema = typeof deleteUserSchema;

export const deleteManyUsersSchema = z.object({
	dns: z.array(dn)
});
