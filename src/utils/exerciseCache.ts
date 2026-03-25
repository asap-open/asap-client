import type { ExerciseCacheItem } from "./exercises";

const EXERCISE_DATA_KEY = "exercise_data";
const EXERCISE_VERSION_KEY = "exercise_db_version";

const withUserScope = (key: string, userId: string) => `${key}:${userId}`;

export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof decoded?.userId === "string" ? decoded.userId : null;
  } catch {
    return null;
  }
}

export function getExerciseCache(userId: string): ExerciseCacheItem[] {
  try {
    const raw = localStorage.getItem(withUserScope(EXERCISE_DATA_KEY, userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setExerciseCache(
  userId: string,
  exercises: ExerciseCacheItem[],
): void {
  localStorage.setItem(
    withUserScope(EXERCISE_DATA_KEY, userId),
    JSON.stringify(exercises),
  );
}

export function getExerciseCacheVersion(userId: string): string | null {
  return localStorage.getItem(withUserScope(EXERCISE_VERSION_KEY, userId));
}

export function setExerciseCacheVersion(userId: string, version: string): void {
  localStorage.setItem(withUserScope(EXERCISE_VERSION_KEY, userId), version);
}

export function clearExerciseCache(userId: string): void {
  localStorage.removeItem(withUserScope(EXERCISE_DATA_KEY, userId));
  localStorage.removeItem(withUserScope(EXERCISE_VERSION_KEY, userId));
}
