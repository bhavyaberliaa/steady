import { describe, expect, it } from "vitest";
import { dailyOrder, dayKey, pickForDay } from "@/lib/daily";

const items = [
  { id: "a", starred: false },
  { id: "b", starred: true },
  { id: "c", starred: false },
  { id: "d", starred: true },
  { id: "e", starred: false },
];

// Extra checks for feature 8 (not one of the two required tests).
describe("affirmation of the day", () => {
  it("picks the same one all day, for the same user", () => {
    const first = pickForDay(items, { userId: "u1", day: "2026-11-02" });
    for (let i = 0; i < 5; i++) {
      expect(pickForDay(items, { userId: "u1", day: "2026-11-02" })).toBe(first);
    }
  });

  it("picks a starred one when there are any", () => {
    for (const day of ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04"]) {
      expect(pickForDay(items, { userId: "u1", day })?.starred).toBe(true);
    }
  });

  it("'Give me another' shows starred first, then every affirmation once, then starts over", () => {
    const seen = [0, 1, 2, 3, 4].map((step) => pickForDay(items, { userId: "u1", day: "2026-11-02", step })!);
    expect(seen.slice(0, 2).every((a) => a.starred)).toBe(true);
    expect(new Set(seen.map((a) => a.id)).size).toBe(5);
    expect(pickForDay(items, { userId: "u1", day: "2026-11-02", step: 5 })).toBe(seen[0]);
  });

  it("changes order across days", () => {
    const days = Array.from({ length: 10 }, (_, i) => `2026-11-${String(i + 1).padStart(2, "0")}`);
    const orders = new Set(days.map((day) => dailyOrder(items, `u1:${day}`).map((a) => a.id).join("")));
    expect(orders.size).toBeGreaterThan(1);
  });

  it("handles no affirmations and junk steps", () => {
    expect(pickForDay([], { userId: "u1", day: "2026-11-02" })).toBeUndefined();
    const today = pickForDay(items, { userId: "u1", day: "2026-11-02" });
    expect(pickForDay(items, { userId: "u1", day: "2026-11-02", step: -3 })).toBe(today);
    expect(pickForDay(items, { userId: "u1", day: "2026-11-02", step: NaN })).toBe(today);
  });

  it("uses the visitor's timezone for 'today'", () => {
    const lateEvening = new Date("2026-11-02T03:30:00Z"); // 7:30pm Nov 1 in Los Angeles
    expect(dayKey(lateEvening, "America/Los_Angeles")).toBe("2026-11-01");
    expect(dayKey(lateEvening)).toBe("2026-11-02");
    expect(dayKey(lateEvening, "Not/AZone")).toBe("2026-11-02");
  });
});
