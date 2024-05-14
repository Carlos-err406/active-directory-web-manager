import { PUBLIC_BASE_DN } from '$env/static/public';
import { z } from 'zod';

export const dn = z
	.string()
	.trim()
	.refine((val) => val.endsWith(PUBLIC_BASE_DN), 'dn must end with ' + PUBLIC_BASE_DN);
