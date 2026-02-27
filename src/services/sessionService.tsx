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

export interface SessionPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SessionsResult {
  data: WorkoutSession[];
  pagination: SessionPagination;
}

export const sessionService = {
  getSessions: async (
    token: string,
    filter?: string,
    limit: number = 10,
    page: number = 1,
  ): Promise<SessionsResult> => {
    const params = new URLSearchParams();
    if (filter) params.set("filter", filter);
    params.set("limit", String(limit));
    params.set("page", String(page));
    const response = await api.get(`/sessions?${params.toString()}`, token);
    return {
      data: response.data || [],
      pagination: response.pagination ?? {
        total: (response.data || []).length,
        page,
        limit,
        totalPages: 1,
      },
    };
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
