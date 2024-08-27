import test, { expect } from '@playwright/test';
import config from '../../config';
import { ADMIN_AUTH } from '../storage-states';

test.use({ storageState: ADMIN_AUTH });

// test.describe('Administrator user profile page', () => {
test.beforeEach(async ({ page }) => {
	await page.goto(`${process.env.ORIGIN}/users/me`);
});

test('Loads administrator avatar', async ({ page }) => {
	await expect(page.locator("[data-test='userAvatar']")).toBeVisible();
});

test('Loads administrator name', async ({ page }) => {
	await expect(page.locator("[data-test='userName']")).toBeVisible();
	await expect(page.locator("[data-test='userName']")).toContainText('Administrator');
});

test('Loads administrator data', async ({ page }) => {
	const { details } = config.app.views.usersPage;
	await expect(page.locator("[data-test='sAMAccountName']")).toContainText('Administrator');
	await expect(page.locator("[data-test='displayName']")).not.toBeVisible();
	await expect(page.locator("[data-test='givenName']")).not.toBeVisible();
	await expect(page.locator("[data-test='sn']")).not.toBeVisible();
	await expect(page.locator("[data-test='mail']")).not.toBeVisible();

	if (details.description.show)
		await expect(page.locator("[data-test='description']")).toContainText(
			'Built-in account for administering the computer/domain'
		);
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
		await expect(page.locator("[data-test='distinguishedName']")).toContainText(
			`CN=Administrator,CN=Users,${process.env.PUBLIC_BASE_DN}`
		);
	else await expect(page.locator("[data-test='distinguishedName']")).not.toBeVisible();

	if (details.memberOf.show)
		await expect(page.locator("[data-test='memberOf']")).toContainText(
			`CN=Domain Admins,CN=Users,${process.env.PUBLIC_BASE_DN}`
		);
	else await expect(page.locator("[data-test='memberOf']")).not.toBeVisible();
});

test('Loads edit user and change password buttons', async ({ page }) => {
	await expect(page.locator("[data-test='userEdit']")).toBeVisible();
	await expect(page.locator("[data-test='userChangePassword']")).toBeVisible();
});
// });
