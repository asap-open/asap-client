import {
  type ProgressMode,
  type TimeRange,
  type WorkloadResponse,
} from "../../../../utils/progress";

export type MuscleGroupFilter = "push" | "pull" | "legs" | "core" | "other";

export const ranges: TimeRange[] = ["1W", "1M", "3M", "6M", "1Y", "ALL"];
export const modes: ProgressMode[] = ["Strength", "Balanced", "Body"];

export const levelClass: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-surface-hover",
  1: "bg-primary/20",
  2: "bg-primary/45",
  3: "bg-primary/70",
  4: "bg-primary",
};

export const workloadStatusTone: Record<
  NonNullable<WorkloadResponse["status"]>,
  string
> = {
  optimal: "text-green-600",
  high: "text-amber-500",
  danger: "text-red-500",
  under: "text-blue-500",
  insufficient: "text-text-muted",
};

const containsAny = (value: string, items: string[]) =>
  items.some((item) => value.includes(item));

export const classifyCategoryToMuscleGroup = (
  category: string,
): MuscleGroupFilter => {
  const normalized = category.toLowerCase();

  if (
    containsAny(normalized, ["chest", "shoulder", "deltoid", "tricep", "press"])
  ) {
    return "push";
  }

  if (
    containsAny(normalized, [
      "back",
      "lat",
      "bicep",
      "row",
      "rear",
      "trap",
      "pull",
    ])
  ) {
    return "pull";
  }

  if (
    containsAny(normalized, [
      "quad",
      "hamstring",
      "glute",
      "calf",
      "leg",
      "adductor",
      "abductor",
    ])
  ) {
    return "legs";
  }

  if (
    containsAny(normalized, ["core", "ab", "oblique", "lower back", "erector"])
  ) {
    return "core";
  }

  return "other";
};
