import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 300_000,
  retries: 3,
  reporter: [['dot'], ['./src/helpers/slack-notify.ts']],
  use: {
    headless: true,
    baseURL: 'https://stg-cloak.ecbo.io/en',
    viewport: { width: 1600, height: 900 },
  },
});