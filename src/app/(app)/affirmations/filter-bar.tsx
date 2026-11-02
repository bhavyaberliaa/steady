"use client";

import Form from "next/form";
import Link from "next/link";
import { isFiltered, SEARCH_MAX, SORTS, type ListQuery } from "@/lib/list-query";

type TriggerOption = { id: string; name: string; emoji: string };

const FIELD =
  "w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-sage focus:ring-2 focus:ring-sage-light";

// A plain GET form, so every choice lands in the URL (?q=&trigger=&starred=&sort=)
// and survives reload and the back button. Dropdowns and the checkbox apply as
// soon as they change; the search box applies on Enter or the Search button.
export function FilterBar({ query, triggers }: { query: ListQuery; triggers: TriggerOption[] }) {
  function applyNow(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
    e.currentTarget.form?.requestSubmit();
  }

  return (
    <Form
      action="/affirmations"
      role="search"
      aria-label="Search and filter affirmations"
      className="space-y-3 rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">Search your affirmations</span>
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            maxLength={SEARCH_MAX}
            placeholder="Search your words…"
            className={FIELD}
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-sage px-4 py-2 font-semibold text-white transition hover:bg-sage-dark"
        >
          Search
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
        <label>
          <span className="sr-only">Filter by trigger</span>
          <select name="trigger" defaultValue={query.triggerId ?? ""} onChange={applyNow} className={FIELD}>
            <option value="">All triggers</option>
            {triggers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.emoji} {t.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Sort</span>
          <select name="sort" defaultValue={query.sort} onChange={applyNow} className={FIELD}>
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="starred"
            value="1"
            defaultChecked={query.starredOnly}
            onChange={applyNow}
            className="h-4 w-4 accent-lavender"
          />
          Starred only ★
        </label>
      </div>

      {isFiltered(query) && (
        <Link href="/affirmations" className="inline-block text-sm font-semibold text-sage-dark hover:underline">
          Clear search and filters
        </Link>
      )}
    </Form>
  );
}
