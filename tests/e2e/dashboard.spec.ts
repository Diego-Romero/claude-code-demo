import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("shows the dashboard heading and incident count", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText(/active incident/)).toBeVisible();
  });

  test("lists active incidents with severity badges", async ({ page }) => {
    await expect(page.getByText("API gateway returning 503s")).toBeVisible();
    await expect(page.getByTestId("incident-card").first().getByText(/P[0-3]/)).toBeVisible();
  });

  test("can create a new incident", async ({ page }) => {
    const title = `Test incident from Playwright ${Date.now()}`;
    await page.getByRole("button", { name: "New incident" }).click();

    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Description").fill("This is a test incident created by the E2E suite.");
    await page.getByLabel("Severity").selectOption("P2");
    await page.getByLabel("Assignee (email)").fill("playwright@test.dev");
    await page.getByRole("button", { name: "Create incident" }).click();

    await expect(page.getByText(title)).toBeVisible();
  });

  test("can resolve an incident", async ({ page }) => {
    const title = `Incident to resolve ${Date.now()}`;
    await page.getByRole("button", { name: "New incident" }).click();
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Description").fill("Will be resolved by the test.");
    await page.getByRole("button", { name: "Create incident" }).click();

    const card = page.getByTestId("incident-card").filter({ hasText: title });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Resolve" }).click();

    await expect(card).not.toBeVisible();
  });

  test("can delete an incident", async ({ page }) => {
    const title = `Incident to delete ${Date.now()}`;
    await page.getByRole("button", { name: "New incident" }).click();
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Description").fill("Will be deleted by the test.");
    await page.getByRole("button", { name: "Create incident" }).click();

    const card = page.getByTestId("incident-card").filter({ hasText: title });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Delete" }).click();

    await expect(card).not.toBeVisible();
  });
});
