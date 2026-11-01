# Prompt log: PLAN.md

Agent: Claude Code (Opus 5.5)

## 1. The idea

> I'm thinking I will build an affirmations app because I get anxiety. I want to build not just an affirmations app, but an app that tells me, every week on a specific day, all the things that are happening through that week. It looks at my calendar and my emails, gives me all the things that are happening, helps me prioritize, and also does affirmations. I can create affirmations through it.

The agent asked questions before writing anything. My answers:

| question | my choice |
|---|---|
| Where the week comes from | Google Calendar now, Gmail later (saved for the team project, which is about outside APIs) |
| How to prioritize | AI suggests a top 3, I can reorder |
| Stack | Next.js + Supabase + Vercel (changed later, see #3) |
| What affirmations are grouped by | Moods / triggers ("before a presentation", "can't sleep") |
| My 3 features | Weekly briefing, AI prioritize + calm note, affirmation of the day |
| Briefing day | User picks it in settings |
| Look and feel | Soft & calm, inspired by Calm and Headspace |

## 2. First draft

The agent wrote PLAN.md with all 7 sections. It flagged Google Calendar as the riskiest part (unverified-app warning, test users only) and put AI prioritization first on the cut list.

## 3. Switching hosting

> Instead of Supabase and Vercel, can we use Replit?

What changed:
- Database is now Replit PostgreSQL (Drizzle ORM).
- Login is our own email + password (bcrypt + encrypted cookie). The agent advised against Replit Auth because it makes visitors sign in with a Replit account, and the assignment wants sign-up inside the app.
- Data isolation now comes from server code filtering every query by user, not database row-level security.
- Deploys are manual on Replit, so this went into Risks.

Decision: Claude Code builds, Replit hosts.
