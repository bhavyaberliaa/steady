# Prompt log: Stranger-test fix 1, no dead end before the first affirmation

Agent: Claude Code (Opus 5.5) · Issue #33 · Branch `fix/first-affirmation`

## Key prompts

> actually my friend did get studck on point A, B, C, E
> My roomates looked at it 2 of them same issues.
> Can you build PRs to help fix 2 issues

Point A was the dead-end New affirmation page, B the missing next step after adding a trigger, and C the unexplained word "trigger". They're all the same problem: a new user can't get from signing up to their first affirmation. So this PR fixes them together. Point E (the first screen) is a separate PR.

## What the agent did and decided

- **New affirmation with no triggers** used to show only "Add one on the Triggers page first." Now it shows **Step 1 of 2: "When will you need these words?"**, an explanation of triggers with examples, and the Add trigger form right there. After saving, the page turns into the affirmation form with that trigger already picked.
- **Triggers page:** after adding a trigger, a green line says **Added "…". Now write an affirmation for it →**. The link opens the form with that trigger picked (`/affirmations/new?trigger=<id>`).
- **Pre-picking is safe:** the `trigger` value in the link is only used if it matches one of the logged-in user's own triggers. Anything else is ignored. With only one trigger, it's picked automatically.
- **The word "trigger"** is now explained with examples on the Triggers page and on the new inline step.
- Reused the existing trigger form and its validation; no new database changes.

## How it was checked

At phone width (375 px) on a local copy, as a brand-new user:

| step | result |
|---|---|
| New affirmation, no triggers | Step 1 of 2 card with the inline trigger form ✅ |
| Add trigger with an empty name | the usual amber "Give this trigger a name" message, still on this page ✅ |
| Add "Before a presentation" | page becomes the affirmation form with that trigger picked ✅ |
| Triggers page, add "Can't sleep" | "Added "Can't sleep". Now write an affirmation for it →" ✅ |
| Follow that link | form opens with 🌙 Can't sleep picked ✅ |
| `?trigger=not-a-real-id` | ignored, nothing picked ✅ |
| `npm test`, `npm run lint`, type check | pass ✅ |
