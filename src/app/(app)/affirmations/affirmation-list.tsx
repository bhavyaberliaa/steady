import Link from "next/link";
import type { AffirmationListItem } from "./data";
import { StarButton } from "./star-button";

export function AffirmationList({ items }: { items: AffirmationListItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <li
          key={a.id}
          className="flex items-start gap-2 rounded-2xl border border-border bg-surface p-3 transition hover:border-sage"
        >
          <Link href={`/affirmations/${a.id}`} className="min-w-0 flex-1 p-2">
            <p className="text-lg">{a.text}</p>
            <p className="mt-2 text-sm text-muted">
              {a.triggerEmoji} {a.triggerName}
            </p>
          </Link>
          <StarButton id={a.id} starred={a.starred} />
        </li>
      ))}
    </ul>
  );
}
