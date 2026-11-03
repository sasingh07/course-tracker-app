import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Welcome />
      </Suspense>
    </main>
  );
}

// Reads the login session, so it sits behind <Suspense> (Next.js 16 rule).
async function Welcome() {
  // Render per request: the Supabase client reads the clock (Date.now()).
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/login");
  }

  return (
    <>
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Course Tracker</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted">{data.claims.email}</span>
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
      <p className="text-muted">
        You&apos;re logged in. Courses and assignments are coming next.
      </p>
    </>
  );
}
