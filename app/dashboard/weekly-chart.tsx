"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeekBucket } from "@/lib/stats";

// Colors match the dark theme in app/globals.css.
const DONE_COLOR = "#4ade80";
const NOT_DONE_COLOR = "#6e79f2";
const MUTED = "#8b8b96";

// Stacked bars: assignments due each week, split into done / not done.
export function WeeklyChart({
  weeks,
  thisWeekLabel,
}: {
  weeks: WeekBucket[];
  thisWeekLabel: string;
}) {
  return (
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
            allowDecimals={false}
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
          <Bar dataKey="done" name="Done" stackId="due" fill={DONE_COLOR} />
          <Bar
            dataKey="notDone"
            name="Not done"
            stackId="due"
            fill={NOT_DONE_COLOR}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
