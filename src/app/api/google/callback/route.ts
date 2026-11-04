import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveGoogleToken } from "@/lib/briefing";
import { exchangeCode } from "@/lib/google";
import { getSession } from "@/lib/session";

function sameState(expected: string | undefined, received: string | null) {
  if (!expected || !received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Google sends the user back here after they say yes (or no).
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = request.nextUrl.searchParams;
  const session = await getSession();
  const expected = session.googleState;
  session.googleState = undefined; // one use only
  await session.save();

  // Refuse replies we didn't ask for (e.g. a link someone else crafted).
  if (!sameState(expected, params.get("state"))) redirect("/settings?google=failed");
  if (params.get("error")) redirect("/settings?google=denied");

  const code = params.get("code");
  if (!code) redirect("/settings?google=failed");

  let refreshToken: string | undefined;
  try {
    refreshToken = await exchangeCode(code, request.nextUrl.origin);
  } catch (error) {
    console.error("Google sign-in: code exchange failed", error);
  }
  if (!refreshToken) redirect("/settings?google=failed");

  await saveGoogleToken(user.id, refreshToken);
  redirect("/week");
}
