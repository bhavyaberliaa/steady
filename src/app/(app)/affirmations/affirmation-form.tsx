"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { FieldError } from "@/components/field-error";
import { AFFIRMATION_MAX } from "@/lib/validation";
import { createAffirmation, updateAffirmation, type AffirmationState } from "./actions";

type TriggerOption = { id: string; name: string; emoji: string };
type Existing = { id: string; text: string; note: string | null; triggerId: string };

const FIELD =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-sage focus:ring-2 focus:ring-sage-light aria-invalid:border-amber";

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
  // After a failed save, show what was typed; otherwise the saved values (or blanks).
  const values = state.values ?? {
    text: existing?.text ?? "",
    triggerId: existing?.triggerId ?? "",
    note: existing?.note ?? "",
  };
  const errors = state.errors ?? {};

  return (
    // noValidate: the server's friendly messages replace the browser's pop-ups.
    <form key={state.attempt} action={formAction} className="space-y-4" noValidate>
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <TextField defaultValue={values.text} error={errors.text} />

      <label className="block">
        <span className="text-sm font-semibold">Trigger</span>
        <select
          name="triggerId"
          defaultValue={values.triggerId}
          aria-invalid={Boolean(errors.triggerId)}
          aria-describedby={errors.triggerId ? "triggerId-error" : undefined}
          className={FIELD}
        >
          <option value="" disabled>
            Choose the moment this helps with…
          </option>
          {triggers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.emoji} {t.name}
            </option>
          ))}
        </select>
        <FieldError id="triggerId-error" message={errors.triggerId} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold">
          Why this helps <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea
          name="note"
          rows={2}
          defaultValue={values.note}
          placeholder="A reminder to future you"
          aria-invalid={Boolean(errors.note)}
          aria-describedby={errors.note ? "note-error" : undefined}
          className={FIELD}
        />
        <FieldError id="note-error" message={errors.note} />
      </label>

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

// The affirmation text, with a live "n / 280" counter that turns amber past the limit.
function TextField({ defaultValue, error }: { defaultValue: string; error?: string }) {
  const [length, setLength] = useState(defaultValue.length);
  const over = length > AFFIRMATION_MAX;

  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">Affirmation</span>
        <span className={`text-xs ${over ? "font-semibold text-amber" : "text-muted"}`} aria-live="polite">
          {length} / {AFFIRMATION_MAX}
        </span>
      </span>
      <textarea
        name="text"
        rows={3}
        defaultValue={defaultValue}
        onChange={(event) => setLength(event.target.value.length)}
        placeholder="e.g. I have handled hard weeks before."
        aria-invalid={Boolean(error) || over}
        aria-describedby={error ? "text-error" : undefined}
        className={FIELD}
      />
      <FieldError id="text-error" message={error} />
    </label>
  );
}
