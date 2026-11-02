# Prompt log: Stars (feature 5)

Agent: Claude Code (Opus 5.5) · Issue #17 · Branch `feature/stars`

## Key prompts

> Merged, start #5

(The agent worked from the user story in PLAN.md: "As a user, I want to star the affirmations that work best for me and open a 'Starred' view, so that my strongest ones are one tap away.")

## What the agent did and decided

- **`stars` junction table** (`user_id`, `affirmation_id`, `created_at`), matching PLAN.md section 3. The pair (user, affirmation) is the **primary key**, so the same affirmation can't be starred twice. It connects users and affirmations many-to-many. Deleting an affirmation deletes its stars. Migration `drizzle/0003_create_stars.sql` runs on the next Vercel deploy.
- **A star button (☆ / ★ in lavender)** sits on every affirmation in the list and on its own page. It fills in **instantly** and saves in the background (React's `useOptimistic`), so a tap never feels laggy.
- **New Starred page** at `/starred`, linked from the header. It reuses the same list as the Affirmations page, filtered to starred ones.
- **Privacy:** the server only stars an affirmation if it's yours, and only ever reads or removes your own stars.
- The list query now joins your stars onto each affirmation in one database call. Feature 6 (search/filter/sort) will extend that same query.

## How it was checked

In the browser, against the local database:

| step | result |
|---|---|
| Tap ☆ on one of two affirmations | turns ★ right away ✅ |
| Reload the page | still ★ (saved) ✅ |
| Starred page | shows only that one ✅ |
| Its own page | shows ★ (Unstar) ✅ |
| Un-star from the Starred page | list becomes "No stars yet…" ✅ |
| Swap another user's affirmation id into the star request | no star saved for it; the database only holds my own star ✅ |
| `npm run build` and `npm run lint` | pass ✅ |
