import test, { expect } from '@playwright/test';
import config from '../../config';
import { displayName, dn, sAMAccountName } from '../mock-data';
import { NO_ADMIN_AUTH } from '../storage-states';

test.use({ storageState: NO_ADMIN_AUTH });

test.beforeEach(async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/users/me`);
});

test('Loads user avatar', async ({ page }) => {
	await expect(page.locator("[data-test='userAvatar']")).toBeVisible();
});

test('Loads user name', async ({ page }) => {
	await expect(page.locator("[data-test='userName']")).toBeVisible();
	await expect(page.locator("[data-test='userName']")).toContainText(displayName);
});

test('Loads user data', async ({ page }) => {
	const { details } = config.app.views.usersPage;
	await expect(page.locator("[data-test='sAMAccountName']")).toContainText(sAMAccountName);

	if (details.displayName.show)
		await expect(page.locator("[data-test='displayName']")).toBeVisible();
	else await expect(page.locator("[data-test='displayName']")).not.toBeVisible();

	if (details.givenName.show) await expect(page.locator("[data-test='givenName']")).toBeVisible();
	else await expect(page.locator("[data-test='givenName']")).not.toBeVisible();

	if (details.sn.show) await expect(page.locator("[data-test='sn']")).toBeVisible();
	else await expect(page.locator("[data-test='sn']")).not.toBeVisible();

	if (details.mail.show) await expect(page.locator("[data-test='mail']")).toBeVisible();
	else await expect(page.locator("[data-test='mail']")).not.toBeVisible();

	if (details.description.show)
		await expect(page.locator("[data-test='description']")).toBeVisible();
	else await expect(page.locator("[data-test='description']")).not.toBeVisible();

	if (details.userAccountControl.show)
		await expect(page.locator("[data-test='userAccountControl']")).toContainText('Normal Account');
	else await expect(page.locator("[data-test='userAccountControl']")).not.toBeVisible();

	if (details.whenCreated.show)
		await expect(page.locator("[data-test='whenCreated']")).toBeVisible();
	else expect(page.locator("[data-test='whenCreated']")).not.toBeVisible();

	if (details.whenChanged.show)
		await expect(page.locator("[data-test='whenChanged']")).toBeVisible();
	else expect(page.locator("[data-test='whenChanged']")).not.toBeVisible();

	if (details.distinguishedName.show)
		await expect(page.locator("[data-test='distinguishedName']")).toContainText(dn);
	else await expect(page.locator("[data-test='distinguishedName']")).not.toBeVisible();
});

test('Loads edit user and change password buttons', async ({ page }) => {
	await expect(page.locator("[data-test='userEdit']")).toBeVisible();
	await expect(page.locator("[data-test='userChangePassword']")).toBeVisible();
});

test('Shows the disabled self update message according to config', async ({ page }) => {
	const locator = page.locator("[data-test='disabledSelfUpdate']");
	if (config.app.nonAdmin.allowSelfEdit) await expect(locator).not.toBeVisible();
	else await expect(locator).toBeVisible();
});
