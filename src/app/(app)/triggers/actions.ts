"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { triggers } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export type TriggerState = { error?: string; saved?: number };

const NAME_MAX = 40;

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    emoji: String(formData.get("emoji") ?? "").trim() || "🌿",
  };
}

function checkName(name: string): string | undefined {
  if (!name) return "Give this trigger a name, like \"Can't sleep\".";
  if (name.length > NAME_MAX) return `Keep the name under ${NAME_MAX} characters.`;
}

export async function createTrigger(_prev: TriggerState, formData: FormData): Promise<TriggerState> {
  const user = await requireUser();
  const { name, emoji } = readForm(formData);

  const error = checkName(name);
  if (error) return { error };

  await db.insert(triggers).values({ userId: user.id, name, emoji });
  revalidatePath("/triggers");
  // A new number each time tells the form to clear itself.
  return { saved: Date.now() };
}

export async function updateTrigger(_prev: TriggerState, formData: FormData): Promise<TriggerState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const { name, emoji } = readForm(formData);

  const error = checkName(name);
  if (error) return { error };

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

  await db.delete(triggers).where(and(eq(triggers.id, id), eq(triggers.userId, user.id)));
  revalidatePath("/triggers");
}
