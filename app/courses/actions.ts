"use server";

import { revalidatePath } from "next/cache";
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

export async function addCourse(
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const instructor = String(formData.get("instructor") ?? "").trim();
  const color = String(formData.get("color") ?? "");

  const values = { name, code, instructor, color };

  const nameError = validateCourseName(name);
  if (nameError) {
    return { nameError, values, savedAt: Date.now() };
  }

  const supabase = await createClient();
  // user_id is filled in by the database (default auth.uid()).
  const { error } = await supabase.from("courses").insert({
    name,
    code: code || null,
    instructor: instructor || null,
    color: COURSE_COLORS.includes(color) ? color : COURSE_COLORS[0],
  });
  if (error) {
    return { error: "Couldn't save the course. Please try again.", values, savedAt: Date.now() };
  }

  revalidatePath("/courses");
  return { savedAt: Date.now() };
}
