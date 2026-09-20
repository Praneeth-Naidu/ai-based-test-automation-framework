import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { ConduitArticleInput } from '../api/types';

export class EditorPage extends BasePage {
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagsInput: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByPlaceholder('Article Title');
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.tagsInput = page.getByPlaceholder('Enter tags');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
  }

  async open() {
    await this.goto('/editor');
  }

  async fillAndPublish(article: ConduitArticleInput) {
    await this.titleInput.fill(article.title);
    await this.descriptionInput.fill(article.description);
    await this.bodyInput.fill(article.body);
    for (const tag of article.tagList ?? []) {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press('Enter');
    }
    await this.publishButton.click();
  }
}
