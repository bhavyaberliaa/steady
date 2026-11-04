# Prompt log: Final docs (schema.md, README.md, Plan vs Reality)

Agent: Claude Code (Opus 5.5) · Issue #29 · Branch `docs/final`

## Key prompts

> Merged, do docs

## What the agent did and decided

- **`schema.md`** was written from the real code, not from the plan: `src/db/schema.ts` and the five migrations in `drizzle/`. It has:
  - a Mermaid diagram with every column, key and relationship
  - one table per database table
  - a "what happens on delete" table: cascade, restrict, set null
  - a short list of what is deliberately *not* stored: calendar events, the daily pick, login sessions
- **`README.md`** covers:
  - what Steady is, and the live URL
  - the 10 features and where to find them
  - the tech stack
  - copy-paste steps to run it locally
  - every environment variable and where it comes from
  - how to run the tests
  - the project structure
  - the Issue → branch → prompt log → PR → merge loop
- **Plan vs Reality** was added at the **bottom** of `PLAN.md`. The original plan above it is unchanged; the agent diffed the old text against the new file to prove it. The table covers:
  - **Hosting:** Replit → Vercel + Supabase, and why
  - **The direct commit to `main`:** made by Replit Agent, with how it was handled
  - **The duplicate Vercel project**
  - **Each feature:** what changed from the plan, e.g. Your week is always reachable; plain `fetch` instead of `googleapis`
  - **Database:** `weekly_briefings` became `weekly_plans`, and why
  - **Tests and cuts:** 2 tests planned and 21 shipped; none of the planned cuts were needed
- Facts were checked against the repo before writing: the git history (`git log --first-parent`, the author of `fb7cd17`), the merged PR list, earlier prompt logs, and the validation limits in code.

## How it was checked

| step | result |
|---|---|
| Every table and column in schema.md matches `src/db/schema.ts` and the migrations | ✅ |
| Original PLAN.md text (lines 1–131) unchanged | ✅ (diffed) |
| PR numbers in the table match the merged PR list on GitHub | ✅ |
| `npm test` | 21 passed ✅ |
