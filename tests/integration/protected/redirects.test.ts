import test, { expect } from '@playwright/test';
import { NO_AUTH } from '../storage-states';

test.use({ storageState: NO_AUTH });

test.describe('Accessing to protected pages without being signed in redirects to sign in page', () => {
	test('Accessing to /users/me', async ({ page }) => {
		await page.goto(`${process.env.ORIGIN}/users/me`);
		await page.waitForURL('**/auth');
		expect(page.url()).toMatch(/(.*)\/auth/);
	});
	test('Accessing to /users', async ({ page }) => {
		await page.goto(`${process.env.ORIGIN}/users`);
		await page.waitForURL('**/auth');
		expect(page.url()).toMatch(/(.*)\/auth/);
	});
	test('Accessing to /groups', async ({ page }) => {
		await page.goto(`${process.env.ORIGIN}/groups`);
		await page.waitForURL('**/auth');
		expect(page.url()).toMatch(/(.*)\/auth/);
	});
	test('Accessing to /logs', async ({ page }) => {
		await page.goto(`${process.env.ORIGIN}/logs`);
		await page.waitForURL('**/auth');
		expect(page.url()).toMatch(/(.*)\/auth/);
	});
	test('Accessing to /ous', async ({ page }) => {
		await page.goto(`${process.env.ORIGIN}/ous`);
		await page.waitForURL('**/auth');
		expect(page.url()).toMatch(/(.*)\/auth/);
	});
	test('Accessing to /tree', async ({ page }) => {
		await page.goto(`${process.env.ORIGIN}/tree`);
		await page.waitForURL('**/auth');
		expect(page.url()).toMatch(/(.*)\/auth/);
	});
	test('Accessing to /settings', async ({ page }) => {
		await page.goto(`${process.env.ORIGIN}/settings`);
		await page.waitForURL('**/auth');
		expect(page.url()).toMatch(/(.*)\/auth/);
	});
});
