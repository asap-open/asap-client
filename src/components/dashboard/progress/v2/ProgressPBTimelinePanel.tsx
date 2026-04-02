import { type PBTimelineResponse } from "../../../../utils/progress";

export function ProgressPBTimelinePanel({
  pbTimeline,
  selectedExerciseId,
  onSelectExercise,
  onSelectDay,
}: {
  pbTimeline: PBTimelineResponse | null;
  selectedExerciseId: string;
  onSelectExercise: (exerciseId: string) => void;
  onSelectDay: (day: string) => void;
}) {
  return (
    <section className="md:col-span-12 bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-text-main">PB Timeline</h2>
        <p className="text-xs text-text-muted">
          Avg days between PRs:{" "}
          {pbTimeline?.summary.avgDaysBetweenPr != null
            ? pbTimeline.summary.avgDaysBetweenPr.toFixed(1)
            : "--"}
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {(pbTimeline?.events ?? []).slice(0, 12).map((event) => (
          <button
            type="button"
            key={`${event.id}-${event.metric}`}
            onClick={() => {
              onSelectExercise(event.exerciseId);
              onSelectDay(event.achievedAt.split("T")[0]);
            }}
            className={`min-w-52 text-left bg-surface-hover border rounded-lg p-3 transition-colors ${
              selectedExerciseId === event.exerciseId
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:bg-surface"
            }`}
          >
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              {new Date(event.achievedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-sm font-bold text-text-main mt-1 truncate">
              {event.exercise.name}
            </p>
            <p className="text-xs text-text-muted mt-1">{event.metric}</p>
            <p className="text-lg font-black text-primary mt-2">
              {Number.isInteger(event.value)
                ? event.value.toFixed(0)
                : event.value.toFixed(1)}
            </p>
          </button>
        ))}
        {(pbTimeline?.events ?? []).length === 0 ? (
          <p className="text-sm text-text-muted py-2">No PB entries yet.</p>
        ) : null}
      </div>
    </section>
  );
}
