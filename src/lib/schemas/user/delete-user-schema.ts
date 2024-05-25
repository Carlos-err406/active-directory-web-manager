import { z } from 'zod';
import { dn } from '../dn-schema';

export const deleteUserSchema = z.object({ dn });
export type DeleteUserSchema = typeof deleteUserSchema;
