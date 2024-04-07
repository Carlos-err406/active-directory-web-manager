import { z } from 'zod';
import { passwordSchema } from './password-schema';

export const loginSchema = z.object({
	email: z.string().email(),
	password: passwordSchema
});
export type LoginSchema = typeof loginSchema;
