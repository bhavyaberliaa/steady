import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AffirmationList } from "./affirmation-list";
import { listMyAffirmations } from "./data";

export default async function AffirmationsPage() {
  const user = await requireUser();
  const mine = await listMyAffirmations(user.id);

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
        <AffirmationList items={mine} />
      )}
    </div>
  );
}
