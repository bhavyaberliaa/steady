# Prompt log: Sign up and login (feature 1)

Agent: Claude Code (Opus 5.5) · Issue #3 · Branch `feature/auth`

## Key prompts

> Start feature 1

(The agent worked from the user story in PLAN.md: "As a new visitor, I want to create an account with my email and a password, then log in and log out, so that my affirmations are private to me.")

## What the agent did and decided

- **Scaffolded the app** with `create-next-app` (Next.js 16, TypeScript, Tailwind).
- **Turned off Next.js "Cache Components".** The new default makes every page that reads the login cookie wrap itself in extra loading boundaries. That's more moving parts than this app needs, so pages simply render fresh on every request.
- **Database:** Drizzle ORM with a `users` table matching PLAN.md section 3 (`id`, `email`, `password_hash`, `display_name`, `briefing_day`, `google_refresh_token`, `created_at`). The table is created by a migration file in `drizzle/`, which runs automatically on Replit when the app starts.
- **Local database:** Replit's database can't be reached from my Mac, so local development uses PGlite (a real Postgres that runs inside Node) via `npm run db:local`. Nothing to install, no passwords shared.
- **Passwords** are hashed with bcrypt before saving; the real password is never stored.
- **Login** is kept in an encrypted, HTTP-only cookie (iron-session) that lasts 30 days.
- **Friendly messages:** empty fields, a malformed email, a password under 8 characters, an email that's already taken, and a wrong password. A wrong email and a wrong password get the *same* message, so nobody can use the login form to find out who has an account.

## How it was checked

In the browser, against the local database:

| step | result |
|---|---|
| Visit `/` logged out | sent to `/login` ✅ |
| Sign up with empty form | "Please fill in your email and a password." ✅ |
| Sign up with a 5-character password | "Your password needs at least 8 characters." ✅ |
| Sign up with valid email + password | lands on home page ✅ |
| Database row | email saved, password stored as a `$2b$10$…` bcrypt hash ✅ |
| Log out, then visit `/` | sent to `/login` ✅ |
| Log in with wrong password | "That email and password don't match." ✅ |
| Log in with right password | lands on home page ✅ |
