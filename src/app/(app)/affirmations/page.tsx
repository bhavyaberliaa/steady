import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, triggers } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export default async function AffirmationsPage() {
  const user = await requireUser();
  const mine = await db
    .select({
      id: affirmations.id,
      text: affirmations.text,
      triggerName: triggers.name,
      triggerEmoji: triggers.emoji,
    })
    .from(affirmations)
    .innerJoin(triggers, eq(triggers.id, affirmations.triggerId))
    .where(eq(affirmations.userId, user.id))
    .orderBy(desc(affirmations.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Affirmations</h1>
          <p className="mt-1 text-muted">Words you wrote for the hard moments.</p>
        </div>
        <Link
          href="/affirmations/new"
          className="rounded-xl bg-sage px-4 py-2 font-semibold text-white transition hover:bg-sage-dark"
        >
          + New affirmation
        </Link>
      </div>

      {mine.length === 0 ? (
        <p className="rounded-3xl bg-lavender-light p-8 text-center text-muted">
          Nothing here yet. Write your first one: something true you&apos;d want to hear on a hard day.
        </p>
      ) : (
        <ul className="space-y-3">
          {mine.map((a) => (
            <li key={a.id}>
              <Link
                href={`/affirmations/${a.id}`}
                className="block rounded-2xl border border-border bg-surface p-5 transition hover:border-sage"
              >
                <p className="text-lg">{a.text}</p>
                <p className="mt-2 text-sm text-muted">
                  {a.triggerEmoji} {a.triggerName}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
