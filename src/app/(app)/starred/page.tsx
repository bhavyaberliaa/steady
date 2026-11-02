import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AffirmationList } from "../affirmations/affirmation-list";
import { listMyAffirmations } from "../affirmations/data";

export default async function StarredPage() {
  const user = await requireUser();
  const starred = await listMyAffirmations(user.id, { starredOnly: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Starred ★</h1>
        <p className="mt-1 text-muted">Your strongest ones, one tap away.</p>
      </div>

      {starred.length === 0 ? (
        <p className="rounded-3xl bg-lavender-light p-8 text-center text-muted">
          No stars yet. Tap ☆ on any affirmation that really works for you, on the{" "}
          <Link href="/affirmations" className="font-semibold text-sage-dark hover:underline">
            Affirmations
          </Link>{" "}
          page.
        </p>
      ) : (
        <AffirmationList items={starred} />
      )}
    </div>
  );
}
