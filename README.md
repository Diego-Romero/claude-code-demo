# Claude Code Demo — Incident Tracker

A demo project built live during a **Claude Code: Tips & Tricks** presentation. It's a real-time incident tracker for engineering teams — think lightweight PagerDuty. The entire app is built incrementally using Claude Code, showcasing how AI-assisted development works in practice from planning through review.

## What this demo covers

Each feature in this app was (or will be) built to demonstrate a specific Claude Code workflow:

| Claude Code concept | What gets built |
|---|---|
| Starting a session + CLAUDE.md | Project setup, initial schema |
| MCP servers | Playwright MCP connected for live test feedback |
| Plan mode | Feature architecture designed before any code is written |
| Skills | Marketplace skills installed and used mid-feature |
| Validating work | Playwright E2E tests run via MCP, Convex dashboard live |
| Commit checkpoints | Logical commits at each working milestone |
| PR review | `pr-review-toolkit` agents reviewing the diff |
| CLAUDE.md evolution | File updated based on what Claude got wrong |
| Parallel worktrees | Two features built simultaneously |
| Subagents from events | GitHub issue created → agent fixes it → PR opened |

## The app

A real-time incident tracker where engineering teams can:

- **Create incidents** with title, severity (P0–P3), and description
- **Assign responders** and track who is on point
- **Post timeline updates** as the incident evolves
- **Mark incidents resolved** and write post-mortem notes
- **View a live dashboard** — open incidents sorted by severity

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Backend | [Convex](https://convex.dev/) (database + real-time subscriptions) |
| Auth | [Convex Auth](https://labs.convex.dev/auth) (GitHub OAuth + password) |
| UI | [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| Testing | [Playwright](https://playwright.dev/) |

Everything runs locally — no external services required.

## Getting started

### Prerequisites

- Node.js 18+
- A [Convex account](https://dashboard.convex.dev/) (free)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This will prompt you to log in to Convex and create a new project. Keep this terminal running — it syncs your backend in real time.

### 3. Run the app

In a second terminal:

```bash
npm run dev:frontend
```

Visit [http://localhost:3000](http://localhost:3000).

### 4. Run Playwright tests

```bash
npx playwright test
```

Or connect via the [Playwright MCP](https://github.com/microsoft/playwright-mcp) to let Claude run and observe tests directly.

## Project structure

```
├── app/                  # Next.js App Router pages
│   ├── (splash)/         # Public landing page
│   ├── product/          # Protected app (requires auth)
│   └── signin/           # Auth pages
├── convex/               # Convex backend
│   ├── auth.ts           # Auth configuration
│   ├── schema.ts         # Database schema
│   └── incidents.ts      # Incident queries & mutations
├── components/           # Shared UI components
└── tests/                # Playwright E2E tests
```

## Running the full dev environment

The `predev` script handles first-time Convex setup automatically:

```bash
npm run dev
```

This runs the Next.js frontend and Convex backend in parallel.

## Design Moodboards

Three aesthetic directions for the UI, generated with the `/frontend-design` skill. Open while the dev server is running (`npm run dev`):

| # | Aesthetic | URL |
|---|---|---|
| 1 | **Midnight Ops** — Modern SaaS dark (Linear/Vercel-style), indigo-black, violet chrome, red→green severity scale. Plus Jakarta Sans + DM Mono | [/moodboard-1.html](http://localhost:3000/moodboard-1.html) |
| 2 | **Hazmat** — True black, safety orange dominant, diagonal caution-stripe borders on P0 cards. Barlow Condensed 900 + Space Mono | [/moodboard-2.html](http://localhost:3000/moodboard-2.html) |
| 3 | **Clean Room** — Clinical white, single blue accent, severity as patient-monitor vitals cards. DM Sans + DM Mono | [/moodboard-3.html](http://localhost:3000/moodboard-3.html) |

---

## About this project

This project was built as part of a Claude Code demo to show engineering teams how to use Claude Code effectively — from spinning up a project to shipping features with confidence. The code was written collaboratively with [Claude Code](https://claude.ai/claude-code).
