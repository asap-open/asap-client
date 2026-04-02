import { type ProgressSummaryResponse } from "../../../../utils/progress";

export function ProgressKpiGrid({
  summary,
}: {
  summary: ProgressSummaryResponse | null;
}) {
  return (
    <section className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Consistency
        </p>
        <p className="text-2xl font-black text-text-main mt-2">
          {summary ? `${summary.adherence.percentage.toFixed(0)}%` : "--"}
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Active Days
        </p>
        <p className="text-2xl font-black text-text-main mt-2">
          {summary ? summary.totals.activeDays : "--"}
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Current Streak
        </p>
        <p className="text-2xl font-black text-text-main mt-2">
          {summary ? summary.streaks.current : "--"}
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Total Volume
        </p>
        <p className="text-2xl font-black text-text-main mt-2">
          {summary
            ? Math.round(summary.totals.totalVolume).toLocaleString()
            : "--"}
        </p>
      </div>
    </section>
  );
}
