import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AffirmationForm } from "../affirmation-form";
import { getMyTriggers } from "../data";

export default async function NewAffirmationPage() {
  const user = await requireUser();
  const triggers = await getMyTriggers(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New affirmation</h1>
      {triggers.length === 0 ? (
        <p className="rounded-3xl bg-lavender-light p-8 text-muted">
          Every affirmation belongs to a trigger. Add one on the{" "}
          <Link href="/triggers" className="font-semibold text-sage-dark hover:underline">
            Triggers
          </Link>{" "}
          page first.
        </p>
      ) : (
        <div className="rounded-3xl border border-border bg-surface p-6">
          <AffirmationForm triggers={triggers} />
        </div>
      )}
    </div>
  );
}
