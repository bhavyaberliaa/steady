# Prompt log: Red/green test screenshots

Agent: Claude Code (Opus 5.5) · Issue #37 · Branch `docs/test-screenshots`

## Key prompts

> okay run it in my terminal then

> can you not do it?

The brief asks for red and green screenshots in the PR that adds the tests (PR #22). It had the explanations but no screenshots.

## What the agent did and decided

- **Ran red and green in my terminal, one step at a time,** pausing so I could screenshot each:
  1. Test 1 red: commented out `eq(affirmations.userId, userId)` in `listMyAffirmations`. User B's list came back with User A's "I have handled hard weeks before".
  2. Test 1 green: put the line back. 1 passed.
  3. Test 2 red: removed the `.where(...)` on the starred count in `src/lib/dashboard.ts`. Starred came out as 3 instead of 2.
  4. Test 2 green: put it back. 1 passed.
  The script restored both files with `git checkout` at the end. Nothing broken was committed.
- **Saved the screenshots in the repo** (`docs/test-screenshots/`), because GitHub has no way to upload images into a PR description from the command line. PR #22's description now shows them from `main`.

## How it was checked

- `git status` was clean after the run: both source files back to normal.
- The 4 images show `1 failed` / `1 passed` as expected.
