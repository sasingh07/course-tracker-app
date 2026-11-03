"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AssignmentFormState = { error?: string };

function readAssignment(formData: FormData) {
  const notes = String(formData.get("notes") ?? "").trim();
  return {
    course_id: String(formData.get("course_id") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    type: String(formData.get("type") ?? "homework"),
    due_date: String(formData.get("due_date") ?? ""),
    notes: notes || null,
  };
}

export async function createAssignment(
  _prev: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  const supabase = await createClient();
  // user_id is filled in by the database (default auth.uid()).
  const { data, error } = await supabase
    .from("assignments")
    .insert(readAssignment(formData))
    .select("id")
    .single();
  if (error) {
    return { error: "Couldn't save the assignment. Please try again." };
  }
  revalidatePath("/");
  redirect(`/assignments/${data.id}`);
}

export async function updateAssignment(
  id: string,
  _prev: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .update(readAssignment(formData))
    .eq("id", id);
  if (error) {
    return { error: "Couldn't save your changes. Please try again." };
  }
  revalidatePath("/");
  redirect(`/assignments/${id}`);
}

export async function deleteAssignment(id: string) {
  const supabase = await createClient();
  await supabase.from("assignments").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}

export async function setAssignmentDone(id: string, isDone: boolean) {
  const supabase = await createClient();
  await supabase.from("assignments").update({ is_done: isDone }).eq("id", id);
  revalidatePath("/");
}
