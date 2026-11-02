import Link from "next/link";
import type { AffirmationListItem } from "./affirmations/data";

// Today's affirmation, big and calm, at the top of Home.
export function DailyCard({
  affirmation,
  step,
  total,
}: {
  affirmation: AffirmationListItem;
  step: number;
  total: number;
}) {
  return (
    <section aria-labelledby="daily-heading" className="rounded-3xl bg-lavender-light p-8">
      <h1 id="daily-heading" className="text-sm font-semibold text-muted">
        {step === 0 ? "Your affirmation for today" : "Another one for you"}
        {affirmation.starred && <span aria-label="starred"> · ★</span>}
      </h1>

      <blockquote aria-live="polite" className="mt-3">
        <p className="text-2xl font-bold leading-snug">“{affirmation.text}”</p>
        <footer className="mt-3 text-sm text-muted">
          {affirmation.triggerEmoji} {affirmation.triggerName}
        </footer>
      </blockquote>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {total > 1 && (
          <Link
            href={`/?another=${step + 1}`}
            scroll={false}
            className="rounded-xl bg-sage px-4 py-2 font-semibold text-white transition hover:bg-sage-dark"
          >
            Give me another
          </Link>
        )}
        <Link href={`/affirmations/${affirmation.id}`} className="font-semibold text-sage-dark hover:underline">
          Open it
        </Link>
      </div>
    </section>
  );
}
