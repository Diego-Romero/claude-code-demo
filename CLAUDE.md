# Claude Code Demo — Incident Tracker 🚀

## Purpose
A real-time incident tracker built as a demo project for a "Claude Code Tips & Tricks" engineering presentation. It showcases plan mode, CLAUDE.md, Playwright testing, and other Claude Code features in a realistic but simple codebase.

**GitHub:** https://github.com/Diego-Romero/claude-code-demo (public)

---

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 15 — App Router, Server Components, Server Actions |
| Backend | Convex — real-time cloud DB, WebSocket subscriptions, TypeScript mutations/queries |
| Auth | NextAuth v5 beta — credentials provider only (no OAuth) |
| UI | shadcn/ui + Tailwind CSS |
| Unit tests | Vitest with jsdom + fake timers |
| E2E tests | Playwright with session state reuse |

---

## Commands
```bash
npm run dev          # Next.js + Convex dev server in parallel (use this for local development)
npm run dev:frontend # Next.js only (used by Playwright's webServer config)
npm run test         # Vitest unit tests (watch mode)
npm run test:e2e     # Playwright E2E tests (starts Next.js automatically)
npx convex run seed:run  # Seed the DB with 6 sample incidents (skips if data exists)
```

---

## Environment Variables (`.env.local`)
```
CONVEX_DEPLOYMENT=dev:wonderful-ostrich-107
NEXT_PUBLIC_CONVEX_URL=https://wonderful-ostrich-107.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://wonderful-ostrich-107.convex.site
AUTH_SECRET=e3d876e2177987d1957ef9e526d2f52ec089f05956b36d6b6d32d693cc7cc4a9
DEMO_EMAIL=demo@incident.dev
DEMO_PASSWORD=demo1234
DEMO_NAME=Demo User
```

Convex is a **cloud** backend — the dev deployment runs in Convex cloud, not locally. This means mutations and queries go over the network even in development. E2E tests hit the real cloud DB.

---

## Project Structure
```
app/
  (splash)/layout.tsx        # Public landing page — passthrough layout, no nav
  dashboard/
    layout.tsx               # Server component: calls auth(), renders Sidebar
    page.tsx                 # Client component: active incidents, create/resolve/delete
  incidents/
    layout.tsx               # Server component: calls auth(), renders Sidebar
    page.tsx                 # Client component: all incidents table (active + resolved)
  signin/
    page.tsx                 # Client component: email/password form
  api/auth/[...nextauth]/
    route.ts                 # NextAuth route handler

auth.ts                      # NextAuth config — credentials provider, JWT sessions
middleware.ts                # Route protection — redirects unauthenticated users

components/
  Sidebar.tsx                # Client component: nav links + sign out button
  ui/                        # shadcn/ui primitives (Button, Input, etc.)

convex/
  schema.ts                  # DB schema — incidents + users tables with indexes
  incidents.ts               # CRUD: list, create, resolve, update, remove
  seed.ts                    # Seed mutation — 4 active + 2 resolved incidents
  _generated/                # Auto-generated Convex types (do not edit)

lib/
  utils.ts                   # cn() for Tailwind merging + formatDistanceToNow()

tests/
  unit/
    utils.test.ts            # 5 Vitest tests for formatDistanceToNow
  e2e/
    auth.setup.ts            # Signs in once, saves session to .auth/user.json
    dashboard.spec.ts        # Dashboard: heading, incidents list, create, resolve, delete
    incidents.spec.ts        # All incidents table + navigation + auth redirect

playwright.config.ts         # fullyParallel:true, expect.timeout:10_000, auth setup project
vitest.config.ts             # jsdom environment, @ alias for src
```

---

## Data Model (`convex/schema.ts`)
```ts
incidents: defineTable({
  title: string,
  description: string,
  severity: "P0" | "P1" | "P2" | "P3",
  status: "active" | "resolved",
  assignee?: string,           // email of assignee
  resolvedAt?: number,         // Unix timestamp ms
}).index("by_status", ["status"])
```

Convex auto-adds `_id` (string ID) and `_creationTime` (Unix ms) to every document.

---

