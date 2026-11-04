"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { getMyWeek } from "@/lib/briefing";
import { isValidOrder } from "@/lib/plan";
import { askClaudeForPlan } from "@/lib/prioritize";
import { reorderMyPlan, saveMyPlan } from "@/lib/weekly-plan";
import { listMyAffirmations } from "../affirmations/data";

export type PlanState = { error?: string; made?: number };

// "Help me prioritize" / "Try again": read the week, ask Claude, save the plan.
export async function makePlan(): Promise<PlanState> {
  const user = await requireUser();
  const fallbackTimeZone = (await headers()).get("x-vercel-ip-timezone") ?? "UTC";
  const [week, mine] = await Promise.all([
    getMyWeek(user.id, new Date(), fallbackTimeZone),
    listMyAffirmations(user.id),
  ]);
  if (week.status !== "ok") return { error: "Your calendar isn't available right now, so there's nothing to plan from." };

  const result = await askClaudeForPlan(week.days, mine);
  if (!result.ok) return { error: result.error };

  await saveMyPlan(user.id, result.plan);
  revalidatePath("/week");
  return { made: Date.now() };
}

export async function reorderPlan(order: number[]) {
  const user = await requireUser();
  if (!isValidOrder(order)) return;
  await reorderMyPlan(user.id, order);
  revalidatePath("/week");
}
