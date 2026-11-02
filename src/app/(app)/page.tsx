import Link from "next/link";

export default function HomePage() {
  return (
    <div className="rounded-3xl bg-lavender-light p-8">
      <h1 className="text-2xl font-bold">Hi, you&apos;re in. 🌿</h1>
      <p className="mt-2 text-muted">
        This is your space. Name the moments that are hard for you on the{" "}
        <Link href="/triggers" className="font-semibold text-sage-dark hover:underline">
          Triggers
        </Link>{" "}
        page, then write{" "}
        <Link href="/affirmations" className="font-semibold text-sage-dark hover:underline">
          affirmations
        </Link>{" "}
        for them.
      </p>
    </div>
  );
}
