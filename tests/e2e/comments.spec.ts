import { test, expect, Page } from "@playwright/test";

async function createAndNavigateToIncident(page: Page, title: string) {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "New incident" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("Description for comment test.");
  await page.getByLabel("Severity").selectOption("P2");
  await page.getByRole("button", { name: "Create incident" }).click();

  const card = page.getByTestId("incident-card").filter({ hasText: title });
  await expect(card).toBeVisible();

  // Get href and navigate directly — avoids click-timing races on the
  // reactive dashboard where parallel tests trigger continuous re-renders.
  const href = await card.getByRole("link", { name: title }).getAttribute("href");
  await page.goto(href!);
}

test.describe("Incident detail page", () => {
  test("navigating from dashboard card reaches the detail page", async ({ page }) => {
    const title = `Comment nav test ${Date.now()}`;
    await createAndNavigateToIncident(page, title);

    await expect(page).toHaveURL(/\/incidents\/[a-z0-9]+/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
  });

  test("navigating from incidents table reaches the detail page", async ({ page }) => {
    await page.goto("/incidents");
    const firstTitleLink = page.locator("tbody tr").first().getByRole("link");
    const href = await firstTitleLink.getAttribute("href");
    const title = await firstTitleLink.textContent();

    // Verify link exists and points to a detail page, then navigate
    expect(href).toMatch(/^\/incidents\/[a-z0-9]+$/);
    await page.goto(href!);

    await expect(page).toHaveURL(/\/incidents\/[a-z0-9]+/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title!.trim());
  });

  test("shows incident details: severity badge, status, description", async ({ page }) => {
    const title = `Detail display test ${Date.now()}`;
    await createAndNavigateToIncident(page, title);

    // Heading proves we're on the detail page (not the dashboard)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
    await expect(page.getByText("P2").first()).toBeVisible();
    await expect(page.getByText("active").first()).toBeVisible();
    await expect(page.getByText("Description for comment test.")).toBeVisible();
  });

  test("shows empty state when there are no comments", async ({ page }) => {
    const title = `Empty comments test ${Date.now()}`;
    await createAndNavigateToIncident(page, title);

    await expect(page.getByText("No comments yet")).toBeVisible();
  });

  test("can post a comment and it appears in the list", async ({ page }) => {
    const title = `Commenting test ${Date.now()}`;
    const commentBody = `This is a test comment ${Date.now()}`;
    await createAndNavigateToIncident(page, title);

    await page.getByLabel("Add a comment").fill(commentBody);
    await page.getByRole("button", { name: "Post comment" }).click();

    await expect(page.getByTestId("comment-item").filter({ hasText: commentBody })).toBeVisible();
  });

  test("comment form clears after posting", async ({ page }) => {
    const title = `Form clear test ${Date.now()}`;
    await createAndNavigateToIncident(page, title);

    await page.getByLabel("Add a comment").fill("A comment that will clear");
    await page.getByRole("button", { name: "Post comment" }).click();

    await expect(page.getByLabel("Add a comment")).toHaveValue("");
  });

  test("can post multiple comments and all appear", async ({ page }) => {
    const title = `Multi-comment test ${Date.now()}`;
    await createAndNavigateToIncident(page, title);

    const stamp = Date.now();
    const first = `First comment ${stamp}`;
    const second = `Second comment ${stamp}`;

    await page.getByLabel("Add a comment").fill(first);
    await page.getByRole("button", { name: "Post comment" }).click();
    await expect(page.getByTestId("comment-item").filter({ hasText: first })).toBeVisible();

    await page.getByLabel("Add a comment").fill(second);
    await page.getByRole("button", { name: "Post comment" }).click();
    await expect(page.getByTestId("comment-item").filter({ hasText: second })).toBeVisible();

    await expect(page.getByTestId("comment-item")).toHaveCount(2);
  });

  test("comment displays author name and relative time", async ({ page }) => {
    const title = `Author display test ${Date.now()}`;
    await createAndNavigateToIncident(page, title);

    await page.getByLabel("Add a comment").fill("Checking author metadata");
    await page.getByRole("button", { name: "Post comment" }).click();

    const item = page.getByTestId("comment-item").filter({ hasText: "Checking author metadata" });
    await expect(item).toBeVisible();
    await expect(item.getByText("Demo User")).toBeVisible();
    await expect(item.getByText(/ago/)).toBeVisible();
  });

  test("Post comment button is disabled when textarea is empty", async ({ page }) => {
    const title = `Disabled button test ${Date.now()}`;
    await createAndNavigateToIncident(page, title);

    await expect(page.getByRole("button", { name: "Post comment" })).toBeDisabled();
    await page.getByLabel("Add a comment").fill("some text");
    await expect(page.getByRole("button", { name: "Post comment" })).toBeEnabled();
  });

  test("resolved incident detail page also shows comment form", async ({ page }) => {
    await page.goto("/incidents");
    const resolvedRow = page.locator("tbody tr").filter({ hasText: "resolved" }).first();
    await resolvedRow.getByRole("link").click();

    await expect(page).toHaveURL(/\/incidents\/[a-z0-9]+/);
    await expect(page.getByLabel("Add a comment")).toBeVisible();
  });
});
