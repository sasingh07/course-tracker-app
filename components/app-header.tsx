import Link from "next/link";
import { logout } from "@/app/auth/actions";

// Top bar shown on every logged-in page.
export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-semibold">
          Course Tracker
        </Link>
        <nav className="flex gap-4 text-sm text-muted">
          <Link href="/" className="hover:text-foreground">
            Assignments
          </Link>
          <Link href="/courses" className="hover:text-foreground">
            Courses
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted">{email}</span>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-white/10 px-3 py-1.5 hover:bg-surface"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
