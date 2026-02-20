---
marp: true
theme: default
paginate: true
style: |
  section {
    font-family: 'Geist', 'Inter', sans-serif;
    background: #0f0f0f;
    color: #f0f0f0;
  }
  h1 { color: #f0f0f0; font-size: 2rem; }
  h2 { color: #a0a0a0; font-size: 1.3rem; font-weight: 400; margin-top: 0; }
  h3 { color: #cc785c; font-size: 1.1rem; }
  code { background: #1e1e1e; color: #ce9178; border-radius: 4px; padding: 2px 6px; }
  pre { background: #1e1e1e; border-radius: 8px; border-left: 3px solid #cc785c; }
  pre code { color: #d4d4d4; padding: 0; background: transparent; }
  ul li { margin-bottom: 0.4rem; }
  strong { color: #cc785c; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1e1e1e; color: #a0a0a0; font-weight: 500; padding: 0.5rem 1rem; border: 1px solid #333; }
  td { background: #141414; color: #f0f0f0; padding: 0.5rem 1rem; border: 1px solid #333; }
  tr:nth-child(even) td { background: #1a1a1a; }
  .lead { font-size: 1.3rem; color: #a0a0a0; }
  section.title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  section.title h1 { font-size: 3rem; color: #f0f0f0; }
  section.title h2 { font-size: 1.2rem; color: #606060; }
  section.section {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  section.section h1 { font-size: 2.5rem; }
  section.section p { color: #606060; font-size: 1rem; }
---

<!-- _class: title -->

# Claude Code
## Tips & Tricks

---

<!-- _class: section -->

# Agenda

1. Session Management
2. `CLAUDE.md` — The Most Underrated Feature
3. Skills & Plugins
4. MCP Servers
5. Plan Mode
6. Validating Claude's Work
7. Commit Checkpoints
8. PR Reviews
9. Parallel Worktrees
10. Tips & Tricks
11. Cool Discoveries

---

<!-- _class: section -->

# 1. Session Management

---

### Session Management

- **Name your sessions** with `/rename` so you can find and resume them later
- Sessions are **tied to the directory** they were started in
- Resume from the same directory to pick up exactly where you left off

```
/rename "incident-tracker — comments feature"
```

> Think of sessions like named terminal tabs — give them a purpose.

---

<!-- _class: section -->

# 2. `CLAUDE.md`
## The Most Underrated Feature

---

### CLAUDE.md — Project Context on Every Session

Claude reads `CLAUDE.md` **automatically** at session start — no prompt needed.

**What to put in it:**
- Tech stack and commands
- Project structure and conventions
- Patterns and anti-patterns
- Code review guidelines

```
npm run dev          # Next.js + Convex in parallel
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npx convex run seed:run  # Seed sample data
```

> Think of it as the onboarding doc you always wished existed.

---

### CLAUDE.md — What It Unlocks

From the **very first message**, Claude knows:

- Which framework and libraries the project uses
- How auth works, what the data model looks like
- Which selector strategy to use in Playwright tests
- What to look for in a code review

**Live demo:** Ask Claude a question about the project cold — no setup needed.

---

<!-- _class: section -->

# 3. Skills & Plugins

---

### What are Plugins?

Plugins extend Claude Code with **new slash commands and agents** — install once, use everywhere.

- Built by Anthropic or the community
- Installed via `/plugin install <name>@claude-plugins-official`
- Enabled per-project in `.claude/settings.json`
- Skills live in `~/.claude/` and are **shared across all projects**

```json
{ "enabledPlugins": { "feature-dev@claude-plugins-official": true } }
```

Official plugins: [github.com/anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)

---

### Skills — Reusable Prompts as Commands

| Command | Plugin | What it does |
|---|---|---|
| [`/commit`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/commit-commands) | commit-commands | Staged changes → commit message → commit |
| [`/commit-push-pr`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/commit-commands) | commit-commands | Commit + push + open PR in one step |
| [`/code-review`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-review) | code-review | Review a PR against project conventions |
| [`/feature-dev`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev) | feature-dev | Guided 7-phase feature development workflow |

---

<!-- _class: section -->

# 4. MCP Servers
## Model Context Protocol

---

### What is MCP?

[Model Context Protocol](https://docs.anthropic.com/en/docs/claude-code/mcp) — an open standard that gives Claude tools beyond the filesystem.

| MCP Server | What it unlocks | Docs |
|---|---|---|
| [**Convex**](https://docs.convex.dev/client/react/nextjs) | Query/mutate the live DB | [docs.convex.dev](https://docs.convex.dev) |
| [**Playwright**](https://github.com/microsoft/playwright-mcp) | Drive the browser, verify UI | [github/playwright-mcp](https://github.com/microsoft/playwright-mcp) |
| [**GitHub**](https://github.com/github/github-mcp-server) | Issues, PRs, branches | [github/github-mcp-server](https://github.com/github/github-mcp-server) |
| [**Chrome**](https://docs.anthropic.com/en/docs/claude-code/mcp) | Visual checks, console logs | built into Claude Code |

> MCP servers are configured once and available in every session.

---

### MCP — Convex

With the [Convex MCP](https://docs.convex.dev) connected, Claude can talk directly to the live database:

> *"Show me all active incidents"*
> *"How many incidents were created today?"*
> *"Resolve the incident titled 'API gateway returning 503s'"*
> *"What indexes are defined on the incidents table?"*

```bash
npx convex mcp start   # start the Convex MCP server
```

No UI needed — Claude reads and mutates the **real cloud DB** directly.

---

### MCP — Playwright & Chrome

Claude drives a real browser to verify UI behaviour end-to-end:

**Playwright MCP**
> *"Navigate to /dashboard and confirm the incident cards render"*
> *"Fill in the create incident form and submit it"*
> *"Check the incidents table shows the resolved incident"*

**Chrome MCP** (built into Claude Code)
> *"Take a screenshot of the dashboard after creating an incident"*
> *"Check the browser console for errors after the mutation"*
> *"What network requests fired when I clicked Resolve?"*

---

### MCP — GitHub

With the [GitHub MCP](https://github.com/github/github-mcp-server), Claude can manage the full PR lifecycle:

> *"List open PRs and summarise what each one changes"*
> *"Create an issue for the bug we just found"*
> *"Check the CI status on this PR"*
> *"Add a review comment on line 42 of dashboard/page.tsx"*

Combined with `/code-review` — Claude reviews, comments, and tracks CI without leaving the editor.

---

<!-- _class: section -->

# 5. Plan Mode

---

### Plan Mode — Basic

Set a guardrail: Claude must propose a plan and **wait for your approval** before writing any code.

```json
{ "defaultMode": "plan" }
```

Add to `.claude/settings.json` to enforce it **for everyone who clones the repo**.

1. Claude reads the codebase
2. Proposes an approach
3. Waits — you approve, reject, or redirect

---

### Plan Mode — Demo

```
Add the ability to leave comments on incidents. Use the
AskUserQuestion tool to ask me everything you need
clarified before proposing any solution. Once approved
and implemented:
1. Write tests
2. Use MCP tools to verify the feature works end-to-end
3. Run npm run lint, npm run test, npx tsc --noEmit and
   npm run build to ensure CI will pass
```

**Watch for:** Claude uses `AskUserQuestion` to surface ambiguities — where to show comments, how to store them, who can comment — before writing a single line of code.

---

### Plan Mode — Advanced: `/feature-dev`

[`/feature-dev`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev) — structured 7-phase workflow built on top of plan mode:

| Phase | What happens |
|---|---|
| Discovery | Confirms what needs to be built |
| Exploration | 2-3 parallel agents map the codebase |
| **Clarifying questions** | **Stops and waits for your answers** |
| Architecture | Multiple approaches with trade-offs |
| Implementation | Waits for explicit approval |
| Review | 3 parallel reviewers check the code |
| Summary | Files changed, decisions made, next steps |

---

### `/feature-dev` — Demo

```
/feature-dev add incident history tracking — a log
of what changed and when (status changes,
reassignments, title edits). Show it in the UI.
Generate a plan and consult with me before implementing.
After implementation:
1. Write tests
2. Use MCP tools to verify the feature end-to-end
3. Run npm run lint, npm run test, npx tsc --noEmit and
   npm run build to ensure CI will pass
4. Fix any critical issues from the review phase
5. Open a PR with a clear description
```

**Watch for:** parallel codebase exploration, structured clarifying questions in Phase 3, multiple architecture options in Phase 4, explicit approval before any code is written.

---

<!-- _class: section -->

# 6. Validating Claude's Work

---

### Trust But Verify

Claude is fast — but not infallible. Build validation into your workflow.

```bash
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright E2E tests (real cloud DB)
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript check
```

- Run tests **after every feature**, not just at the end
- Use plan mode to review Claude's approach **before** it writes code
- Ask Claude to **explain its changes** before accepting

---

<!-- _class: section -->

# 7. Commit Checkpoints

---

### Commit Early, Commit Often

**Workflow:** plan → implement → test → commit → repeat

```bash
git log --oneline
# a4100b9 Add incident tracker app, tests, and CI pipeline
# ac93170 fix: add package-lock.json so CI can run npm ci
# b4b52ac test: trigger CI pipeline
# a307d23 Initial scaffold
```

- If Claude goes in the wrong direction → `git reset` to a known-good state
- **Short commit rule:** describe the *why*, not just the *what*
- Use `/commit` skill to keep messages consistent

---

<!-- _class: section -->

# 8. PR Reviews with Claude

---

### PR Reviews — Claude Knows Your Conventions

`/code-review` reviews PRs against what's in `CLAUDE.md`:

- ✅ Correct Convex mutation argument types
- ✅ `Id<"incidents">` type casting
- ✅ Playwright selector quality (`getByRole` over CSS selectors)
- ✅ Test isolation (`Date.now()` suffixes for uniqueness)
- ✅ Accessibility — `htmlFor`/`id` label pairs
- ✅ Empty states and UI consistency

> The review checklist in CLAUDE.md *drives* what Claude looks for.

---

<!-- _class: section -->

# 9. Parallel Worktrees

---

### Parallel Worktrees — Multiple Features at Once

Work on multiple things **simultaneously** — each worktree is a separate directory with its own Claude session.

```bash
git worktree add ../tracker-feature   feature/assignee-filter
git worktree add ../tracker-bugfix    fix/severity-colors
git worktree add ../tracker-prettier  chore/prettier
```

Open 3 terminal tabs, `cd` into each, start Claude. All 3 run in parallel.

---

### Worktree 1 — Feature

```
Create a git worktree at ../tracker-feature on branch
feature/assignee-filter and work from there.
Add an "assigned to me" toggle to the dashboard —
when active, only show incidents assigned to the
logged-in user's email. Enter plan mode, confirm the
approach with me before implementing. Then: write tests,
use MCP to verify end-to-end, run npm run lint &&
npm run test && npx tsc --noEmit && npm run build to
confirm CI passes, run /code-review:code-review and fix
critical issues, then open a PR.
```

---

### Worktree 2 — Bug Fix

```
Create a git worktree at ../tracker-bugfix on branch
fix/severity-colors and work from there.
There is a bug in the app: P0 incidents show blue badges
and P3 show red — the severity colours are inverted from
the spec in CLAUDE.md. To reproduce: open the dashboard
and look at any P0 incident badge.
Find the bug, fix it, and add a regression test so this
can't happen again. Run CI checks locally, run
/code-review:code-review, fix critical issues, open a PR.
```

---

### Worktree 3 — Prettier Setup

```
Create a git worktree at ../tracker-prettier on branch
chore/prettier and work from there.
Prettier is already installed but has no config or format
script. Set it up properly: add a .prettierrc, a
.prettierignore, add a format script to package.json,
format the entire codebase, and add a CI check so
unformatted code fails the build. Run /code-review:code-review,
fix any critical issues, and open a PR.
```

---

<!-- _class: section -->

# 10. Tips & Tricks

---

### Tips & Tricks

**Be specific in prompts**
> *"Add an assignee filter to the dashboard using the existing `by_status` index pattern"*
> beats *"add filtering"*

**Reference files directly**
> *"Look at `convex/incidents.ts`"* gives Claude immediate context

**Iterate in small steps**
One feature at a time, run tests between each

**Use the escape hatch**
If Claude is going the wrong way, stop it and restate the goal

---

### Tips & Tricks (cont.)

**Deny list protects you**

```json
"deny": [
  "Bash(git push * --force*)",
  "Bash(git reset --hard *)",
  "Bash(rm -rf .git*)"
]
```

**CLAUDE.md is a living document**
Update it as you learn — conventions, gotchas, lessons from tests

**Parallel agents for big tasks**
Claude can spawn subagents to explore, review, and implement in parallel

---

<!-- _class: section -->

# Cool Discoveries

---

<!-- _class: section -->

# `/skill-creator`
## Build your own slash commands

---

### `/skill-creator` — What it does

A meta-skill that **interviews you, drafts a skill, tests it, and refines it** until it performs well:

1. **Interview** — understands your intent and success criteria
2. **Draft** — writes a `SKILL.md` for the new command
3. **Eval** — runs test prompts and grades the output
4. **Blind compare** — judges old vs new version without bias
5. **Iterate** — applies improvements, repeats until satisfied

> Claude builds better Claude.

---

### `/skill-creator` — Demo

```
/skill-creator Create a /post-mortem skill for this
incident tracker. Given an incident title, it should
produce a structured post-mortem document: timeline,
root cause, impact, what went well, action items.
It should query the Convex DB via MCP to pull the
real incident data rather than asking the user to
paste it in.
```

**Watch for:** skill-creator asking clarifying questions about format and tone, drafting a `SKILL.md`, running test cases against it, grading the output, and proposing improvements before finalising.

---

<!-- _class: section -->

# `/playground`
## Interactive explorers from a single prompt

---

### Playground — TBD

*Coming soon — examples from the openpass-api repo*

---

<!-- _class: section -->

# `/frontend-design`
## Design exploration at speed

---

### `/frontend-design` — Live Demo

The [`/frontend-design`](https://github.com/anthropics/claude-plugins-official) skill generates production-grade, visually distinct UI from a single design brief.

- Bold aesthetic direction, not generic AI output
- Self-contained HTML — ready to serve, share, or iterate on
- Emotional framing gets better results than functional specs

> *Live demo*

---

<!-- _class: section -->

# `/learning-output-style`
## Claude teaches as it builds

---

### `/learning-output-style` — What it does

Installs a session hook that changes how Claude responds:

- **`★ Insight` callouts** — explains *why* a pattern is used, not just *what* it does
- **Pauses at decision points** — hands you 5–10 lines of meaningful code to write
- Targets logic with real trade-offs: algorithms, error handling, UX choices
- Skips the boring stuff — boilerplate is still written for you

> Claude becomes a pair programmer who teaches as it builds.

---

### `/learning-output-style` — Demo

```
Add a search bar to the dashboard that filters incidents
by title. Use the AskUserQuestion tool to ask me anything
you need clarified before starting.
```

**Watch for:**
- `★ Insight` explaining why we debounce (and what happens without it)
- Claude pausing and asking *you* to write the debounce logic
- The trade-off surfaced: `useMemo` filter vs. Convex query filter

---

<!-- _class: section -->

# `/explanatory-output-style`
## Claude narrates its reasoning as it builds

---

### `/explanatory-output-style` — What it does

Like `/learning-output-style` but **no contribution pauses** — Claude explains everything and keeps building:

- **`★ Insight` callouts** before and after code changes
- Surfaces *why* a pattern exists in *your specific codebase*
- Explains trade-offs, conventions, and design decisions in context
- Great for onboarding, code review sessions, and architecture walkthroughs

**vs. `/learning-output-style`:**
| | Insights | Pauses for you to write code |
|---|---|---|
| `/explanatory-output-style` | ✅ | ❌ |
| `/learning-output-style` | ✅ | ✅ |

---

### `/explanatory-output-style` — Demo

```
Walk me through how auth works in this project — middleware,
session strategy, and how protected routes are enforced.
Then refactor middleware.ts to also protect /settings
if it existed.
```

**Watch for:** Insights explaining *why* JWT was chosen over DB sessions, *why* the matcher regex excludes `api/auth`, and the trade-off between middleware-level vs layout-level protection.

---

<!-- _class: section -->

# `/ralph-loop`
## Autonomous iteration until done

---

### `/ralph-loop` — What it does

A **Stop hook** that blocks exit and re-feeds the prompt until a completion signal is detected:

```bash
/ralph-loop "Build X. Requirements: ... Output <promise>COMPLETE</promise> when done." \
  --completion-promise "COMPLETE" \
  --max-iterations 20
```

1. Claude attempts the task
2. Hook intercepts exit — feeds the prompt back with full file context
3. Claude sees what changed, fixes failures, iterates
4. Repeats until it outputs the completion promise

> Walk away. Come back to a finished feature.

---

### `/ralph-loop` — Demo

```
/ralph-loop "Add severity filter toggle buttons to the
dashboard — P0/P1/P2/P3, all selected by default, clicking
one toggles it, only matching active incidents are shown.
Write a Playwright E2E test for it. Then run:
  npm run test
  npx tsc --noEmit
  npm run build
All must pass with zero errors. Output
<promise>COMPLETE</promise> when everything passes."
--completion-promise "COMPLETE" --max-iterations 15
```

**Watch for:** Claude failing a type check, seeing the error on the next loop, fixing it, iterating until all checks pass — without any human input.

