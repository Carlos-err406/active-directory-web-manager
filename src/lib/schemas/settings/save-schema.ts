import { getCaptchaCharacters } from '$/lib/utils';
import { z } from 'zod';

export const saveConfigSchema = z.object({
	app_captcha_charPreset: z.string().trim().min(1).transform(getCaptchaCharacters),
	app_captcha_ignoreChars: z.string().trim().min(0).transform(getCaptchaCharacters),
	app_captcha_size: z.number({ coerce: true }).min(1).max(10),
	app_nonAdmin_allowSelfEdit: z.boolean(),
	app_nonAdmin_allowAccessToUsersPage: z.boolean(),
	app_nonAdmin_allowAccessToTreePage: z.boolean(),
	app_nonAdmin_allowAccessToOUsPage: z.boolean(),
	app_nonAdmin_allowAccessToGroupsPage: z.boolean(),
	app_groups_show: z.boolean(),
	app_logs_show: z.boolean(),
	app_tree_show: z.boolean(),
	app_ous_show: z.boolean()
});
export type SaveConfigSchema = typeof saveConfigSchema;
