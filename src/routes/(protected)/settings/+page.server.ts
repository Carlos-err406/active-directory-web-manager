import { saveConfigSchema } from '$/lib/schemas/settings/save-schema';
import { protectedAccessControl } from '$/lib/server/utils.js';
import getConfig from '$config';
import defaults from '$config/defaults';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ depends, locals, url }) => {
	await protectedAccessControl({ locals, url });
	depends('protected:config');
	const config = await getConfig();
	const saveConfigForm = await superValidate(
		zod(saveConfigSchema, {
			defaults: {
				app_captcha_charPreset: config.app.captcha.charPreset,
				app_captcha_ignoreChars: config.app.captcha.ignoreChars,
				app_captcha_size: config.app.captcha.size,
				app_nonAdmin_allowAccessToGroupsPage: config.app.nonAdmin.allowAccessToGroupsPage,
				app_nonAdmin_allowAccessToUsersPage: config.app.nonAdmin.allowAccessToUsersPage,
				app_nonAdmin_allowAccessToOUsPage: config.app.nonAdmin.allowAccessToOUsPage,
				app_nonAdmin_allowAccessToTreePage: config.app.nonAdmin.allowAccessToTreePage,
				app_nonAdmin_allowSelfEdit: config.app.nonAdmin.allowSelfEdit,
				app_groups_show: config.app.views.groupsPage.show,
				app_logs_show: config.app.views.logsPage.show,
				app_ous_show: config.app.views.ousPage.show,
				app_tree_show: config.app.views.treePage.show
			}
		})
	);
	return {
		searchForm: false,
		defaults,
		saveConfigForm
	};
};

export * as actions from '$lib/actions/settings';
