import { sleep } from '../fixtures';
import { expect, test } from '@playwright/test';
import { NO_AUTH } from '../storage-states';

test.describe('user actions', () => {
	test.use({ storageState: NO_AUTH });

	test.beforeEach(async ({ page }) => {
		await page.goto(`${process.env.ORIGIN}/auth`);
	});

	test('should accept user input', async ({ page }) => {
		await page.fill('input[name="email"]', 'test@mail.com');
		await page.fill('input[type="password"]', 'password123');
		await page.fill('input[name="captcha"]', 'captcha');

		await expect(page.locator('input[name="email"]')).toHaveValue('test@mail.com');
		await expect(page.locator('input[type="password"]')).toHaveValue('password123');
		await expect(page.locator('input[name="captcha"]')).toHaveValue('captcha');
	});

	test('should refresh captcha', async ({ page }) => {
		const initialCaptcha = await page.locator('[data-test="captcha"]').innerHTML();
		await page.click('button[data-test="captcha-reload"]');
		await page.waitForTimeout(1000); // wait for the captcha to reload
		const refreshedCaptcha = await page.locator('[data-test="captcha"]').innerHTML();

		expect(initialCaptcha).not.toBe(refreshedCaptcha);
	});
	test('should validate user input', async ({ page }) => {
		await page.fill('input[name="email"]', '');
		await page.fill('input[type="password"]', '');
		await page.fill('input[name="captcha"]', '');
		await sleep(2000);
		await page.click("button[data-test='signInButton']");
		await expect(page.locator('[data-test="email-error"]')).toContainText('Invalid email');
		await expect(page.locator('[data-test="password-error"]')).toContainText(
			'Password is required'
		);
		await expect(page.locator('[data-test="captcha-error"]')).toContainText('Captcha is required');
	});
});
