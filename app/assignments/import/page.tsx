import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { ImportForm } from "./import-form";

export default function ImportPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Import />
      </Suspense>
    </main>
  );
}

async function Import() {
  const { supabase, email } = await requireUser();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, name")
    .order("name");

  return (
    <>
      <AppHeader email={email} />
      <h1 className="mb-6 text-2xl font-semibold">Import from CSV</h1>
      {courses && courses.length > 0 ? (
        <ImportForm courses={courses} />
      ) : (
        <p className="text-muted">
          Imported assignments go into a course.{" "}
          <Link href="/courses" className="text-accent hover:underline">
            Add a course
          </Link>{" "}
          first.
        </p>
      )}
    </>
  );
}
