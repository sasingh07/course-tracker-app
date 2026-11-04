"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { CourseFormState } from "./actions";
import { COURSE_COLORS } from "./colors";

const inputClass =
  "rounded-md border border-white/10 bg-background px-3 py-2 outline-none focus:border-accent";
const inputErrorClass =
  "rounded-md border border-red-400 bg-background px-3 py-2 outline-none focus:border-accent";

type Course = { name: string; code: string | null; instructor: string | null; color: string };

// Used by both "Add a course" and "Edit course".
export function CourseForm({
  action,
  course,
  title,
  submitLabel,
  pendingLabel,
  cancelHref,
}: {
  action: (prev: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  course?: Course;
  title: string;
  submitLabel: string;
  pendingLabel: string;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState<CourseFormState, FormData>(
    action,
    {},
  );
  // After an error, show what the user typed instead of the saved values.
  const values = state.values ?? course;

  return (
    // Remount after every submit: cleared after a save, or showing `values` after an error.
    <form
      key={state.savedAt ?? 0}
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface p-6"
    >
      <h2 className="font-medium">{title}</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Name *
          <input
            name="name"
            placeholder="Intro to Coding"
            defaultValue={values?.name}
            aria-invalid={Boolean(state.nameError)}
            aria-describedby="name-error"
            className={state.nameError ? inputErrorClass : inputClass}
          />
          {state.nameError && (
            <span id="name-error" role="alert" className="text-sm text-red-400">
              {state.nameError}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Code
          <input
            name="code"
            placeholder="UGBA 196"
            defaultValue={values?.code ?? ""}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Instructor
          <input
            name="instructor"
            defaultValue={values?.instructor ?? ""}
            className={inputClass}
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-2">Color</legend>
        <div className="flex flex-wrap gap-2">
          {COURSE_COLORS.map((color, i) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={values ? values.color === color : i === 0}
                className="peer sr-only"
              />
              <span
                className="block h-7 w-7 rounded-full ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-foreground"
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            </label>
          ))}
        </div>
      </fieldset>

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
          {pending ? pendingLabel : submitLabel}
        </button>
        {cancelHref && (
          <Link
            href={cancelHref}
            className="rounded-md border border-white/10 px-4 py-2 hover:bg-background"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
