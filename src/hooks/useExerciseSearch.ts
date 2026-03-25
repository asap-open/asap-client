import { useMemo } from "react";
import Fuse from "fuse.js";
import type { ExerciseCacheItem } from "../utils/exercises";

export interface ExerciseSearchFilters {
  muscle?: string;
  category?: string;
  equipment?: string;
}

interface UseExerciseSearchParams {
  exercises: ExerciseCacheItem[];
  searchTerm: string;
  filters?: ExerciseSearchFilters;
  page?: number;
  pageSize?: number;
}

interface UseExerciseSearchResult {
  items: ExerciseCacheItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const hasMuscle = (exercise: ExerciseCacheItem, muscle: string) => {
  const target = muscle.toLowerCase();
  const primary = Array.isArray(exercise.primaryMuscles)
    ? exercise.primaryMuscles
    : [];
  const secondary = Array.isArray(exercise.secondaryMuscles)
    ? exercise.secondaryMuscles
    : [];

  return [...primary, ...secondary].some((m) =>
    String(m).toLowerCase().includes(target),
  );
};

export function useExerciseSearch({
  exercises,
  searchTerm,
  filters = {},
  page = 1,
  pageSize = 20,
}: UseExerciseSearchParams): UseExerciseSearchResult {
  const filteredByFacet = useMemo(() => {
    const muscle = normalize(filters.muscle);
    const category = normalize(filters.category);
    const equipment = normalize(filters.equipment);

    return exercises.filter((exercise) => {
      if (category && normalize(exercise.category) !== category) return false;
      if (equipment && normalize(exercise.equipment) !== equipment)
        return false;
      if (muscle && !hasMuscle(exercise, muscle)) return false;
      return true;
    });
  }, [exercises, filters.muscle, filters.category, filters.equipment]);

  const searched = useMemo(() => {
    const term = normalize(searchTerm);
    if (!term) return filteredByFacet;

    const fuse = new Fuse(filteredByFacet, {
      includeScore: true,
      shouldSort: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: [
        { name: "name", weight: 0.55 },
        { name: "primaryMuscles", weight: 0.2 },
        { name: "secondaryMuscles", weight: 0.1 },
        { name: "category", weight: 0.1 },
        { name: "equipment", weight: 0.05 },
      ],
    });

    return fuse.search(term).map((result) => result.item);
  }, [filteredByFacet, searchTerm]);

  const total = searched.length;
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    items: searched.slice(start, end),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}
