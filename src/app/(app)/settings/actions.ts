"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { clearGoogleToken } from "@/lib/briefing";
import { revoke } from "@/lib/google";
import { parseBriefingDay } from "@/lib/validation";

export async function saveBriefingDay(formData: FormData) {
  const user = await requireUser();
  const day = parseBriefingDay(formData.get("briefingDay"));
  if (day === undefined) redirect("/settings?day=invalid");

  await db.update(users).set({ briefingDay: day }).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  redirect("/settings?day=saved");
}

export async function disconnectGoogle() {
  const user = await requireUser();
  const token = await clearGoogleToken(user.id);
  if (token) await revoke(token);
  revalidatePath("/", "layout");
  redirect("/settings?google=disconnected");
}
