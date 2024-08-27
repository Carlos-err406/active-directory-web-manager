import { sleep } from '$lib/utils';
import { expect, test } from '@playwright/test';
import config from '../../config';
import { NO_AUTH } from '../storage-states';

test.use({ storageState: NO_AUTH });

test.beforeEach(async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/auth`);
});

test('should submit the form and redirect to the users profile page', async ({ page }) => {
	await sleep(3_000);

	await expect(page.locator("[data-test='captchaLoader']")).not.toBeVisible({ timeout: 10_000 });

	await page.fill("[data-test='emailInput']", `administrator@${process.env.PUBLIC_LDAP_DOMAIN}`);
	await page.fill("[data-test='passwordInput']", `${process.env.ADMIN_PASSWD}`);

	const { size, charPreset } = config.app.captcha;
	await page.fill('[data-test="captchaInput"]', charPreset.repeat(size));

	await page.click("[data-test='signInButton']");
	await page.waitForURL('**/users/me', { timeout: 30_000 });
	expect(page.url()).toMatch(/(.*)\/users\/me/);
});
