# Prompt log: Final submission docs

Agent: Claude Code (Opus 5.5) · Issue #31 · Branch `docs/submission`

## Key prompt

> canyou help finalise the answer that I can submit please

(I pasted the full assignment brief.)

## What the agent did and decided

- Checked the repo against every line of the brief. Two docs gaps:
  - The brief asks for a Plan vs Reality table with exact columns (Planned feature · Shipped / Changed / Cut · Status · Learning · What changed and why). PLAN.md had detailed tables but not that one. Added it as a **Summary** at the top of Plan vs Reality. The original plan above it is unchanged (diffed).
  - The brief asks schema.md to be compared with PLAN.md section 3. Added **Compared with the plan**: 4 of 5 tables match; `weekly_briefings` became `weekly_plans`.
- Features 9 and 10 are marked "Done in code; live site waits on keys", because the Google and Anthropic keys aren't in Vercel yet. That row should be updated once they are.
- Drafted the bCourses submission text separately (not in the repo): links, Reflection 1 with its evidence trail, and a Reflection 2 template. The stranger test has to be done and written by me.

## How it was checked

| step | result |
|---|---|
| PLAN.md lines 1–137 identical to `main` | ✅ |
| Every PR and Issue number in the new tables matches GitHub | ✅ |
