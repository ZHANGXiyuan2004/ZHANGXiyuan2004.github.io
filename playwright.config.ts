import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 45000, workers: 1,
  use: { baseURL: 'http://127.0.0.1:8765', channel: 'chrome', headless: true },
  reporter: 'list',
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:8765', reuseExistingServer: true },
});
