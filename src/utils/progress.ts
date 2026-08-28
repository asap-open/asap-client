import { api } from "./api";

// --- Types ---

export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

export type SessionLabel =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Legs"
  | "Glutes"
  | "FullBody"
  | "Cardio"
  | "Mobility"
  | "Stretching";

export const SESSION_LABELS: SessionLabel[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Core",
  "Legs",
  "Glutes",
  "FullBody",
  "Cardio",
  "Mobility",
  "Stretching",
];

export interface ProgressOverviewMetrics {
  consistency: number;
  activeDays: number;
  currentStreak: number;
  totalVolume: number;
}

export interface ProgressHeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ProgressChartPoint {
  date: string;
  value: number;
  sessions?: number;
}

export interface ProgressOverviewResponse {
  metrics: ProgressOverviewMetrics;
  heatmap: ProgressHeatmapDay[];
  chartData: ProgressChartPoint[];
  metric: "volume" | "weight";
  range: TimeRange;
  selectedLabels: string[];
}

export interface PersonalBest {
  id: number;
  exerciseId: string;
  metric: string;
  value: number;
  achievedAt: string;
  exercise: { id: string; name: string; category: string };
  session: { id: number; sessionName: string; startTime: string } | null;
}

// --- API Functions ---

/**
 * Fetches the simplified progress overview: KPI metrics, GitHub heatmap data, and chart series.
 */
export const fetchProgressOverview = async (
  token: string | null,
  range: TimeRange = "1M",
  metric: "volume" | "weight" = "volume",
  labels: string[] = [],
): Promise<ProgressOverviewResponse> => {
  if (!token) throw new Error("No auth token provided");
  const params = new URLSearchParams();
  params.set("range", range);
  params.set("metric", metric);
  if (labels.length > 0) {
    params.set("labels", labels.join(","));
  }
  return await api.get(`/progress/overview?${params.toString()}`, token);
};

/**
 * Personal Bests Utilities (used by modals and tracking settings)
 */
export const fetchPersonalBests = async (
  token: string | null,
  exerciseIds: string[],
  metric?: string,
): Promise<PersonalBest[]> => {
  if (!token) throw new Error("No auth token provided");
  if (!exerciseIds || exerciseIds.length === 0) return [];

  const params = new URLSearchParams();
  params.set("exerciseIds", exerciseIds.join(","));
  if (metric) params.set("metric", metric);

  const response = await api.get(`/pbs?${params.toString()}`, token);
  return response;
};

export const deleteExercisePBs = async (
  token: string | null,
  exerciseId: string,
): Promise<void> => {
  if (!token) throw new Error("No auth token provided");
  await api.delete(`/pbs/${exerciseId}`, token);
};

export const syncPBs = async (token: string | null): Promise<void> => {
  if (!token) throw new Error("No auth token provided");
  await api.post("/pbs/sync", {}, token);
};
