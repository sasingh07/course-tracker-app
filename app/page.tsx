import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import {
  ASSIGNMENT_COLUMNS,
  formatDueDate,
  formatHours,
  type Assignment,
} from "@/app/assignments/shared";
import {
  escapeLike,
  filtersToHref,
  hasActiveFilters,
  parseFilters,
} from "@/app/assignments/filters";
import { DoneCheckbox } from "@/app/assignments/done-checkbox";
import { StarButton } from "@/app/assignments/star-button";
import { Toolbar } from "@/app/assignments/toolbar";
import { CrunchBanner } from "@/components/crunch-banner";
import { todayInBerkeley, upcomingCrunchWeeks } from "@/lib/stats";

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
  const filters = parseFilters(await searchParams);
  const { supabase, email } = await requireUser();

  // Search, course, and status are filtered by the database.
  let query = supabase.from("assignments").select(ASSIGNMENT_COLUMNS);
  if (filters.q) query = query.ilike("title", `%${escapeLike(filters.q)}%`);
  if (filters.course) query = query.eq("course_id", filters.course);
  if (filters.status !== "all") query = query.eq("is_done", filters.status === "done");
  query =
    filters.sort === "newest"
      ? query.order("created_at", { ascending: false })
      : query.order("due_date").order("created_at");

  // Row Level Security means all of these only return the logged-in user's rows.
  const [{ data, error }, { data: stars }, { data: courses }, { data: workload }] =
    await Promise.all([
      query,
      supabase.from("stars").select("assignment_id"),
      supabase.from("courses").select("id, name").order("name"),
      // Every assignment (ignoring filters), for the total and the crunch warning.
      supabase.from("assignments").select("due_date, is_done, estimated_hours"),
    ]);
  const total = workload?.length ?? 0;
  const crunchWeeks = upcomingCrunchWeeks(workload ?? [], todayInBerkeley());
  const starredIds = new Set((stars ?? []).map((s) => s.assignment_id as string));
  const matching = (data ?? []) as unknown as Assignment[];
  const assignments = filters.starred
    ? matching.filter((a) => starredIds.has(a.id))
    : matching;

  return (
    <>
      <AppHeader email={email} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assignments</h1>
        <div className="flex gap-2">
          <Link
            href="/assignments/import"
            className="rounded-md border border-white/10 px-4 py-2 text-sm hover:bg-surface"
          >
            Import CSV
          </Link>
          <Link
            href="/assignments/new"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + New assignment
          </Link>
        </div>
      </div>

      <CrunchBanner weeks={crunchWeeks} showDashboardLink />

      <nav className="mb-4 flex gap-1 text-sm" aria-label="Filter assignments">
        <ViewTab href={filtersToHref({ ...filters, starred: false })} active={!filters.starred}>
          All ({total})
        </ViewTab>
        <ViewTab href={filtersToHref({ ...filters, starred: true })} active={filters.starred}>
          Starred ★ ({starredIds.size})
        </ViewTab>
      </nav>

      <Toolbar filters={filters} courses={courses ?? []} />

      {error && (
        <p role="alert" className="mb-6 text-sm text-red-400">
          Couldn&apos;t load your assignments. Please refresh the page.
        </p>
      )}

      {!error && assignments.length === 0 && (
        <EmptyMessage
          noAssignmentsYet={!total}
          noStarsYet={filters.starred && starredIds.size === 0}
          starred={filters.starred}
          filtered={hasActiveFilters(filters)}
          clearHref={filtersToHref({ ...filters, q: "", course: "", status: "all" })}
        />
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
              <span className="w-10 text-right text-xs text-muted">
                {formatHours(a.estimated_hours)}
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

function EmptyMessage({
  noAssignmentsYet,
  noStarsYet,
  starred,
  filtered,
  clearHref,
}: {
  noAssignmentsYet: boolean;
  noStarsYet: boolean;
  starred: boolean;
  filtered: boolean;
  clearHref: string;
}) {
  if (noAssignmentsYet) {
    return (
      <p className="text-muted">
        No assignments yet. Click &ldquo;New assignment&rdquo; to add one (you&apos;ll
        need at least one{" "}
        <Link href="/courses" className="text-accent hover:underline">
          course
        </Link>
        ).
      </p>
    );
  }
  if (noStarsYet) {
    return (
      <p className="text-muted">
        No starred assignments yet. Click ☆ next to a midterm or project to star it.
      </p>
    );
  }
  if (filtered) {
    return (
      <p className="text-muted">
        No {starred ? "starred " : ""}assignments match these filters.{" "}
        <Link href={clearHref} className="text-accent hover:underline">
          Clear filters
        </Link>
      </p>
    );
  }
  // Default view (not-done only) is empty: everything is finished.
  return (
    <p className="text-muted">
      Nothing left to do 🎉{" "}
      <Link href={clearHref} className="text-accent hover:underline">
        Show finished {starred ? "starred " : ""}assignments
      </Link>
    </p>
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
