"use client";

import { useActionState } from "react";
import { addCourse, type CourseFormState } from "./actions";
import { COURSE_COLORS } from "./colors";

const inputClass =
  "rounded-md border border-white/10 bg-background px-3 py-2 outline-none focus:border-accent";

export function CourseForm() {
  const [state, formAction, pending] = useActionState<CourseFormState, FormData>(
    addCourse,
    {},
  );

  return (
    // Changing the key after a successful save clears the form.
    <form
      key={state.savedAt ?? 0}
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface p-6"
    >
      <h2 className="font-medium">Add a course</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Name *
          <input name="name" placeholder="Intro to Coding" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Code
          <input name="code" placeholder="UGBA 196" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Instructor
          <input name="instructor" className={inputClass} />
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
                defaultChecked={i === 0}
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

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add course"}
      </button>
    </form>
  );
}
