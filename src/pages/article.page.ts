import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ArticlePage extends BasePage {
  readonly title: Locator;
  readonly body: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h1');
    this.body = page.locator('.article-content');
    this.deleteButton = page.getByRole('button', { name: /Delete Article/i }).first();
  }

  async openBySlug(slug: string) {
    await this.goto(`/article/${slug}`);
  }

  async expectTitle(title: string) {
    await expect(this.title).toHaveText(title);
  }
}
