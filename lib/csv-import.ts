// CSV import (feature 10): turns rows from a syllabus CSV into assignments,
// checking each row with the same rules as the New assignment form.
// Pure functions, so the browser preview and the server use the same checks.

import { ASSIGNMENT_TYPES } from "@/app/assignments/shared";
import { validateAssignment, type AssignmentInput } from "@/lib/validation";

export const CSV_COLUMNS = ["title", "due_date", "type", "estimated_hours"] as const;
export const MAX_IMPORT_ROWS = 200;

// One CSV row as text, keyed by column name.
export type CsvRow = Partial<Record<(typeof CSV_COLUMNS)[number], string>>;

export type CheckedRow = {
  line: number; // line number in the file (the header is line 1)
  input: AssignmentInput;
  errors: string[]; // empty = OK to import
};

// "Due Date " -> "due_date"
export function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

// Accepts 2026-11-20 or 11/20/2026 (how Excel and Google Sheets often export).
export function normalizeDate(raw: string) {
  const text = raw.trim();
  const us = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const [, month, day, year] = us;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return text;
}

// Returns a message if the file is missing a required column.
export function checkHeaders(headers: string[]): string | undefined {
  const missing = ["title", "due_date"].filter((column) => !headers.includes(column));
  if (missing.length > 0) {
    return `The file is missing the column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Use the template's header row: ${CSV_COLUMNS.join(",")}`;
  }
  return undefined;
}

export function checkRows(rows: CsvRow[], courseId: string): CheckedRow[] {
  return rows.map((row, index) => {
    const type = (row.type ?? "").trim().toLowerCase();
    const input: AssignmentInput = {
      course_id: courseId,
      title: (row.title ?? "").trim(),
      type: type || "homework",
      due_date: normalizeDate(row.due_date ?? ""),
      notes: null,
      estimated_hours: (row.estimated_hours ?? "").trim(),
    };

    const errors = Object.values(validateAssignment(input));
    if (!(ASSIGNMENT_TYPES as readonly string[]).includes(input.type)) {
      errors.push(`Type must be one of: ${ASSIGNMENT_TYPES.join(", ")}.`);
    }
    return { line: index + 2, input, errors };
  });
}
