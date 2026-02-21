import { api } from "./api";
import { fetchWithSWR, invalidateCache } from "./swrHelpers";
import { CacheTTL } from "./cacheService";

export interface FilterOptions {
  muscles: string[];
  categories: string[];
  equipment: string[];
}

export const exerciseService = {
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
