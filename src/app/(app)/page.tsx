import { headers } from "next/headers";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getBriefingSettings } from "@/lib/briefing";
import { dayKey, pickForDay } from "@/lib/daily";
import { getDashboardStats } from "@/lib/dashboard";
import { weekdayIn } from "@/lib/week";
import { listMyAffirmations } from "./affirmations/data";
import { DailyCard } from "./daily-card";
import { TriggerChart } from "./trigger-chart";

const LINK = "font-semibold text-sage-dark hover:underline";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const [stats, mine, { another }, headerList, briefing] = await Promise.all([
    getDashboardStats(user.id),
    listMyAffirmations(user.id),
    searchParams,
    headers(),
    getBriefingSettings(user.id),
  ]);
  // Vercel tells us the visitor's timezone, so "today" flips at their midnight.
  const timeZone = headerList.get("x-vercel-ip-timezone") ?? undefined;
  const day = dayKey(new Date(), timeZone);
  const isBriefingDay = briefing.connected && weekdayIn(new Date(), timeZone) === briefing.briefingDay;
  const n = Number(another);
  const step = Number.isSafeInteger(n) && n > 0 ? n : 0;
  const daily = pickForDay(mine, { userId: user.id, day, step });

  const briefingCard = isBriefingDay && (
    <Link
      href="/week"
      className="block rounded-3xl border border-sage bg-sage-light p-6 transition hover:bg-surface"
    >
      <p className="font-bold text-sage-dark">🗓️ It&apos;s your briefing day</p>
      <p className="mt-1 text-muted">Take a calm look at your week ahead →</p>
    </Link>
  );

  if (stats.total === 0) {
    return (
      <div className="space-y-8">
        <div className="rounded-3xl bg-lavender-light p-8">
          <h1 className="text-2xl font-bold">Hi, you&apos;re in. 🌿</h1>
          <p className="mt-2 text-muted">
            This is your space. Name the moments that are hard for you on the{" "}
            <Link href="/triggers" className={LINK}>
              Triggers
            </Link>{" "}
            page, then write{" "}
            <Link href="/affirmations" className={LINK}>
              affirmations
            </Link>{" "}
            for them. Your dashboard fills in from there.
          </p>
        </div>
        {briefingCard}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {daily && <DailyCard affirmation={daily} step={step} total={mine.length} />}
      {briefingCard}

      <div>
        <h2 className="text-2xl font-bold">Your dashboard</h2>
        <p className="mt-1 text-muted">Where you&apos;re putting your energy.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Affirmations" value={stats.total} href="/affirmations" />
        <Stat label="Starred" value={stats.starred} href="/starred" />
        <Stat
          label="Top trigger"
          value={stats.topTrigger ? `${stats.topTrigger.emoji} ${stats.topTrigger.name}` : "—"}
          small
        />
      </div>

      <section className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-bold">Affirmations per trigger</h2>
        <TriggerChart data={stats.perTrigger} />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  small = false,
}: {
  label: string;
  value: string | number;
  href?: string;
  small?: boolean;
}) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 font-bold ${small ? "text-xl leading-snug" : "text-4xl"}`}>{value}</p>
    </>
  );
  const box = "block h-full rounded-2xl border border-border bg-surface p-5";
  return (
    <div>
      {href ? (
        <Link href={href} className={`${box} transition hover:border-sage`}>
          {body}
        </Link>
      ) : (
        <div className={box}>{body}</div>
      )}
    </div>
  );
}
