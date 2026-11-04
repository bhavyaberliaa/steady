# Prompt log: Weekly briefing (feature 9, custom)

Agent: Claude Code (Opus 5.5) · Issue #25 · Branch `feature/briefing`

## Key prompts

> Merged, start #9

(The agent worked from PLAN.md user story 9: "connect Google Calendar and pick my briefing day in settings, so that on that day the app shows a 'Your week' page with every event from the next 7 days, grouped by day.")

## What the agent did and decided

- **New Settings page** (in the header). It has two parts:
  - **Google Calendar:** a Connect button, or Disconnect once you're connected.
  - **Briefing day:** pick Sunday through Saturday.
- **New "Your week" page:** the next 7 days, starting today, each listing its events:
  - Times are shown in your calendar's own timezone.
  - All-day events come first, then timed ones in order.
  - Multi-day all-day events appear on every day they cover.
  - Cancelled events are hidden.
  - Empty days say "Nothing scheduled."
- **On your briefing day,** Home shows a green "🗓️ It's your briefing day" card linking to Your week. Your week is also always in the header, so you can check it on other days too. That's a small change from the plan, which only mentions the briefing day.
- **Google sign-in (OAuth) with plain `fetch`,** no extra packages:
  - Steady asks only for **read-only** calendar access (`calendar.readonly`).
  - A random one-time "state" value is kept in the encrypted login cookie and checked when Google sends you back. A reply that didn't start in your browser is refused.
  - The refresh token is **encrypted (AES-256-GCM) before it's saved** in `users.google_refresh_token`. A copied database row alone can't read anyone's calendar.
  - **Disconnect** deletes our copy and tells Google to revoke it.
  - If Google stops accepting the token (you removed access, or it expired), Your week says "please connect it again" and clears the dead token.
  - If you say no on Google's page, Settings shows a gentle message.
- **No database changes:** `briefing_day` and `google_refresh_token` were already in the `users` table from PLAN.md.
- **Header wraps on phones** now that it has two more links. This also fixes the header being cut off on narrow screens.
- **Setup needed:** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must be set in Vercel. They're documented in `.env.example`. Without them, Settings says Google sign-in isn't set up instead of breaking.

## How it was checked

Unit tests (`tests/briefing.test.ts`, 6 new; `npm test` gives 14 passed):

- 7 days starting today in the calendar's timezone.
- Events on the right day and in time order, including a 10:30pm event that is already the next day in UTC.
- Multi-day and cancelled events.
- Today's weekday in your timezone.
- Briefing day input accepts only 0–6.
- The encrypted token reads back only with the right secret, and tampering is detected.

End to end in the browser, against a **fake Google server** run locally. The real Google needs the owner's own credentials. The fake server wasn't committed, and its settings were removed afterwards.

| step | result |
|---|---|
| No Google credentials set | Settings: "Google sign-in isn't set up on this site yet"; Your week: "Connect Google Calendar on the Settings page" ✅ |
| Connect, then say **no** on Google's page | back on Settings: "No problem: Google Calendar wasn't connected" ✅ |
| Connect, then say **yes** | lands on Your week: 5 events over 7 days, cancelled one hidden, "times in America/New York" ✅ |
| Look at the database row | token is encrypted; the real value isn't in it ✅ |
| Open the callback URL with a made-up state | refused: "Connecting to Google didn't work" ✅ |
| Set briefing day to Wednesday (today) | "Saved"; Home shows the briefing card ✅ |
| Send briefing day `9` (edited form) | "Please pick a day of the week"; still Wednesday ✅ |
| Google rejects the token | Your week: "Google stopped sharing your calendar… connect it again"; Settings shows Connect again ✅ |
| Reconnect, then Disconnect | "Disconnected"; Google got the revoke request; briefing card gone ✅ |
| Phone width | header wraps, no sideways scrolling ✅ |
| `npm run build` and `npm run lint` | pass ✅ |
