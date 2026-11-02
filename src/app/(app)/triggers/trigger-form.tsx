"use client";

import { useActionState, useEffect } from "react";
import { createTrigger, updateTrigger, type TriggerState } from "./actions";

const EMOJIS = ["🌿", "🌙", "🎤", "💼", "📚", "❤️", "🌧️", "☀️", "😮‍💨", "🫶"];

type Props =
  | { mode: "create" }
  | { mode: "edit"; trigger: { id: string; name: string; emoji: string }; onDone: () => void };

export function TriggerForm(props: Props) {
  const [state, formAction, pending] = useActionState<TriggerState, FormData>(
    props.mode === "create" ? createTrigger : updateTrigger,
    {},
  );
  const existing = props.mode === "edit" ? props.trigger : undefined;
  const onDone = props.mode === "edit" ? props.onDone : undefined;

  // After a successful edit, close the edit form.
  useEffect(() => {
    if (state.saved) onDone?.();
  }, [state.saved, onDone]);

  return (
    // Changing the key after a save resets the fields for the next trigger.
    <form key={state.saved} action={formAction} className="space-y-3" noValidate>
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <label className="block">
        <span className="text-sm font-semibold">Name</span>
        <input
          name="name"
          defaultValue={existing?.name}
          placeholder="e.g. Before a presentation"
          maxLength={40}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-sage focus:ring-2 focus:ring-sage-light"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-semibold">Emoji</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {EMOJIS.map((emoji) => (
            <label key={emoji} className="cursor-pointer">
              <input
                type="radio"
                name="emoji"
                value={emoji}
                defaultChecked={emoji === (existing?.emoji ?? EMOJIS[0])}
                className="peer sr-only"
              />
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-xl peer-checked:border-sage peer-checked:bg-sage-light peer-focus-visible:ring-2 peer-focus-visible:ring-sage">
                {emoji}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

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
          {pending ? "Saving…" : existing ? "Save" : "Add trigger"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-sage-light"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
