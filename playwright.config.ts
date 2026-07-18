import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    // E2E_TEST_MODE enables the auth bypass used by the e2e specs. It is only
    // ever set here for the test server, never in a real deployment.
    command: "npm run build && npm start",
    env: { E2E_TEST_MODE: "true" },
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180000,
  },
});
