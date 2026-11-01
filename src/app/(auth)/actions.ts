"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";

export type AuthState = { error?: string; email?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readForm(formData);

  if (!email || !password) return { error: "Please fill in your email and a password.", email };
  if (!EMAIL_PATTERN.test(email)) return { error: "That email doesn't look quite right.", email };
  if (password.length < 8) return { error: "Your password needs at least 8 characters.", email };

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return { error: "There's already an account with that email. Try logging in.", email };

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ email, passwordHash }).returning({ id: users.id });

  const session = await getSession();
  session.userId = user.id;
  await session.save();
  redirect("/");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readForm(formData);

  if (!email || !password) return { error: "Please fill in your email and password.", email };

  const [user] = await db.select().from(users).where(eq(users.email, email));
  // Same message either way, so nobody can probe which emails have accounts.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "That email and password don't match. Want to try again?", email };
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();
  redirect("/");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
