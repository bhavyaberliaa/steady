import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, triggers, weeklyPlans } from "@/db/schema";
import type { Plan } from "./plan";

// The user's saved plan, with the quoted affirmation's text straight from the
// database (never Claude's copy of it), only if that affirmation is theirs.
export async function getMyPlan(userId: string) {
  const [row] = await db
    .select({
      priorities: weeklyPlans.priorities,
      calmNote: weeklyPlans.calmNote,
      createdAt: weeklyPlans.createdAt,
      quoteText: affirmations.text,
      quoteTrigger: triggers.name,
      quoteEmoji: triggers.emoji,
    })
    .from(weeklyPlans)
    .leftJoin(
      affirmations,
      and(eq(affirmations.id, weeklyPlans.affirmationId), eq(affirmations.userId, userId)),
    )
    .leftJoin(triggers, eq(triggers.id, affirmations.triggerId))
    .where(eq(weeklyPlans.userId, userId));
  return row;
}

export type MyPlan = NonNullable<Awaited<ReturnType<typeof getMyPlan>>>;

export async function saveMyPlan(userId: string, plan: Plan) {
  const values = {
    priorities: plan.priorities,
    calmNote: plan.calmNote,
    affirmationId: plan.affirmationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db
    .insert(weeklyPlans)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: weeklyPlans.userId, set: values });
}

// Rearranges the saved priorities; `order` lists the old positions in the new order.
export async function reorderMyPlan(userId: string, order: [number, number, number]) {
  const [row] = await db
    .select({ priorities: weeklyPlans.priorities })
    .from(weeklyPlans)
    .where(eq(weeklyPlans.userId, userId));
  if (!row || row.priorities.length !== 3) return false;
  await db
    .update(weeklyPlans)
    .set({ priorities: order.map((i) => row.priorities[i]), updatedAt: new Date() })
    .where(eq(weeklyPlans.userId, userId));
  return true;
}
