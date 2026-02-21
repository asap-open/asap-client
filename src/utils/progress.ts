import { api } from "./api";

// --- Types ---

export interface ConsistencyData {
  day: string;
  value: number;
}

export interface VolumeData {
  day: string;
  volume: number;
}

export interface MuscleData {
  muscle: string;
  value: number;
}

export interface PersonalBest {
  exerciseId: string;
  exercise: string;
  weight: number;
  date: string;
}

export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

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
): Promise<PersonalBest[]> => {
  if (!token) throw new Error("No auth token provided");
  if (!exerciseIds || exerciseIds.length === 0) return [];

  const idsParam = exerciseIds.join(",");
  const response = await api.get(
    `/progress/pbs?exerciseIds=${idsParam}`,
    token,
  );
  return response;
};
