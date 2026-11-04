import "server-only";
import type { CalendarEvent } from "./week";

// Talks to Google with plain fetch: OAuth sign-in, then read-only Calendar access.

const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

// In local development only, GOOGLE_FAKE_BASE can point all of this at a fake
// Google server for testing. It is ignored in production.
const FAKE = process.env.NODE_ENV !== "production" ? process.env.GOOGLE_FAKE_BASE : undefined;
const AUTH_URL = FAKE ? `${FAKE}/auth` : "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = FAKE ? `${FAKE}/token` : "https://oauth2.googleapis.com/token";
const REVOKE_URL = FAKE ? `${FAKE}/revoke` : "https://oauth2.googleapis.com/revoke";
const EVENTS_URL = FAKE
  ? `${FAKE}/calendar/v3/calendars/primary/events`
  : "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// Google said the refresh token is no longer valid (revoked or expired).
export class GoogleAccessRevoked extends Error {}

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function redirectUri(origin: string) {
  return `${origin}/api/google/callback`;
}

export function authUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline", // so we get a refresh token
    prompt: "consent", // ...every time, even on reconnect
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${params}`;
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      ...body,
    }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    error?: string;
  };
  if (json.error === "invalid_grant") throw new GoogleAccessRevoked();
  if (!res.ok || !json.access_token) throw new Error(`Google token request failed (${res.status}).`);
  return json;
}

// After the user says yes on Google's page: swap the one-time code for tokens.
export async function exchangeCode(code: string, origin: string) {
  const json = await tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(origin),
  });
  return json.refresh_token;
}

// Events from now until 7 days from now, plus the calendar's own timezone.
export async function fetchWeekEvents(refreshToken: string, now: Date) {
  const { access_token } = await tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    singleEvents: "true", // expand repeating events into each occurrence
    orderBy: "startTime",
    maxResults: "250",
  });
  const res = await fetch(`${EVENTS_URL}?${params}`, {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: "no-store",
  });
  if (res.status === 401) throw new GoogleAccessRevoked();
  if (!res.ok) throw new Error(`Google Calendar request failed (${res.status}).`);
  const json = (await res.json()) as { items?: CalendarEvent[]; timeZone?: string };
  return { events: json.items ?? [], timeZone: json.timeZone };
}

// Best effort: tell Google to forget our access. We clear our copy either way.
export async function revoke(token: string) {
  await fetch(REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  }).catch(() => undefined);
}
