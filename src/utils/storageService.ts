/**
 * localStorage utility with TTL (Time To Live) support
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

export const storageService = {
  /**
   * Set item in localStorage with TTL
   */
  set<T>(key: string, value: T, ttlMs: number = Infinity): void {
    try {
      const cached: CachedData<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttlMs,
      };
      localStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.error(`Failed to set localStorage key "${key}":`, error);
    }
  },

  /**
   * Get item from localStorage
   * Returns null if expired or doesn't exist
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cached: CachedData<T> = JSON.parse(item);
      const isExpired = Date.now() - cached.timestamp > cached.ttl;

      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error(`Failed to get localStorage key "${key}":`, error);
      return null;
    }
  },

  /**
   * Get item even if expired (for SWR pattern)
   */
  getStale<T>(key: string): { data: T; isStale: boolean } | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cached: CachedData<T> = JSON.parse(item);
      const isStale = Date.now() - cached.timestamp > cached.ttl;

      return {
        data: cached.data,
        isStale,
      };
    } catch (error) {
      console.error(`Failed to get stale data for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Check if cache exists and is valid
   */
  isValid(key: string): boolean {
    try {
      const item = localStorage.getItem(key);
      if (!item) return false;

      const cached: CachedData<unknown> = JSON.parse(item);
      return Date.now() - cached.timestamp <= cached.ttl;
    } catch {
      return false;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  },

  /**
   * Clear all items
   */
  clear(): void {
    localStorage.clear();
  },

  /**
   * Clear all items with a specific prefix
   */
  clearPrefix(prefix: string): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  },
};
