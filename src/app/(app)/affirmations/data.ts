import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, triggers } from "@/db/schema";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Only ids shaped like a uuid reach the database; anything else is "not found".
export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

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
