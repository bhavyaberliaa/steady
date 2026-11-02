"use client";

import { useState } from "react";

// A delete button that asks "Are you sure?" before submitting.
export function ConfirmDelete({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
}) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="rounded-full px-3 py-1 text-sm font-semibold text-muted hover:bg-amber-light hover:text-amber"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2 text-sm" role="alertdialog" aria-label={`Delete ${label}?`}>
      <input type="hidden" name="id" value={id} />
      <span className="text-amber">Delete &ldquo;{label}&rdquo;? Are you sure?</span>
      <button className="rounded-full bg-amber px-3 py-1 font-semibold text-white hover:opacity-90">
        Yes, delete
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="rounded-full border border-border px-3 py-1 font-semibold hover:bg-sage-light"
      >
        Keep it
      </button>
    </form>
  );
}
