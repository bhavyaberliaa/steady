"use client";

import { useActionState, useOptimistic, useTransition } from "react";
import type { MyPlan } from "@/lib/weekly-plan";
import { makePlan, reorderPlan, type PlanState } from "./actions";

const BUTTON =
  "rounded-xl bg-sage px-4 py-2 font-semibold text-white transition hover:bg-sage-dark disabled:opacity-60";
const ARROW =
  "flex h-8 w-8 items-center justify-center rounded-full border border-border text-sm font-bold hover:bg-sage-light disabled:opacity-30 disabled:hover:bg-transparent";

// Claude's top 3 priorities and calm note for the week, above the calendar.
export function PlanPanel({
  plan,
  madeLabel,
  aiReady,
}: {
  plan: MyPlan | undefined;
  madeLabel: string;
  aiReady: boolean;
}) {
  const [state, formAction, pending] = useActionState<PlanState, FormData>(makePlan, {});

  const button = (label: string) => (
    <form action={formAction}>
      <button
        className={plan ? "font-semibold text-sage-dark hover:underline disabled:opacity-60" : BUTTON}
        disabled={pending || !aiReady}
      >
        {pending ? "Claude is reading your week…" : label}
      </button>
    </form>
  );

  return (
    <section aria-labelledby="plan-heading" className="space-y-4 rounded-3xl bg-lavender-light p-6">
      <h2 id="plan-heading" className="font-bold">
        ✨ Your top 3 this week
      </h2>

      {plan ? (
        <>
          <PriorityList priorities={plan.priorities} />
          <figure className="rounded-2xl bg-surface p-5">
            <p className="leading-relaxed">{plan.calmNote}</p>
            {plan.quoteText && (
              <blockquote className="mt-4 border-l-4 border-lavender pl-4">
                <p className="font-semibold">“{plan.quoteText}”</p>
                <footer className="mt-1 text-sm text-muted">
                  Your words, for {plan.quoteEmoji} {plan.quoteTrigger}
                </footer>
              </blockquote>
            )}
          </figure>
          <div className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
            <span>Made {madeLabel} ·</span>
            {button("Try again")}
          </div>
        </>
      ) : (
        <>
          <p className="text-muted">
            Let Claude read your next 7 days and suggest the 3 things that matter most, with a calm note that
            leans on one of your own affirmations.
          </p>
          {button("Help me prioritize")}
          {!aiReady && <p className="text-sm text-amber">The AI helper isn&apos;t set up on this site yet.</p>}
        </>
      )}

      {state.error && (
        <p role="alert" className="rounded-lg bg-amber-light px-3 py-2 text-sm text-amber">
          {state.error}
        </p>
      )}
    </section>
  );
}

function PriorityList({ priorities }: { priorities: MyPlan["priorities"] }) {
  // Positions in the saved list, in the order shown. Moves show at once, then save.
  const [order, setOrder] = useOptimistic([0, 1, 2]);
  const [, startTransition] = useTransition();

  function move(from: number, to: number) {
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    startTransition(async () => {
      setOrder(next);
      await reorderPlan(next);
    });
  }

  return (
    <ol className="space-y-2">
      {order.map((i, pos) => {
        const p = priorities[i];
        return (
          <li key={i} className="flex items-start gap-3 rounded-2xl bg-surface p-4">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-sm font-bold text-white">
              {pos + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.title}</p>
              <p className="mt-1 text-sm text-muted">{p.why}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                className={ARROW}
                onClick={() => move(pos, pos - 1)}
                disabled={pos === 0}
                aria-label={`Move “${p.title}” up`}
              >
                ↑
              </button>
              <button
                type="button"
                className={ARROW}
                onClick={() => move(pos, pos + 1)}
                disabled={pos === order.length - 1}
                aria-label={`Move “${p.title}” down`}
              >
                ↓
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
