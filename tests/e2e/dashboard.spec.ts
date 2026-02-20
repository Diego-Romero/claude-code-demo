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
    await expect(page.getByTestId("incident-card").first().getByText(/^P[0-3]$/)).toBeVisible();
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

test.describe("Assigned to me filter", () => {
  const DEMO_EMAIL = "demo@incident.dev"; // fixed single demo user — safe to hardcode

  test("toggle shows only incidents assigned to the current user", async ({ page }) => {
    test.setTimeout(60_000); // Creates two incidents — needs extra time for Convex round-trips
    await page.goto("/dashboard");

    const assignedTitle = `Assigned to me ${Date.now()}`;
    const unassignedTitle = `Not assigned ${Date.now()}`;

    // Create an incident assigned to the demo user
    await page.getByRole("button", { name: "New incident" }).click();
    await page.getByLabel("Title").fill(assignedTitle);
    await page.getByLabel("Description").fill("Should appear when filter is on.");
    await page.getByLabel("Assignee (email)").fill(DEMO_EMAIL);
    await page.getByRole("button", { name: "Create incident" }).click();
    await expect(page.getByTestId("incident-card").filter({ hasText: assignedTitle })).toBeVisible();

    // Create an unassigned incident
    await page.getByRole("button", { name: "New incident" }).click();
    await page.getByLabel("Title").fill(unassignedTitle);
    await page.getByLabel("Description").fill("Should disappear when filter is on.");
    await page.getByRole("button", { name: "Create incident" }).click();
    await expect(page.getByTestId("incident-card").filter({ hasText: unassignedTitle })).toBeVisible();

    // Enable filter — only the assigned incident should be visible
    await page.getByRole("button", { name: "Assigned to me" }).click();
    await expect(page.getByTestId("incident-card").filter({ hasText: assignedTitle })).toBeVisible();
    await expect(page.getByTestId("incident-card").filter({ hasText: unassignedTitle })).not.toBeVisible();

    // Disable filter — both incidents visible again
    await page.getByRole("button", { name: "Assigned to me" }).click();
    await expect(page.getByTestId("incident-card").filter({ hasText: unassignedTitle })).toBeVisible();

    // Cleanup — delete both created incidents
    const assignedCard = page.getByTestId("incident-card").filter({ hasText: assignedTitle });
    await assignedCard.getByRole("button", { name: "Delete" }).click();
    await expect(assignedCard).not.toBeVisible();

    const unassignedCard = page.getByTestId("incident-card").filter({ hasText: unassignedTitle });
    await unassignedCard.getByRole("button", { name: "Delete" }).click();
    await expect(unassignedCard).not.toBeVisible();
  });
});
