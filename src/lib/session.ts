import "server-only";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

// googleState: the one-time value that proves a Google sign-in reply is for the
// sign-in this browser started.
export type SessionData = { userId?: string; googleState?: string };

// The session lives in an encrypted cookie; only the server can read it.
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: "steady_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  });
}
