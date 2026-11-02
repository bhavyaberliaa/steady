"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createAffirmation, updateAffirmation, type AffirmationState } from "./actions";

type TriggerOption = { id: string; name: string; emoji: string };
type Existing = { id: string; text: string; note: string | null; triggerId: string };

const FIELD =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-sage focus:ring-2 focus:ring-sage-light";

export function AffirmationForm({
  triggers,
  existing,
}: {
  triggers: TriggerOption[];
  existing?: Existing;
}) {
  const [state, formAction, pending] = useActionState<AffirmationState, FormData>(
    existing ? updateAffirmation : createAffirmation,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <label className="block">
        <span className="text-sm font-semibold">Affirmation</span>
        <textarea
          name="text"
          rows={3}
          required
          maxLength={280}
          defaultValue={existing?.text}
          placeholder="e.g. I have handled hard weeks before."
          className={FIELD}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold">Trigger</span>
        <select name="triggerId" required defaultValue={existing?.triggerId ?? ""} className={FIELD}>
          <option value="" disabled>
            Choose the moment this helps with…
          </option>
          {triggers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.emoji} {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold">
          Why this helps <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea
          name="note"
          rows={2}
          defaultValue={existing?.note ?? ""}
          placeholder="A reminder to future you"
          className={FIELD}
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-amber-light px-3 py-2 text-sm text-amber">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-sage px-4 py-2 font-semibold text-white transition hover:bg-sage-dark disabled:opacity-60"
        >
          {pending ? "Saving…" : existing ? "Save changes" : "Save affirmation"}
        </button>
        <Link
          href={existing ? `/affirmations/${existing.id}` : "/affirmations"}
          className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-sage-light"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
