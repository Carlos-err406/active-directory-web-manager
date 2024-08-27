import { expect, test } from '@playwright/test';
import { NO_AUTH } from '../storage-states';

test.use({ storageState: NO_AUTH });

test.beforeEach(async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/auth`);
});
test('should load the sign-in form', async ({ page }) => {
	await expect(page.locator('form[data-test="signInForm"]')).toBeVisible();
});

test('should display all required inputs and captcha', async ({ page }) => {
	await expect(page.locator('input[name="email"]')).toBeVisible();
	await expect(page.locator('input[type="password"]')).toBeVisible();
	await expect(page.locator('input[name="captcha"]')).toBeVisible();
	await expect(page.locator('[data-test="captcha"]')).toBeVisible({ timeout: 20_000 });
});
