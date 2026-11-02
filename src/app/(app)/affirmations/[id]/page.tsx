import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmDelete } from "@/components/confirm-delete";
import { requireUser } from "@/lib/auth";
import { deleteAffirmation } from "../actions";
import { getMyAffirmation } from "../data";

const DATE = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function shorten(text: string) {
  return text.length > 40 ? `${text.slice(0, 40).trimEnd()}…` : text;
}

export default async function AffirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const affirmation = await getMyAffirmation(user.id, id);
  if (!affirmation) notFound();

  return (
    <div className="space-y-6">
      <Link href="/affirmations" className="text-sm font-semibold text-muted hover:text-sage-dark">
        ← All affirmations
      </Link>

      <article className="rounded-3xl bg-lavender-light p-8">
        <p className="text-sm font-semibold text-muted">
          {affirmation.triggerEmoji} {affirmation.triggerName}
        </p>
        <p className="mt-3 text-2xl font-bold leading-snug">{affirmation.text}</p>
        {affirmation.note && (
          <p className="mt-4 border-l-4 border-lavender pl-3 text-muted">{affirmation.note}</p>
        )}
        <p className="mt-6 text-xs text-muted">Written {DATE.format(affirmation.createdAt)}</p>
      </article>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/affirmations/${affirmation.id}/edit`}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold hover:bg-sage-light"
        >
          Edit
        </Link>
        <ConfirmDelete action={deleteAffirmation} id={affirmation.id} label={shorten(affirmation.text)} />
      </div>
    </div>
  );
}
