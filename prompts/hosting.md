# Prompt log: Move hosting to Vercel + Supabase

Agent: Claude Code (Opus 5.5) · Issue #5 · Branch `chore/vercel-supabase`

## What happened

PLAN.md section 5 said Replit would host the app and its database. After merging feature 1, I tried to publish on Replit and got:

> You have reached the maximum number of Autoscale deployments. Please contact support to request an increase.

My other Replit projects were already using the free plan's deployment slots. The agent gave me three options: unpublish an old app, pay for Replit Core, or switch to Vercel + a hosted Postgres.

## Key prompt

> Let's just use Vercel and Supabase or something because I feel like Replit's not going to work out.

## What the agent did and decided

- **Kept our own login.** Supabase also offers login, but feature 1 was already built and tested with our own email + password, so Supabase is used only as the Postgres database.
- **Migrations run on every Vercel deploy** through a `vercel-build` script (`drizzle-kit migrate && next build`). Vercel runs `vercel-build` instead of `build` when it exists, so local builds don't need a database.
- **SSL:** Supabase requires encrypted connections, so `src/db/connection.ts` turns SSL on for any non-local database (and off for local PGlite). Both the app and the migration tool use it.
- **Removed `.replit`.**

## A problem I caught: Replit committed directly to `main`

While starting this branch, the agent found a commit on `main` that neither of us made:

```
fb7cd17  Add Replit configuration file   (author: Replit Agent)
```

When I imported the repo, Replit's own agent created a `.replit` file and pushed it straight to `main`, skipping the Issue → branch → PR loop. Rewriting `main`'s history to erase it would be riskier than the mistake itself, so this PR removes the file instead, and I'm documenting it here. To stop it happening again, I'm disconnecting the Replit project from the repo.

## How it was checked

- `npm run lint` and `npm run build` pass.
- Migrations still apply to the local database with the new connection code.
- In the browser: logged out, logged back in, home page loads (reads the user from the database). ✅
- The SSL settings for a Supabase-style URL were checked in isolation. The real Supabase connection gets checked on the first Vercel deploy.
