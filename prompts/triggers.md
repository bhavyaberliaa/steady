# Prompt log: Moods / triggers (feature 2)

Agent: Claude Code (Opus 5.5) · Issue #11 · Branch `feature/triggers`

## Key prompts

After the live site worked (sign-up on steady-lime.vercel.app landed on "Hi, you're in"), I sent the screenshot and the agent moved on to feature 2.

(The agent worked from the user story in PLAN.md: "As a user, I want to create triggers such as 'Before a presentation' or 'Can't sleep', each with a name and an emoji, so that I can group affirmations by the situation they help with.")

## What the agent did and decided

- **New `triggers` table** (`id`, `user_id`, `name`, `emoji`, `created_at`), matching PLAN.md section 3. Migration `drizzle/0001_create_triggers.sql` runs automatically on the next Vercel deploy. If a user is deleted, their triggers go with them.
- **Every query filters by the logged-in user.** Listing, renaming and deleting all match on `user_id` as well as the trigger's id, so guessing or forging another trigger's id does nothing.
- **Emoji picker instead of a text box:** ten calm presets (🌿 🌙 🎤 💼 📚 ❤️ 🌧️ ☀️ 😮‍💨 🫶). No typing emoji on a laptop.
- **"Are you sure?" on delete:** clicking Delete turns into "Delete "X"? Are you sure? Yes, delete / Keep it". It's a reusable component, so affirmations (feature 3) will use the same one.
- **Shared signed-in layout:** the header (Steady, Home, Triggers, email, Log out) moved into one layout that also handles the login check for every private page.
- **Small fix:** `npm run db:generate` now reads `.env.local` by itself.
- A trigger with no name gets a friendly message now. The rest of validation (affirmations) is feature 4.

## How it was checked

In the browser, against the local database:

| step | result |
|---|---|
| Add with an empty name | "Give this trigger a name, like "Can't sleep"." ✅ |
| Add "Cant sleep" and "Before a presentation" | both appear in the list ✅ |
| Edit: rename to "Can't sleep", pick 🌙, Save | list shows 🌙 Can't sleep, form closes ✅ |
| Delete → "Keep it" | trigger stays ✅ |
| Delete → "Yes, delete" | trigger removed ✅ |
| Another user's trigger, added straight to the database | not shown on my page ✅ |
| Forge a delete with the other user's trigger id | their trigger is still there ✅ |
| `npm run build` and `npm run lint` | pass ✅ |
