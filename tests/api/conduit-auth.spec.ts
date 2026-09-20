import { test, expect } from '../../src/fixtures/api.fixture';
import { buildUser } from '../../src/data/factories/user.factory';

test.describe('Conduit API — auth', () => {
  test('registering a new user returns a token', async ({ conduitApi }) => {
    const user = buildUser();
    const { user: registered } = await conduitApi.register(user);

    expect(registered.username).toBe(user.username);
    expect(registered.token).toBeTruthy();
  });

  test('logging in with a registered user succeeds', async ({ conduitApi }) => {
    const user = buildUser();
    await conduitApi.register(user);

    const { user: loggedIn } = await conduitApi.login(user.email, user.password);
    expect(loggedIn.email).toBe(user.email);
  });

  test('creating an article requires auth', async ({ authedConduitApi }) => {
    const { client } = authedConduitApi;
    // authedConduitApi is already registered+logged in — this is the
    // "log in via API, not the form" pattern used across the UI suite too.
    const { article } = await client.createArticle({
      title: `API test article ${Date.now()}`,
      description: 'Created directly via the API client',
      body: 'Body content',
      tagList: ['automation'],
    });

    expect(article.slug).toBeTruthy();
    await client.deleteArticle(article.slug); // cleanup
  });
});
