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

  const visibleSessions = filteredSessions.slice(0, 2);
  const hiddenSessionsCount = Math.max(filteredSessions.length - 2, 0);
  const visibleExercises = filteredExercises.slice(0, 3);
  const hiddenExercisesCount = Math.max(filteredExercises.length - 3, 0);

  return (
    <section className="md:col-span-4 bg-surface rounded-xl border border-border p-4 md:p-5">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base md:text-lg font-black text-text-main leading-tight">
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
        <p className="text-sm text-text-muted">Pick a day to load detail.</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface-hover rounded-lg p-2.5 border border-border/60">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Sessions
              </p>
              <p className="text-base font-black text-text-main mt-1">
                {dayDetail.summary.sessions}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-2.5 border border-border/60">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Sets
              </p>
              <p className="text-base font-black text-text-main mt-1">
                {dayDetail.summary.totalSets}
              </p>
            </div>
            <div className="bg-surface-hover rounded-lg p-2.5 border border-border/60">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Volume
              </p>
              <p className="text-base font-black text-text-main mt-1">
                {Math.round(dayDetail.summary.totalVolume).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:gap-2">
            <div className="border border-border rounded-lg p-3 bg-background/40">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-text-muted mb-2">
                Sessions {selectedMuscleGroup ? "(Filtered)" : ""}
              </h3>
              <div className="space-y-2">
                {visibleSessions.length === 0 ? (
                  <p className="text-xs text-text-muted">
                    No session labels matched this muscle group.
                  </p>
                ) : (
                  visibleSessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-md bg-surface-hover/80 p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-text-main truncate">
                          {session.sessionName}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          {session.stats.durationMin}m
                        </p>
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {session.stats.exerciseCount} ex •{" "}
                        {session.stats.setCount} sets
                      </p>
                    </div>
                  ))
                )}
                {hiddenSessionsCount > 0 ? (
                  <p className="text-[10px] font-semibold text-text-muted px-0.5">
                    +{hiddenSessionsCount} more sessions
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 bg-background/40">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-text-muted mb-2">
                Exercise Breakdown {selectedMuscleGroup ? "(Filtered)" : ""}
              </h3>
              <div className="space-y-2">
                {visibleExercises.length === 0 ? (
                  <p className="text-xs text-text-muted">
                    No exercises found for this muscle group.
                  </p>
                ) : (
                  visibleExercises.map((exercise) => (
                    <div
                      key={exercise.exerciseId}
                      className="rounded-md bg-surface-hover/80 p-2"
                    >
                      <p className="text-xs font-semibold text-text-main truncate">
                        {exercise.name}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wide truncate">
                        {exercise.category}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {exercise.sets} sets •{" "}
                        {Math.round(exercise.volume).toLocaleString()} vol
                      </p>
                    </div>
                  ))
                )}
                {hiddenExercisesCount > 0 ? (
                  <p className="text-[10px] font-semibold text-text-muted px-0.5">
                    +{hiddenExercisesCount} more exercises
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
