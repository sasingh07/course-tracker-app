// Dashboard math (feature 7). Pure functions with no database access,
// so the dashboard test can check the numbers directly.
//
// Dates are "YYYY-MM-DD" strings. Weeks start on Monday.

// Fall 2026 semester. The chart always covers at least these weeks.
export const SEMESTER_START = "2026-08-24";
export const SEMESTER_END = "2026-12-18";

// "This week" is decided in Berkeley's time zone, not the server's.
export const TIME_ZONE = "America/Los_Angeles";

export type StatsInput = { due_date: string; is_done: boolean };

export type WeekBucket = {
  weekStart: string; // the Monday, "YYYY-MM-DD"
  label: string; // "Nov 16"
  done: number;
  notDone: number;
};

export type DashboardStats = {
  dueThisWeek: number;
  doneThisWeek: number;
  percentDoneThisWeek: number | null; // null when nothing is due this week
  busiestWeek: { weekStart: string; label: string; count: number } | null;
  weeks: WeekBucket[];
};

// Today's date as "YYYY-MM-DD" in Berkeley's time zone.
export function todayInBerkeley(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

function toDate(day: string) {
  return new Date(`${day}T00:00:00Z`);
}

function toDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(day: string, days: number) {
  const date = toDate(day);
  date.setUTCDate(date.getUTCDate() + days);
  return toDay(date);
}

// The Monday on or before this day.
export function weekStartOf(day: string) {
  const weekday = toDate(day).getUTCDay(); // 0 = Sunday … 6 = Saturday
  const daysSinceMonday = (weekday + 6) % 7;
  return addDays(day, -daysSinceMonday);
}

export function weekLabel(weekStart: string) {
  return toDate(weekStart).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function computeStats(assignments: StatsInput[], today: string): DashboardStats {
  const thisWeek = weekStartOf(today);

  // Due this week, and how many of those are done.
  const thisWeeks = assignments.filter((a) => weekStartOf(a.due_date) === thisWeek);
  const dueThisWeek = thisWeeks.length;
  const doneThisWeek = thisWeeks.filter((a) => a.is_done).length;
  const percentDoneThisWeek =
    dueThisWeek === 0 ? null : Math.round((doneThisWeek / dueThisWeek) * 100);

  // One bucket per week, from the semester's first week to its last
  // (stretched if any assignment falls outside the semester).
  const dueDates = assignments.map((a) => a.due_date).sort();
  const firstWeek = weekStartOf(
    dueDates[0] && dueDates[0] < SEMESTER_START ? dueDates[0] : SEMESTER_START,
  );
  const lastDue = dueDates[dueDates.length - 1];
  const lastWeek = weekStartOf(lastDue && lastDue > SEMESTER_END ? lastDue : SEMESTER_END);

  const byWeek = new Map<string, WeekBucket>();
  for (let week = firstWeek; week <= lastWeek; week = addDays(week, 7)) {
    byWeek.set(week, { weekStart: week, label: weekLabel(week), done: 0, notDone: 0 });
  }
  for (const a of assignments) {
    const bucket = byWeek.get(weekStartOf(a.due_date));
    if (!bucket) continue;
    if (a.is_done) bucket.done += 1;
    else bucket.notDone += 1;
  }
  const weeks = [...byWeek.values()];

  // Busiest week from this week onward (earliest one wins a tie).
  let busiestWeek: DashboardStats["busiestWeek"] = null;
  for (const week of weeks) {
    const count = week.done + week.notDone;
    if (week.weekStart >= thisWeek && count > 0 && count > (busiestWeek?.count ?? 0)) {
      busiestWeek = { weekStart: week.weekStart, label: week.label, count };
    }
  }

  return { dueThisWeek, doneThisWeek, percentDoneThisWeek, busiestWeek, weeks };
}
