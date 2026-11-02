# Tests

Run them with:

```bash
npm test
```

Each test file gets its own brand-new, empty Postgres database that lives only in memory (PGlite). It runs the same migrations as Vercel. The tests call the real query functions the pages use, so they check what users actually see. They never touch the live Supabase data.

## Test 1: Data isolation (`data-isolation.test.ts`)

**In plain English:** User A writes "I have handled hard weeks before". User B signs up. When B opens their affirmations list, it must be empty. A's words must not be in it, even if B searches for them or asks for A's affirmation by its id. As a sanity check, A still sees their own affirmation, so the test can't pass just because nothing loads.

**Why it matters:** this is the app's main privacy promise. Affirmations are personal, and a stranger must never see yours.

**What would break it:** removing the `eq(affirmations.userId, userId)` line from `listMyAffirmations` in `src/app/(app)/affirmations/data.ts`. That line is the "only my rows" filter. Without it, User B's list comes back with User A's affirmation in it, and the test fails with `expected [ { …(5) } ] to deeply equal []`.

## Test 2: Dashboard stat (`dashboard-stats.test.ts`)

**In plain English:** a user has 3 affirmations under "Before a presentation" and 1 under "Can't sleep", and has starred 2 of them. A second user also has an affirmation and a star, which must not be counted. When the dashboard numbers are calculated, they must be total = 4, starred = 2, top trigger = "Before a presentation", and the chart gets 1 bar for "Can't sleep" and 3 for "Before a presentation".

**Why it matters:** the dashboard is only useful if its numbers are true, and only true for *you*.

**What would break it:** removing the `.where(...)` on the starred count in `src/lib/dashboard.ts`. The count then includes every user's stars, so it says 3 instead of 2, and the test fails with `expected 3 to be 2`.

## Reproducing red and green (for the screenshots)

1. **Green:** run `npm test`. You'll see `2 passed`.
2. **Red, test 1:** in `src/app/(app)/affirmations/data.ts`, put `//` in front of the line `eq(affirmations.userId, userId),` inside `listMyAffirmations`. Run `npm test`. Test 1 fails.
3. **Red, test 2:** undo step 2. In `src/lib/dashboard.ts`, delete the line `.where(and(eq(stars.userId, userId), eq(affirmations.userId, userId))),`. Run `npm test`. Test 2 fails with `expected 3 to be 2`.
4. Undo the change (or run `git checkout -- src`) and run `npm test` again to get back to green.
