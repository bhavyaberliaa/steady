import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getBriefingSettings } from "@/lib/briefing";
import { googleConfigured } from "@/lib/google";
import { WEEKDAYS } from "@/lib/week";
import { disconnectGoogle, saveBriefingDay } from "./actions";

const MESSAGES: Record<string, { text: string; good: boolean }> = {
  "day:saved": { text: "Saved. Your briefing day is set.", good: true },
  "day:invalid": { text: "Please pick a day of the week.", good: false },
  "google:disconnected": { text: "Disconnected. Steady can no longer read your calendar.", good: true },
  "google:denied": { text: "No problem: Google Calendar wasn't connected. You can try again any time.", good: false },
  "google:failed": { text: "Connecting to Google didn't work. Please try again.", good: false },
  "google:not-configured": {
    text: "Google sign-in isn't set up on this site yet (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
    good: false,
  },
};

const BUTTON = "rounded-xl bg-sage px-4 py-2 font-semibold text-white transition hover:bg-sage-dark";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const [{ briefingDay, connected }, params] = await Promise.all([getBriefingSettings(user.id), searchParams]);
  const message = ["day", "google"].map((k) => MESSAGES[`${k}:${params[k]}`]).find(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted">Set up your weekly briefing.</p>
      </div>

      {message && (
        <p
          role="status"
          className={`rounded-2xl px-4 py-3 text-sm ${message.good ? "bg-sage-light text-sage-dark" : "bg-amber-light text-amber"}`}
        >
          {message.text}
        </p>
      )}

      <section className="space-y-4 rounded-3xl border border-border bg-surface p-6">
        <h2 className="font-bold">🗓️ Google Calendar</h2>
        {connected ? (
          <>
            <p className="text-muted">
              Connected. Steady can <strong>read</strong> your calendar (never change it) to build{" "}
              <Link href="/week" className="font-semibold text-sage-dark hover:underline">
                Your week
              </Link>
              .
            </p>
            <form action={disconnectGoogle}>
              <button className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-sage-light">
                Disconnect
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-muted">
              Connect your Google Calendar so Steady can show every event from your next 7 days. Read-only:
              Steady never changes your calendar.
            </p>
            {googleConfigured() ? (
              // A plain link: this goes to our server, which sends you on to Google.
              <a href="/api/google/connect" className={`inline-block ${BUTTON}`}>
                Connect Google Calendar
              </a>
            ) : (
              <p className="text-sm text-amber">Google sign-in isn&apos;t set up on this site yet.</p>
            )}
          </>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6">
        <form action={saveBriefingDay} className="space-y-4">
          <label className="block">
            <span className="font-bold">Briefing day</span>
            <span className="mt-1 block text-sm text-muted">
              On this day, Home reminds you to look at your week ahead.
            </span>
            <select
              name="briefingDay"
              defaultValue={String(briefingDay)}
              className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-sage focus:ring-2 focus:ring-sage-light"
            >
              {WEEKDAYS.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button className={BUTTON}>Save</button>
        </form>
      </section>
    </div>
  );
}
