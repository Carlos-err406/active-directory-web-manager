import { UAC } from '$/lib/types/user';
import { z } from 'zod';

export const userAccountControlSchema = z.object({
	[`uac.${UAC['Account Disabled']}`]: z.boolean().optional(),
	[`uac.${UAC['Account Locked Out']}`]: z.boolean().optional(),
	[`uac.${UAC["Don't Require Preauthentication"]}`]: z.boolean().optional(),
	[`uac.${UAC['Encrypted Text Password Allowed']}`]: z.boolean().optional(),
	[`uac.${UAC['Home Directory Required']}`]: z.boolean().optional(),
	[`uac.${UAC['Interdomain Trust Account']}`]: z.boolean().optional(),
	[`uac.${UAC['MNS Logon Account']}`]: z.boolean().optional(),
	[`uac.${UAC['Normal Account']}`]: z.boolean().optional(),
	[`uac.${UAC['Not Delegated']}`]: z.boolean().optional(),
	[`uac.${UAC['Password Cannot Change']}`]: z.boolean().optional(),
	[`uac.${UAC['Password Never Expires']}`]: z.boolean().optional(),
	[`uac.${UAC['Password Expired']}`]: z.boolean().optional(),
	[`uac.${UAC['Password Not Required']}`]: z.boolean().optional(),
	[`uac.${UAC['Script']}`]: z.boolean().optional(),
	[`uac.${UAC['Server Trust Account']}`]: z.boolean().optional(),
	[`uac.${UAC['Smart Card Required']}`]: z.boolean().optional(),
	[`uac.${UAC['Temporary Duplicate Account']}`]: z.boolean().optional(),
	[`uac.${UAC['Trusted for Delegation']}`]: z.boolean().optional(),
	[`uac.${UAC['Trusted to Authenticate for Delegation']}`]: z.boolean().optional(),
	[`uac.${UAC['Use DES Keys only']}`]: z.boolean().optional(),
	[`uac.${UAC['Workstation Trust Account']}`]: z.boolean().optional()
});
export type UserAccountControlSchema = typeof userAccountControlSchema;
