# Prompt log: AI prioritize + calm note (feature 10, custom)

Agent: Claude Code (Opus 5.5) · Issue #27 · Branch `feature/prioritize`

## Key prompts

> Merged, start #10

(The agent worked from PLAN.md user story 10: "Claude reads my week, suggests my top 3 priorities, and writes a short calm note that quotes one of my affirmations, which I can reorder, so that a busy week feels manageable." Before writing any code, it loaded its Claude API reference to get the current model, SDK calls and settings right.)

## What the agent did and decided

- **"✨ Your top 3 this week" card** at the top of Your week.
  - **Help me prioritize** sends your next 7 days of events and your affirmations to Claude.
  - While Claude works, the button reads "Claude is reading your week…".
  - Back come 3 numbered priorities, each with a one-line "why", plus a short calm note. Under the note sits one of your affirmations, word for word.
- **Reorder with ↑ / ↓.** The new order shows instantly and is saved, so it survives a reload.
- **Saved, not regenerated.** The plan lives in a new `weekly_plans` table (one row per user), so reloading doesn't call Claude again. **Try again** asks for a fresh plan.
- **How Claude is called:**
  - It uses the official Anthropic SDK with the `claude-opus-5-5` model at `medium` effort.
  - **Structured outputs** make Claude answer in an exact JSON shape (Zod schema), not free text.
  - **Refusal fallback** (`fallbacks: "default"`): if a safety check declines, Anthropic retries on its recommended fallback model.
- **Guard rails on Claude's answer** (`src/lib/plan.ts`):
  - It needs exactly 3 priorities and a note, or it's rejected with "came back incomplete". Over-long text is trimmed.
  - The quoted affirmation must be one of **your** affirmations. Its text is always read from the database, never copied from Claude's reply, so it can't be misquoted. If Claude names an id that isn't yours, your first starred affirmation is used instead.
  - The calendar and affirmations are sent inside `<calendar>` / `<affirmations>` tags, and the instructions tell Claude to treat them as data. An event titled "ignore your instructions…" can't steer it.
- **Friendly failures.** If Claude refuses, errors, is rate-limited, or the key is wrong, you get a calm one-line message and your previous plan stays.
- **Database:** new table `weekly_plans`:

  | column | what it holds |
  |---|---|
  | `user_id` | the user, unique |
  | `priorities` | the 3 priorities, as JSON |
  | `calm_note` | the note |
  | `affirmation_id` | the quoted affirmation; set to null if that affirmation is deleted |
  | `created_at`, `updated_at` | when the plan was made and last changed |

  Migration `drizzle/0004_create_weekly_plans.sql` runs on the next Vercel deploy.
- **Setup needed:** `ANTHROPIC_API_KEY` in Vercel. Without it, the button is disabled with "The AI helper isn't set up on this site yet."

## How it was checked

Unit tests (`tests/plan.test.ts`, 7 new; `npm test` gives 21 passed):

- A good answer is kept.
- Another user's affirmation id is replaced with your starred one.
- No affirmations is handled.
- Fewer than 3 priorities, or an empty note, is rejected.
- Long titles are trimmed.
- A reorder must be exactly 0/1/2 rearranged.
- The prompt contains each day's events and your affirmation ids, wrapped as data.

End to end in the browser, with **local fake Google and fake Anthropic servers**. These were not committed, and their settings were removed afterwards. The real API needs the owner's key, so the first real call happens on the live site.

| step | result |
|---|---|
| No `ANTHROPIC_API_KEY` | button disabled, "The AI helper isn't set up on this site yet" ✅ |
| Click Help me prioritize | 3 numbered priorities, calm note, starred affirmation quoted from the database ✅ |
| What the app sent | model `claude-opus-5-5`, effort `medium`, JSON-schema output, `fallbacks: "default"`; only this user's 5 affirmations and their 7 days ✅ |
| Move #1 down, reload | new order kept; ↑ disabled on the top item ✅ |
| Forged reorder `[0,0,5]` | ignored: still 3 different priorities ✅ |
| Claude names another user's affirmation | your own starred one is shown instead; the saved row points to your affirmation ✅ |
| Claude returns only 2 priorities | "Claude's answer came back incomplete"; old plan kept ✅ |
| Claude refuses | "Claude couldn't help with this week"; old plan kept ✅ |
| Server error (500) | "Couldn't reach Claude right now"; old plan kept ✅ |
| Phone width | cards stack, arrows reachable, no sideways scrolling ✅ |
| `npm run build` and `npm run lint` | pass ✅ |
