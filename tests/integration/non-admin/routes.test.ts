import test, { expect } from '@playwright/test';
import { NO_ADMIN_AUTH } from '../storage-states';

test.use({ storageState: NO_ADMIN_AUTH });
test.beforeEach(async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/users/me`);
	expect(page.url()).toMatch(/(.*)\/users\/me/);
});

test("Loads logged user's page", async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/users/me`);
	await expect(page.locator("[data-test='usersMePage']")).toBeVisible();
});

test('Non admin users cant access groups page', async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/groups`);
	await expect(page.locator("[data-test='groupsPage']")).not.toBeVisible();
	await page.waitForURL('**/groups');
	expect(page.url()).toMatch(/(.*)\/groups/);
	await expect(page.locator("[data-test='errorCard']")).toBeVisible();
	await expect(page.locator("[data-test='errorStatus']")).toContainText('Error code: 403');
});

test('Non admin users cant access group details page', async ({ page }) => {
	await page.goto(
		`${process.env.ORIGIN}/groups/CN=Domain Admins,CN=Users,${process.env.PUBLIC_BASE_DN}`
	);
	await expect(page.locator("[data-test='groupsDnPage']")).not.toBeVisible();
	await page.waitForURL('**/groups/*');
	expect(page.url()).toMatch(/(.*)\/groups\/(.*)/);
	await expect(page.locator("[data-test='errorCard']")).toBeVisible();
	await expect(page.locator("[data-test='errorStatus']")).toContainText('Error code: 403');
});

test('Non admin users cant access the logs page', async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/logs`);
	await expect(page.locator("[data-test='logsPage']")).not.toBeVisible();
	await page.waitForURL('**/logs');
	expect(page.url()).toMatch(/(.*)\/logs/);
	await expect(page.locator("[data-test='errorCard']")).toBeVisible();
	await expect(page.locator("[data-test='errorStatus']")).toContainText('Error code: 403');
});

test('Non admin users cant access the tree page', async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/tree`);
	await expect(page.locator("[data-test='treePage']")).not.toBeVisible();
	await page.waitForURL('**/tree');
	expect(page.url()).toMatch(/(.*)\/tree/);
	await expect(page.locator("[data-test='errorCard']")).toBeVisible();
	await expect(page.locator("[data-test='errorStatus']")).toContainText('Error code: 403');
});

test('Non admin users cant access the ous page', async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/ous`);
	await expect(page.locator("[data-test='ousPage']")).not.toBeVisible();
	await page.waitForURL('**/ous');
	expect(page.url()).toMatch(/(.*)\/ous/);
	await expect(page.locator("[data-test='errorCard']")).toBeVisible();
	await expect(page.locator("[data-test='errorStatus']")).toContainText('Error code: 403');
});
