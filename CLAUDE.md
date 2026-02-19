# Claude Code Demo — Incident Tracker

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

---

## Presentation: "Claude Code Tips & Tricks"

This repo is the live demo vehicle for an engineering team presentation. The presentation covers practical Claude Code workflows with this incident tracker as the hands-on example. Below is the planned structure.

### Presentation Structure

#### 1. Session Management
- Name your sessions (`/rename`) so you can find and resume them
- Sessions are tied to the directory they were started in — resume from the same directory
- Use CLAUDE.md (this file) to give Claude full project context on every session start

#### 2. CLAUDE.md — The Most Underrated Feature
- Claude reads CLAUDE.md automatically at session start
- Include: stack, commands, conventions, patterns, review guidelines
- Think of it as the onboarding doc you always wished existed
- **Live demo**: show how Claude answers questions about the project correctly from the first message

#### 3. Plan Mode
- Use plan mode before making significant changes (new features, refactors)
- Claude explores the codebase, proposes an approach, waits for approval before writing code
- Prevents wasted effort from misunderstood requirements
- **Live demo**: use plan mode to add a new feature to the incident tracker
  - Good candidates: add "comments" to incidents, add an "assigned to me" filter, add incident priority sorting, add a status timeline

#### 4. MCP Servers (Model Context Protocol)
- MCP extends Claude with tools beyond the filesystem: databases, APIs, browsers
- Useful MCPs for this stack:
  - **Convex MCP** (`npx convex mcp start`) — query/mutate the DB directly from Claude
  - **Playwright MCP** — Claude can drive the browser to verify UI behaviour
  - **GitHub MCP** — create issues, review PRs, manage branches
- **Live demo**: use Convex MCP to inspect the live database, ask Claude to show all active incidents

#### 5. Skills (Slash Commands)
- Custom slash commands that expand to full prompts
- Examples built into this workflow:
  - `/commit` — staged changes → commit message → commit
  - `/commit-push-pr` — commit + push + open PR in one command
  - `/code-review` — review a PR against project conventions
- Skills live in `~/.claude/` and are shared across projects

#### 6. Validating Claude's Work
- Always run tests after Claude makes changes: `npm run test` + `npm run test:e2e`
- Use plan mode to review Claude's proposed approach before it writes code
- Ask Claude to explain its changes before accepting them
- Use `/code-review` after a feature is built to catch issues early

#### 7. Commit Checkpoints
- Commit frequently after each working state, not just at the end
- If Claude goes in the wrong direction, you can always `git reset` to a known-good commit
- Short commit message rule: Claude should describe the "why", not just the "what"
- **Workflow**: plan → implement → test → commit → repeat

#### 8. PR Reviews with Claude
- Use `/code-review` or the `pr-review-toolkit` to review PRs against CLAUDE.md conventions
- Claude checks: selector quality, test isolation, Convex type safety, accessibility, empty states
- The code review section in this CLAUDE.md drives what Claude looks for

#### 9. Parallel Worktrees
- Work on multiple features simultaneously without stashing or switching branches
- `git worktree add ../feature-branch feature-branch` — separate directory, same repo
- Each worktree gets its own Claude session
- Useful for: implementing a feature in one worktree while reviewing/testing another

#### 10. Tips & Tricks
- **Be specific in prompts**: "add an assignee filter to the dashboard using the existing `by_status` index pattern" beats "add filtering"
- **Reference files**: Claude reads the files you mention — "look at `convex/incidents.ts`" gives immediate context
- **Iterate in small steps**: one feature at a time, test between each
- **Use the escape hatch**: if Claude is going in a wrong direction, stop it and restate the goal
- **Trust but verify**: Claude is fast but not infallible — run the tests, read the diff

---

## Pending / Next Steps
- Build a new feature live during the presentation (good candidates: comments on incidents, assignee filter, priority sorting)
- Finalize and create the presentation document
- Clean up stale test-created incidents in the Convex DB (optional — they don't affect correctness)
