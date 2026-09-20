import { test } from '../../src/fixtures/auth.fixture';
import { EditorPage } from '../../src/pages/editor.page';
import { ArticlePage } from '../../src/pages/article.page';
import { buildArticle } from '../../src/data/factories/article.factory';

test.describe('Article creation', () => {
  test('a logged-in user can publish an article and see it rendered', async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    const article = buildArticle();

    const editor = new EditorPage(page);
    await editor.open();
    await editor.fillAndPublish(article);

    // Publishing redirects to the article's own page — assert against
    // the resulting page, not the editor, so this test fails loudly
    // if the redirect itself breaks.
    const articlePage = new ArticlePage(page);
    await articlePage.expectTitle(article.title);
  });
});
