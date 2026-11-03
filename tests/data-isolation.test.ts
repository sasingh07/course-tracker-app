// Test 1: data isolation (PLAN.md section 4).
//
// Given User A has a course and an assignment,
// when User B logs in and looks at assignments,
// then User B sees none of User A's courses or assignments.
//
// This talks to the real Supabase database as two test users, so it checks
// the actual row-level security rules, not a copy of them.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Logs in as a test user (creating the account the first time).
async function logIn(email: string, password: string) {
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    const { error: signUpError } = await client.auth.signUp({ email, password });
    if (signUpError) throw signUpError;
  }
  return client;
}

describe("data isolation", () => {
  let userA: SupabaseClient;
  let userB: SupabaseClient;
  let courseId: string;
  let assignmentId: string;

  beforeAll(async () => {
    userA = await logIn(process.env.TEST_USER_A_EMAIL!, process.env.TEST_USER_A_PASSWORD!);
    userB = await logIn(process.env.TEST_USER_B_EMAIL!, process.env.TEST_USER_B_PASSWORD!);

    // Given: User A has a course and an assignment.
    const course = await userA
      .from("courses")
      .insert({ name: "Isolation test course" })
      .select("id")
      .single();
    if (course.error) throw course.error;
    courseId = course.data.id;

    const assignment = await userA
      .from("assignments")
      .insert({ course_id: courseId, title: "User A's private assignment", due_date: "2026-11-20" })
      .select("id")
      .single();
    if (assignment.error) throw assignment.error;
    assignmentId = assignment.data.id;
  });

  afterAll(async () => {
    // Clean up: deleting the course also deletes its assignment.
    if (courseId) await userA.from("courses").delete().eq("id", courseId);
  });

  it("User A can see their own assignment (so the test setup worked)", async () => {
    const { data } = await userA.from("assignments").select("id").eq("id", assignmentId);
    expect(data).toHaveLength(1);
  });

  it("User B's assignment list does not include User A's assignment", async () => {
    const { data, error } = await userB.from("assignments").select("id");
    expect(error).toBeNull();
    expect(data!.map((row) => row.id)).not.toContain(assignmentId);
  });

  it("User B's course list does not include User A's course", async () => {
    const { data, error } = await userB.from("courses").select("id");
    expect(error).toBeNull();
    expect(data!.map((row) => row.id)).not.toContain(courseId);
  });

  it("User B cannot open User A's assignment directly by its id", async () => {
    const { data } = await userB
      .from("assignments")
      .select("id, title")
      .eq("id", assignmentId)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("User B cannot edit User A's assignment", async () => {
    await userB.from("assignments").update({ title: "Hacked by B" }).eq("id", assignmentId);
    const { data } = await userA
      .from("assignments")
      .select("title")
      .eq("id", assignmentId)
      .single();
    expect(data!.title).toBe("User A's private assignment");
  });
});
