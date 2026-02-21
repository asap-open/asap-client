import { api } from "../utils/api";

export interface RoutineSet {
  weight?: number;
  reps?: number;
  durationSec?: number;
  distance?: number;
  isHardSet: boolean;
}

export interface RoutineExercise {
  id: number;
  exerciseId: string;
  order: number;
  sets: RoutineSet[];
  exercise: {
    id: string;
    name: string;
    category: string;
    primaryMuscles: string[];
  };
}

export interface Routine {
  id: number;
  name: string;
  description?: string;
  labels: string[];
  exercises: RoutineExercise[];
}

export interface CreateRoutineExerciseInput {
  exerciseId: string;
  sets: RoutineSet[];
}

export interface CreateRoutineInput {
  name: string;
  description?: string;
  labels: string[];
  exercises: CreateRoutineExerciseInput[];
}

export const routineService = {
  createRoutine: async (token: string | null, data: CreateRoutineInput) => {
    if (!token) throw new Error("No token provided");
    return await api.post("/routines", data, token);
  },

  getRoutines: async (token: string | null): Promise<Routine[]> => {
    if (!token) throw new Error("No token provided");
    const response = await api.get("/routines", token);
    return response.data || response;
  },

  getRoutineById: async (
    token: string | null,
    id: number,
  ): Promise<Routine> => {
    if (!token) throw new Error("No token provided");
    return await api.get(`/routines/${id}`, token);
  },

  deleteRoutine: async (token: string | null, id: number) => {
    if (!token) throw new Error("No token provided");
    return await api.delete(`/routines/${id}`, token);
  },
};
