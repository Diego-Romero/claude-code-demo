# Claude Code Demo — Incident Tracker

A real-time incident tracker built as the live demo vehicle for a **Claude Code: Tips & Tricks** engineering presentation. The app is intentionally simple so the focus stays on the Claude Code workflows, not the product.

## Live deployment

| | URL |
|---|---|
| **App** | [diego-claude-code-demo.vercel.app](https://diego-claude-code-demo.vercel.app) |
| **Presentation** | [diego-claude-code-demo.vercel.app/presentation.html](https://diego-claude-code-demo.vercel.app/presentation.html) |
| **Moodboard 1** — Midnight Ops | [.../moodboard-1.html](https://diego-claude-code-demo.vercel.app/moodboard-1.html) |
| **Moodboard 2** — Hazmat | [.../moodboard-2.html](https://diego-claude-code-demo.vercel.app/moodboard-2.html) |
| **Moodboard 3** — Clean Room | [.../moodboard-3.html](https://diego-claude-code-demo.vercel.app/moodboard-3.html) |

## Presentation

The slide deck lives in [`presentation.md`](./presentation.md) (Marp format) and is automatically converted to HTML during the build:

```bash
npm run build   # runs marp first, then next build
```

The generated `public/presentation.html` is committed to the repo and deployed to Vercel — accessible at `/presentation.html` on the live site.

After editing the slides, regenerate and commit the HTML:

```bash
npm run slides   # regenerates public/presentation.html
git add presentation.md public/presentation.html && git commit
```

## The app

A lightweight incident tracker where engineering teams can:

- **Create incidents** with title, severity (P0–P3), assignee, and description
- **Resolve or delete incidents** from the dashboard
- **View all incidents** (active + resolved) in a full table view
- **Real-time updates** — Convex pushes changes via WebSocket, no refresh needed

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Backend | [Convex](https://convex.dev/) — cloud DB, real-time subscriptions, TypeScript mutations |
| Auth | [NextAuth v5](https://authjs.dev/) — credentials provider, JWT sessions |
| UI | [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| Unit tests | [Vitest](https://vitest.dev/) |
| E2E tests | [Playwright](https://playwright.dev/) |

## Getting started

### Prerequisites

- Node.js 18+
- A [Convex account](https://dashboard.convex.dev/) (free)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local`:

```
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
NEXT_PUBLIC_CONVEX_SITE_URL=...
AUTH_SECRET=...
DEMO_EMAIL=demo@incident.dev
DEMO_PASSWORD=demo1234
DEMO_NAME=Demo User
```

### 3. Start the dev server

```bash
npm run dev     # Next.js + Convex in parallel
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with the demo credentials.

### 4. Seed sample data (optional)

```bash
npx convex run seed:run
```

## Running tests

```bash
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright E2E tests (hits the real Convex cloud DB)
```

## Project structure

```
app/
  dashboard/        # Active incidents — create, resolve, delete
  incidents/        # All incidents table (active + resolved)
  signin/           # Email/password sign-in
convex/
  schema.ts         # DB schema
  incidents.ts      # CRUD queries and mutations
  seed.ts           # Sample data
tests/
  unit/             # Vitest
  e2e/              # Playwright
presentation.md     # Marp slide deck (source)
public/
  presentation.html # Generated from presentation.md at build time
```

## CI

GitHub Actions runs on every PR to `main`:

1. Lint (`next lint`)
2. Unit tests (`vitest run`)
3. Type check (`tsc --noEmit`)
4. Build — which includes generating `presentation.html` via `prebuild`

---

Built collaboratively with [Claude Code](https://claude.ai/claude-code).
