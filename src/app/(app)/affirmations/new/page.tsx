import { requireUser } from "@/lib/auth";
import { TriggerForm } from "../../triggers/trigger-form";
import { AffirmationForm } from "../affirmation-form";
import { getMyTriggers } from "../data";

export default async function NewAffirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ trigger?: string | string[] }>;
}) {
  const user = await requireUser();
  const [triggers, params] = await Promise.all([getMyTriggers(user.id), searchParams]);

  // Pre-pick the trigger from "Now write an affirmation for it →", or the only one there is.
  // Only ever one of this user's own triggers.
  const asked = triggers.find((t) => t.id === params.trigger);
  const defaultTriggerId = asked?.id ?? (triggers.length === 1 ? triggers[0].id : undefined);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New affirmation</h1>
      {triggers.length === 0 ? (
        // First time here: add a trigger right on this page instead of sending people away.
        <section className="rounded-3xl bg-lavender-light p-6">
          <p className="text-sm font-semibold text-sage-dark">Step 1 of 2</p>
          <h2 className="mt-1 font-bold">When will you need these words?</h2>
          <p className="mt-1 mb-4 text-muted">
            Name a moment that&apos;s hard for you, like &ldquo;Before a presentation&rdquo; or &ldquo;Can&apos;t
            sleep&rdquo;. Steady calls these <strong>triggers</strong> and groups your affirmations by them.
          </p>
          <TriggerForm mode="create" />
        </section>
      ) : (
        <div className="rounded-3xl border border-border bg-surface p-6">
          <AffirmationForm triggers={triggers} defaultTriggerId={defaultTriggerId} />
        </div>
      )}
    </div>
  );
}
