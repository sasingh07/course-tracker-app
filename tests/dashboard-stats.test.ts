// Test 2: dashboard stat (PLAN.md section 4).
//
// Given I have 3 assignments due this week (2 done, 1 not done) and 1 due
// next week, when the dashboard stats are calculated, then "Due this week"
// is 3 and "% completed this week" is 67%.
//
// It calls the same computeStats() the dashboard page uses, with "today"
// fixed, so the result doesn't depend on the day the test runs.

import { describe, expect, it } from "vitest";
import { computeStats } from "@/lib/stats";

// Tuesday, Nov 3, 2026. This week runs Mon Nov 2 – Sun Nov 8.
const TODAY = "2026-11-03";

describe("dashboard stats", () => {
  it("counts 3 due this week and 67% completed (the PLAN.md scenario)", () => {
    const assignments = [
      { due_date: "2026-11-02", is_done: true }, // Mon, this week, done
      { due_date: "2026-11-05", is_done: true }, // Thu, this week, done
      { due_date: "2026-11-06", is_done: false }, // Fri, this week, not done
      { due_date: "2026-11-10", is_done: false }, // Tue next week, doesn't count
    ];

    const stats = computeStats(assignments, TODAY);

    expect(stats.dueThisWeek).toBe(3);
    expect(stats.percentDoneThisWeek).toBe(67);
  });

  it("counts Sunday night as part of the same week (weeks start Monday)", () => {
    const stats = computeStats([{ due_date: "2026-11-08", is_done: false }], TODAY);
    expect(stats.dueThisWeek).toBe(1);
  });

  it("shows no percentage when nothing is due this week", () => {
    const stats = computeStats([{ due_date: "2026-11-10", is_done: true }], TODAY);
    expect(stats.dueThisWeek).toBe(0);
    expect(stats.percentDoneThisWeek).toBeNull(); // the dashboard shows "—"
  });
});
