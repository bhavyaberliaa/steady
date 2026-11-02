"use client";

import { useCallback, useState } from "react";
import { ConfirmDelete } from "@/components/confirm-delete";
import { deleteTrigger } from "./actions";
import { TriggerForm } from "./trigger-form";

export function TriggerRow({ trigger }: { trigger: { id: string; name: string; emoji: string } }) {
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
        {trigger.name}
      </span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full px-3 py-1 text-sm font-semibold text-muted hover:bg-sage-light hover:text-sage-dark"
        >
          Edit
        </button>
        <ConfirmDelete action={deleteTrigger} id={trigger.id} label={trigger.name} />
      </span>
    </li>
  );
}
