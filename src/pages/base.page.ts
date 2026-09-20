import { Page } from '@playwright/test';

/**
 * Common helpers only — no locators here. Page objects should compose
 * this, not lean on it as a god-object. Keep it thin.
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForToast(text: string | RegExp) {
    await this.page.getByText(text).waitFor({ state: 'visible' });
  }
}
