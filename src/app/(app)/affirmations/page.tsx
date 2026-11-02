import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isFiltered, parseListQuery } from "@/lib/list-query";
import { AffirmationList } from "./affirmation-list";
import { getMyTriggers, listMyAffirmations } from "./data";
import { FilterBar } from "./filter-bar";

export default async function AffirmationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const query = parseListQuery(await searchParams);
  const [mine, triggers] = await Promise.all([
    listMyAffirmations(user.id, query),
    getMyTriggers(user.id),
  ]);
  const filtered = isFiltered(query);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Affirmations</h1>
          <p className="mt-1 text-muted">Words you wrote for the hard moments.</p>
        </div>
        <Link
          href="/affirmations/new"
          className="rounded-xl bg-sage px-4 py-2 font-semibold text-white transition hover:bg-sage-dark"
        >
          + New affirmation
        </Link>
      </div>

      {(mine.length > 0 || filtered) && (
        // key: redraw the inputs when the URL changes (e.g. Back, or Clear).
        <FilterBar key={JSON.stringify(query)} query={query} triggers={triggers} />
      )}

      {filtered && mine.length > 0 && (
        <p className="text-sm text-muted" aria-live="polite">
          {mine.length} {mine.length === 1 ? "match" : "matches"}
        </p>
      )}

      {mine.length === 0 ? (
        <p className="rounded-3xl bg-lavender-light p-8 text-center text-muted" aria-live="polite">
          {filtered ? (
            <>
              Nothing matches that.{" "}
              <Link href="/affirmations" className="font-semibold text-sage-dark hover:underline">
                Show all affirmations
              </Link>
            </>
          ) : (
            <>Nothing here yet. Write your first one: something true you&apos;d want to hear on a hard day.</>
          )}
        </p>
      ) : (
        <AffirmationList items={mine} />
      )}
    </div>
  );
}
