"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "./actions";

const COPY = {
  signup: {
    title: "Create your space",
    subtitle: "A quiet place for your affirmations and your week.",
    button: "Sign up",
    pending: "Creating your account…",
    switchText: "Already have an account?",
    switchLink: "Log in",
    switchHref: "/login",
  },
  login: {
    // Most people who land here are new, so say what Steady is, not "Welcome back".
    title: "Log in to Steady",
    subtitle: "A quiet place for the affirmations you write for hard moments, and a calm look at your week.",
    button: "Log in",
    pending: "Logging in…",
    switchText: "First time here?",
    switchLink: "Create a free account",
    switchHref: "/signup",
  },
};

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "signup" ? signup : login,
    {},
  );
  const copy = COPY[mode];

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-wide text-sage">Steady</p>
        <h1 className="mt-2 text-2xl font-bold">{copy.title}</h1>
        <p className="mt-1 text-muted">{copy.subtitle}</p>

        <form action={formAction} className="mt-6 space-y-4" noValidate>
          <label className="block">
            <span className="text-sm font-semibold">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.email}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-sage focus:ring-2 focus:ring-sage-light"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Password</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-sage focus:ring-2 focus:ring-sage-light"
            />
            {mode === "signup" && (
              <span className="mt-1 block text-xs text-muted">At least 8 characters.</span>
            )}
          </label>

          {state.error && (
            <p role="alert" className="rounded-xl bg-amber-light px-3 py-2 text-sm text-amber">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-sage px-4 py-2.5 font-semibold text-white transition hover:bg-sage-dark disabled:opacity-60"
          >
            {pending ? copy.pending : copy.button}
          </button>
        </form>

        {mode === "login" ? (
          // A full-size button, so first-time visitors don't miss it.
          <div className="mt-6 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted">{copy.switchText}</p>
            <Link
              href={copy.switchHref}
              className="mt-2 block w-full rounded-xl border-2 border-sage px-4 py-2.5 font-semibold text-sage-dark transition hover:bg-sage-light"
            >
              {copy.switchLink}
            </Link>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-muted">
            {copy.switchText}{" "}
            <Link href={copy.switchHref} className="font-semibold text-sage-dark hover:underline">
              {copy.switchLink}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
