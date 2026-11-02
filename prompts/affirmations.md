# Prompt log: Affirmations CRUD (feature 3)

Agent: Claude Code (Opus 5.5) · Issue #13 · Branch `feature/affirmations`

## Key prompts

> Merged, start #3

(The agent worked from the user story in PLAN.md: "As a user, I want to write an affirmation (text, the trigger it's for, an optional note on why it helps), see all mine in a list, open one on its own page, edit it, and delete it after an 'Are you sure?' prompt, so that my collection stays the way I want it.")

## What the agent did and decided

- **New `affirmations` table** (`id`, `user_id`, `trigger_id`, `text` up to 280 characters, `note`, `created_at`, `updated_at`), matching PLAN.md section 3. Migration `drizzle/0002_create_affirmations.sql` runs on the next Vercel deploy.
- **Four pages:** `/affirmations` (list, newest first), `/affirmations/new`, `/affirmations/[id]` (its own page, with the note and the date written), `/affirmations/[id]/edit`.
- **Delete reuses the "Are you sure?" step** from triggers and quotes the start of the affirmation.
- **Privacy:** every query matches on the logged-in user. Someone else's affirmation shows "404 not found" even with its exact link. Saving also checks the chosen trigger is yours, so a forged trigger id is refused.
- **Triggers in use can't be deleted.** The Triggers page now shows how many affirmations each trigger has. If it has any, Delete is replaced with "In use". The database also refuses (`ON DELETE RESTRICT`), so your affirmations can never be silently lost.
- **If you have no triggers yet,** the New page points you to the Triggers page instead of showing an empty dropdown.
- **Left for feature 4 (validation):** for now the browser's built-in "required" and the 280-character limit stop empty or too-long entries. Feature 4 adds friendly messages and keeps your text if something's wrong.

## How it was checked

In the browser, against the local database:

| step | result |
|---|---|
| Write "I have handled hard weeks before." under 🌙 Can't sleep, with a note | opens its own page with the text, trigger, note, and date ✅ |
| Edit the text | the page shows the new text ✅ |
| Triggers page | "Can't sleep · 1 affirmation · In use" (no Delete) ✅ |
| `/affirmations/not-a-real-id` | 404 ✅ |
| Another user's affirmation (added straight to the database) | not in my list; its view and edit links both 404 ✅ |
| Forge another user's trigger id into my edit form | "Please pick one of your triggers." ✅ |
| Delete → "Are you sure?" → Yes, delete | back to an empty list; trigger shows 0 affirmations ✅ |
| `npm run build` and `npm run lint` | pass ✅ |
