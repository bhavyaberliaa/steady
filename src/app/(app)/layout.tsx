import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "../(auth)/actions";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/affirmations", label: "Affirmations" },
  { href: "/starred", label: "Starred" },
  { href: "/triggers", label: "Triggers" },
  { href: "/week", label: "Your week" },
  { href: "/settings", label: "Settings" },
];

// Every page in this group is private: visitors are sent to /login.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border bg-surface px-4 py-3 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/" className="text-lg font-bold text-sage-dark">
            Steady
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-muted">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-sage-dark">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted sm:inline">{user.email}</span>
          <form action={logout}>
            <button className="rounded-full border border-border px-4 py-1.5 font-semibold hover:bg-sage-light">
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">{children}</main>
    </>
  );
}
