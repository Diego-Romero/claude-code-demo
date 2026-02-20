# Plan: Incident Comments Feature

## Context
Users need to leave append-only comments on incidents (active and resolved) to share updates, findings, and next steps. Clicking an incident from the dashboard or incidents table opens a new detail page at `/incidents/[id]` which shows incident metadata and a threaded comment section.

---

## Files to Create / Modify

| File | Action |
|---|---|
| `convex/schema.ts` | Add `comments` table |
| `convex/comments.ts` | New — `list` query + `add` mutation |
| `convex/incidents.ts` | Add `get` query (single doc by ID) |
| `app/incidents/[id]/page.tsx` | New — Server Component (auth + props) |
| `app/incidents/[id]/IncidentDetailClient.tsx` | New — Client Component (Convex, comment form) |
| `app/dashboard/page.tsx` | Wrap incident card titles in `<Link>` |
| `app/incidents/page.tsx` | Wrap table title cells in `<Link>` |
| `tests/e2e/comments.spec.ts` | New — E2E tests |

---

## Step 1 — `convex/schema.ts`

Add the `comments` table. Must be done **first** — Convex regenerates `_generated/` types on save.

```ts
comments: defineTable({
  incidentId:  v.id("incidents"),
  body:        v.string(),
  authorEmail: v.string(),
  authorName:  v.string(),
}).index("by_incident", ["incidentId"]),
```

`by_incident` index keeps `list` O(comments per incident), not O(all comments).

---

## Step 2 — `convex/comments.ts` (new file)

```ts
export const list = query({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, { incidentId }) =>
    ctx.db
      .query("comments")
      .withIndex("by_incident", (q) => q.eq("incidentId", incidentId))
      .order("asc")   // chronological — oldest first
      .collect(),
});

export const add = mutation({
  args: {
    incidentId:  v.id("incidents"),
    body:        v.string(),
    authorEmail: v.string(),
    authorName:  v.string(),
  },
  handler: async (ctx, args) => ctx.db.insert("comments", args),
});
```

`authorEmail` / `authorName` are passed explicitly from the client — Convex cannot read NextAuth JWT sessions.

---

## Step 3 — `convex/incidents.ts`

Add at the end of the file:

```ts
export const get = query({
  args: { id: v.id("incidents") },
  handler: async (ctx, { id }) => ctx.db.get(id),  // returns null if not found
});
```

---

## Step 4 — `app/incidents/[id]/page.tsx` (new file, Server Component)

`app/incidents/layout.tsx` already handles auth + Sidebar via Next.js layout inheritance — **no separate `[id]/layout.tsx` needed**.

```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import IncidentDetailClient from "./IncidentDetailClient";

interface Props { params: Promise<{ id: string }> }   // Next.js 15: params is a Promise

export default async function IncidentDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <IncidentDetailClient
      incidentId={id}
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? ""}
    />
  );
}
```

---

## Step 5 — `app/incidents/[id]/IncidentDetailClient.tsx` (new file, Client Component)

Key decisions:
- `useQuery(api.incidents.get, { id })` — real-time incident subscription
- `useQuery(api.comments.list, { incidentId })` — real-time comments subscription
- `useMutation(api.comments.add)` — fire-and-forget (no loading spinner on optimistic UI)
- Controlled textarea — `disabled` when empty/submitting; clears on submit
- `undefined` → loading state; `null` → 404 state
- Severity colour map: P0=red, P1=orange, P2=yellow, P3=blue (matches CLAUDE.md)
- `data-testid="comment-list"` and `data-testid="comment-item"` for Playwright targeting
- `<label htmlFor="comment-body">` + `<textarea id="comment-body">` for `getByLabel()` in tests

Structure:
```
← All incidents link
Severity badge + Status badge
<h1> Title
Description
Metadata: assignee · opened X ago · resolved X ago (if resolved)

Comments (N)
  [list of comment items or dashed empty state]

[Add a comment textarea + Post comment button]
```

---

## Step 6 — `app/dashboard/page.tsx`

Wrap incident card title in `<Link>` (import `Link` from `next/link`):

```tsx
// Before:
<p className="font-medium text-sm">{incident.title}</p>

// After:
<Link href={`/incidents/${incident._id}`} className="font-medium text-sm hover:underline">
  {incident.title}
</Link>
```

---

## Step 7 — `app/incidents/page.tsx`

Wrap title cell content in `<Link>` (import `Link` from `next/link`):

```tsx
// Before:
<p className="font-medium">{incident.title}</p>

// After:
<Link href={`/incidents/${incident._id}`} className="font-medium hover:underline">
  {incident.title}
</Link>
```

---

## Step 8 — `tests/e2e/comments.spec.ts` (new file)

Test cases (all use `Date.now()` suffix for uniqueness):

1. Navigating from dashboard card reaches detail page (`/incidents/[id]` URL)
2. Navigating from incidents table reaches detail page
3. Detail page shows severity badge, status, and description
4. Empty state shows "No comments yet" message
5. Can post a comment — appears in real-time via Convex WebSocket
6. Comment form clears after posting
7. Can post multiple comments and all appear
8. Comment displays author name and relative time ("Demo User" + "X ago")
9. Post comment button is disabled when textarea is empty
10. Resolved incident detail page also shows the comment form

Helper: `createAndNavigateToIncident(page, title)` — creates fresh incident from dashboard, then clicks the title link to navigate to its detail page.

---

## Verification

### Convex MCP
```
mcp__convex__tables             → confirm `comments` table exists with correct schema
mcp__convex__data (comments)    → confirm rows are written with correct fields after posting
mcp__convex__insights           → confirm no full-table-scan warnings (by_incident index used)
```

### Playwright MCP
```
navigate → /dashboard
snapshot → confirm incident titles are now links
click    → incident title link → lands on /incidents/[id]
snapshot → confirm h1, severity badge, comment form visible
type     → textarea, click Post comment
snapshot → confirm comment-item with text appears
```

### CI commands
```bash
npm run lint
npm run test          # Vitest unit tests (no new utilities; existing tests must still pass)
npx tsc --noEmit      # TypeScript check
npm run build         # Next.js build
npm run test:e2e      # Playwright (auth setup + all specs including comments.spec.ts)
```
