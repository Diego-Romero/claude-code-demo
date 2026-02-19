import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  expect: {
    timeout: 10_000, // Convex cloud round-trips need extra time
  },
  projects: [
    // Auth setup runs first, once
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  // Start the dev server automatically when running tests
  webServer: {
    command: "npm run dev:frontend",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
