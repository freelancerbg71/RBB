import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: 'line',
  webServer: {
    command: 'node scripts/serve-static.mjs',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      HOST: '127.0.0.1',
      PORT: '4321',
    },
  },
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'http://127.0.0.1:4321',
  },
});
