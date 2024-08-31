import { z } from 'zod';
import { dn } from '../dn-schema';

export const deleteOuSchema = z.object({ dn });
export type DeleteOuSchema = typeof deleteOuSchema;
