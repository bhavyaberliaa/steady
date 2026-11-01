import "server-only";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "./session";

export type CurrentUser = { id: string; email: string; displayName: string | null };

// Returns the logged-in user, or null for visitors.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId } = await getSession();
  if (!userId) return null;

  const [user] = await db
    .select({ id: users.id, email: users.email, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, userId));
  return user ?? null;
}

// Use at the top of every private page: visitors are sent to /login.
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
