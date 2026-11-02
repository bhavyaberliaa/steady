"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { affirmations, stars, triggers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  hasErrors,
  isUuid,
  validateAffirmation,
  type AffirmationInput,
  type FieldErrors,
} from "@/lib/validation";

// On a problem, send back the messages and what was typed, so nothing is lost.
// `attempt` changes every time, which tells the form to redraw with those values.
export type AffirmationState = {
  errors?: FieldErrors<keyof AffirmationInput>;
  values?: AffirmationInput;
  attempt?: number;
};

function readForm(formData: FormData) {
  return {
    id: String(formData.get("id") ?? ""),
    text: String(formData.get("text") ?? "").trim(),
    triggerId: String(formData.get("triggerId") ?? ""),
    note: String(formData.get("note") ?? "").trim(),
  };
}

// Checks the rules, then that the chosen trigger is one of this user's own.
async function check(userId: string, values: AffirmationInput): Promise<AffirmationState | undefined> {
  const errors = validateAffirmation(values);
  if (!errors.triggerId && !(await ownsTrigger(userId, values.triggerId))) {
    errors.triggerId = "Please pick one of your triggers.";
  }
  if (hasErrors(errors)) return { errors, values, attempt: Date.now() };
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
  const problem = await check(user.id, { text, triggerId, note });
  if (problem) return problem;

  const [created] = await db
    .insert(affirmations)
    .values({ userId: user.id, triggerId, text, note: note || null })
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
  const problem = await check(user.id, { text, triggerId, note });
  if (problem) return problem;

  // Matching on user_id too means nobody can edit someone else's affirmation by guessing its id.
  await db
    .update(affirmations)
    .set({ text, triggerId, note: note || null, updatedAt: new Date() })
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

// Stars or un-stars one of this user's affirmations.
export async function setStar(affirmationId: string, starred: boolean) {
  const user = await requireUser();
  if (!isUuid(affirmationId)) return;

  if (starred) {
    // Only your own affirmations can be starred.
    const [own] = await db
      .select({ id: affirmations.id })
      .from(affirmations)
      .where(and(eq(affirmations.id, affirmationId), eq(affirmations.userId, user.id)));
    if (!own) return;
    await db.insert(stars).values({ userId: user.id, affirmationId }).onConflictDoNothing();
  } else {
    await db.delete(stars).where(and(eq(stars.userId, user.id), eq(stars.affirmationId, affirmationId)));
  }

  revalidatePath("/affirmations");
  revalidatePath("/starred");
}
