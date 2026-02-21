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
    sets: Array<{
      weight: number;
      reps: number;
      completed: boolean;
    }>;
    exercise: {
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
    return response.data;
  },
};
