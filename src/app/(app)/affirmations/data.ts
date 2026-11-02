import "server-only";
import { and, asc, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, stars, triggers } from "@/db/schema";
import { isUuid } from "@/lib/validation";

// True when the joined star row exists.
const isStarred = sql<boolean>`${stars.affirmationId} is not null`;

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
      starred: isStarred,
    })
    .from(affirmations)
    .innerJoin(triggers, eq(triggers.id, affirmations.triggerId))
    .leftJoin(stars, myStar(userId))
    .where(and(eq(affirmations.id, id), eq(affirmations.userId, userId)));
  return row;
}

// Joins this user's star (if any) onto each affirmation.
function myStar(userId: string) {
  return and(eq(stars.affirmationId, affirmations.id), eq(stars.userId, userId));
}

export type AffirmationListItem = Awaited<ReturnType<typeof listMyAffirmations>>[number];

// This user's affirmations, newest first, each marked starred or not.
export async function listMyAffirmations(userId: string, { starredOnly = false } = {}) {
  return db
    .select({
      id: affirmations.id,
      text: affirmations.text,
      triggerName: triggers.name,
      triggerEmoji: triggers.emoji,
      starred: isStarred,
    })
    .from(affirmations)
    .innerJoin(triggers, eq(triggers.id, affirmations.triggerId))
    .leftJoin(stars, myStar(userId))
    .where(and(eq(affirmations.userId, userId), starredOnly ? isNotNull(stars.affirmationId) : undefined))
    .orderBy(desc(affirmations.createdAt));
}
