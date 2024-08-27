import { chromium, expect, type Page } from '@playwright/test';
import { AlreadyExistsError } from 'ldapts';
import config from '../config';
import { addTestUser, delTestUser, sudo } from './fixtures';
import { password, sAMAccountName } from './mock-data';
import { ADMIN_AUTH, NO_ADMIN_AUTH } from './storage-states';

const globalSetup = async () => {
	console.log('Running global setup');
	try {
		console.log('adding test user');
		await sudo(addTestUser);
	} catch (e) {
		if (!(e instanceof AlreadyExistsError)) {
			console.log(e);
			throw e;
		}
	}
	console.log('test user added!');
	expect(process.env.TESTING).toBeTruthy();
	expect(process.env.TESTING).toBe('1');

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext();

	const adminPage = await context.newPage();
	await signIn(adminPage, 'administrator', process.env.ADMIN_PASSWD || '', ADMIN_AUTH);
	const userPage = await context.newPage();
	await signIn(userPage, sAMAccountName, password, NO_ADMIN_AUTH);

	await browser.close();

	return async () => {
		console.log('Running global teardown...');
		console.log('deleing test user');
		try {
			await sudo(delTestUser);
		} catch (e) {
			console.log(e);
			//
		}
		console.log('test user deleted!');
	};
};
export default globalSetup;

const signIn = async (page: Page, username: string, password: string, storageState: string) => {
	await page.goto(`${process.env.ORIGIN}/auth`);
	await expect(page.locator("div[data-test='captchaLoader']")).not.toBeVisible({ timeout: 30_000 });
	await page.fill("input[data-test='emailInput']", `${username}@${process.env.PUBLIC_LDAP_DOMAIN}`);
	await page.fill("input[data-test='passwordInput']", password);

	const { size, charPreset } = config.app.captcha;
	await page.fill('input[data-test="captchaInput"]', charPreset.repeat(size));

	await page.click("button[data-test='signInButton']");
	await page.waitForURL('**/users/me', { timeout: 30_000 });

	await page.context().storageState({ path: storageState });
};
