import { CONFIG_PATH } from '$env/static/private';
import type { Action } from '@sveltejs/kit';
import { error, fail, redirect } from '@sveltejs/kit';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import YAML from 'yaml';
import { isAdmin } from '../ldap';
import { saveConfigSchema } from '../schemas/settings/save-schema';
import { getCaptchaCharacters } from '../utils';

export const saveConfig: Action = async (event) => {
	const { locals } = event;
	const auth = await locals.auth();
	if (!auth) throw redirect(302, '/auth');
	const { ldap, session } = auth;
	const allowed = await isAdmin(ldap, session.distinguishedName);
	if (!allowed) throw error(403, 'You are not allowed to do modifications in the settings.');
	const { config } = locals;
	const form = await superValidate(event, zod(saveConfigSchema));
	if (!form.valid) return fail(400, { form });

	const configPath = CONFIG_PATH;
	const configPathExtension = path.extname(configPath);
	const isYAML = ['.yml', '.yaml'].includes(configPathExtension);
	const isJSON = ['.json'].includes(configPathExtension);
	const tempConfig = _.cloneDeep(config);
	tempConfig.app.captcha.size = form.data.app_captcha_size;
	tempConfig.app.captcha.charPreset = getCaptchaCharacters(form.data.app_captcha_charPreset);
	tempConfig.app.captcha.ignoreChars = getCaptchaCharacters(form.data.app_captcha_ignoreChars);
	tempConfig.app.nonAdmin.allowAccessToGroupsPage = form.data.app_nonAdmin_allowAccessToGroupsPage;
	tempConfig.app.nonAdmin.allowAccessToOUsPage = form.data.app_nonAdmin_allowAccessToOUsPage;
	tempConfig.app.nonAdmin.allowAccessToTreePage = form.data.app_nonAdmin_allowAccessToTreePage;
	tempConfig.app.nonAdmin.allowAccessToUsersPage = form.data.app_nonAdmin_allowAccessToUsersPage;
	tempConfig.app.nonAdmin.allowSelfEdit = form.data.app_nonAdmin_allowSelfEdit;
	tempConfig.app.views.groupsPage.show = form.data.app_groups_show;
	tempConfig.app.views.logsPage.show = form.data.app_logs_show;
	tempConfig.app.views.treePage.show = form.data.app_tree_show;
	tempConfig.app.views.ousPage.show = form.data.app_ous_show;

	if (isJSON) {
		fs.writeFileSync(configPath, JSON.stringify(tempConfig, null, 2));
	} else if (isYAML) {
		fs.writeFileSync(configPath, YAML.stringify(tempConfig, { lineWidth: 1000 }));
	}

	return { form };
};
