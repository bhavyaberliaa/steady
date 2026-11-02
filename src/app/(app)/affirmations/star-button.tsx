"use client";

import { useOptimistic, useTransition } from "react";
import { setStar } from "./actions";

// Fills in right away, then saves in the background.
export function StarButton({ id, starred }: { id: string; starred: boolean }) {
  const [shown, setShown] = useOptimistic(starred);
  const [, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setShown(!shown);
      await setStar(id, !shown);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={shown}
      aria-label={shown ? "Unstar" : "Star"}
      title={shown ? "Unstar" : "Star"}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl leading-none transition hover:bg-lavender-light ${
        shown ? "text-lavender" : "text-border hover:text-lavender"
      }`}
    >
      {shown ? "★" : "☆"}
    </button>
  );
}
