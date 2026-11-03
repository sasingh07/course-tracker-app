"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { filtersToHref, type ListFilters } from "./filters";

const controlClass =
  "rounded-md border border-white/10 bg-background px-3 py-2 text-sm outline-none focus:border-accent";

// Search box + course / status / sort dropdowns. Every change updates the URL,
// and the server re-renders the list for the new URL.
export function Toolbar({
  filters,
  courses,
}: {
  filters: ListFilters;
  courses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.q);

  // Search as you type, waiting 300ms after the last keystroke.
  useEffect(() => {
    if (search.trim() === filters.q) return;
    const timer = setTimeout(() => {
      router.replace(filtersToHref({ ...filters, q: search.trim() }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters, router]);

  function update(change: Partial<ListFilters>) {
    router.replace(filtersToHref({ ...filters, q: search.trim(), ...change }));
  }

  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search titles…"
        aria-label="Search assignments by title"
        className={controlClass}
      />
      <select
        value={filters.course}
        onChange={(event) => update({ course: event.target.value })}
        aria-label="Filter by course"
        className={controlClass}
      >
        <option value="">All courses</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(event) =>
          update({ status: event.target.value as ListFilters["status"] })
        }
        aria-label="Filter by status"
        className={controlClass}
      >
        <option value="todo">Not done</option>
        <option value="done">Done</option>
        <option value="all">All statuses</option>
      </select>
      <select
        value={filters.sort}
        onChange={(event) => update({ sort: event.target.value as ListFilters["sort"] })}
        aria-label="Sort"
        className={controlClass}
      >
        <option value="due">Due date (soonest)</option>
        <option value="newest">Newest added</option>
      </select>
    </div>
  );
}
