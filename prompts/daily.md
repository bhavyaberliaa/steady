# Prompt log: Affirmation of the day (feature 8, custom)

Agent: Claude Code (Opus 5.5) · Issue #23 · Branch `feature/daily`

## Key prompts

> Merged, start #8

(The agent worked from PLAN.md user story 8: "the home page to show one affirmation each day, chosen at random with starred ones picked first, plus a 'Give me another' button, so that I start the day with something I wrote for myself.")

## What the agent did and decided

- **A lavender card at the top of Home** shows "Your affirmation for today" in large text, with its trigger, a ★ if it's starred, **Give me another**, and **Open it**.
- **"Random" but the same all day.** Each user gets their own shuffle for each date: starred affirmations first, then the rest. Today's affirmation is the first one. Reloading shows the same one, and tomorrow brings a new order. Nothing is stored in the database.
- **"Give me another"** steps to the next one in today's order (`/?another=1`, `2`, …). You see your starred ones first, then every other affirmation once, before anything repeats. It hides when you only have one affirmation.
- **"Today" means your today.** On Vercel the app reads your timezone from the `x-vercel-ip-timezone` header, so the pick changes at your midnight, not London's. Locally (no header) it uses UTC.
- **Only your own affirmations** are ever picked: it uses the same `listMyAffirmations` query as the list page.
- **Junk in the URL** (`?another=banana`, `?another=-7`) just shows today's pick.
- The picking logic is plain functions in `src/lib/daily.ts` with 6 extra unit tests in `tests/daily.test.ts`. These are on top of the two required tests.

## How it was checked

| step | result |
|---|---|
| Open Home (5 affirmations, 1 starred) | "Your affirmation for today · ★": the starred one ✅ |
| Reload | same affirmation ✅ |
| Click "Give me another" 5 times | 4 different unstarred ones, then back to the starred one: no repeats, nothing from the other user ✅ |
| `?another=banana` / `?another=-7` | today's pick, labelled "for today" ✅ |
| Phone width | card stacks above the dashboard, nothing cut off ✅ |
| `npm test` | 8 passed (6 new: same pick all day, starred first, no repeats, changes across days, empty list, timezone) ✅ |
| `npm run build` and `npm run lint` | pass ✅ |
