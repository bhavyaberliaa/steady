# Prompt log: Dashboard and tests (feature 7)

Agent: Claude Code (Opus 5.5) · Issue #21 · Branch `feature/dashboard`

## Key prompts

> Merged, start #7

(The agent worked from PLAN.md: user story 7, "a dashboard showing my total affirmations, how many I've starred, and the trigger I've written the most for, plus a bar chart of affirmations per trigger", and the two tests in section 4.)

## What the agent did and decided

- **The Home page is now the dashboard** once you have at least one affirmation. Brand-new users still see the friendly "Hi, you're in. 🌿" welcome card. It has three stat tiles:
  - **Affirmations:** links to the list.
  - **Starred:** links to the Starred page.
  - **Top trigger:** the trigger with the most affirmations. On a tie, the one you created first wins.
- **Bar chart (Recharts): affirmations per trigger.**
  - The bars are horizontal so trigger names stay readable, even on a phone.
  - It uses one color (sage), because there's only one kind of bar.
  - The number sits at the end of each bar, and hovering shows a tooltip.
  - A hidden table gives screen readers the same numbers.
  - Triggers with 0 affirmations still show as an empty row.
- **All numbers come from one function**, `getDashboardStats` in `src/lib/dashboard.ts`. Every count is filtered to the logged-in user, including the starred count.
- **Tests with Vitest + PGlite.**
  - Each test file gets a fresh, empty in-memory Postgres with the real migrations applied.
  - The tests call the same query functions the pages use, so there's nothing fake in between.
  - No database setup is needed: `npm test` just works.
  - Plain-English explanations, "what would break it", and the steps to reproduce red and green are in [tests/README.md](../tests/README.md).
- New packages: `recharts` (chart) and `vitest` (tests). No database changes.

## How it was checked

| step | result |
|---|---|
| `npm test` | 2 passed ✅ (green) |
| Comment out the "only my rows" filter in `listMyAffirmations`, run test 1 | **fails**: User B's list contains User A's affirmation ✅ (red) |
| Remove the "only my stars" filter from the starred count, run test 2 | **fails**: `expected 3 to be 2` ✅ (red) |
| Restore both, `npm test` | 2 passed ✅ (green again) |
| Dashboard in the browser (5 affirmations, 1 starred, 2 triggers; another user also has data) | shows 5 / 1 / 🎤 Before a presentation; bars 2 and 3; the other user's data isn't counted ✅ |
| Hover a bar | tooltip "🌙 Can't sleep · Affirmations: 2" ✅ |
| Phone width (375px) | tiles stack, the chart fits, no sideways scrolling ✅ |
| `npm run build` and `npm run lint` | pass ✅ |
