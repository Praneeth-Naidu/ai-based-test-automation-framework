import { test as base } from '@playwright/test';
import { ConduitApiClient } from '../api/clients/conduit-api.client';
import { buildUser } from '../data/factories/user.factory';
import { ConduitUser } from '../api/types';
import { config } from '../config/env';

type AuthFixtures = {
  /** A logged-in Page for a freshly registered user — no UI login steps. */
  authenticatedPage: { page: import('@playwright/test').Page; user: ConduitUser };
};

/**
 * Registers a user via the API (fast, reliable) and seeds the browser's
 * localStorage with the resulting JWT before any test code runs, so UI
 * specs that aren't specifically testing login/signup start already
 * authenticated. This is the same principle as "log in once via API"
 * used across the suite — it's the biggest lever for cutting UI test
 * runtime and flakiness.
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, playwright }, use) => {
    const context = await playwright.request.newContext();
    const client = new ConduitApiClient(context);
    const user = buildUser();
    const { user: registered } = await client.register(user);

    // Conduit's frontend reads its session from localStorage under 'jwt'.
    // We navigate first so localStorage has an origin to attach to, then seed it.
    await page.goto(config.conduit.baseUrl);
    await page.evaluate((token) => {
      window.localStorage.setItem('jwt', token);
    }, registered.token);
    await page.reload();

    await use({ page, user });
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
