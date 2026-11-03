"use client";

import { useState, useTransition } from "react";
import { deleteAssignment } from "./actions";

// Two-step delete: "Delete" first shows an "Are you sure?" prompt.
export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-400/40 px-4 py-2 text-red-400 hover:bg-red-400/10"
      >
        Delete
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-label="Confirm delete"
      className="flex flex-wrap items-center gap-3 rounded-md border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm"
    >
      <span>Are you sure? &ldquo;{title}&rdquo; will be deleted for good.</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteAssignment(id))}
        className="rounded-md bg-red-500 px-3 py-1.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(false)}
        className="rounded-md border border-white/10 px-3 py-1.5 hover:bg-surface"
      >
        Cancel
      </button>
    </div>
  );
}
