import { test, expect } from "@playwright/test";

test.describe("All Incidents", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/incidents");
  });

  test("shows all incidents in a table including resolved ones", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "All Incidents" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "active" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "resolved" }).first()).toBeVisible();
  });

  test("shows severity badges in the table", async ({ page }) => {
    await expect(page.getByRole("cell", { name: "P0" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "P1" }).first()).toBeVisible();
  });

  test("resolved incidents do not show a Resolve button", async ({ page }) => {
    // Filter by exact status cell text to avoid matching active incidents
    // whose descriptions happen to contain the word "resolved"
    const resolvedRow = page.locator("tbody tr").filter({
      has: page.getByRole("cell", { name: "resolved", exact: true }),
    }).first();
    await expect(resolvedRow).toBeVisible();
    await expect(resolvedRow.getByRole("button", { name: "Resolve" })).not.toBeVisible();
  });

  test("active incidents show a Resolve button", async ({ page }) => {
    const activeRow = page.locator("tbody tr").filter({ hasText: "active" }).first();
    await expect(activeRow.getByRole("button", { name: "Resolve" })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("sidebar links navigate correctly", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "All Incidents" }).click();
    await expect(page).toHaveURL("/incidents");

    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("unauthenticated users are redirected to signin", async ({ browser }) => {
    const freshContext = await browser.newContext({ storageState: undefined });
    const freshPage = await freshContext.newPage();

    await freshPage.goto("/dashboard");
    await expect(freshPage).toHaveURL(/\/signin/);

    await freshContext.close();
  });
});
