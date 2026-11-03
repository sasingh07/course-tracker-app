// Assignment types allowed by the database (PLAN.md section 3).
export const ASSIGNMENT_TYPES = [
  "homework",
  "reading",
  "quiz",
  "exam",
  "project",
  "paper",
] as const;

export type Assignment = {
  id: string;
  course_id: string;
  title: string;
  type: string;
  due_date: string; // "YYYY-MM-DD"
  is_done: boolean;
  notes: string | null;
  estimated_hours: number | null;
  courses: { name: string; color: string } | null;
};

// The columns every assignment page needs, including its course.
export const ASSIGNMENT_COLUMNS =
  "id, course_id, title, type, due_date, is_done, notes, estimated_hours, courses(name, color)";

// "2026-11-14" -> "Sat, Nov 14". Due dates have no time, so use UTC to avoid
// the date shifting by a day in some time zones.
export function formatDueDate(dueDate: string) {
  return new Date(`${dueDate}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// 2 -> "2h", 1.5 -> "1.5h"
export function formatHours(hours: number | null) {
  return hours === null ? "" : `${Number(hours)}h`;
}
