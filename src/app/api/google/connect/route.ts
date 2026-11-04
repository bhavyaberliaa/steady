import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { authUrl, googleConfigured } from "@/lib/google";
import { getSession } from "@/lib/session";

// "Connect Google Calendar": remember a random state, then send the user to Google.
export async function GET(request: NextRequest) {
  if (!(await getCurrentUser())) redirect("/login");
  if (!googleConfigured()) redirect("/settings?google=not-configured");

  const session = await getSession();
  session.googleState = randomBytes(32).toString("base64url");
  await session.save();

  redirect(authUrl(request.nextUrl.origin, session.googleState));
}
