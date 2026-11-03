"use client";

import Link from "next/link";
import Papa from "papaparse";
import { useState, useTransition } from "react";
import { importAssignments, type ImportResult } from "../actions";
import { formatDueDate } from "../shared";
import {
  checkHeaders,
  checkRows,
  MAX_IMPORT_ROWS,
  normalizeHeader,
  type CsvRow,
} from "@/lib/csv-import";

const inputClass =
  "rounded-md border border-white/10 bg-background px-3 py-2 outline-none focus:border-accent";

// Step 1: pick a course + file. Step 2: preview every row (✓ / ✗ with the
// reason). Step 3: import the good rows; bad rows are skipped.
export function ImportForm({ courses }: { courses: { id: string; name: string }[] }) {
  const [courseId, setCourseId] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  // Preview uses the same checks the server will run.
  const checked = courseId ? checkRows(rows, courseId) : [];
  const goodCount = checked.filter((row) => row.errors.length === 0).length;

  async function readFile(file: File) {
    setFileName(file.name);
    setResult(null);
    setFileError("");
    setRows([]);

    let text: string;
    try {
      text = await file.text();
    } catch {
      setFileError("Couldn't read that file. Is it a .csv?");
      return;
    }

    // Parse the text (not the File object): it runs synchronously, with no
    // callbacks or background file reading.
    const { data, meta } = Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: normalizeHeader,
    });
    const headerError = checkHeaders(meta.fields ?? []);
    if (headerError) {
      setFileError(headerError);
    } else if (data.length === 0) {
      setFileError("That file has no rows under the header.");
    } else if (data.length > MAX_IMPORT_ROWS) {
      setFileError(`Please import at most ${MAX_IMPORT_ROWS} rows at a time.`);
    } else {
      setRows(data);
    }
  }

  function runImport() {
    startTransition(async () => {
      setResult(await importAssignments(courseId, rows));
    });
  }

  if (result && !result.error) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface p-6">
        <p role="status" className="text-lg">
          ✓ Imported <strong>{result.imported}</strong> assignment
          {result.imported === 1 ? "" : "s"}
          {result.skipped > 0 && (
            <>
              , skipped <strong>{result.skipped}</strong> with problems
            </>
          )}
          .
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90"
          >
            See assignments
          </Link>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setRows([]);
              setFileName("");
            }}
            className="rounded-md border border-white/10 px-4 py-2 hover:bg-background"
          >
            Import another file
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface p-6">
        <p className="text-sm text-muted">
          Columns: <code>title, due_date, type, estimated_hours</code>. Dates can be
          2026-11-20 or 11/20/2026.{" "}
          <a
            href="/assignments-template.csv"
            download
            className="text-accent hover:underline"
          >
            Download template
          </a>
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Course
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
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
            CSV file
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) readFile(file);
              }}
              className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-surface file:px-2 file:py-1 file:text-foreground`}
            />
          </label>
        </div>

        {fileError && (
          <p role="alert" className="text-sm text-red-400">
            {fileError}
          </p>
        )}
        {result?.error && (
          <p role="alert" className="text-sm text-red-400">
            {result.error}
          </p>
        )}
        {rows.length > 0 && !courseId && (
          <p className="text-sm text-muted">Choose a course to see the preview.</p>
        )}
      </div>

      {checked.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-surface p-6">
          <h2 className="mb-1 font-medium">Preview: {fileName}</h2>
          <p className="mb-4 text-sm text-muted">
            {goodCount} of {checked.length} rows ready to import
            {goodCount < checked.length && ". Rows marked ✗ will be skipped"}.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="py-2 pr-3 font-normal">Line</th>
                  <th className="py-2 pr-3 font-normal"></th>
                  <th className="py-2 pr-3 font-normal">Title</th>
                  <th className="py-2 pr-3 font-normal">Due</th>
                  <th className="py-2 pr-3 font-normal">Type</th>
                  <th className="py-2 pr-3 font-normal">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {checked.map((row) => {
                  const ok = row.errors.length === 0;
                  return (
                    <tr key={row.line} className="align-top">
                      <td className="py-2 pr-3 text-muted">{row.line}</td>
                      <td className={`py-2 pr-3 ${ok ? "text-green-400" : "text-red-400"}`}>
                        {ok ? "✓" : "✗"}
                      </td>
                      <td className="py-2 pr-3">
                        {row.input.title || <span className="text-muted">(blank)</span>}
                        {!ok && (
                          <ul className="mt-1 text-xs text-red-400">
                            {row.errors.map((error) => (
                              <li key={error}>{error}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {/^\d{4}-\d{2}-\d{2}$/.test(row.input.due_date)
                          ? formatDueDate(row.input.due_date)
                          : row.input.due_date}
                      </td>
                      <td className="py-2 pr-3 capitalize">{row.input.type}</td>
                      <td className="py-2 pr-3">
                        {row.input.estimated_hours && `${row.input.estimated_hours}h`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            disabled={pending || goodCount === 0}
            onClick={runImport}
            className="mt-6 rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending
              ? "Importing…"
              : `Import ${goodCount} assignment${goodCount === 1 ? "" : "s"}`}
          </button>
        </section>
      )}
    </div>
  );
}
