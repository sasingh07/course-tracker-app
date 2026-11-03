"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AssignmentFormState } from "./actions";
import { ASSIGNMENT_TYPES, type Assignment } from "./shared";

const inputClass =
  "rounded-md border border-white/10 bg-background px-3 py-2 outline-none focus:border-accent";

type Course = { id: string; name: string };

// Used by both "New assignment" and "Edit assignment".
export function AssignmentForm({
  action,
  courses,
  assignment,
  submitLabel,
  cancelHref,
}: {
  action: (
    prev: AssignmentFormState,
    formData: FormData,
  ) => Promise<AssignmentFormState>;
  courses: Course[];
  assignment?: Assignment;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface p-6"
    >
      <label className="flex flex-col gap-1 text-sm">
        Course
        <select
          name="course_id"
          defaultValue={assignment?.course_id ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Choose a course…
          </option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          name="title"
          defaultValue={assignment?.title}
          placeholder="Problem Set 4"
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Type
          <select
            name="type"
            defaultValue={assignment?.type ?? "homework"}
            className={`${inputClass} capitalize`}
          >
            {ASSIGNMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Due date
          <input
            name="due_date"
            type="date"
            defaultValue={assignment?.due_date}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea
          name="notes"
          rows={3}
          defaultValue={assignment?.notes ?? ""}
          className={inputClass}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-md border border-white/10 px-4 py-2 hover:bg-background"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
