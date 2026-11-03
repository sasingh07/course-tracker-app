import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import {
  computeStats,
  todayInBerkeley,
  upcomingCrunchWeeks,
  weekLabel,
  weekStartOf,
} from "@/lib/stats";
import { CrunchBanner } from "@/components/crunch-banner";
import { WeeklyChart } from "./weekly-chart";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  const { supabase, email } = await requireUser();
  // Row Level Security means this only returns the logged-in user's assignments.
  const { data, error } = await supabase.from("assignments").select("due_date, is_done, estimated_hours");

  const today = todayInBerkeley();
  const stats = computeStats(data ?? [], today);
  const thisWeekLabel = weekLabel(weekStartOf(today));
  const crunchWeeks = upcomingCrunchWeeks(data ?? [], today);

  return (
    <>
      <AppHeader email={email} />
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      {error && (
        <p role="alert" className="mb-6 text-sm text-red-400">
          Couldn&apos;t load your assignments. Please refresh the page.
        </p>
      )}

      <CrunchBanner weeks={crunchWeeks} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard label="Due this week" value={String(stats.dueThisWeek)} />
        <StatCard
          label="Completed this week"
          value={
            stats.percentDoneThisWeek === null ? "—" : `${stats.percentDoneThisWeek}%`
          }
          detail={
            stats.dueThisWeek > 0
              ? `${stats.doneThisWeek} of ${stats.dueThisWeek} done`
              : "Nothing due this week"
          }
        />
        <StatCard
          label="Hours due this week"
          value={`${stats.hoursThisWeek}h`}
          detail="From estimated hours"
        />
        <StatCard
          label="Busiest upcoming week"
          value={stats.busiestWeek ? `Week of ${stats.busiestWeek.label}` : "—"}
          detail={
            stats.busiestWeek
              ? `${stats.busiestWeek.count} assignment${stats.busiestWeek.count === 1 ? "" : "s"} due`
              : "Nothing upcoming"
          }
        />
      </div>

      <section className="rounded-xl border border-white/10 bg-surface p-6">
                <WeeklyChart weeks={stats.weeks} thisWeekLabel={thisWeekLabel} />
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </div>
  );
}
