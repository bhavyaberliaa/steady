"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { triggers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { isUuid, validateTriggerName } from "@/lib/validation";

// `saved` changes after a save (the form clears); `attempt` after a problem
// (the form redraws with what was typed, kept in `values`).
export type TriggerState = {
  error?: string;
  saved?: number;
  attempt?: number;
  values?: { name: string; emoji: string };
};

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    emoji: String(formData.get("emoji") ?? "").trim() || "🌿",
  };
}

// The user's other trigger names, to catch duplicates.
async function otherNames(userId: string, exceptId?: string) {
  const rows = await db
    .select({ name: triggers.name })
    .from(triggers)
    .where(and(eq(triggers.userId, userId), exceptId ? ne(triggers.id, exceptId) : undefined));
  return rows.map((row) => row.name);
}

export async function createTrigger(_prev: TriggerState, formData: FormData): Promise<TriggerState> {
  const user = await requireUser();
  const { name, emoji } = readForm(formData);

  const error = validateTriggerName(name, await otherNames(user.id));
  if (error) return { error, values: { name, emoji }, attempt: Date.now() };

  await db.insert(triggers).values({ userId: user.id, name, emoji });
  revalidatePath("/triggers");
  // A new number each time tells the form to clear itself.
  return { saved: Date.now() };
}

export async function updateTrigger(_prev: TriggerState, formData: FormData): Promise<TriggerState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const { name, emoji } = readForm(formData);
  if (!isUuid(id)) return { error: "That trigger doesn't exist anymore." };

  const error = validateTriggerName(name, await otherNames(user.id, id));
  if (error) return { error, values: { name, emoji }, attempt: Date.now() };

  // Matching on user_id too means nobody can edit someone else's trigger by guessing its id.
  await db
    .update(triggers)
    .set({ name, emoji })
    .where(and(eq(triggers.id, id), eq(triggers.userId, user.id)));
  revalidatePath("/triggers");
  return { saved: Date.now() };
}

export async function deleteTrigger(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!isUuid(id)) return;
  try {
    await db.delete(triggers).where(and(eq(triggers.id, id), eq(triggers.userId, user.id)));
  } catch (error) {
    // 23503: affirmations still use this trigger. The page hides Delete then, so leave it be.
    if ((error as { cause?: { code?: string } }).cause?.code !== "23503") throw error;
  }
  revalidatePath("/triggers");
}
