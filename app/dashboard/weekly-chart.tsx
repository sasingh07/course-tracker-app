"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CRUNCH_HOURS, type WeekBucket } from "@/lib/stats";

// Colors match the dark theme in app/globals.css.
const DONE_COLOR = "#4ade80";
const NOT_DONE_COLOR = "#6e79f2";
const MUTED = "#8b8b96";
const CRUNCH_COLOR = "#f87171"; // crunch weeks (feature 9)

type Measure = "count" | "hours";

// Stacked bars per week, split into done / not done. The toggle switches
// between number of assignments and estimated hours (feature 8).
export function WeeklyChart({
  weeks,
  thisWeekLabel,
}: {
  weeks: WeekBucket[];
  thisWeekLabel: string;
}) {
  const [measure, setMeasure] = useState<Measure>("count");
  const hours = measure === "hours";

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 font-medium">
            {hours ? "Estimated hours due per week" : "Assignments due per week"}
          </h2>
          <p className="text-sm text-muted">
            Fall 2026, weeks start on Monday.{" "}
            <span className="text-red-400">Red</span> = crunch week (over {CRUNCH_HOURS}h).
          </p>
        </div>
        <div
          role="group"
          aria-label="Chart shows"
          className="flex rounded-md border border-white/10 p-0.5 text-sm"
        >
          {(["count", "hours"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={measure === option}
              onClick={() => setMeasure(option)}
              className={`rounded px-3 py-1 ${
                measure === option
                  ? "bg-background text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {option === "count" ? "Assignments" : "Hours"}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={weeks} margin={{ top: 16, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: MUTED, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              interval={1} // label every other week so they don't overlap
            />
            <YAxis
              allowDecimals={hours}
              tick={{ fill: MUTED, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                background: "#17171d",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e8e8ec",
              }}
              labelFormatter={(label) => `Week of ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: MUTED }} />
            <ReferenceLine
              x={thisWeekLabel}
              stroke={MUTED}
              strokeDasharray="4 4"
              label={{ value: "This week", fill: MUTED, fontSize: 11, position: "top" }}
            />
            {hours && (
              <ReferenceLine
                y={CRUNCH_HOURS}
                stroke={CRUNCH_COLOR}
                strokeDasharray="4 4"
                label={{
                  value: `${CRUNCH_HOURS}h`,
                  fill: CRUNCH_COLOR,
                  fontSize: 11,
                  position: "insideTopLeft",
                }}
              />
            )}
            <Bar
              dataKey={hours ? "doneHours" : "done"}
              name={hours ? "Done (hours)" : "Done"}
              stackId="due"
              fill={DONE_COLOR}
            />
            <Bar
              dataKey={hours ? "notDoneHours" : "notDone"}
              name={hours ? "Not done (hours)" : "Not done"}
              stackId="due"
              fill={NOT_DONE_COLOR}
              radius={[4, 4, 0, 0]}
            >
              {weeks.map((week) => (
                <Cell
                  key={week.weekStart}
                  fill={week.crunch ? CRUNCH_COLOR : NOT_DONE_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
