import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '100%' : undefined,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: config.headless,
  },

  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: config.conduit.baseUrl },
    },
    {
      name: 'api',
      testDir: './tests/api',
      // API tests don't need a browser context at all — keeps them fast.
      use: {},
    },
  ],
});
