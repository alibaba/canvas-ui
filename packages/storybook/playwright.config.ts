import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './vrt',
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{ext}',
  outputDir: './vrt/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:6006',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // -s: silent mode, suppresses log output for cleaner test runs
    command: 'npx http-server storybook-static -p 6006 -s',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
  },
})
