// Affirmation of the day. Plain functions with no database, so they're easy to test.
//
// Each user gets their own shuffle for each day: starred affirmations first,
// then the rest. Today's affirmation is the first in that order, and
// "Give me another" steps through it, so nothing repeats until all have been shown.

// Today's date (YYYY-MM-DD) in the given timezone, falling back to UTC.
export function dayKey(now: Date, timeZone?: string) {
  const format = (tz: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  try {
    return format(timeZone || "UTC");
  } catch {
    return format("UTC"); // unknown timezone name
  }
}

// FNV-1a: turns a string into a 32-bit number, the same one every time.
function hash(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Same seed, same shuffle: each id gets a stable random score for the day.
function shuffle<T extends { id: string }>(items: T[], seed: string) {
  return [...items]
    .map((item) => ({ item, score: hash(`${seed}:${item.id}`) }))
    .sort((a, b) => a.score - b.score || a.item.id.localeCompare(b.item.id))
    .map(({ item }) => item);
}

export function dailyOrder<T extends { id: string; starred: boolean }>(items: T[], seed: string) {
  return [
    ...shuffle(items.filter((a) => a.starred), seed),
    ...shuffle(items.filter((a) => !a.starred), seed),
  ];
}

// The affirmation to show: number `step` in today's order (0 = today's pick).
export function pickForDay<T extends { id: string; starred: boolean }>(
  items: T[],
  { userId, day, step = 0 }: { userId: string; day: string; step?: number },
) {
  if (items.length === 0) return undefined;
  const order = dailyOrder(items, `${userId}:${day}`);
  const safeStep = Number.isSafeInteger(step) && step >= 0 ? step : 0;
  return order[safeStep % order.length];
}
