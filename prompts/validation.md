# Prompt log: Validation (feature 4)

Agent: Claude Code (Opus 5.5) · Issue #15 · Branch `feature/validation`

## Key prompts

> Merged, start #4

(The agent worked from the user story in PLAN.md: "As a user, if I try to save an affirmation with no text or no trigger, or a trigger with no name, I want a friendly message telling me what's missing, so that I don't save empty entries by accident.")

## What the agent did and decided

- **One place for the rules:** `src/lib/validation.ts` holds every rule as a plain function with no database access. The server uses it on every save, and the Vitest tests in feature 7 can call it directly.
- **Checked on the server.** The browser's own pop-ups are turned off (`noValidate`), so a message can't be skipped by editing the page, and every message reads in Steady's calm voice.
- **Messages sit next to the field they're about,** in soft amber, and the field's border turns amber too. Screen readers hear each one (`role="alert"`, `aria-invalid`, `aria-describedby`).
- **Nothing you typed is lost.** On a problem the server sends back what you typed, and the form redraws with it. Before, React cleared the form after every submit.
- **Live character counter** on the affirmation: "41 / 280", turning amber past the limit. The old hard stop at 280 is gone, so you can paste something long and trim it, rather than having it silently cut off.
- **Rules:**

| field | rule | message |
|---|---|---|
| Affirmation text | required | "Write a few words first. Even one short sentence counts." |
| Affirmation text | ≤ 280 characters | "Keep it to 280 characters so it's easy to read in a hard moment. You're at 286." |
| Trigger | required | "Pick the moment this affirmation helps with." |
| Trigger | must be yours | "Please pick one of your triggers." |
| Note | ≤ 500 characters | "Keep the note under 500 characters. You're at …" |
| Trigger name | required | "Give this trigger a name, like "Can't sleep"." |
| Trigger name | ≤ 40 characters | "Keep the name under 40 characters." |
| Trigger name | no duplicates (ignores capitals) | "You already have a trigger called "…"." |

## How it was checked

In the browser, against the local database:

| step | result |
|---|---|
| Save an empty affirmation | two messages: text and trigger ✅ |
| Type 286 characters | counter shows "286 / 280" ✅ |
| Save it with a trigger and note | length message; text, trigger, and note all kept ✅ |
| Shorten to 41 characters and save | saved, opens its page ✅ |
| Edit: clear the text and save | message shown, stays on the edit page, note kept ✅ |
| Add trigger "can't SLEEP" when "Can't sleep" exists | duplicate message, typed name and 💼 kept ✅ |
| Rename a trigger to its own unchanged name | saves (not counted as a duplicate) ✅ |
| `npm run build` and `npm run lint` | pass ✅ |
