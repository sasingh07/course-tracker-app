import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { ASSIGNMENT_COLUMNS, formatDueDate, type Assignment } from "../shared";
import { DeleteButton } from "../delete-button";

export default function AssignmentPage({ params }: PageProps<"/assignments/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <AssignmentDetail params={params} />
      </Suspense>
    </main>
  );
}

async function AssignmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, email } = await requireUser();
  // Row Level Security: someone else's assignment id returns nothing (404).
  const { data } = await supabase
    .from("assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) {
    notFound();
  }
  const assignment = data as unknown as Assignment;

  return (
    <>
      <AppHeader email={email} />
      <Link href="/" className="mb-6 text-sm text-muted hover:text-foreground">
        ← All assignments
      </Link>

      <div className="flex flex-col gap-6 rounded-xl border border-white/10 bg-surface p-6">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm text-muted">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: assignment.courses?.color }}
            />
            {assignment.courses?.name}
          </p>
          <h1 className="text-2xl font-semibold">{assignment.title}</h1>
        </div>

        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-muted">Type</dt>
            <dd className="capitalize">{assignment.type}</dd>
          </div>
          <div>
            <dt className="text-muted">Due</dt>
            <dd>{formatDueDate(assignment.due_date)}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd>{assignment.is_done ? "Done ✓" : "Not done"}</dd>
          </div>
        </dl>

        {assignment.notes && (
          <div className="text-sm">
            <p className="mb-1 text-muted">Notes</p>
            <p className="whitespace-pre-wrap">{assignment.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/assignments/${assignment.id}/edit`}
            className="rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90"
          >
            Edit
          </Link>
          <DeleteButton id={assignment.id} title={assignment.title} />
        </div>
      </div>
    </>
  );
}
