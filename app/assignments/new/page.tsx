import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { AssignmentForm } from "../assignment-form";
import { createAssignment } from "../actions";

export default function NewAssignmentPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <NewAssignment />
      </Suspense>
    </main>
  );
}

async function NewAssignment() {
  const { supabase, email } = await requireUser();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, name")
    .order("name");

  return (
    <>
      <AppHeader email={email} />
      <h1 className="mb-6 text-2xl font-semibold">New assignment</h1>
      {courses && courses.length > 0 ? (
        <AssignmentForm
          action={createAssignment}
          courses={courses}
          submitLabel="Add assignment"
          cancelHref="/"
        />
      ) : (
        <p className="text-muted">
          Every assignment belongs to a course.{" "}
          <Link href="/courses" className="text-accent hover:underline">
            Add a course
          </Link>{" "}
          first.
        </p>
      )}
    </>
  );
}
