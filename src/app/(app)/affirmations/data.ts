import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, triggers } from "@/db/schema";
import { isUuid } from "@/lib/validation";

export async function getMyTriggers(userId: string) {
  return db
    .select({ id: triggers.id, name: triggers.name, emoji: triggers.emoji })
    .from(triggers)
    .where(eq(triggers.userId, userId))
    .orderBy(asc(triggers.createdAt));
}

// One affirmation with its trigger, or undefined if it isn't this user's.
export async function getMyAffirmation(userId: string, id: string) {
  if (!isUuid(id)) return undefined;
  const [row] = await db
    .select({
      id: affirmations.id,
      text: affirmations.text,
      note: affirmations.note,
      triggerId: affirmations.triggerId,
      createdAt: affirmations.createdAt,
      updatedAt: affirmations.updatedAt,
      triggerName: triggers.name,
      triggerEmoji: triggers.emoji,
    })
    .from(affirmations)
    .innerJoin(triggers, eq(triggers.id, affirmations.triggerId))
    .where(and(eq(affirmations.id, id), eq(affirmations.userId, userId)));
  return row;
}
