import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import {
  ASSIGNMENT_COLUMNS,
  formatDueDate,
  type Assignment,
} from "@/app/assignments/shared";
import { DoneCheckbox } from "@/app/assignments/done-checkbox";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <AssignmentList />
      </Suspense>
    </main>
  );
}

// Reads the login session, so it sits behind <Suspense> (Next.js 16 rule).
async function AssignmentList() {
  const { supabase, email } = await requireUser();
  // Row Level Security means this only returns the logged-in user's assignments.
  const { data, error } = await supabase
    .from("assignments")
    .select(ASSIGNMENT_COLUMNS)
    .order("due_date")
    .order("created_at");
  const assignments = (data ?? []) as unknown as Assignment[];

  return (
    <>
      <AppHeader email={email} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assignments</h1>
        <Link
          href="/assignments/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + New assignment
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-6 text-sm text-red-400">
          Couldn&apos;t load your assignments. Please refresh the page.
        </p>
      )}

      {!error && assignments.length === 0 && (
        <p className="text-muted">
          No assignments yet. Click &ldquo;New assignment&rdquo; to add one (you&apos;ll
          need at least one{" "}
          <Link href="/courses" className="text-accent hover:underline">
            course
          </Link>
          ).
        </p>
      )}

      {assignments.length > 0 && (
        <ul className="flex flex-col divide-y divide-white/10 rounded-xl border border-white/10 bg-surface">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-3">
              <DoneCheckbox id={a.id} isDone={a.is_done} />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: a.courses?.color }}
                title={a.courses?.name}
              />
              <Link
                href={`/assignments/${a.id}`}
                className={`min-w-0 flex-1 truncate hover:underline ${
                  a.is_done ? "text-muted line-through" : ""
                }`}
              >
                {a.title}
              </Link>
              <span className="hidden text-xs capitalize text-muted sm:inline">
                {a.type}
              </span>
              <span className="w-24 text-right text-sm text-muted">
                {formatDueDate(a.due_date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
