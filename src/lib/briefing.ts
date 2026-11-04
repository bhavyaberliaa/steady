import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { fetchWeekEvents, GoogleAccessRevoked } from "./google";
import { open, seal } from "./secret-box";
import { groupEventsByDay, type WeekDay } from "./week";

export async function getBriefingSettings(userId: string) {
  const [row] = await db
    .select({ briefingDay: users.briefingDay, token: users.googleRefreshToken })
    .from(users)
    .where(eq(users.id, userId));
  return { briefingDay: row?.briefingDay ?? 0, connected: Boolean(row?.token) };
}

export async function saveGoogleToken(userId: string, refreshToken: string) {
  await db.update(users).set({ googleRefreshToken: seal(refreshToken) }).where(eq(users.id, userId));
}

// Clears our copy and returns the old token (so the caller can revoke it with Google).
export async function clearGoogleToken(userId: string) {
  const [row] = await db
    .select({ token: users.googleRefreshToken })
    .from(users)
    .where(eq(users.id, userId));
  await db.update(users).set({ googleRefreshToken: null }).where(eq(users.id, userId));
  return row?.token ? open(row.token) : undefined;
}

export type MyWeek =
  | { status: "not-connected" }
  | { status: "reconnect" }
  | { status: "unavailable" }
  | { status: "ok"; days: WeekDay[]; timeZone: string; total: number };

export async function getMyWeek(userId: string, now: Date, fallbackTimeZone: string): Promise<MyWeek> {
  const [row] = await db
    .select({ token: users.googleRefreshToken })
    .from(users)
    .where(eq(users.id, userId));
  if (!row?.token) return { status: "not-connected" };

  const refreshToken = open(row.token);
  if (!refreshToken) {
    // Sealed with an old secret: unusable, so ask for a fresh connection.
    await clearGoogleToken(userId);
    return { status: "reconnect" };
  }

  try {
    const { events, timeZone } = await fetchWeekEvents(refreshToken, now);
    const tz = timeZone || fallbackTimeZone;
    const days = groupEventsByDay(events, { now, timeZone: tz });
    return { status: "ok", days, timeZone: tz, total: days.reduce((n, d) => n + d.events.length, 0) };
  } catch (error) {
    if (error instanceof GoogleAccessRevoked) {
      await clearGoogleToken(userId);
      return { status: "reconnect" };
    }
    console.error("Your week: Google Calendar request failed", error);
    return { status: "unavailable" };
  }
}
