import { z } from 'zod';
import { dn } from '../dn-schema';

export const deleteGroupSchema = z.object({ dn });
export type DeleteGroupSchema = typeof deleteGroupSchema;
