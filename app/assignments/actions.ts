"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  validateAssignment,
  type AssignmentInput,
  type FieldErrors,
} from "@/lib/validation";
import { checkRows, MAX_IMPORT_ROWS, type CsvRow } from "@/lib/csv-import";

export type AssignmentFormState = {
  error?: string;
  fieldErrors?: FieldErrors;
  // What the user typed, so the form can show it again after an error.
  values?: AssignmentInput;
  // Changes on every failed save, so the form remounts with `values`.
  attempt?: number;
};

function readAssignment(formData: FormData): AssignmentInput {
  const notes = String(formData.get("notes") ?? "").trim();
  return {
    course_id: String(formData.get("course_id") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    type: String(formData.get("type") ?? "homework"),
    due_date: String(formData.get("due_date") ?? ""),
    notes: notes || null,
    estimated_hours: String(formData.get("estimated_hours") ?? "").trim(),
  };
}

// The form sends hours as text; the database stores a number (or null).
function toRow(values: AssignmentInput) {
  return {
    ...values,
    estimated_hours: values.estimated_hours === "" ? null : Number(values.estimated_hours),
  };
}

export async function createAssignment(
  _prev: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  const values = readAssignment(formData);
  const fieldErrors = validateAssignment(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values, attempt: Date.now() };
  }

  const supabase = await createClient();
  // user_id is filled in by the database (default auth.uid()).
  const { data, error } = await supabase
    .from("assignments")
    .insert(toRow(values))
    .select("id")
    .single();
  if (error) {
    return { error: "Couldn't save the assignment. Please try again.", values, attempt: Date.now() };
  }
  revalidatePath("/");
  redirect(`/assignments/${data.id}`);
}

export async function updateAssignment(
  id: string,
  _prev: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  const values = readAssignment(formData);
  const fieldErrors = validateAssignment(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values, attempt: Date.now() };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("assignments").update(toRow(values)).eq("id", id);
  if (error) {
    return { error: "Couldn't save your changes. Please try again.", values, attempt: Date.now() };
  }
  revalidatePath("/");
  redirect(`/assignments/${id}`);
}

export type ImportResult = { imported: number; skipped: number; error?: string };

// CSV import (feature 10). Re-checks every row on the server (the browser
// preview could be skipped), saves the good rows, and skips the bad ones.
export async function importAssignments(
  courseId: string,
  rows: CsvRow[],
): Promise<ImportResult> {
  if (!courseId) {
    return { imported: 0, skipped: rows.length, error: "Please choose a course." };
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      imported: 0,
      skipped: rows.length,
      error: `Please import at most ${MAX_IMPORT_ROWS} rows at a time.`,
    };
  }

  const checked = checkRows(rows, courseId);
  const good = checked.filter((row) => row.errors.length === 0);
  if (good.length > 0) {
    const supabase = await createClient();
    // Row Level Security rejects the whole batch if the course isn't the user's.
    const { error } = await supabase
      .from("assignments")
      .insert(good.map((row) => toRow(row.input)));
    if (error) {
      return {
        imported: 0,
        skipped: rows.length,
        error: "Couldn't save the assignments. Please try again.",
      };
    }
  }

  revalidatePath("/");
  return { imported: good.length, skipped: checked.length - good.length };
}

export async function deleteAssignment(id: string) {
  const supabase = await createClient();
  await supabase.from("assignments").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}

// Adds or removes this user's row in the stars table.
export async function setStarred(assignmentId: string, starred: boolean) {
  const supabase = await createClient();
  if (starred) {
    // user_id is filled in by the database (default auth.uid()).
    await supabase.from("stars").insert({ assignment_id: assignmentId });
  } else {
    // Row Level Security limits this to the logged-in user's own star.
    await supabase.from("stars").delete().eq("assignment_id", assignmentId);
  }
  revalidatePath("/");
  revalidatePath(`/assignments/${assignmentId}`);
}

export async function setAssignmentDone(id: string, isDone: boolean) {
  const supabase = await createClient();
  await supabase.from("assignments").update({ is_done: isDone }).eq("id", id);
  revalidatePath("/");
}
