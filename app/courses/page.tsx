import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { CourseForm } from "./course-form";

export default function CoursesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Courses />
      </Suspense>
    </main>
  );
}

async function Courses() {
  const { supabase, email } = await requireUser();
  // Row Level Security means this only returns the logged-in user's courses.
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, name, code, instructor, color")
    .order("created_at");

  return (
    <>
      <AppHeader email={email} />
      <h1 className="mb-6 text-2xl font-semibold">My courses</h1>

      {error && (
        <p role="alert" className="mb-6 text-sm text-red-400">
          Couldn&apos;t load your courses. Please refresh the page.
        </p>
      )}

      {courses && courses.length === 0 && (
        <p className="mb-6 text-muted">No courses yet. Add your first one below.</p>
      )}

      {courses && courses.length > 0 && (
        <ul className="mb-8 flex flex-col divide-y divide-white/10 rounded-xl border border-white/10 bg-surface">
          {courses.map((course) => (
            <li key={course.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: course.color }}
              />
              <span className="font-medium">{course.name}</span>
              {course.code && <span className="text-sm text-muted">{course.code}</span>}
              {course.instructor && (
                <span className="ml-auto text-sm text-muted">{course.instructor}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <CourseForm />
    </>
  );
}
