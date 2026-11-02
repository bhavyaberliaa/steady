import "server-only";
import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, stars, triggers } from "@/db/schema";

export type TriggerCount = { name: string; emoji: string; count: number };

export type DashboardStats = {
  total: number;
  starred: number;
  // undefined until the user has written at least one affirmation.
  topTrigger: TriggerCount | undefined;
  perTrigger: TriggerCount[];
};

// Everything the dashboard shows, counted from this user's rows only.
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [perTrigger, [{ starred }]] = await Promise.all([
    db
      .select({ name: triggers.name, emoji: triggers.emoji, count: count(affirmations.id) })
      .from(triggers)
      .leftJoin(
        affirmations,
        and(eq(affirmations.triggerId, triggers.id), eq(affirmations.userId, userId)),
      )
      .where(eq(triggers.userId, userId))
      .groupBy(triggers.id)
      .orderBy(asc(triggers.createdAt)),
    db
      .select({ starred: count() })
      .from(stars)
      .innerJoin(affirmations, eq(affirmations.id, stars.affirmationId))
      .where(and(eq(stars.userId, userId), eq(affirmations.userId, userId))),
  ]);

  const total = perTrigger.reduce((sum, t) => sum + t.count, 0);
  // Most affirmations wins; on a tie, the trigger created first.
  const topTrigger = perTrigger.reduce<TriggerCount | undefined>(
    (top, t) => (t.count > 0 && (!top || t.count > top.count) ? t : top),
    undefined,
  );

  return { total, starred, topTrigger, perTrigger };
}
