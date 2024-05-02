import { z } from 'zod';
import { passwordSchema } from './password-schema';

export const signUpSchema = z.object({
	email: z.string().email(),
	captcha: z.string().min(1, 'Captcha is required'),
	password: passwordSchema.min(1, 'Password is required')
});
export type LoginSchema = typeof signUpSchema;
