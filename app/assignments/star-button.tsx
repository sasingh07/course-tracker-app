"use client";

import { useOptimistic, useTransition } from "react";
import { setStarred } from "./actions";

// ☆ / ★ toggle. Starring adds a row to the stars table; unstarring removes it.
export function StarButton({ id, starred }: { id: string; starred: boolean }) {
  const [optimisticStarred, setOptimisticStarred] = useOptimistic(starred);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={optimisticStarred}
      aria-label={optimisticStarred ? "Unstar" : "Star"}
      title={optimisticStarred ? "Unstar" : "Star"}
      onClick={() => {
        const next = !optimisticStarred;
        startTransition(async () => {
          setOptimisticStarred(next);
          await setStarred(id, next);
        });
      }}
      className={`shrink-0 text-lg leading-none ${
        optimisticStarred ? "text-yellow-400" : "text-muted hover:text-foreground"
      }`}
    >
      {optimisticStarred ? "★" : "☆"}
    </button>
  );
}
