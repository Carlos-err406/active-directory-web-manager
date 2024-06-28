import { sleep } from '$lib/utils';
import { expect, test } from '@playwright/test';

test.describe('Sign In Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:5173/auth');
	});

	test('should load the sign-in form', async ({ page }) => {
		await expect(page.locator('form[data-test="signInForm"]')).toBeVisible();
	});

	test('should display all required inputs', async ({ page }) => {
		await expect(page.locator('input[name="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.locator('input[name="captcha"]')).toBeVisible();
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

	test('should submit the form', async ({ page }) => {
		await sleep(3000);
		await page.fill(
			"input[data-test='emailInput']",
			`administrator@${process.env.PUBLIC_LDAP_DOMAIN}`
		);
		await page.fill("input[data-test='passwordInput']", `${process.env.ADMIN_PASSWD}`);

		await expect(page.locator("input[data-test='emailInput']")).toHaveValue(
			`administrator@${process.env.PUBLIC_LDAP_DOMAIN}`
		);
		await expect(page.locator("input[data-test='passwordInput']")).toHaveValue(
			`${process.env.ADMIN_PASSWD}`
		);
		await expect(page.locator("div[data-test='captchaLoader']")).not.toBeVisible();
		await page.fill('input[data-test="captchaInput"]', 'A');

		await sleep(2000);
		await page.click("button[data-test='signInButton']");
		await expect(page).toHaveURL('http://localhost:5173/users/me');
	});
});
