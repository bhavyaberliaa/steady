import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, triggers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { TriggerForm } from "./trigger-form";
import { TriggerRow } from "./trigger-row";

export default async function TriggersPage() {
  const user = await requireUser();
  const mine = await db
    .select({
      id: triggers.id,
      name: triggers.name,
      emoji: triggers.emoji,
      affirmationCount: count(affirmations.id),
    })
    .from(triggers)
    .leftJoin(affirmations, eq(affirmations.triggerId, triggers.id))
    .where(eq(triggers.userId, user.id))
    .groupBy(triggers.id)
    .orderBy(asc(triggers.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Triggers</h1>
        <p className="mt-1 text-muted">
          A trigger is a moment that&apos;s hard for you, like &ldquo;Before a presentation&rdquo; or &ldquo;Can&apos;t
          sleep&rdquo;. Each affirmation you write belongs to one, so the right words are easy to find when that
          moment comes.
        </p>
      </div>

      <section className="rounded-3xl bg-lavender-light p-6">
        <h2 className="mb-3 font-bold">Add a trigger</h2>
        <TriggerForm mode="create" />
      </section>

      {mine.length === 0 ? (
        <p className="text-center text-muted">No triggers yet. Add your first one above.</p>
      ) : (
        <ul className="space-y-2">
          {mine.map((trigger) => (
            <TriggerRow key={trigger.id} trigger={trigger} />
          ))}
        </ul>
      )}
    </div>
  );
}
