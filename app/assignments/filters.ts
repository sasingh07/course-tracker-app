// Search / filter / sort options for the assignment list (feature 6).
// They live in the URL (e.g. /?status=all&sort=newest), so refresh and the
// back button keep them.

export type Status = "todo" | "done" | "all";
export type Sort = "due" | "newest";

export type ListFilters = {
  q: string; // search text, matched against the title
  course: string; // course id, or "" for all courses
  status: Status;
  sort: Sort;
  starred: boolean; // the "Starred" tab
};

// Default view: not-done assignments, soonest due first.
export const DEFAULT_STATUS: Status = "todo";
export const DEFAULT_SORT: Sort = "due";

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseFilters(params: RawParams): ListFilters {
  const status = first(params.status);
  const sort = first(params.sort);
  return {
    q: first(params.q).trim(),
    course: first(params.course),
    status: status === "done" || status === "all" ? status : DEFAULT_STATUS,
    sort: sort === "newest" ? "newest" : DEFAULT_SORT,
    starred: first(params.view) === "starred",
  };
}

// Builds a URL for the list, leaving out anything that's at its default.
export function filtersToHref(filters: ListFilters) {
  const params = new URLSearchParams();
  if (filters.starred) params.set("view", "starred");
  if (filters.q) params.set("q", filters.q);
  if (filters.course) params.set("course", filters.course);
  if (filters.status !== DEFAULT_STATUS) params.set("status", filters.status);
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

// True when search, course, or a non-default status is narrowing the list.
export function hasActiveFilters(filters: ListFilters) {
  return Boolean(filters.q || filters.course || filters.status !== DEFAULT_STATUS);
}

// % and _ are wildcards in a SQL "ilike" search, so treat them as plain text.
export function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}
