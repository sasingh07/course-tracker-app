"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateCourseName } from "@/lib/validation";
import { COURSE_COLORS } from "./colors";

export type CourseFormState = {
  error?: string;
  nameError?: string;
  // Changes on every submit, so the form remounts (cleared, or showing `values`).
  savedAt?: number;
  // What the user typed, so the form can show it again after an error.
  values?: { name: string; code: string; instructor: string; color: string };
};

function readCourse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim(),
    instructor: String(formData.get("instructor") ?? "").trim(),
    color: String(formData.get("color") ?? ""),
  };
}

// The form sends text; the database stores null for blank optional fields.
function toRow(values: ReturnType<typeof readCourse>) {
  return {
    name: values.name,
    code: values.code || null,
    instructor: values.instructor || null,
    color: COURSE_COLORS.includes(values.color) ? values.color : COURSE_COLORS[0],
  };
}

export async function addCourse(
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const values = readCourse(formData);

  const nameError = validateCourseName(values.name);
  if (nameError) {
    return { nameError, values, savedAt: Date.now() };
  }

  const supabase = await createClient();
  // user_id is filled in by the database (default auth.uid()).
  const { error } = await supabase.from("courses").insert(toRow(values));
  if (error) {
    return { error: "Couldn't save the course. Please try again.", values, savedAt: Date.now() };
  }

  revalidatePath("/courses");
  return { savedAt: Date.now() };
}

// Edit a course (found in the stranger test: a typo in a course name
// couldn't be fixed). Assignments keep pointing at the same course.
export async function updateCourse(
  id: string,
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const values = readCourse(formData);

  const nameError = validateCourseName(values.name);
  if (nameError) {
    return { nameError, values, savedAt: Date.now() };
  }

  const supabase = await createClient();
  // Row Level Security limits this to the logged-in user's own course.
  const { error } = await supabase.from("courses").update(toRow(values)).eq("id", id);
  if (error) {
    return { error: "Couldn't save your changes. Please try again.", values, savedAt: Date.now() };
  }

  // The course name and color also show on the assignment pages and dashboard.
  revalidatePath("/", "layout");
  redirect("/courses");
}
