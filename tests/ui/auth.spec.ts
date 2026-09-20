import { test } from '../../src/fixtures/auth.fixture';
import { expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';

test.describe('Authentication', () => {
  test('shows an error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('nobody@example-test.com', 'wrong-password');
    await loginPage.expectError(/email or password is invalid/i);
  });

  test('an authenticated user sees their username in the nav', async ({ authenticatedPage }) => {
    const { page, user } = authenticatedPage;
    await expect(page.getByRole('link', { name: user.username })).toBeVisible();
  });
});
