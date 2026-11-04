// Turns Google Calendar events into the "Your week" view: 7 days starting
// today, each with its events in order. Plain functions with no network, so
// they're easy to test.

import { dayKey } from "./daily";

// The parts of a Google Calendar event we use. Timed events have dateTime;
// all-day events have date (and their end date is the day *after* they finish).
export type CalendarEvent = {
  id: string;
  summary?: string;
  location?: string;
  status?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
};

export type WeekEvent = { id: string; title: string; time: string; location?: string };
export type WeekDay = { date: string; label: string; isToday: boolean; events: WeekEvent[] };

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "2026-11-04" plus n days, without timezone surprises (noon UTC never crosses a date line).
function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// 0 = Sunday … 6 = Saturday, for today in the given timezone.
export function weekdayIn(now: Date, timeZone?: string) {
  return new Date(`${dayKey(now, timeZone)}T12:00:00Z`).getUTCDay();
}

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

function timeLabel(start: string, end: string | undefined, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" });
  return end ? `${fmt.format(new Date(start))} – ${fmt.format(new Date(end))}` : fmt.format(new Date(start));
}

export function groupEventsByDay(
  events: CalendarEvent[],
  { now, timeZone }: { now: Date; timeZone: string },
): WeekDay[] {
  const today = dayKey(now, timeZone);
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    return { date, label: dayLabel(date), isToday: i === 0, events: [] };
  });
  const byDate = new Map(days.map((d) => [d.date, d]));
  const timed: { day: WeekDay; at: number; event: WeekEvent }[] = [];

  for (const e of events) {
    if (e.status === "cancelled") continue;
    const title = e.summary?.trim() || "(No title)";

    if (e.start.date) {
      // All-day: show on every day it covers, inside this week.
      const end = e.end.date ?? addDays(e.start.date, 1);
      for (let date = e.start.date; date < end; date = addDays(date, 1)) {
        byDate.get(date)?.events.push({ id: `${e.id}:${date}`, title, time: "All day", location: e.location });
      }
    } else if (e.start.dateTime) {
      // Timed: show on the day it starts. Started before today but still going? Show it today.
      const startDay = dayKey(new Date(e.start.dateTime), timeZone);
      const day = byDate.get(startDay < today ? today : startDay);
      if (!day) continue;
      const event = { id: e.id, title, time: timeLabel(e.start.dateTime, e.end.dateTime, timeZone), location: e.location };
      timed.push({ day, at: Date.parse(e.start.dateTime), event });
    }
  }

  // All-day events first (already in place), then timed events by start time.
  timed.sort((a, b) => a.at - b.at);
  for (const { day, event } of timed) day.events.push(event);
  return days;
}
