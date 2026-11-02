// Turns the URL's ?q=&trigger=&starred=&sort= into safe list options.
// Plain functions with no database access, like validation.ts.

import { isUuid } from "./validation";

export const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  az: "A–Z",
} as const;

export type Sort = keyof typeof SORTS;

export const SEARCH_MAX = 100;

export type ListQuery = {
  q: string;
  triggerId: string | undefined;
  starredOnly: boolean;
  sort: Sort;
};

type RawParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// Anything unexpected falls back to "no filter" instead of an error page.
export function parseListQuery(params: RawParams): ListQuery {
  const sort = first(params.sort);
  const triggerId = first(params.trigger);
  return {
    q: first(params.q).trim().slice(0, SEARCH_MAX),
    triggerId: isUuid(triggerId) ? triggerId : undefined,
    starredOnly: first(params.starred) === "1",
    sort: Object.hasOwn(SORTS, sort) ? (sort as Sort) : "newest",
  };
}

export function isFiltered(query: ListQuery) {
  return Boolean(query.q || query.triggerId || query.starredOnly);
}

// Makes % and _ in the search box match themselves, not "anything".
export function likePattern(q: string) {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
