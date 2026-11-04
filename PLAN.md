# PLAN.md — Steady

## 1. Pitch

I'm building **Steady**, an affirmations app with a weekly briefing, because I get anxiety, and two things help: knowing what's coming this week, and having the right words ready for the moments that set me off. Steady keeps my own affirmations organized by the situation they're for ("before a presentation", "can't sleep"), and once a week, on the day I pick, it pulls my week from Google Calendar, suggests what to focus on first, and pairs it with one of my affirmations.

**How often:** I'll open it most days for the affirmation of the day, reach for it in anxious moments, and read the briefing once a week.

## 2. Features

Built in this order, one PR each.

1. **Sign up and login.** As a new visitor, I want to create an account with my email and a password, then log in and log out, so that my affirmations are private to me.
2. **Moods / triggers (data model).** As a user, I want to create triggers such as "Before a presentation" or "Can't sleep", each with a name and an emoji, so that I can group affirmations by the situation they help with.
3. **Affirmations CRUD.** As a user, I want to write an affirmation (text, the trigger it's for, an optional note on why it helps), see all mine in a list, open one on its own page, edit it, and delete it after an "Are you sure?" prompt, so that my collection stays the way I want it.
4. **Validation.** As a user, if I try to save an affirmation with no text or no trigger, or a trigger with no name, I want a friendly message telling me what's missing, so that I don't save empty entries by accident.
5. **Stars.** As a user, I want to star the affirmations that work best for me and open a "Starred" view, so that my strongest ones are one tap away.
6. **Find things.** As a user, I want to search affirmations by text, filter by trigger or starred, and sort by newest, oldest, or A–Z, so that I can find the right one in an anxious moment.
7. **Dashboard.** As a user, I want a dashboard showing my total affirmations, how many I've starred, and the trigger I've written the most for, plus a bar chart of affirmations per trigger, so that I can see where I'm putting my energy.
8. **Affirmation of the day (mine).** As a user, I want the home page to show one affirmation each day, chosen at random with starred ones picked first, plus a "Give me another" button, so that I start the day with something I wrote for myself.
9. **Weekly briefing (mine).** As a user, I want to connect Google Calendar and pick my briefing day in settings, so that on that day the app shows a "Your week" page with every event from the next 7 days, grouped by day.
10. **AI prioritize + calm note (mine).** As a user, I want Claude to read my week, suggest my top 3 priorities, and write a short calm note that quotes one of my affirmations, which I can reorder, so that a busy week feels manageable.

## 3. Database

Replit's built-in PostgreSQL database. Every table except `users` has a `user_id`, and every query the server runs filters by the logged-in user's id, so each user can only read and write their own rows.

**users**

| column | type | notes |
|---|---|---|
| id | text (uuid) | **primary key** |
| email | text | required, unique |
| password_hash | text | bcrypt hash, never the real password |
| display_name | text | |
| briefing_day | number | 0 = Sunday … 6 = Saturday, default 0 |
| google_refresh_token | text | set only after connecting Google Calendar |
| created_at | date | |

**triggers**

| column | type | notes |
|---|---|---|
| id | text (uuid) | **primary key** |
| user_id | text (uuid) | → users.id |
| name | text | required, e.g. "Can't sleep" |
| emoji | text | e.g. 🌙 |
| created_at | date | |

**affirmations**

| column | type | notes |
|---|---|---|
| id | text (uuid) | **primary key** |
| user_id | text (uuid) | → users.id |
| trigger_id | text (uuid) | → triggers.id, required |
| text | text | required, max 280 characters |
| note | text | optional, "why this helps" |
| created_at | date | |
| updated_at | date | |

**stars** (junction table)

| column | type | notes |
|---|---|---|
| user_id | text (uuid) | → users.id, part of **primary key** |
| affirmation_id | text (uuid) | → affirmations.id, part of **primary key** |
| created_at | date | |

**weekly_briefings**

| column | type | notes |
|---|---|---|
| id | text (uuid) | **primary key** |
| user_id | text (uuid) | → users.id |
| week_start | date | one briefing per user per week |
| events | text (JSON) | the week's calendar events |
| priorities | text (JSON) | ordered top-3, editable |
| calm_note | text | written by Claude |
| affirmation_id | text (uuid) | → affirmations.id, the one quoted |
| created_at | date | |

**Relationships**

- users 1 → many triggers
- triggers 1 → many affirmations (each affirmation has exactly one trigger)
- users ↔ affirmations, many-to-many through **stars**
- users 1 → many weekly_briefings; each briefing quotes 1 affirmation

```mermaid
erDiagram
  users ||--o{ triggers : creates
  users ||--o{ affirmations : writes
  triggers ||--o{ affirmations : groups
  users ||--o{ stars : gives
  affirmations ||--o{ stars : receives
  users ||--o{ weekly_briefings : gets
  affirmations ||--o{ weekly_briefings : "quoted in"
```

## 4. Tests

1. **Data isolation.** Given User A has written the affirmation "I have handled hard weeks before" and User B has a new account, when User B logs in and loads their affirmations list, then the list is empty and User A's affirmation is not returned.
2. **Dashboard stat.** Given a user has 3 affirmations under "Before a presentation" and 1 under "Can't sleep", and has starred 2 of them, when the dashboard stats are calculated, then total = 4, starred = 2, and top trigger = "Before a presentation".

## 5. Technologies

| what | choice | why |
|---|---|---|
| Coding agent | Claude Code | It works directly in my repo and can run git and the GitHub CLI for the issue → branch → PR loop. |
| Framework | Next.js (App Router, TypeScript) | One project for pages and server code, and it runs on Replit as a normal Node app. |
| Database | Replit PostgreSQL, via Drizzle ORM | Built into Replit, real relational tables; Drizzle keeps the schema in code so it's easy to compare with this plan. |
| Sign up / login | My own email + password: bcrypt-hashed passwords, login kept in an encrypted cookie (iron-session) | Any visitor can sign up inside the app without needing a Replit or Google account, and every account is a row in my `users` table. |
| Hosting | Replit Deployments | Database, secrets and hosting in one place; the Replit project is linked to my GitHub repo, and after each merge I pull `main` and redeploy. |
| Calendar | Google Calendar API (read-only), via `googleapis` | Where my week actually lives; read-only access is all the briefing needs. Connecting Google is optional and separate from login. |
| AI | Anthropic API (Claude) | Turns a list of events into a short, kind, ranked plan. |
| Charts | Recharts | Simple React charts for the dashboard. |
| Styling | Tailwind CSS | Fast to build a consistent soft look. |
| Tests | Vitest | Fast, simple test runner that works with TypeScript. |

## 6. Design

Soft and calm. Muted sage green as the main color, lavender for accents, warm off-white background, rounded cards with lots of whitespace, a gentle rounded sans-serif font. Nothing red or alarming: error messages are soft amber and worded kindly ("Add a few words first"). Inspiration: **Calm** (quiet color, one thing per screen) and **Headspace** (friendly, rounded, encouraging).

## 7. Risks and cuts

- **Least sure I can build:** the Google Calendar connection. Google shows an "unverified app" warning, and only accounts I add as test users can connect, so a stranger may not be able to use the briefing.
- **Deploys are manual:** Replit doesn't redeploy on every merge the way Vercel would, so the live URL can fall behind `main`. I'll redeploy after every merged PR.
- **Cut first:** AI prioritization (feature 10). If time runs short, the briefing shows my week without Claude's ranking, and I swap in a simpler third feature (anxiety check-in).
- **Also cut if needed:** the user-picked briefing day becomes fixed to Sunday.
- **Not doing now:** Gmail. Reading email is planned for the team project, which is about connecting outside APIs.

---

## Plan vs Reality

*Added after the build (Issue #29). Everything above this line is the original plan, unchanged.*

**Hosting and process**

| area | planned | what actually happened | why |
|---|---|---|---|
| Hosting | Replit Deployments, redeploy by hand after each merge | **Vercel**, which deploys automatically on every merge to `main` and runs database migrations first (PR #6) | Replit refused to publish: "maximum number of Autoscale deployments" on the free plan. |
| Database | Replit PostgreSQL | **Supabase Postgres**, connected through Vercel → Storage so the connection string (`POSTGRES_URL`) is filled in automatically; **PGlite** locally (PRs #6, #8, #10) | Followed the hosting move. The first deploy failed on a mistyped password; connecting through Storage means nobody copies a password by hand. |
| Deploy risk | "The live URL can fall behind `main`" | Gone: every merge deploys by itself | Vercel instead of Replit |
| One PR per feature, nothing straight to `main` | yes | One commit landed on `main` without a PR: `fb7cd17 Add Replit configuration file`, authored by **Replit Agent**, made when the repo was imported into Replit. I didn't rewrite history; PR #6 removed the file and I disconnected Replit from the repo. | Replit's agent pushes directly when it sets up a project. |
| A duplicate Vercel project | — | Re-importing the repo created a second Vercel project (`steady-be9x`) without the database, which fails on every merge. The real site is the `steady` project. | My mistake while setting up. Delete the duplicate. |

**Features**

| # | feature | planned | what actually happened |
|---|---|---|---|
| 1 | Sign up and login | email + password, bcrypt, iron-session | As planned (PR #4). |
| 2 | Triggers | name + emoji | As planned, plus an emoji picker. A trigger can only be deleted when no affirmations use it: the database restricts it, and the app shows "In use" instead of Delete (PR #12). |
| 3 | Affirmations CRUD | text, trigger, note; list, detail, edit, delete with "Are you sure?" | As planned (PR #14). Opening another user's affirmation by URL shows "not found". |
| 4 | Validation | missing text, trigger or name | **More rules than planned** (PR #16): text up to 280 characters with a live counter, note up to 500, trigger names up to 40 and no duplicates per user (case-insensitive), only your own trigger can be picked. All checked on the server; messages are soft amber as planned. |
| 5 | Stars | star + Starred view | As planned (PR #18). The star fills instantly, then saves. |
| 6 | Find things | search, filter by trigger or starred, sort | As planned (PR #20). Choices are kept in the URL, so reload and Back work. |
| 7 | Dashboard | total, starred, top trigger, bar chart | As planned, on the Home page (PR #22). Horizontal bars so trigger names stay readable on phones. |
| 8 | Affirmation of the day | random, starred first, "Give me another" | As planned (PR #24). "Random" is a fixed shuffle per user per day in their timezone, so it stays the same all day, and "Give me another" shows every affirmation once before repeating. |
| 9 | Weekly briefing | connect Google, pick a day; Your week shows on that day | Built (PR #26), with two changes. **Your week is always in the header**, and on the briefing day Home shows a "It's your briefing day" card linking to it. I used **plain `fetch` instead of the `googleapis` package**. Also added: the Google token is encrypted before it's stored, Disconnect revokes it with Google, and an expired token asks you to reconnect. |
| 10 | AI prioritize + calm note | Claude ranks top 3, calm note quotes an affirmation, reorderable | Built, **not cut** (PR #28). Claude Opus 5.5 with structured outputs. The quoted affirmation is always the user's own, read from the database. ↑ / ↓ reorder is saved. |

**Database**

| planned | reality | why |
|---|---|---|
| `users`, `triggers`, `affirmations`, `stars` | Built as planned. Extra rules: `affirmations.text` is `varchar(280)`; deleting a trigger is restricted; deleting a user cascades. | |
| `weekly_briefings` with `week_start`, `events` JSON, `priorities`, `calm_note`, `affirmation_id`, one per user per week | **`weekly_plans`**: one row per user (latest plan), `priorities` as JSON, `calm_note`, `affirmation_id`. **No `events` or `week_start` column.** | Events are fetched live from Google each time, so they're never stale and never stored. Keeping only the latest plan was enough for "Try again" and reordering. See [schema.md](schema.md). |

**Tests**

| planned | reality |
|---|---|
| 2 tests: data isolation, dashboard stat | Both built with Vitest against a real in-memory Postgres (PR #22), each seen red and green; explained in [tests/README.md](tests/README.md). Later features added 19 more small tests (daily pick, briefing, AI plan rules): **21 in total**. |

**Risks and cuts**

| planned | reality |
|---|---|
| Google Calendar might be the hardest part; unverified-app warning; only test users can connect | Still true: Google shows the unverified warning, and only accounts added as test users can connect. In test mode Google also expires the connection after 7 days. The app handles that with a "connect it again" message. |
| Cut AI prioritization first if short on time | Not needed: all 10 features shipped. |
| Briefing day might become fixed to Sunday | Not needed: the briefing day is chosen in Settings. |
| No Gmail | Still not done, as planned. |

**Unplanned extras:** the header wraps on phones (PR #26); a `scripts/migrate.ts` that prints the real database error when a deploy fails (PR #8).
