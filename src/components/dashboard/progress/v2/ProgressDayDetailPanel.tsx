import { useMemo } from "react";
import { type DayDetailResponse } from "../../../../utils/progress";
import {
  classifyCategoryToMuscleGroup,
  type MuscleGroupFilter,
} from "./constants";

interface ProgressDayDetailPanelProps {
  selectedDay: string | null;
  dayLoading: boolean;
  dayDetail: DayDetailResponse | null;
  selectedMuscleGroup: MuscleGroupFilter | null;
}

export function ProgressDayDetailPanel({
  selectedDay,
  dayLoading,
  dayDetail,
  selectedMuscleGroup,
}: ProgressDayDetailPanelProps) {
  const selectedDayLabel = selectedDay
    ? new Date(`${selectedDay}T00:00:00.000Z`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const filteredExercises = useMemo(() => {
    if (!dayDetail) return [];
    if (!selectedMuscleGroup) return dayDetail.exerciseBreakdown;

    return dayDetail.exerciseBreakdown.filter(
      (exercise) =>
        classifyCategoryToMuscleGroup(exercise.category) ===
        selectedMuscleGroup,
    );
  }, [dayDetail, selectedMuscleGroup]);

  const filteredSessions = useMemo(() => {
    if (!dayDetail) return [];
    if (!selectedMuscleGroup) return dayDetail.sessions;

    const keywords: Record<Exclude<MuscleGroupFilter, "other">, string[]> = {
      push: ["push", "chest", "shoulder", "tricep", "press"],
      pull: ["pull", "back", "row", "lat", "bicep"],
      legs: ["leg", "squat", "hamstring", "quad", "glute"],
      core: ["core", "abs", "oblique", "plank"],
    };

    if (selectedMuscleGroup === "other") {
      return dayDetail.sessions;
    }

    return dayDetail.sessions.filter((session) => {
      const source =
        `${session.sessionName} ${session.labels.join(" ")}`.toLowerCase();
      return keywords[selectedMuscleGroup].some((keyword) =>
        source.includes(keyword),
      );
    });
  }, [dayDetail, selectedMuscleGroup]);

  return (
    <section className="md:col-span-4 bg-surface rounded-2xl border border-border p-5 md:p-6">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-black text-text-main leading-tight">
            Day Detail
          </h2>
          {selectedDayLabel ? (
            <p className="text-xs text-text-muted mt-1">{selectedDayLabel}</p>
          ) : null}
        </div>
        {selectedMuscleGroup ? (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {selectedMuscleGroup} focus
          </span>
        ) : null}
      </div>

      {dayLoading ? (
        <p className="text-sm text-text-muted">Loading detail...</p>
      ) : !dayDetail ? (
        <p className="text-sm text-text-muted">Select a day with activity.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface-hover rounded-xl p-3 border border-border/60">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Sessions
              </p>
              <p className="text-lg font-black text-text-main mt-1">
                {dayDetail.summary.sessions}
              </p>
            </div>
            <div className="bg-surface-hover rounded-xl p-3 border border-border/60">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Sets
              </p>
              <p className="text-lg font-black text-text-main mt-1">
                {dayDetail.summary.totalSets}
              </p>
            </div>
            <div className="bg-surface-hover rounded-xl p-3 border border-border/60">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Volume
              </p>
              <p className="text-lg font-black text-text-main mt-1">
                {Math.round(dayDetail.summary.totalVolume).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-text-muted mb-2">
              Sessions {selectedMuscleGroup ? "(Filtered)" : ""}
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
              {filteredSessions.length === 0 ? (
                <p className="text-xs text-text-muted px-1">
                  No session names or labels matched this muscle group.
                </p>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-border rounded-xl p-3 bg-background/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text-main truncate">
                        {session.sessionName}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {session.stats.durationMin} min
                      </p>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {session.stats.exerciseCount} exercises •{" "}
                      {session.stats.setCount} sets
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-text-muted mb-2">
              Exercise Breakdown {selectedMuscleGroup ? "(Filtered)" : ""}
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
              {filteredExercises.length === 0 ? (
                <p className="text-xs text-text-muted px-1">
                  No exercises found for this muscle group.
                </p>
              ) : (
                filteredExercises.map((exercise) => (
                  <div
                    key={exercise.exerciseId}
                    className="border border-border rounded-xl p-3 bg-background/40"
                  >
                    <p className="text-sm font-semibold text-text-main truncate">
                      {exercise.name}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-[11px] text-text-muted uppercase tracking-wide">
                        {exercise.category}
                      </p>
                      <p className="text-xs text-text-muted">
                        {exercise.sets} sets •{" "}
                        {Math.round(exercise.volume).toLocaleString()} vol
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
