import { api } from "./api";

// --- Types ---

export interface ConsistencyData {
  day: string;
  value: number;
}

export interface VolumeData {
  day: string;
  volume: number;
  bodyweightScore?: number;
}

export interface MuscleData {
  muscle: string;
  value: number;
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

export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";
export type ProgressMode = "Strength" | "Body" | "Balanced";
export type CalendarMetric = "sessions" | "volume" | "intensity";
export type Granularity = "day" | "week" | "month";

// --- V2 Types ---

export interface ProgressSummaryResponse {
  range: TimeRange;
  mode: ProgressMode;
  totals: {
    sessions: number;
    activeDays: number;
    totalVolume: number;
    bodyweightScore: number;
    avgSessionDurationMin: number;
  };
  streaks: {
    current: number;
    best: number;
  };
  adherence: {
    targetSessionsPerWeek: number;
    percentage: number;
  };
  trends: {
    sessionsPct: number | null;
    volumePct: number | null;
    bodyweightScorePct: number | null;
  };
}

export interface ProgressCalendarDay {
  day: string;
  sessions: number;
  volume: number;
  bodyweightScore: number;
  intensity: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ProgressCalendarResponse {
  range: TimeRange;
  metric: CalendarMetric;
  startDate: string;
  endDate: string;
  days: ProgressCalendarDay[];
  summary: {
    activeDays: number;
    totalDays: number;
    currentStreak: number;
    bestStreak: number;
  };
}

export interface TimeSeriesBucket {
  bucket: string;
  sessions: number;
  volume: number;
  bodyweightScore: number;
  durationMin: number;
}

export interface ProgressTimeSeriesResponse {
  range: TimeRange;
  granularity: Granularity;
  compare: boolean;
  current: TimeSeriesBucket[];
  previous: TimeSeriesBucket[];
}

export interface MuscleBalanceResponse {
  range: TimeRange;
  mode: ProgressMode;
  totalSets: number;
  muscles: Array<{
    muscle: string;
    sets: number;
    ratio: number;
  }>;
  groups: Array<{
    group: "push" | "pull" | "legs" | "core" | "other";
    sets: number;
    ratio: number;
    target: number;
    status: "low" | "balanced" | "high";
  }>;
}

export interface PBTimelineResponse {
  range: TimeRange;
  metric: string | null;
  exerciseId: string | null;
  events: PersonalBest[];
  summary: {
    count: number;
    avgDaysBetweenPr: number | null;
  };
}

export interface Strength1RMResponse {
  range: TimeRange;
  exerciseId: string;
  exerciseName: string | null;
  series: Array<{
    day: string;
    e1rm: number;
    sourceWeight: number;
    sourceReps: number;
  }>;
  summary: {
    latest: {
      day: string;
      e1rm: number;
      sourceWeight: number;
      sourceReps: number;
    } | null;
    best: {
      day: string;
      e1rm: number;
      sourceWeight: number;
      sourceReps: number;
    } | null;
    changePct: number | null;
  };
}

export interface WorkloadResponse {
  range: TimeRange;
  status: "under" | "optimal" | "high" | "danger" | "insufficient";
  confidence: "high" | "medium" | "low";
  acute: number;
  previous7: number;
  chronicWeeklyAvg: number;
  acwr: number | null;
  rampRate: number;
  recommendation: string;
  series: Array<{
    day: string;
    workload: number;
    sessions: number;
  }>;
}

export interface DayDetailResponse {
  date: string;
  summary: {
    sessions: number;
    totalDurationMin: number;
    totalVolume: number;
    bodyweightScore: number;
    totalSets: number;
  };
  sessions: Array<{
    id: number;
    sessionName: string;
    labels: string[];
    startTime: string;
    endTime: string | null;
    stats: {
      durationMin: number;
      totalVolume: number;
      bodyweightScore: number;
      exerciseCount: number;
      setCount: number;
    };
  }>;
  exerciseBreakdown: Array<{
    exerciseId: string;
    name: string;
    category: string;
    sets: number;
    volume: number;
    bodyweightScore: number;
  }>;
}

// --- API Functions ---

/**
 * Fetches consistency heatmap data (e.g. for calendar).
 */
export const fetchConsistency = async (
  token: string | null,
  range: TimeRange = "ALL",
): Promise<ConsistencyData[]> => {
  if (!token) throw new Error("No auth token provided");
  const response = await api.get(`/progress/consistency?range=${range}`, token);
  return response;
};

/**
 * Fetches volume stats (e.g. for bar chart).
 */
export const fetchVolumeStats = async (
  token: string | null,
  range: TimeRange = "1M",
): Promise<VolumeData[]> => {
  if (!token) throw new Error("No auth token provided");
  const response = await api.get(`/progress/volume?range=${range}`, token);
  return response;
};

/**
 * Fetches muscle distribution (e.g. for radar chart).
 */
export const fetchMuscleDistribution = async (
  token: string | null,
  range: TimeRange = "ALL",
): Promise<MuscleData[]> => {
  if (!token) throw new Error("No auth token provided");
  const response = await api.get(`/progress/muscles?range=${range}`, token);
  return response;
};

/**
 * Fetches personal bests for specific exercises.
 * exerciseIds is required.
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

/**
 * Delete all PB records for a specific exercise (called when untracking).
 */
export const deleteExercisePBs = async (
  token: string | null,
  exerciseId: string,
): Promise<void> => {
  if (!token) throw new Error("No auth token provided");
  await api.delete(`/pbs/${exerciseId}`, token);
};

/**
 * Trigger full PB recalculation from history (called when tracking a new exercise).
 */
export const syncPBs = async (token: string | null): Promise<void> => {
  if (!token) throw new Error("No auth token provided");
  await api.post("/pbs/sync", {}, token);
};

// --- V2 API Functions ---

export const fetchProgressSummary = async (
  token: string | null,
  range: TimeRange,
  mode: ProgressMode,
): Promise<ProgressSummaryResponse> => {
  if (!token) throw new Error("No auth token provided");
  return await api.get(`/progress/summary?range=${range}&mode=${mode}`, token);
};

export const fetchProgressCalendar = async (
  token: string | null,
  range: TimeRange,
  metric: CalendarMetric = "sessions",
): Promise<ProgressCalendarResponse> => {
  if (!token) throw new Error("No auth token provided");
  return await api.get(
    `/progress/calendar?range=${range}&metric=${metric}`,
    token,
  );
};

export const fetchProgressTimeSeries = async (
  token: string | null,
  range: TimeRange,
  granularity: Granularity = "day",
  compare: boolean = false,
): Promise<ProgressTimeSeriesResponse> => {
  if (!token) throw new Error("No auth token provided");
  const compareFlag = compare ? "true" : "false";
  return await api.get(
    `/progress/timeseries?range=${range}&granularity=${granularity}&compare=${compareFlag}`,
    token,
  );
};

export const fetchMuscleBalance = async (
  token: string | null,
  range: TimeRange,
  mode: ProgressMode,
): Promise<MuscleBalanceResponse> => {
  if (!token) throw new Error("No auth token provided");
  return await api.get(
    `/progress/muscle-balance?range=${range}&mode=${mode}`,
    token,
  );
};

export const fetchPBTimeline = async (
  token: string | null,
  range: TimeRange,
  exerciseId?: string,
  metric?: string,
): Promise<PBTimelineResponse> => {
  if (!token) throw new Error("No auth token provided");

  const params = new URLSearchParams();
  params.set("range", range);
  if (exerciseId) params.set("exerciseId", exerciseId);
  if (metric) params.set("metric", metric);

  return await api.get(`/progress/pbs/timeline?${params.toString()}`, token);
};

export const fetchStrength1RM = async (
  token: string | null,
  range: TimeRange,
  exerciseId: string,
): Promise<Strength1RMResponse> => {
  if (!token) throw new Error("No auth token provided");
  if (!exerciseId) throw new Error("exerciseId is required");

  return await api.get(
    `/progress/strength/1rm?range=${range}&exerciseId=${exerciseId}`,
    token,
  );
};

export const fetchWorkload = async (
  token: string | null,
  range: TimeRange,
): Promise<WorkloadResponse> => {
  if (!token) throw new Error("No auth token provided");
  return await api.get(`/progress/workload?range=${range}`, token);
};

export const fetchDayDetail = async (
  token: string | null,
  date: string,
): Promise<DayDetailResponse> => {
  if (!token) throw new Error("No auth token provided");
  if (!date) throw new Error("date is required");
  return await api.get(`/progress/day-detail?date=${date}`, token);
};
