import { api } from "../utils/api";

export interface SessionStats {
  totalVolume: number;
  duration: number | null;
  exerciseCount: number;
  totalSets: number;
}

export interface WorkoutSession {
  id: number;
  sessionName: string;
  startTime: string;
  endTime: string | null;
  labels?: string[];
  stats: SessionStats;
  exercises: Array<{
    exerciseId: string;
    sets: Array<{
      weight: number;
      reps: number;
      completed: boolean;
      isHardSet: boolean;
    }>;
    exercise: {
      id: string;
      name: string;
      category: string;
    };
  }>;
}

export const sessionService = {
  getSessions: async (
    token: string,
    filter?: string,
    limit: number = 10,
  ): Promise<WorkoutSession[]> => {
    const filterQuery = filter
      ? `?filter=${filter}&limit=${limit}`
      : `?limit=${limit}`;
    const response = await api.get(`/sessions${filterQuery}`, token);
    return response.data || [];
  },

  getSessionById: async (
    token: string,
    sessionId: number,
  ): Promise<WorkoutSession> => {
    const response = await api.get(`/sessions/${sessionId}`, token);
    // Single session endpoint returns the object directly (no .data wrapper)
    return response.data ?? response;
  },
};
