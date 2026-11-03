"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AssignmentFormState } from "./actions";
import { ASSIGNMENT_TYPES, type Assignment } from "./shared";
import { TITLE_MAX_LENGTH } from "@/lib/validation";

const inputClass =
  "rounded-md border bg-background px-3 py-2 outline-none focus:border-accent";

// Red outline on fields with a problem.
function borderFor(error?: string) {
  return error ? "border-red-400" : "border-white/10";
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-sm text-red-400">
      {message}
    </span>
  );
}

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
  const errors = state.fieldErrors ?? {};
  // After an error, show what the user typed instead of the saved values.
  const values = state.values ?? assignment;

  return (
    // Dropdowns don't pick up new defaultValues after React resets the form,
    // so remount it after each failed save to show what the user chose.
    <form
      key={state.attempt ?? 0}
      action={formAction}
      noValidate
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface p-6"
    >
      <label className="flex flex-col gap-1 text-sm">
        Course *
        <select
          name="course_id"
          defaultValue={values?.course_id ?? ""}
          aria-invalid={Boolean(errors.course_id)}
          aria-describedby="course-error"
          className={`${inputClass} ${borderFor(errors.course_id)}`}
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
        <FieldError id="course-error" message={errors.course_id} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Title *
        <input
          name="title"
          defaultValue={values?.title}
          placeholder="Problem Set 4"
          maxLength={TITLE_MAX_LENGTH + 50}
          aria-invalid={Boolean(errors.title)}
          aria-describedby="title-error"
          className={`${inputClass} ${borderFor(errors.title)}`}
        />
        <FieldError id="title-error" message={errors.title} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Type
          <select
            name="type"
            defaultValue={values?.type ?? "homework"}
            className={`${inputClass} ${borderFor()} capitalize`}
          >
            {ASSIGNMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Due date *
          <input
            name="due_date"
            type="date"
            defaultValue={values?.due_date}
            aria-invalid={Boolean(errors.due_date)}
            aria-describedby="due-date-error"
            className={`${inputClass} ${borderFor(errors.due_date)} [color-scheme:dark]`}
          />
          <FieldError id="due-date-error" message={errors.due_date} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea
          name="notes"
          rows={3}
          defaultValue={values?.notes ?? ""}
          className={`${inputClass} ${borderFor()}`}
        />
      </label>

      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm text-red-400">
          Please fix the highlighted fields above.
        </p>
      )}
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
