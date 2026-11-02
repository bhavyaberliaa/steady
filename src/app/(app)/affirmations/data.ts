import "server-only";
import { and, asc, desc, eq, ilike, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, stars, triggers } from "@/db/schema";
import { likePattern, type ListQuery } from "@/lib/list-query";
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

const ORDER = {
  newest: [desc(affirmations.createdAt)],
  oldest: [asc(affirmations.createdAt)],
  az: [asc(sql`lower(${affirmations.text})`), desc(affirmations.createdAt)],
};

// This user's affirmations, each marked starred or not. Search, filters and
// sort only ever narrow or reorder the user's own rows.
export async function listMyAffirmations(
  userId: string,
  { q = "", triggerId, starredOnly = false, sort = "newest" }: Partial<ListQuery> = {},
) {
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
    .where(
      and(
        eq(affirmations.userId, userId),
        q ? ilike(affirmations.text, likePattern(q)) : undefined,
        triggerId ? eq(affirmations.triggerId, triggerId) : undefined,
        starredOnly ? isNotNull(stars.affirmationId) : undefined,
      ),
    )
    .orderBy(...ORDER[sort]);
}
