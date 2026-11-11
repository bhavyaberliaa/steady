# Prompt log: Stranger-test fix 2, a first screen for new visitors

Agent: Claude Code (Opus 5.5) · Issue #35 · Branch `fix/first-screen`

## Key prompts

> actually my friend did get studck on point A, B, C, E
> My roomates looked at it 2 of them same issues.
> Can you build PRs to help fix 2 issues

Point E: opening the live URL lands a new visitor on Log in, titled "Welcome back". Nothing says what Steady is, and "Create an account" is a small line at the bottom.

## What the agent did and decided

- **Title** "Welcome back" → **"Log in to Steady"**. It's true for returning users and doesn't confuse new ones.
- **One line on what Steady is:** "A quiet place for the affirmations you write for hard moments, and a calm look at your week."
- **"Create a free account" is now a full-width outlined button** under a divider with "First time here?", instead of a small text link. "Log in" stays the filled main button, so returning users see no change in how they log in.
- **Kept logged-out visitors going to Log in** rather than switching them to Sign up. Returning users would otherwise land on a sign-up form every time their 30-day session ends. The bigger button solves the problem without that cost.
- The Sign up page is unchanged; it already explains Steady.

## How it was checked

At phone width (375 px) on a local copy:

| step | result |
|---|---|
| Log out, open `/` | lands on "Log in to Steady" with the description ✅ |
| "Create a free account" | full-width button, goes to `/signup` ✅ |
| Log in with an existing test account | goes to Home as before ✅ |
| `npm test`, `npm run lint`, type check | pass ✅ |
