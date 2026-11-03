import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { AssignmentForm } from "../../assignment-form";
import { updateAssignment } from "../../actions";
import { ASSIGNMENT_COLUMNS, type Assignment } from "../../shared";

export default function EditAssignmentPage({
  params,
}: PageProps<"/assignments/[id]/edit">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <EditAssignment params={params} />
      </Suspense>
    </main>
  );
}

async function EditAssignment({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, email } = await requireUser();
  const [{ data }, { data: courses }] = await Promise.all([
    supabase.from("assignments").select(ASSIGNMENT_COLUMNS).eq("id", id).maybeSingle(),
    supabase.from("courses").select("id, name").order("name"),
  ]);
  if (!data) {
    notFound();
  }
  const assignment = data as unknown as Assignment;

  return (
    <>
      <AppHeader email={email} />
      <h1 className="mb-6 text-2xl font-semibold">Edit assignment</h1>
      <AssignmentForm
        action={updateAssignment.bind(null, assignment.id)}
        courses={courses ?? []}
        assignment={assignment}
        submitLabel="Save changes"
        cancelHref={`/assignments/${assignment.id}`}
      />
    </>
  );
}
