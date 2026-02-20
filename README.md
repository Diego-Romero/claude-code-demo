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
| **Codebase Concept Map** | [.../codebase-concept-map.html](https://diego-claude-code-demo.vercel.app/codebase-concept-map.html) |

## Design moodboards

Three static HTML moodboards exploring different visual directions for the Incident Tracker UI. Each is a fully self-contained page showing the same dashboard content — same data, same components — styled in a completely different design language.

| Moodboard | Theme | Vibe |
|---|---|---|
| [Midnight Ops](https://diego-claude-code-demo.vercel.app/moodboard-1.html) | Dark, violet accents, Plus Jakarta Sans | Polished ops tooling — Vercel/Linear aesthetic |
| [Hazmat](https://diego-claude-code-demo.vercel.app/moodboard-2.html) | Black + orange, Space Mono, industrial striping | High-contrast emergency aesthetic |
| [Clean Room](https://diego-claude-code-demo.vercel.app/moodboard-3.html) | White, blue accents, DM Sans | Government/enterprise — calm and structured |

**How they were generated:**

Each moodboard was created by Claude Code using the `/frontend-design` skill, which generates distinctive, production-grade frontend interfaces with a strong design point of view. The prompt gave Claude the component requirements (incident cards, severity badges, dashboard layout) and let it choose the visual language for each direction:

```
/frontend-design
# Claude designed 3 distinct moodboard variants as single-file HTML
# — no frameworks, no build step, fully self-contained
```

The files live in `public/` and are served as static assets by Next.js, so they're accessible at `/moodboard-N.html` on any deployment.

## Codebase concept map

`public/codebase-concept-map.html` is an interactive learning tool pre-populated with the Incident Tracker's architecture — 18 nodes across the Frontend, Backend, Auth, and Testing layers, with pre-drawn edges showing real relationships between them.

**How to use it:**

1. Open [`/codebase-concept-map.html`](https://diego-claude-code-demo.vercel.app/codebase-concept-map.html) in a browser
2. Click any node label in the sidebar to cycle its knowledge level: **Fuzzy → Know → Unknown**
3. Click a node on the canvas, then click another to draw a relationship edge
4. Select a connection type (calls, depends on, subscribes to, …) before drawing
5. Right-click an edge label to delete it — **Auto-layout** runs a force-directed simulation
6. Try a **persona preset** (Frontend dev, Backend dev, Newcomer) to pre-fill knowledge levels
7. The **Learning Prompt** panel updates live — copy it into Claude for a targeted explanation

**How it was generated:**

The file was created by Claude Code using the `/playground` skill with the `concept-map` template. Nodes and edges were pre-populated from the CLAUDE.md project context — no manual data entry required. The full interaction was:

```
/playground
# selected: Concept Map
# Claude read CLAUDE.md, extracted the architecture, and generated the single-file HTML
```

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
- A [Vercel account](https://vercel.com/) (free, for deployment)

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Convex project

```bash
npx convex dev
```

Follow the prompts to log in and create a new project. This will create `.env.local` with `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` auto-populated. Keep this terminal running — it syncs the backend in real time.

### 3. Complete `.env.local`

Add the remaining variables:

```
# Added automatically by `npx convex dev`:
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment-name.convex.site

# Generate with: openssl rand -hex 32
AUTH_SECRET=your-secret-here

# Demo credentials — set to whatever you want
DEMO_EMAIL=demo@incident.dev
DEMO_PASSWORD=demo1234
DEMO_NAME=Demo User
```

### 4. Start the dev server

```bash
npm run dev     # Next.js + Convex in parallel
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with your demo credentials.

### 5. Seed sample data (optional)

```bash
npx convex run seed:run
```

### Deploying to Vercel

```bash
vercel                  # link project and deploy preview
vercel --prod           # promote to production
```

Set all env vars from `.env.local` in Vercel, plus one extra required by NextAuth v5:

```bash
vercel env add AUTH_URL production   # set to your production URL, e.g. https://your-app.vercel.app
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
  presentation.html           # Generated from presentation.md at build time
  moodboard-1.html            # Design direction: Midnight Ops (dark, violet)
  moodboard-2.html            # Design direction: Hazmat (black, orange, industrial)
  moodboard-3.html            # Design direction: Clean Room (white, blue, enterprise)
  codebase-concept-map.html   # Interactive architecture learning tool
```

## CI

GitHub Actions runs on every PR to `main`:

1. Lint (`next lint`)
2. Unit tests (`vitest run`)
3. Type check (`tsc --noEmit`)
4. Build — which includes generating `presentation.html` via `prebuild`

---

Built collaboratively with [Claude Code](https://claude.ai/claude-code).
