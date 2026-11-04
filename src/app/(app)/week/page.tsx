import { headers } from "next/headers";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getMyWeek } from "@/lib/briefing";

const LINK = "font-semibold text-sage-dark hover:underline";

export default async function WeekPage() {
  const user = await requireUser();
  const fallbackTimeZone = (await headers()).get("x-vercel-ip-timezone") ?? "UTC";
  const week = await getMyWeek(user.id, new Date(), fallbackTimeZone);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Your week</h1>
        <p className="mt-1 text-muted">Everything on your calendar for the next 7 days.</p>
      </div>

      {week.status === "not-connected" && (
        <Notice>
          Connect Google Calendar on the{" "}
          <Link href="/settings" className={LINK}>
            Settings
          </Link>{" "}
          page and your week will show up here.
        </Notice>
      )}
      {week.status === "reconnect" && (
        <Notice>
          Google stopped sharing your calendar (access was removed or expired). Please{" "}
          <Link href="/settings" className={LINK}>
            connect it again
          </Link>
          .
        </Notice>
      )}
      {week.status === "unavailable" && (
        <Notice>Couldn&apos;t reach Google Calendar right now. Please try again in a minute.</Notice>
      )}

      {week.status === "ok" && (
        <>
          <p className="text-sm text-muted">
            {week.total === 0 ? "Nothing scheduled. A quiet week." : `${week.total} ${week.total === 1 ? "event" : "events"}`} ·
            times in {week.timeZone.replaceAll("_", " ")}
          </p>
          <ol className="space-y-4">
            {week.days.map((day) => (
              <li key={day.date} className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="font-bold">
                  {day.label}
                  {day.isToday && <span className="ml-2 text-sm font-semibold text-sage-dark">Today</span>}
                </h2>
                {day.events.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">Nothing scheduled.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {day.events.map((e) => (
                      <li key={e.id} className="flex gap-3">
                        <span className="w-36 shrink-0 text-sm text-muted">{e.time}</span>
                        <span className="min-w-0">
                          <span className="font-semibold">{e.title}</span>
                          {e.location && <span className="block text-sm text-muted">{e.location}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-3xl bg-lavender-light p-8 text-center text-muted">{children}</p>;
}
