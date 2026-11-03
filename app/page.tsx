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
import { StarButton } from "@/app/assignments/star-button";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <AssignmentList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// Reads the login session, so it sits behind <Suspense> (Next.js 16 rule).
async function AssignmentList({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const { view } = await searchParams;
  const showStarred = view === "starred";
  const { supabase, email } = await requireUser();

  // Row Level Security means both only return the logged-in user's rows.
  const [{ data, error }, { data: stars }] = await Promise.all([
    supabase
      .from("assignments")
      .select(ASSIGNMENT_COLUMNS)
      .order("due_date")
      .order("created_at"),
    supabase.from("stars").select("assignment_id"),
  ]);
  const allAssignments = (data ?? []) as unknown as Assignment[];
  const starredIds = new Set((stars ?? []).map((s) => s.assignment_id as string));
  const assignments = showStarred
    ? allAssignments.filter((a) => starredIds.has(a.id))
    : allAssignments;

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

      <nav className="mb-4 flex gap-1 text-sm" aria-label="Filter assignments">
        <ViewTab href="/" active={!showStarred}>
          All ({allAssignments.length})
        </ViewTab>
        <ViewTab href="/?view=starred" active={showStarred}>
          Starred ★ ({starredIds.size})
        </ViewTab>
      </nav>

      {error && (
        <p role="alert" className="mb-6 text-sm text-red-400">
          Couldn&apos;t load your assignments. Please refresh the page.
        </p>
      )}

      {!error && assignments.length === 0 && !showStarred && (
        <p className="text-muted">
          No assignments yet. Click &ldquo;New assignment&rdquo; to add one (you&apos;ll
          need at least one{" "}
          <Link href="/courses" className="text-accent hover:underline">
            course
          </Link>
          ).
        </p>
      )}

      {!error && assignments.length === 0 && showStarred && (
        <p className="text-muted">
          No starred assignments yet. Click ☆ next to a midterm or project to star it.
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
              <StarButton id={a.id} starred={starredIds.has(a.id)} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ViewTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-md px-3 py-1.5 ${
        active ? "bg-surface text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
