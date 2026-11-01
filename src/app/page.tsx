import { requireUser } from "@/lib/auth";
import { logout } from "./(auth)/actions";

export default async function HomePage() {
  const user = await requireUser();

  return (
    <>
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-8">
        <span className="text-lg font-bold text-sage-dark">Steady</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted sm:inline">{user.email}</span>
          <form action={logout}>
            <button className="rounded-full border border-border px-4 py-1.5 font-semibold hover:bg-sage-light">
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <div className="rounded-3xl bg-lavender-light p-8">
          <h1 className="text-2xl font-bold">Hi, you&apos;re in. 🌿</h1>
          <p className="mt-2 text-muted">
            This is your space. Your affirmations will live here soon.
          </p>
        </div>
      </main>
    </>
  );
}
