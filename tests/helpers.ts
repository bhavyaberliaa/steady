import { db } from "@/db";
import { affirmations, stars, triggers, users } from "@/db/schema";

// Small builders so each test reads like its Given/When/Then.

export async function makeUser(email: string) {
  const [user] = await db.insert(users).values({ email, passwordHash: "not-a-real-hash" }).returning();
  return user;
}

export async function makeTrigger(userId: string, name: string, emoji = "🌿") {
  const [trigger] = await db.insert(triggers).values({ userId, name, emoji }).returning();
  return trigger;
}

export async function makeAffirmation(userId: string, triggerId: string, text: string) {
  const [affirmation] = await db.insert(affirmations).values({ userId, triggerId, text }).returning();
  return affirmation;
}

export async function star(userId: string, affirmationId: string) {
  await db.insert(stars).values({ userId, affirmationId });
}
