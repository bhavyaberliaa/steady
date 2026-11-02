"use client";

import { useCallback, useState } from "react";
import { ConfirmDelete } from "@/components/confirm-delete";
import { deleteTrigger } from "./actions";
import { TriggerForm } from "./trigger-form";

type TriggerWithCount = { id: string; name: string; emoji: string; affirmationCount: number };

export function TriggerRow({ trigger }: { trigger: TriggerWithCount }) {
  const [editing, setEditing] = useState(false);
  const stopEditing = useCallback(() => setEditing(false), []);

  if (editing) {
    return (
      <li className="rounded-2xl border border-sage bg-surface p-4">
        <TriggerForm mode="edit" trigger={trigger} onDone={stopEditing} />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
      <span className="flex items-center gap-3 font-semibold">
        <span className="text-2xl" aria-hidden>
          {trigger.emoji}
        </span>
        <span>
          {trigger.name}
          <span className="block text-xs font-normal text-muted">
            {trigger.affirmationCount === 1 ? "1 affirmation" : `${trigger.affirmationCount} affirmations`}
          </span>
        </span>
      </span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full px-3 py-1 text-sm font-semibold text-muted hover:bg-sage-light hover:text-sage-dark"
        >
          Edit
        </button>
        {trigger.affirmationCount === 0 ? (
          <ConfirmDelete action={deleteTrigger} id={trigger.id} label={trigger.name} />
        ) : (
          // Deleting would orphan its affirmations, so it waits until they're moved or deleted.
          <span className="px-3 text-xs text-muted" title="Move or delete its affirmations first">
            In use
          </span>
        )}
      </span>
    </li>
  );
}
