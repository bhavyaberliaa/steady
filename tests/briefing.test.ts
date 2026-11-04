import { describe, expect, it } from "vitest";
import { open, seal } from "@/lib/secret-box";
import { parseBriefingDay } from "@/lib/validation";
import { groupEventsByDay, weekdayIn, type CalendarEvent } from "@/lib/week";

// Extra checks for feature 9 (not one of the two required tests).

// Wednesday Nov 4, 2026, 9:00am in New York.
const now = new Date("2026-11-04T14:00:00Z");
const timeZone = "America/New_York";

const timed = (id: string, summary: string, start: string, end: string): CalendarEvent => ({
  id,
  summary,
  start: { dateTime: start },
  end: { dateTime: end },
});

describe("Your week grouping", () => {
  it("makes 7 days starting today, in the calendar's timezone", () => {
    const days = groupEventsByDay([], { now, timeZone });
    expect(days.map((d) => d.date)).toEqual([
      "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10",
    ]);
    expect(days[0]).toMatchObject({ label: "Wednesday, Nov 4", isToday: true });
    expect(days[6].isToday).toBe(false);
  });

  it("puts each event on its day, in time order, with all-day events first", () => {
    const days = groupEventsByDay(
      [
        timed("late", "Demo day", "2026-11-04T15:00:00-05:00", "2026-11-04T16:00:00-05:00"),
        timed("early", "Standup", "2026-11-04T09:30:00-05:00", "2026-11-04T09:45:00-05:00"),
        { id: "trip", summary: "Trip", start: { date: "2026-11-06" }, end: { date: "2026-11-08" } },
        timed("night", "Late call", "2026-11-06T03:30:00Z", "2026-11-06T04:00:00Z"), // 10:30pm Nov 5 in NY
        { id: "gone", summary: "Cancelled thing", status: "cancelled", start: { date: "2026-11-05" }, end: { date: "2026-11-06" } },
        timed("far", "Next month", "2026-12-01T10:00:00-05:00", "2026-12-01T11:00:00-05:00"),
      ],
      { now, timeZone },
    );
    const byDate = Object.fromEntries(days.map((d) => [d.date, d.events.map((e) => `${e.time} ${e.title}`)]));

    expect(byDate["2026-11-04"]).toEqual(["9:30 AM – 9:45 AM Standup", "3:00 PM – 4:00 PM Demo day"]);
    expect(byDate["2026-11-05"]).toEqual(["10:30 PM – 11:00 PM Late call"]); // its local day, not UTC's
    expect(byDate["2026-11-06"]).toEqual(["All day Trip"]);
    expect(byDate["2026-11-07"]).toEqual(["All day Trip"]); // multi-day: every day it covers
    expect(byDate["2026-11-08"]).toEqual([]); // end date is the day after
  });

  it("shows something already in progress under today, and untitled events kindly", () => {
    const days = groupEventsByDay(
      [{ id: "x", start: { dateTime: "2026-11-03T23:00:00-05:00" }, end: { dateTime: "2026-11-04T10:00:00-05:00" } }],
      { now, timeZone },
    );
    expect(days[0].events.map((e) => e.title)).toEqual(["(No title)"]);
  });

  it("knows which weekday it is where you are", () => {
    const sundayNightUtc = new Date("2026-11-09T02:00:00Z"); // still Sunday evening in New York
    expect(weekdayIn(sundayNightUtc, "America/New_York")).toBe(0);
    expect(weekdayIn(sundayNightUtc, "UTC")).toBe(1);
  });
});

describe("briefing day input", () => {
  it("accepts 0–6 and refuses anything else", () => {
    expect(parseBriefingDay("0")).toBe(0);
    expect(parseBriefingDay("6")).toBe(6);
    for (const bad of ["7", "-1", "2.5", "", "monday", null, undefined]) {
      expect(parseBriefingDay(bad)).toBeUndefined();
    }
  });
});

describe("stored Google token", () => {
  it("is encrypted, and reads back only with the same secret", () => {
    process.env.SESSION_SECRET = "test-secret-one-that-is-at-least-32-chars";
    const sealed = seal("1//refresh-token");
    expect(sealed).not.toContain("refresh-token");
    expect(open(sealed)).toBe("1//refresh-token");
    expect(seal("1//refresh-token")).not.toBe(sealed); // random each time

    const tampered = sealed.slice(0, -2) + (sealed.endsWith("AA") ? "BB" : "AA");
    expect(open(tampered)).toBeUndefined();
    expect(open("garbage")).toBeUndefined();

    process.env.SESSION_SECRET = "a-different-secret-also-32-characters!!";
    expect(open(sealed)).toBeUndefined();
  });
});
