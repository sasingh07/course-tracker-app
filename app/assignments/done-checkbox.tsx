"use client";

import { useOptimistic, useTransition } from "react";
import { setAssignmentDone } from "./actions";

// Ticks an assignment done/not done right from the list.
export function DoneCheckbox({ id, isDone }: { id: string; isDone: boolean }) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(isDone);
  const [, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={optimisticDone}
      aria-label={optimisticDone ? "Mark as not done" : "Mark as done"}
      className="h-4 w-4 shrink-0 cursor-pointer accent-accent"
      onChange={(event) => {
        const next = event.target.checked;
        startTransition(async () => {
          setOptimisticDone(next);
          await setAssignmentDone(id, next);
        });
      }}
    />
  );
}
