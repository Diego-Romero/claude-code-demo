import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate as demo user", async ({ page }) => {
  await page.goto("/signin");

  await page.fill('input[name="email"]', process.env.DEMO_EMAIL!);
  await page.fill('input[name="password"]', process.env.DEMO_PASSWORD!);
  await page.click('button[type="submit"]');

  await page.waitForURL("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // Save session state — all subsequent tests reuse this
  await page.context().storageState({ path: authFile });
});
