# Prompt log: Vercel build fails at the migration step

Agent: Claude Code (Opus 5.5) · Issue #7 · Branch `fix/migration-errors`

## What happened

The first Vercel deploy after merging #6 failed. I pasted the build log:

> got a failure in vercel with these logs

```
> drizzle-kit migrate && next build
Using 'pg' driver for database querying
[⣷] applying migrations...
Error: Command "npm run vercel-build" exited with 1
```

## What the agent found

The log had no actual error: `drizzle-kit migrate` hides the database's error message. Rather than guess (wrong password? wrong connection string?), the agent changed the build so the next failure explains itself.

## What changed

- New `scripts/migrate.ts` runs migrations with Drizzle's migrator directly and prints the real error, its Postgres error code, and a plain-English hint for the common causes (wrong password, wrong user, host not found, missing `DATABASE_URL`).
- `vercel-build` and `npm run db:migrate` now use it. It reads the same migration files and the same history table, so nothing already applied runs twice.

## How it was checked

| case | output |
|---|---|
| Local database, already migrated | "Migrations applied." ✅ |
| Brand-new empty database | creates the `users` table ✅ |
| `DATABASE_URL` missing | "DATABASE_URL is not set." ✅ |
| Host that doesn't exist | `ENOTFOUND` + hint ✅ |
| Real Supabase pooler, made-up project | "tenant/user … not found" + hint ✅ (this also proves the SSL connection to Supabase works) |

## Follow-up: the real error (Issue #9)

With #8 merged, the next build said exactly what was wrong:

```
Migration failed: password authentication failed for user "postgres"
Error code: 28P01
```

The password I'd pasted into Vercel's `DATABASE_URL` was wrong. I asked:

> can you not do this for me? all the steps?

The agent said it won't type, reset, or paste passwords into my accounts. Instead it suggested connecting Supabase through **Vercel → Storage**, which fills in the connection string (`POSTGRES_URL`) automatically, so nobody copies a password by hand. The app now uses `POSTGRES_URL` when it's set and falls back to `DATABASE_URL` locally. Checked: local migrate still works, `POSTGRES_URL` takes priority, and Supabase's extra URL options (`?sslmode=…&supa=…`) don't break the connection.
