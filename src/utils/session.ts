import { api } from "./api";

// --- Types ---

export interface SessionSetInput {
  weight: number;
  reps: number;
  isHardSet: boolean;
}

export interface SessionExerciseInput {
  exerciseId: string;
  sets: SessionSetInput[];
}

export interface CreateSessionPayload {
  sessionName: string;
  startTime: string;
  exercises: SessionExerciseInput[];
}

export interface UpdateSessionPayload {
  sessionName?: string;
  exercises?: SessionExerciseInput[];
  endTime?: string;
  startTime?: string;
}

export interface CalendarStats {
  date: string;
  workouts: number;
  totalVolume?: number;
  totalDuration?: number;
}

// --- API Functions ---

/**
 * Fetches calendar statistics for the last N days
 */
export const fetchSessionCalendarStats = async (
  token: string | null,
  days: number = 7,
): Promise<CalendarStats[]> => {
  if (!token) throw new Error("No auth token provided");
  const response = await api.get(
    `/sessions/stats/calendar?days=${days}`,
    token,
  );
  return response.data || response;
};

/**
 * Creates a new session
 */
export const createSession = async (
  token: string | null,
  data: CreateSessionPayload,
): Promise<{ id: number }> => {
  if (!token) throw new Error("No auth token provided");
  return await api.post("/sessions", data, token);
};

/**
 * Updates an existing session
 */
export const updateSession = async (
  token: string | null,
  sessionId: number,
  data: UpdateSessionPayload,
): Promise<void> => {
  if (!token) throw new Error("No auth token provided");
  return await api.put(`/sessions/${sessionId}`, data, token);
};

/**
 * Deletes a session
 */
export const deleteSession = async (
  token: string | null,
  sessionId: number,
): Promise<void> => {
  if (!token) throw new Error("No auth token provided");
  return await api.delete(`/sessions/${sessionId}`, token);
};