## Auth Flow (`auth.ts`, `middleware.ts`)
- NextAuth v5 credentials provider — checks `DEMO_EMAIL` / `DEMO_PASSWORD` env vars
- Returns a static user object `{ id: "demo-user", email, name }` on success
- JWT session strategy (no DB session storage)
- `middleware.ts` protects `/dashboard` and `/incidents` — unauthenticated users redirected to `/signin`
- Authenticated users visiting `/signin` are redirected to `/dashboard`
- Middleware matcher excludes static files, `_next`, and `api/auth` (NextAuth's own routes)

---

## Convex Patterns
- `useQuery(api.incidents.list, { status: "active" })` — real-time reactive query, auto-updates via WebSocket
- `useMutation(api.incidents.resolve)` — returns a function, call it with args directly
- All Convex IDs are strings typed as `Id<"incidents">` — cast with `as Id<"incidents">` when needed
- The `list` query accepts an optional `status` filter; passing `{}` returns all incidents
- Mutations are fire-and-forget from the UI — no loading state needed for resolve/delete

---

## UI Conventions
- Severity color coding: P0=red, P1=orange, P2=yellow, P3=blue
- Active incidents: shown as cards on `/dashboard` with Resolve + Delete actions
- Resolved incidents: only appear in the `/incidents` table, no Resolve button
- Dashboard shows count: "N active incident(s)" in the subtitle
- Empty state: dashed border box with "No active incidents. All clear! 🎉"
- Form labels use `htmlFor`/`id` pairs — required for accessibility AND for Playwright's `getByLabel()`

---

## Testing: Key Patterns & Lessons Learned

### Playwright Configuration
- `fullyParallel: true` — tests within the same file run concurrently, not just across files
- `expect: { timeout: 10_000 }` — single source of truth for Convex cloud round-trip tolerance; no inline timeouts scattered in tests
- Auth setup project runs once before all other tests; chromium project `dependencies: ["setup"]`
- `webServer` starts `npm run dev:frontend` only (Next.js); Convex runs in the cloud
- `reuseExistingServer: true` — won't restart if port 3000 is already live

### Selector Priority (most to least preferred)
1. `getByRole("button", { name: "..." })` — tests behaviour AND accessibility simultaneously
2. `getByLabel("Field name")` — works only when labels have `htmlFor`/`id` associations
3. `getByText(...)` — use for content assertions, not for interaction
4. `data-testid` — last resort for elements with no accessible role (e.g. incident cards)
5. CSS selectors (`locator("tbody tr")`) — only when role-based selectors cause ambiguity (e.g. thead vs tbody rows)

Never use: `page.fill('input[name="x"]')`, `page.click("text=x")` — these are legacy Playwright APIs.

### Shared Backend = Test Isolation Is Critical
Convex cloud is a **shared DB** across all test runs. There is no teardown. This means:
- **All test-created data must use unique titles** with `Date.now()` suffix
  ```ts
  const title = `Incident to resolve ${Date.now()}`;
  ```
- Without this, stale data from previous runs causes Playwright strict mode violations
  (one selector matching multiple elements → test throws)
- Tests that check seed data (e.g. "API gateway returning 503s") are safe because they
  read specific known titles, not generic text

### Real-time Updates & Timeouts
- After a mutation (resolve/delete), Convex pushes the update via WebSocket → React re-renders
- The global `expect.timeout: 10_000` is sufficient for cloud round-trips
- Do NOT add per-assertion `{ timeout: N }` — use the global config
- Do NOT use `page.waitForTimeout()` — let assertions poll naturally

### Row Selectors in Tables
- Use `page.locator("tbody tr")` not `page.getByRole("row")` when filtering table rows
- `getByRole("row")` includes `<thead>` rows, which can cause `.first()` to resolve
  to the wrong row in parallel test runs

---

## Standard Feature Workflow

When implementing any non-trivial feature, always follow this sequence:

1. **Clarify** — use `AskUserQuestion` to resolve ambiguities before writing code
2. **Implement** — follow existing Convex + Next.js patterns in this codebase
3. **Write tests** — unit tests for any new utility functions; Playwright E2E tests for any new user-visible behaviour
4. **Run tests** — `npm run test` (unit) and `npm run test:e2e` (E2E) must pass
5. **Self-verify end-to-end** — use MCP tools to confirm the feature works (see MCP Self-Verification below)

---

## MCP Self-Verification

After implementing a feature, use these MCP tools to verify everything works end-to-end before opening a PR:

### Convex MCP — verify DB state
Use `mcp__convex__*` tools to inspect the live database directly:
- Query tables to confirm new data is being written correctly
- Run mutations to test edge cases without touching the UI
- Check that indexes are being used (run `mcp__convex__insights` to catch full-table scans)

### Playwright MCP — drive the browser
Use `mcp__plugin_playwright_*` tools to navigate the running app and assert UI behaviour:
- `playwright__browser_navigate` to open pages
- `playwright__browser_snapshot` to inspect the accessibility tree (preferred over screenshots for assertions)
- `playwright__browser_click` / `playwright__browser_type` to interact with the UI

### Claude in Chrome — visual verification
Use `mcp__claude-in-chrome__*` tools for visual spot-checks and reading console errors:
- `read_console_messages` to catch JS errors after interactions
- `read_network_requests` to verify API calls are going to the right endpoints
- `computer` with `screenshot` action for a final visual check

### Self-verification checklist
- [ ] New Convex table/mutation produces the expected documents (Convex MCP)
- [ ] UI renders the new feature correctly and updates in real time (Playwright or Chrome MCP)
- [ ] No JS errors in the browser console after interacting with the feature (Chrome MCP)
- [ ] Unit tests pass: `npm run test`
- [ ] E2E tests pass: `npm run test:e2e`

---

## Code Review Guidelines

When reviewing code in this project, focus on the following:

### Correctness & Safety
- [ ] Are Convex mutations called with the correct argument types? Check against `convex/schema.ts`
- [ ] Is `Id<"incidents">` cast used correctly? Convex IDs must be typed or cast explicitly
- [ ] Does new UI conditionally render based on `incident.status`? (e.g. Resolve button only for active)
- [ ] Are new protected routes added to `middleware.ts`?
- [ ] Are form fields properly validated? Required fields should have `required` attribute
- [ ] Is there any risk of XSS? (Convex data rendered via React is safe by default — no `dangerouslySetInnerHTML`)

### TypeScript
- [ ] No `any` types — use Convex generated types from `convex/_generated/`
- [ ] Severity values should use the union type `"P0" | "P1" | "P2" | "P3"` not plain `string`
- [ ] `Id<"tableName">` should be used for all Convex document IDs

### Accessibility & Testability (these go hand in hand)
- [ ] Do all form inputs have an associated `<label>` with matching `htmlFor`/`id`?
- [ ] Are interactive elements reachable by `getByRole`? (buttons, links, inputs)
- [ ] Are non-interactive elements that need E2E targeting marked with `data-testid`?

### Playwright Tests
- [ ] Does any new user-visible feature have a corresponding E2E test?
- [ ] Do new tests use `getByRole` / `getByLabel` selectors — not CSS attribute selectors?
- [ ] Do tests that create incidents use a `Date.now()` suffix for uniqueness?
- [ ] Are there any hardcoded `{ timeout: N }` overrides? Remove them — use global config
- [ ] Do tests avoid `page.waitForTimeout()`?

### Vitest Unit Tests
- [ ] Do pure utility functions in `lib/utils.ts` have unit test coverage?
- [ ] Do tests use `vi.useFakeTimers()` for anything time-dependent?

### Performance & Convex
- [ ] Are new queries using indexes where possible? (check `convex/schema.ts` for defined indexes)
- [ ] Are mutations doing the minimum necessary DB operations?
- [ ] Is `useQuery` called with the narrowest possible filter? (avoid fetching all data when a subset is needed)

### UI Consistency
- [ ] Severity badges use the correct colour map: P0=red, P1=orange, P2=yellow, P3=blue
- [ ] New pages inside the authenticated area use `layout.tsx` with `auth()` + `<Sidebar>`
- [ ] Empty states have a helpful message (not just blank space)

---
