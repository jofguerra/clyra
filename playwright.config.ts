import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:8090',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: {
    command: 'npm run web -- --localhost --port 8090 --max-workers 2',
    url: 'http://127.0.0.1:8090',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { CI: '1', EXPO_OFFLINE: '1', EXPO_NO_TELEMETRY: '1', EXPO_PUBLIC_LOCAL_MODE: 'true' },
  },
});
