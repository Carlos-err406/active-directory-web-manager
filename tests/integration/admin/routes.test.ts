import test, { expect } from '@playwright/test';
import { ADMIN_AUTH } from '../storage-states';

test.use({ storageState: ADMIN_AUTH });

test('Loads users page', async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/users`);
	await expect(page.locator("[data-test='usersPage']")).toBeVisible();
});

test('Loads groups page', async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/groups`);
	await expect(page.locator("[data-test='groupsPage']")).toBeVisible();
});

test('Loads groups details page', async ({ page }) => {
	await page.goto(
		`${process.env.ORIGIN}/groups/CN=Domain Admins,CN=Users,${process.env.PUBLIC_BASE_DN}`
	);
	await expect(page.locator("[data-test='groupsDnPage']")).toBeVisible();
});

test('Loads logs page', async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/logs`);
	await expect(page.locator("[data-test='logsPage']")).toBeVisible();
});

test('Loads tree page', async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/tree`);
	await expect(page.locator("[data-test='treePage']")).toBeVisible();
});

test('Loads ous page', async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/ous`);
	await expect(page.locator("[data-test='ousPage']")).toBeVisible();
});
