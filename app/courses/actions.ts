"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COURSE_COLORS } from "./colors";

export type CourseFormState = { error?: string; savedAt?: number };

export async function addCourse(
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const instructor = String(formData.get("instructor") ?? "").trim();
  const color = String(formData.get("color") ?? "");

  if (!name) {
    return { error: "Please enter a course name." };
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
    return { error: "Couldn't save the course. Please try again." };
  }

  revalidatePath("/courses");
  return { savedAt: Date.now() };
}
