import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";

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
  const { email } = await requireUser();

  return (
    <>
      <AppHeader email={email} />
      <p className="text-muted">
        You&apos;re logged in. Start by adding your{" "}
        <Link href="/courses" className="text-accent hover:underline">
          courses
        </Link>
        . Assignments are coming next.
      </p>
    </>
  );
}
