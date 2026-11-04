# Steady 🌿

**An affirmations app with a weekly calendar briefing.** Steady keeps the words you wrote for yourself organized by the moments that set you off ("Before a presentation", "Can't sleep"). It shows you one each day, and once a week it reads your Google Calendar and has Claude suggest your top 3 priorities, with a calm note.

**Live:** https://steady-lime.vercel.app

I built it because I get anxiety, and two things help: knowing what's coming this week, and having the right words ready for the hard moments. The full plan is in [PLAN.md](PLAN.md), including a Plan vs Reality table at the bottom.

## Features

| # | Feature | Where |
|---|---|---|
| 1 | **Sign up, log in, log out** with email + password | `/signup`, `/login` |
| 2 | **Triggers:** name the moments that are hard for you, each with an emoji | Triggers |
| 3 | **Affirmations:** write, list, open, edit, and delete (with "Are you sure?") | Affirmations |
| 4 | **Validation:** friendly amber messages for missing text, too-long text, duplicate trigger names | every form |
| 5 | **Stars:** star your strongest affirmations; see them all on one page | ☆ / ★, Starred |
| 6 | **Search, filter, sort:** search text, filter by trigger or starred, sort newest / oldest / A–Z | Affirmations |
| 7 | **Dashboard:** total, starred, top trigger, and a bar chart of affirmations per trigger | Home |
| 8 | **Affirmation of the day** *(custom):* one per day, starred first, plus "Give me another" | Home |
| 9 | **Weekly briefing** *(custom):* connect Google Calendar (read-only), pick a briefing day, see your next 7 days grouped by day | Settings, Your week |
| 10 | **AI prioritize + calm note** *(custom):* Claude suggests your top 3 priorities, which you can reorder, and writes a calm note quoting one of your affirmations | Your week |

## Tech stack

- **Next.js 16** (App Router, TypeScript, server actions) and **React 19**
- **Postgres** through **Drizzle ORM**: Supabase in production, PGlite locally. See [schema.md](schema.md).
- **Own auth:** bcrypt password hashes, session in an encrypted cookie (iron-session)
- **Tailwind CSS v4**, **Recharts** for the dashboard chart
- **Google Calendar API** (read-only, OAuth with plain `fetch`)
- **Anthropic API** (Claude Opus 5.5, structured outputs) via `@anthropic-ai/sdk`
- **Vitest** for tests
- **Vercel** hosting: every merge to `main` deploys automatically and runs database migrations first

## Run it locally

You need Node.js 20.12 or newer.

```bash
npm install
```

```bash
cp .env.example .env.local
```

Open `.env.local` and set `SESSION_SECRET` to at least 32 random characters. You can generate one with `openssl rand -base64 32`. Then start a local Postgres in one terminal:

```bash
npm run db:local
```

In a second terminal, create the tables and start the app:

```bash
npm run db:migrate
```

```bash
npm run dev
```

Open http://localhost:3000 and sign up.

### Environment variables

| name | needed for | where to get it |
|---|---|---|
| `DATABASE_URL` | locally | already set in `.env.example` for the local PGlite database |
| `POSTGRES_URL` | production | filled in automatically when Supabase is connected under Vercel → Storage |
| `SESSION_SECRET` | everything | any 32+ random characters |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | weekly briefing (optional) | Google Cloud → Credentials → OAuth client ID (Web). Redirect URI: `<site>/api/google/callback` |
| `ANTHROPIC_API_KEY` | AI prioritize (optional) | console.anthropic.com → API Keys |

Without the Google or Anthropic keys, those features say "isn't set up on this site yet" and everything else still works.

## Tests

```bash
npm test
```

Each test file gets a fresh in-memory Postgres with the real migrations, and calls the same query functions the pages use. It never touches live data. The two required tests are:

1. **Data isolation** (`tests/data-isolation.test.ts`): User B never sees User A's affirmation.
2. **Dashboard stat** (`tests/dashboard-stats.test.ts`): 3 + 1 affirmations with 2 starred gives total 4, starred 2, top trigger "Before a presentation".

[tests/README.md](tests/README.md) explains them in plain English, says what would break each one, and shows how to see each go red and green. The other test files check the daily pick, the briefing, and the AI plan rules. 21 tests in total.

## Project structure

```
src/
  app/
    (auth)/            sign up and log in pages
    (app)/             signed-in pages: Home, Affirmations, Starred, Triggers, Your week, Settings
    api/google/        Google sign-in start and callback
  db/schema.ts         the tables (see schema.md)
  lib/                 rules and data: auth, validation, dashboard, daily pick, calendar, Claude
drizzle/               numbered SQL migrations
scripts/migrate.ts     runs migrations (locally and on every Vercel deploy)
tests/                 Vitest tests
prompts/               a prompt log for every feature
```

## How it was built

Every change followed the same loop:

1. A **GitHub Issue** describing the feature.
2. A **branch**.
3. A **prompt log** in [`prompts/`](prompts/) recording the key prompts, the decisions the agent made, and how each feature was checked.
4. A **pull request** that says `closes #N`.
5. **I reviewed and merged** each PR, and Vercel deployed it.

Nothing was committed directly to `main` on purpose. The one exception was made by Replit's agent and is explained in [PLAN.md](PLAN.md#plan-vs-reality). The coding agent was **Claude Code**.
