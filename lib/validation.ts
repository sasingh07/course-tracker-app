// Validation rules for assignments and courses (feature 4).
// Pure functions with no database access, so they're easy to test.

export const TITLE_MAX_LENGTH = 120;

// Due dates must fall within this academic year, which catches typos like 2062.
export const ACADEMIC_YEAR_START = "2026-08-01";
export const ACADEMIC_YEAR_END = "2027-07-31";

// Estimated hours (feature 8): optional, whole or half hours.
export const HOURS_MIN = 0.5;
export const HOURS_MAX = 100;

export type AssignmentInput = {
  course_id: string;
  title: string;
  type: string;
  due_date: string;
  notes: string | null;
  estimated_hours: string; // as typed in the form; "" means not set
};

export type FieldErrors = Partial<
  Record<"course_id" | "title" | "due_date" | "estimated_hours", string>
>;

export function validateAssignment(input: AssignmentInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.course_id) {
    errors.course_id = "Please choose a course.";
  }

  if (!input.title) {
    errors.title = "Please enter a title.";
  } else if (input.title.length > TITLE_MAX_LENGTH) {
    errors.title = `Please keep the title under ${TITLE_MAX_LENGTH} characters (it's ${input.title.length}).`;
  }

  if (!input.due_date) {
    errors.due_date = "Please pick a due date.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.due_date)) {
    errors.due_date = "Please pick a valid date.";
  } else if (
    input.due_date < ACADEMIC_YEAR_START ||
    input.due_date > ACADEMIC_YEAR_END
  ) {
    errors.due_date = "That date is outside this academic year (Aug 2026 – Jul 2027). Check for a typo?";
  }

  const hoursError = validateHours(input.estimated_hours);
  if (hoursError) {
    errors.estimated_hours = hoursError;
  }

  return errors;
}

export function validateHours(raw: string): string | undefined {
  if (raw === "") return undefined; // optional
  const hours = Number(raw);
  if (!Number.isFinite(hours)) {
    return "Please enter a number of hours, like 2 or 1.5.";
  }
  if (hours < HOURS_MIN || hours > HOURS_MAX) {
    return `Please enter between ${HOURS_MIN} and ${HOURS_MAX} hours.`;
  }
  if (!Number.isInteger(hours * 2)) {
    return "Please use whole or half hours, like 2 or 1.5.";
  }
  return undefined;
}

export function validateCourseName(name: string): string | undefined {
  if (!name) {
    return "Please enter a course name.";
  }
  if (name.length > TITLE_MAX_LENGTH) {
    return `Please keep the course name under ${TITLE_MAX_LENGTH} characters.`;
  }
  return undefined;
}
