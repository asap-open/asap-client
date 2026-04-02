import { useEffect, useMemo, useState } from "react";
import {
  type MuscleBalanceResponse,
  type Strength1RMResponse,
  type WorkloadResponse,
} from "../../../../utils/progress";
import { type MuscleGroupFilter, workloadStatusTone } from "./constants";

type ExerciseOption = {
  id: string;
  name: string;
};

interface ProgressInsightsPanelProps {
  workload: WorkloadResponse | null;
  muscleBalance: MuscleBalanceResponse | null;
  strengthTrend: Strength1RMResponse | null;
  exerciseOptions: ExerciseOption[];
  selectedExerciseId: string;
  selectedMuscleGroup: MuscleGroupFilter | null;
  strengthSeriesMax: number;
  onExerciseChange: (next: string) => void;
  onMuscleGroupSelect: (next: MuscleGroupFilter | null) => void;
}

export function ProgressInsightsPanel({
  workload,
  muscleBalance,
  strengthTrend,
  exerciseOptions,
  selectedExerciseId,
  selectedMuscleGroup,
  strengthSeriesMax,
  onExerciseChange,
  onMuscleGroupSelect,
}: ProgressInsightsPanelProps) {
  const [hoveredPointDay, setHoveredPointDay] = useState<string | null>(null);
  const [selectedPointDay, setSelectedPointDay] = useState<string | null>(null);

  const visibleSeries = useMemo(
    () => strengthTrend?.series.slice(-10) ?? [],
    [strengthTrend],
  );

  useEffect(() => {
    setHoveredPointDay(null);
    setSelectedPointDay(strengthTrend?.summary.latest?.day ?? null);
  }, [strengthTrend?.exerciseId, strengthTrend?.summary.latest?.day]);

  const resolvedActiveDay = hoveredPointDay ?? selectedPointDay;
  const activeIndex = visibleSeries.findIndex(
    (point) => point.day === resolvedActiveDay,
  );
  const safeActiveIndex =
    activeIndex >= 0 ? activeIndex : visibleSeries.length - 1;
  const activePoint =
    safeActiveIndex >= 0 ? visibleSeries[safeActiveIndex] : null;
  const previousPoint =
    safeActiveIndex > 0 ? visibleSeries[safeActiveIndex - 1] : null;
  const deltaFromPrevious =
    activePoint && previousPoint ? activePoint.e1rm - previousPoint.e1rm : null;

  const latestLabel = strengthTrend?.summary.latest
    ? new Date(
        `${strengthTrend.summary.latest.day}T00:00:00.000Z`,
      ).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "--";
  const bestLabel = strengthTrend?.summary.best
    ? `${strengthTrend.summary.best.e1rm.toFixed(1)} kg`
    : "--";

  return (
    <section className="md:col-span-5 bg-surface rounded-xl border border-border p-5 space-y-4">
      <div className="pb-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-black text-text-main">Strength Trend</h2>
          <select
            value={selectedExerciseId}
            onChange={(event) => onExerciseChange(event.target.value)}
            className="bg-surface-hover border border-border rounded-lg px-2 py-1 text-xs text-text-main"
          >
            {exerciseOptions.length === 0 ? (
              <option value="">No exercise</option>
            ) : (
              exerciseOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))
            )}
          </select>
        </div>

        {strengthTrend ? (
          <>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-text-main">
                {strengthTrend.summary.latest
                  ? strengthTrend.summary.latest.e1rm.toFixed(1)
                  : "--"}
              </p>
              <p className="text-sm text-text-muted mb-1">kg e1RM</p>
              <p className="text-xs font-semibold text-primary mb-1">
                {strengthTrend.summary.changePct != null
                  ? `${strengthTrend.summary.changePct >= 0 ? "+" : ""}${strengthTrend.summary.changePct.toFixed(1)}%`
                  : "--"}
              </p>
            </div>

            <div className="h-20 flex items-end gap-1">
              {strengthTrend.series.slice(-10).map((point) => {
                const height = Math.max(
                  (point.e1rm / strengthSeriesMax) * 100,
                  8,
                );
                const isActive = activePoint?.day === point.day;
                return (
                  <button
                    key={point.day}
                    type="button"
                    onMouseEnter={() => setHoveredPointDay(point.day)}
                    onMouseLeave={() => setHoveredPointDay(null)}
                    onFocus={() => setHoveredPointDay(point.day)}
                    onBlur={() => setHoveredPointDay(null)}
                    onClick={() => setSelectedPointDay(point.day)}
                    className={`flex-1 bg-primary/70 rounded-t-sm outline-none transition-all ${
                      isActive ? "ring-2 ring-primary/70" : ""
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${point.day} • ${point.e1rm.toFixed(1)}kg`}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface-hover rounded-lg p-2">
                <p className="text-[10px] text-text-muted">Active Point</p>
                <p className="text-xs font-semibold text-text-main mt-0.5">
                  {activePoint
                    ? new Date(
                        `${activePoint.day}T00:00:00.000Z`,
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "--"}
                </p>
              </div>
              <div className="bg-surface-hover rounded-lg p-2">
                <p className="text-[10px] text-text-muted">e1RM</p>
                <p className="text-xs font-semibold text-text-main mt-0.5">
                  {activePoint ? `${activePoint.e1rm.toFixed(1)} kg` : "--"}
                </p>
              </div>
              <div className="bg-surface-hover rounded-lg p-2">
                <p className="text-[10px] text-text-muted">Delta vs Prev</p>
                <p className="text-xs font-semibold text-text-main mt-0.5">
                  {deltaFromPrevious != null
                    ? `${deltaFromPrevious >= 0 ? "+" : ""}${deltaFromPrevious.toFixed(1)} kg`
                    : "--"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-surface-hover text-text-muted">
                Latest: {latestLabel}
              </span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-surface-hover text-text-muted">
                Best: {bestLabel}
              </span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-surface-hover text-text-muted">
                Points: {visibleSeries.length}
              </span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-surface-hover text-text-muted">
                Source:{" "}
                {activePoint
                  ? `${activePoint.sourceWeight}kg x ${activePoint.sourceReps}`
                  : "--"}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-text-muted">No strength trend data yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-black text-text-main">Training Status</h2>
        <p
          className={`text-sm font-semibold mt-1 ${
            workload ? workloadStatusTone[workload.status] : "text-text-muted"
          }`}
        >
          {workload ? workload.status.toUpperCase() : "INSUFFICIENT"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-hover rounded-lg p-3">
          <p className="text-[11px] text-text-muted">ACWR</p>
          <p className="text-xl font-black text-text-main mt-1">
            {workload?.acwr != null ? workload.acwr.toFixed(2) : "--"}
          </p>
        </div>
        <div className="bg-surface-hover rounded-lg p-3">
          <p className="text-[11px] text-text-muted">Ramp Rate</p>
          <p className="text-xl font-black text-text-main mt-1">
            {workload ? Math.round(workload.rampRate).toLocaleString() : "--"}
          </p>
        </div>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">
        {workload?.recommendation ?? "Not enough load data yet."}
      </p>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-sm font-bold text-text-main">Muscle Balance</h3>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onMuscleGroupSelect(null)}
              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                selectedMuscleGroup == null
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-text-muted bg-surface-hover"
              }`}
            >
              All
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {(muscleBalance?.groups ?? [])
            .filter((group) => group.group !== "other")
            .map((group) => (
              <button
                type="button"
                key={group.group}
                onClick={() =>
                  onMuscleGroupSelect(
                    selectedMuscleGroup === group.group ? null : group.group,
                  )
                }
                className={`w-full text-left rounded-lg p-2 transition-colors border ${
                  selectedMuscleGroup === group.group
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-text-main capitalize">
                    {group.group}
                  </p>
                  <p className="text-xs text-text-muted">
                    {group.ratio.toFixed(0)}% / {group.target.toFixed(0)}%
                  </p>
                </div>
                <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(group.ratio, 100)}%` }}
                  />
                </div>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
