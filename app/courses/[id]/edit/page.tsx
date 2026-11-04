import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { CourseForm } from "../../course-form";
import { updateCourse } from "../../actions";

export default function EditCoursePage({ params }: PageProps<"/courses/[id]/edit">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <EditCourse params={params} />
      </Suspense>
    </main>
  );
}

async function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, email } = await requireUser();
  // Row Level Security: someone else's course id returns nothing (404).
  const { data: course } = await supabase
    .from("courses")
    .select("id, name, code, instructor, color")
    .eq("id", id)
    .maybeSingle();
  if (!course) {
    notFound();
  }

  return (
    <>
      <AppHeader email={email} />
      <h1 className="mb-6 text-2xl font-semibold">Edit course</h1>
      <CourseForm
        action={updateCourse.bind(null, course.id)}
        course={course}
        title={course.name}
        submitLabel="Save changes"
        pendingLabel="Saving…"
        cancelHref="/courses"
      />
    </>
  );
}
