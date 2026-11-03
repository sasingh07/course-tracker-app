import Link from "next/link";
import { CRUNCH_HOURS } from "@/lib/stats";

type CrunchWeek = { weekStart: string; label: string; hours: number };

// "⚠ Crunch week ahead" warning (feature 9). Shows nothing when there are none.
export function CrunchBanner({
  weeks,
  showDashboardLink = false,
}: {
  weeks: CrunchWeek[];
  showDashboardLink?: boolean;
}) {
  if (weeks.length === 0) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm"
    >
      <p className="font-medium text-red-300">
        ⚠ {weeks.length === 1 ? "Crunch week ahead" : `${weeks.length} crunch weeks ahead`}
      </p>
      <ul className="mt-1 text-foreground">
        {weeks.map((week) => (
          <li key={week.weekStart}>
            Week of {week.label}: <strong>{week.hours}h</strong> due
          </li>
        ))}
      </ul>
      <p className="mt-1 text-muted">
        More than {CRUNCH_HOURS} estimated hours. Start early!
        {showDashboardLink && (
          <>
            {" "}
            <Link href="/dashboard" className="text-accent hover:underline">
              See dashboard
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
