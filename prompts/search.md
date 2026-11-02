# Prompt log: Search, filter and sort (feature 6)

Agent: Claude Code (Opus 5.5) · Issue #19 · Branch `feature/search`

## Key prompts

> Merged, start #6

(The agent worked from the user story in PLAN.md: "As a user, I want to search affirmations by text, filter by trigger or starred, and sort by newest, oldest, or A–Z, so that I can find the right one in an anxious moment.")

## What the agent did and decided

- **One filter bar** on the Affirmations page: a search box, a trigger dropdown, a sort dropdown (Newest first / Oldest first / A–Z) and a "Starred only ★" checkbox. They all combine, e.g. "safe" + 🎤 Before a presentation + A–Z.
- **Choices live in the URL** (`/affirmations?q=safe&trigger=…&sort=az&starred=1`). Reloading keeps them, the Back button undoes the last change, and a filtered view can be bookmarked. It's a plain GET form, so it works even before JavaScript loads.
- **Dropdowns and the checkbox apply as soon as you change them.** The search box applies on Enter or the Search button, so the list doesn't jump while you type.
- **Search ignores case** and matches anywhere in the text. Typing `%` or `_` finds those characters literally instead of acting as database wildcards.
- **Friendly empty state:** "Nothing matches that. Show all affirmations", plus a "Clear search and filters" link and a match count.
- **Junk in the URL is ignored, not an error:** an unknown sort falls back to Newest first, a trigger that isn't a valid id means "all triggers", and the search is cut to 100 characters.
- **Privacy:** search, filters and sort only narrow or reorder *your own* affirmations. The query always starts from "affirmations where user = me", so even pasting another user's trigger id into the URL shows nothing.
- The URL-reading rules live in `src/lib/list-query.ts` as plain functions with no database, so the tests in feature 7 can use them.

## How it was checked

In the browser, against the local database (5 affirmations under 2 triggers, 1 starred; a second user with 1 private affirmation):

| step | result |
|---|---|
| Type `SAFE` in search, press Enter | 2 matches, both containing "safe" (case ignored) ✅ |
| Then pick 🎤 Before a presentation | applies at once, 1 match, search text kept ✅ |
| Sort A–Z | 100%…, Breathe…, I am…, My worth…, Zero… ✅ |
| Sort Oldest first | oldest at the top ✅ |
| Tick Starred only | only the starred one ✅ |
| Press Back | checkbox unticked again, all 5 shown ✅ |
| Search `%` | only "100% prepared…" (not everything) ✅ |
| Search `_` | "Nothing matches that." ✅ |
| Search "Other user" (the other user's text) | nothing found ✅ |
| URL with the other user's trigger id | nothing found; the dropdown only lists my triggers ✅ |
| URL with `sort=toString&trigger=not-a-uuid` | falls back to Newest first, all 5 shown ✅ |
| URL with `q='; drop table affirmations;--` | just "Nothing matches"; table still there ✅ |
| `npm run build` and `npm run lint` | pass ✅ |
