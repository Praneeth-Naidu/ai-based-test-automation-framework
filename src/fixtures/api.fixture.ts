import { test as base, request as playwrightRequest } from '@playwright/test';
import { ConduitApiClient } from '../api/clients/conduit-api.client';
import { BookerApiClient } from '../api/clients/booker-api.client';
import { buildUser } from '../data/factories/user.factory';
import { ConduitUser } from '../api/types';
import { config } from '../config/env';

type ApiFixtures = {
  conduitApi: ConduitApiClient;
  bookerApi: BookerApiClient;
  /** A ConduitApiClient already registered + logged in as a fresh throwaway user. */
  authedConduitApi: { client: ConduitApiClient; user: ConduitUser };
};

/**
 * Extends the base Playwright test with API clients so specs never
 * construct an APIRequestContext by hand. Each fixture gets its own
 * isolated request context — no shared cookies/state bleeding between
 * parallel tests.
 */
/**
 * Fails the whole run with one clear message instead of every test timing
 * out individually against a dead target. Worth having regardless of how
 * reliable the target app is meant to be — this project switched away from
 * a public demo instance specifically because a slow, buried failure like
 * this was the first symptom of it going down.
 */
base.beforeAll(async ({ playwright }) => {
  const ctx = await playwright.request.newContext();
  const res = await ctx.get(`${config.conduit.apiUrl}/tags`).catch(() => null);
  await ctx.dispose();
  if (!res || !res.ok()) {
    throw new Error(
      `Conduit API unreachable at ${config.conduit.apiUrl} — is the stack up? ` +
        `Run "docker compose up" first, or check CONDUIT_API_URL in .env.`
    );
  }
});

export const test = base.extend<ApiFixtures>({
  conduitApi: async ({ playwright }, use) => {
    const context = await playwright.request.newContext();
    await use(new ConduitApiClient(context));
    await context.dispose();
  },

  bookerApi: async ({ playwright }, use) => {
    const context = await playwright.request.newContext();
    await use(new BookerApiClient(context));
    await context.dispose();
  },

  authedConduitApi: async ({ playwright }, use) => {
    const context = await playwright.request.newContext();
    const client = new ConduitApiClient(context);
    const user = buildUser();
    await client.register(user);
    await use({ client, user });
    await context.dispose();
  },
});

export { playwrightRequest };
export { expect } from '@playwright/test';
