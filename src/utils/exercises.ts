import { api } from "./api";
import { fetchWithSWR, invalidateCache } from "./swrHelpers";
import { CacheTTL } from "./cacheService";
import {
  getExerciseCache,
  getExerciseCacheVersion,
  getUserIdFromToken,
  setExerciseCache,
  setExerciseCacheVersion,
} from "./exerciseCache";

export interface FilterOptions {
  muscles: string[];
  categories: string[];
  equipment: string[];
}

export interface ExerciseCacheItem {
  id: string;
  name: string;
  category: string;
  equipment: string;
  isBodyweightExercise: boolean;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  instructions?: string;
  isCustom: boolean;
  createdBy?: string;
}

export const exerciseService = {
  getLastUpdated: async (token: string): Promise<string | null> => {
    try {
      const response = await api.get("/exercises/last-updated", token);
      return response?.data?.lastUpdated ?? null;
    } catch (error) {
      console.error("Failed to fetch exercises last-updated:", error);
      return null;
    }
  },

  getAllExercises: async (token: string): Promise<ExerciseCacheItem[]> => {
    try {
      const response = await api.get("/exercises/all", token);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch all exercises:", error);
      return [];
    }
  },

  syncExerciseCache: async (token: string): Promise<ExerciseCacheItem[]> => {
    const userId = getUserIdFromToken(token);
    if (!userId) return [];

    const [remoteVersion, localVersion, localData] = await Promise.all([
      exerciseService.getLastUpdated(token),
      Promise.resolve(getExerciseCacheVersion(userId)),
      Promise.resolve(getExerciseCache(userId)),
    ]);

    const shouldRefresh =
      !localData.length ||
      !localVersion ||
      (remoteVersion !== null && remoteVersion !== localVersion);

    if (!shouldRefresh) {
      return localData;
    }

    const fresh = await exerciseService.getAllExercises(token);
    setExerciseCache(userId, fresh);
    if (remoteVersion) {
      setExerciseCacheVersion(userId, remoteVersion);
    }
    return fresh;
  },

  getMuscles: async (
    token: string,
    onUpdate?: (data: string[]) => void,
  ): Promise<string[]> => {
    try {
      return await fetchWithSWR(
        "exercises:muscles",
        async () => {
          const response = await api.get("/exercises/muscles", token);
          return Array.isArray(response.data) ? response.data : [];
        },
        CacheTTL.ONE_DAY, // Static data, cache for 1 day
        onUpdate,
      );
    } catch (error) {
      console.error("Failed to fetch muscles:", error);
      return [];
    }
  },

  getCategories: async (
    token: string,
    onUpdate?: (data: string[]) => void,
  ): Promise<string[]> => {
    try {
      return await fetchWithSWR(
        "exercises:categories",
        async () => {
          const response = await api.get("/exercises/categories", token);
          return Array.isArray(response.data) ? response.data : [];
        },
        CacheTTL.ONE_DAY,
        onUpdate,
      );
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  },

  getEquipment: async (
    token: string,
    onUpdate?: (data: string[]) => void,
  ): Promise<string[]> => {
    try {
      return await fetchWithSWR(
        "exercises:equipment",
        async () => {
          const response = await api.get("/exercises/equipment", token);
          return Array.isArray(response.data) ? response.data : [];
        },
        CacheTTL.ONE_DAY,
        onUpdate,
      );
    } catch (error) {
      console.error("Failed to fetch equipment:", error);
      return [];
    }
  },

  getAllFilters: async (
    token: string,
    onUpdate?: (data: FilterOptions) => void,
  ): Promise<FilterOptions> => {
    try {
      return await fetchWithSWR(
        "exercises:allFilters",
        async () => {
          const [muscles, categories, equipment] = await Promise.all([
            exerciseService.getMuscles(token),
            exerciseService.getCategories(token),
            exerciseService.getEquipment(token),
          ]);
          return { muscles, categories, equipment };
        },
        CacheTTL.ONE_DAY,
        onUpdate,
      );
    } catch (error) {
      console.error("Failed to fetch all filters:", error);
      return { muscles: [], categories: [], equipment: [] };
    }
  },
};
