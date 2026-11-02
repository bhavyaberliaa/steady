"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, triggers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { isUuid } from "./data";

export type AffirmationState = { error?: string };

function readForm(formData: FormData) {
  return {
    id: String(formData.get("id") ?? ""),
    text: String(formData.get("text") ?? "").trim(),
    triggerId: String(formData.get("triggerId") ?? ""),
    note: String(formData.get("note") ?? "").trim() || null,
  };
}

// The chosen trigger has to be one of this user's own.
async function ownsTrigger(userId: string, triggerId: string) {
  if (!isUuid(triggerId)) return false;
  const [row] = await db
    .select({ id: triggers.id })
    .from(triggers)
    .where(and(eq(triggers.id, triggerId), eq(triggers.userId, userId)));
  return Boolean(row);
}

export async function createAffirmation(
  _prev: AffirmationState,
  formData: FormData,
): Promise<AffirmationState> {
  const user = await requireUser();
  const { text, triggerId, note } = readForm(formData);
  if (!(await ownsTrigger(user.id, triggerId))) return { error: "Please pick one of your triggers." };

  const [created] = await db
    .insert(affirmations)
    .values({ userId: user.id, triggerId, text, note })
    .returning({ id: affirmations.id });

  revalidatePath("/affirmations");
  redirect(`/affirmations/${created.id}`);
}

export async function updateAffirmation(
  _prev: AffirmationState,
  formData: FormData,
): Promise<AffirmationState> {
  const user = await requireUser();
  const { id, text, triggerId, note } = readForm(formData);
  if (!isUuid(id)) redirect("/affirmations");
  if (!(await ownsTrigger(user.id, triggerId))) return { error: "Please pick one of your triggers." };

  // Matching on user_id too means nobody can edit someone else's affirmation by guessing its id.
  await db
    .update(affirmations)
    .set({ text, triggerId, note, updatedAt: new Date() })
    .where(and(eq(affirmations.id, id), eq(affirmations.userId, user.id)));

  revalidatePath("/affirmations");
  redirect(`/affirmations/${id}`);
}

export async function deleteAffirmation(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (isUuid(id)) {
    await db.delete(affirmations).where(and(eq(affirmations.id, id), eq(affirmations.userId, user.id)));
  }
  revalidatePath("/affirmations");
  redirect("/affirmations");
}
