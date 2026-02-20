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
3. Skills & Slash Commands
4. Plan Mode
5. MCP Servers
6. Validating Claude's Work
7. Commit Checkpoints
8. PR Reviews
9. Parallel Worktrees
10. Tips & Tricks

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

# 4. Plan Mode

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
and implemented: write tests, run /code-review:code-review
and fix any critical issues, then open a PR.
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
After implementation: write tests, fix any critical
issues from the review phase, then open a PR.
```

**Watch for:** parallel codebase exploration, structured clarifying questions in Phase 3, multiple architecture options in Phase 4, explicit approval before any code is written.

---

<!-- _class: section -->

# 5. MCP Servers
## Model Context Protocol

---

### MCP — Extending Claude Beyond the Filesystem

MCP gives Claude tools beyond reading and writing files.

| MCP Server | What it enables |
|---|---|
| **Convex MCP** | Query/mutate the live DB from Claude |
| **Playwright MCP** | Claude drives the browser to verify UI |
| **GitHub MCP** | Create issues, review PRs, manage branches |

```bash
npx convex mcp start   # Start the Convex MCP server
```

---

### MCP — Convex Live Demo

With the Convex MCP connected, you can ask Claude:

> *"Show me all active incidents in the database"*
> *"Resolve the incident titled 'API gateway returning 503s'"*
> *"How many incidents were created in the last 24 hours?"*

Claude queries and mutates the **real cloud database** directly — no UI needed.

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

Work on multiple features **simultaneously** without stashing or branch-switching.

```bash
# Create a separate working directory on a new branch
git worktree add ../feature-comments feature/comments
git worktree add ../feature-filters feature/assignee-filter
```

- Each worktree is a **separate directory** — same repo, separate state
- Each gets its **own Claude session**
- Implement one feature while reviewing/testing another

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

<!-- _class: title -->

# Demo Time 🚀

### Incident Tracker — live coding

`github.com/Diego-Romero/claude-code-demo`
