/**
 * SWR (Stale-While-Revalidate) Helper Functions
 *
 * Use these helpers to implement caching for any API endpoint
 */

import { cacheService, CacheTTL } from "./cacheService";
import { storageService } from "./storageService";

/**
 * Generic SWR fetch function
 * Returns cached data immediately and revalidates in background
 *
 * @param cacheKey - Unique key for this data
 * @param fetchFn - Function that fetches fresh data
 * @param ttl - Cache time-to-live in milliseconds
 * @param onUpdate - Callback when fresh data is available
 * @param useStorage - Whether to persist to localStorage (default: true)
 */
export async function fetchWithSWR<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = CacheTTL.FIVE_MINUTES,
  onUpdate?: (data: T) => void,
  useStorage: boolean = true,
): Promise<T> {
  // Check memory cache first
  const memoryCache = cacheService.getStale<T>(cacheKey);

  // Check localStorage if not in memory
  const storageCache = useStorage ? storageService.getStale<T>(cacheKey) : null;

  const cachedData = memoryCache?.data || storageCache?.data;
  const isStale = memoryCache?.isStale ?? storageCache?.isStale ?? true;

  // If we have cached data
  if (cachedData) {
    // Revalidate in background if stale
    if (isStale) {
      fetchFn()
        .then((freshData) => {
          // Update caches
          cacheService.set(cacheKey, freshData, ttl);
          if (useStorage) {
            storageService.set(cacheKey, freshData, ttl);
          }
          // Notify callback
          if (onUpdate) {
            onUpdate(freshData);
          }
        })
        .catch((error) => {
          console.error(
            `Background revalidation failed for ${cacheKey}:`,
            error,
          );
        });
    }

    return cachedData;
  }

  // No cache, fetch fresh data
  const freshData = await fetchFn();
  cacheService.set(cacheKey, freshData, ttl);
  if (useStorage) {
    storageService.set(cacheKey, freshData, ttl);
  }
  return freshData;
}

/**
 * Invalidate cache for a specific key
 */
export function invalidateCache(cacheKey: string): void {
  cacheService.remove(cacheKey);
  storageService.remove(cacheKey);
}

/**
 * Invalidate all caches with a specific prefix
 * Useful for clearing related data (e.g., all exercise-related caches)
 */
export function invalidateCachePrefix(prefix: string): void {
  cacheService.clearPrefix(prefix);
  storageService.clearPrefix(prefix);
}

/**
 * Force refresh - clears cache and fetches fresh data
 */
export async function forceRefresh<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = CacheTTL.FIVE_MINUTES,
  useStorage: boolean = true,
): Promise<T> {
  invalidateCache(cacheKey);
  const freshData = await fetchFn();
  cacheService.set(cacheKey, freshData, ttl);
  if (useStorage) {
    storageService.set(cacheKey, freshData, ttl);
  }
  return freshData;
}

/**
 * Example: Cache exercises with 1 hour TTL
 *
 * ```typescript
 * const exercises = await fetchWithSWR(
 *   'exercises:all',
 *   () => api.get('/exercises', token),
 *   CacheTTL.ONE_HOUR,
 *   (freshData) => setExercises(freshData)
 * );
 * ```
 *
 * Example: Cache user routines with 10 minute TTL
 *
 * ```typescript
 * const routines = await fetchWithSWR(
 *   'routines:user',
 *   () => api.get('/routines', token),
 *   CacheTTL.TEN_MINUTES,
 *   (freshData) => setRoutines(freshData)
 * );
 *
 * // After creating a new routine, invalidate cache
 * await api.post('/routines', data, token);
 * invalidateCache('routines:user');
 * ```
 *
 * Example: Memory-only cache (no localStorage)
 *
 * ```typescript
 * const sessionData = await fetchWithSWR(
 *   'session:active',
 *   () => api.get('/sessions/active', token),
 *   CacheTTL.ONE_MINUTE,
 *   (freshData) => setSession(freshData),
 *   false // Don't persist to localStorage
 * );
 * ```
 */
