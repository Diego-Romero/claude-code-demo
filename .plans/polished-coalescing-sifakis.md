# Plan: "Assigned to me" Dashboard Toggle

## Context
The dashboard currently shows all active incidents. Engineers need a quick way to filter
to only incidents assigned to their own email — a single toggle avoids having to scan the
full list. The logged-in user's email is available server-side via `auth()` but not in
the existing client component, so the page needs a Server/Client split to pass the email
down as a prop.

---

## Worktree Setup (before code changes)
```bash
git worktree add ../tracker-feature -b feature/assignee-filter
cd ../tracker-feature
```
All implementation work happens inside `../tracker-feature/`.

---

## Files to Change

| File | Action | Summary |
|---|---|---|
| `convex/incidents.ts` | Modify | Add `assignee?: string` arg + JS post-collect filter to `list` query |
| `app/dashboard/page.tsx` | Modify | Strip to thin Server Component; call `auth()`, render `<DashboardClient>` |
| `app/dashboard/DashboardClient.tsx` | **Create** | Current page.tsx logic + `currentUserEmail` prop + `assignedToMe` toggle |
| `tests/e2e/dashboard.spec.ts` | Modify | Append `test.describe("Assigned to me filter", ...)` block |

No schema changes. No new dependencies. No `SessionProvider` setup.

---

## Step 1 — `convex/incidents.ts`: extend `list` query

Replace the `list` export only. Add `assignee: v.optional(v.string())`.
Apply JS-level post-collect filter (avoids TypeScript union issues with the query builder
chain; fine at demo scale — note: production would use compound index `["status","assignee"]`).

```typescript
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("resolved"))),
    assignee: v.optional(v.string()),
  },
  handler: async (ctx, { status, assignee }) => {
    const results = await (
      status
        ? ctx.db.query("incidents").withIndex("by_status", (q) => q.eq("status", status))
        : ctx.db.query("incidents")
    )
      .order("desc")
      .collect();

    return assignee ? results.filter((i) => i.assignee === assignee) : results;
  },
});
```

`convex/_generated/api.d.ts` regenerates automatically via the dev server.

---

## Step 2 — `app/dashboard/page.tsx`: thin Server Component

Remove `"use client"` and all hooks. Call `auth()` (NextAuth v5 caches per-request;
safe to call in both layout and page). Layout already redirects if unauthenticated.

```typescript
import { auth } from "@/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  return <DashboardClient currentUserEmail={session?.user?.email ?? null} />;
}
```

---

## Step 3 — `app/dashboard/DashboardClient.tsx`: new file

Copy entire current `page.tsx` content, then apply three targeted additions:

**a) Prop interface + toggle state** (after the existing `useState` calls):
```typescript
"use client";
// ... all existing imports unchanged ...

interface Props {
  currentUserEmail: string | null;
}

export default function DashboardClient({ currentUserEmail }: Props) {
  const [assignedToMe, setAssignedToMe] = useState(false);
  // ... existing state: showForm, saving ...
```

**b) Modified `useQuery` call** (replace line 22):
```typescript
  const incidents = useQuery(api.incidents.list, {
    status: "active",
    ...(assignedToMe && currentUserEmail ? { assignee: currentUserEmail } : {}),
  });
```

**c) Toggle button** — replace the single `<Button>` in the header (line 54) with a flex row:
```tsx
        <div className="flex items-center gap-2">
          <Button
            variant={assignedToMe ? "default" : "outline"}
            aria-pressed={assignedToMe}
            onClick={() => setAssignedToMe((v) => !v)}
          >
            Assigned to me
          </Button>
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "New incident"}
          </Button>
        </div>
```

**d) Context-aware empty state** (replace the static message on line 102):
```tsx
          <p className="text-sm text-muted-foreground">
            {assignedToMe
              ? "No active incidents assigned to you."
              : "No active incidents. All clear! 🎉"}
          </p>
```

`aria-pressed` makes the button a toggle button — accessible name stays "Assigned to me"
in both states, so `getByRole("button", { name: "Assigned to me" })` works in Playwright.

---

## Step 4 — `tests/e2e/dashboard.spec.ts`: append toggle test

```typescript
test.describe("Assigned to me filter", () => {
  const DEMO_EMAIL = "demo@incident.dev"; // fixed single demo user

  test("toggle shows only incidents assigned to the current user", async ({ page }) => {
    await page.goto("/dashboard");

    const assignedTitle = `Assigned to me ${Date.now()}`;
    const unassignedTitle = `Not assigned ${Date.now()}`;

    // Create incident assigned to demo user
    await page.getByRole("button", { name: "New incident" }).click();
    await page.getByLabel("Title").fill(assignedTitle);
    await page.getByLabel("Description").fill("Should appear when filter is on.");
    await page.getByLabel("Assignee (email)").fill(DEMO_EMAIL);
    await page.getByRole("button", { name: "Create incident" }).click();
    await expect(page.getByTestId("incident-card").filter({ hasText: assignedTitle })).toBeVisible();

    // Create unassigned incident
    await page.getByRole("button", { name: "New incident" }).click();
    await page.getByLabel("Title").fill(unassignedTitle);
    await page.getByLabel("Description").fill("Should disappear when filter is on.");
    await page.getByRole("button", { name: "Create incident" }).click();
    await expect(page.getByTestId("incident-card").filter({ hasText: unassignedTitle })).toBeVisible();

    // Enable filter → only assigned incident visible
    await page.getByRole("button", { name: "Assigned to me" }).click();
    await expect(page.getByTestId("incident-card").filter({ hasText: assignedTitle })).toBeVisible();
    await expect(page.getByTestId("incident-card").filter({ hasText: unassignedTitle })).not.toBeVisible();

    // Disable filter → both visible
    await page.getByRole("button", { name: "Assigned to me" }).click();
    await expect(page.getByTestId("incident-card").filter({ hasText: unassignedTitle })).toBeVisible();

    // Cleanup — delete both
    const assignedCard = page.getByTestId("incident-card").filter({ hasText: assignedTitle });
    await assignedCard.getByRole("button", { name: "Delete" }).click();
    await expect(assignedCard).not.toBeVisible();

    const unassignedCard = page.getByTestId("incident-card").filter({ hasText: unassignedTitle });
    await unassignedCard.getByRole("button", { name: "Delete" }).click();
    await expect(unassignedCard).not.toBeVisible();
  });
});
```

- `Date.now()` suffixes on both titles → shared-DB isolation (per CLAUDE.md)
- No hardcoded timeouts — global `expect.timeout: 10_000` covers Convex WebSocket round-trips
- No `page.waitForTimeout()` — assertions poll naturally

---

## Step 5 — MCP Self-Verification

1. **Convex MCP**: Run `api.incidents.list` with `{ status: "active", assignee: "demo@incident.dev" }` — confirm arg is accepted and only matching incidents are returned.
2. **Playwright MCP**: Navigate to `/dashboard`, snapshot accessibility tree — confirm "Assigned to me" button appears. Click it, snapshot again — confirm list changes.
3. **Console MCP**: `read_console_messages` after toggle — confirm no hydration errors from Server/Client split.

---

## Step 6 — CI Gate

```bash
npm run lint && npm run test && npx tsc --noEmit && npm run build
npm run test:e2e
```

---

## Step 7 — Code Review & PR

Run `/code-review:code-review`, fix any critical issues, then open PR targeting `main`.
