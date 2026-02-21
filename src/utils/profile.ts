import { api } from "./api";
import { storageService } from "./storageService";
import { cacheService, CacheTTL } from "./cacheService";

// --- Types ---
export interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  fullName: string | null;
  heightCm: number | null;
  targetWeightKg: number | null;
  latestWeightKg: number | null;
  unitPref: string;
  dateOfBirth: string | null;
  gender: string | null;
}

export interface FullProfileData {
  user: UserData;
  profile: UserProfile | null;
  previousWeight: number | null;
}

export const getBMIStatus = (bmi: number) => {
  if (bmi < 18.5) {
    return { text: "Underweight", color: "text-yellow-500" };
  } else if (bmi < 25) {
    return { text: "Normal", color: "text-primary" };
  } else if (bmi < 30) {
    return { text: "Overweight", color: "text-orange-500" };
  } else {
    return { text: "Obese", color: "text-red-500" };
  }
};

export const getBMIPosition = (bmi: number): number => {
  // Map BMI value (15-35 range) to percentage (0-100)
  const minBMI = 15;
  const maxBMI = 35;
  const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
  return ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 100;
};

export const formatMemberSince = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export const formatDateOfBirth = (dateString: string | null) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatGender = (gender: string | null) => {
  if (!gender) return "—";
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

/**
 * Fetches user profile, account data, and weight history to calculate previous weight.
 * Handles localStorage caching automatically with TTL.
 */
export const fetchFullUserProfile = async (
  token: string | null,
): Promise<FullProfileData> => {
  if (!token) throw new Error("No auth token provided");

  // 1. Fetch Profile Data
  const profileData = await api.get("/profile", token);

  const userObj: UserData = {
    id: profileData.id,
    username: profileData.username,
    email: profileData.email,
    createdAt: profileData.createdAt,
  };

  const profileObj: UserProfile | null = profileData.profile || null;

  // 2. Fetch Weight History (for previous weight comparison)
  let previousWeight: number | null = null;
  try {
    const weightHistory = await api.get("/weights/history", token);
    if (weightHistory && weightHistory.length > 1) {
      previousWeight = weightHistory[1].weightKg;
    }
  } catch (err) {
    console.warn("Failed to fetch weight history", err);
    // Non-critical, continue
  }

  const fullData: FullProfileData = {
    user: userObj,
    profile: profileObj,
    previousWeight,
  };

  // 3. Update caches with TTL of 5 minutes
  storageService.set("fullProfile", fullData, CacheTTL.FIVE_MINUTES);
  cacheService.set("fullProfile", fullData, CacheTTL.FIVE_MINUTES);

  return fullData;
};

/**
 * Loads user data from local storage if available (even if stale)
 */
export const loadUserFromStorage = (): FullProfileData | null => {
  // Try memory cache first (faster)
  const memoryCache = cacheService.get<FullProfileData>("fullProfile");
  if (memoryCache) return memoryCache;

  // Fallback to localStorage
  const localCache = storageService.get<FullProfileData>("fullProfile");
  if (localCache) {
    // Repopulate memory cache
    cacheService.set("fullProfile", localCache, CacheTTL.FIVE_MINUTES);
    return localCache;
  }

  return null;
};

/**
 * SWR Pattern: Stale-While-Revalidate
 * Returns cached data immediately and revalidates in the background
 *
 * @param token - Auth token
 * @param onUpdate - Callback when fresh data is available
 * @returns Promise with initial data (may be stale)
 */
export const fetchProfileWithSWR = async (
  token: string | null,
  onUpdate?: (data: FullProfileData) => void,
): Promise<FullProfileData> => {
  if (!token) throw new Error("No auth token provided");

  // Check for stale cache data
  const staleMemory = cacheService.getStale<FullProfileData>("fullProfile");
  const staleStorage = storageService.getStale<FullProfileData>("fullProfile");

  const cachedData = staleMemory?.data || staleStorage?.data;
  const isStale = staleMemory?.isStale ?? staleStorage?.isStale ?? true;

  // If we have cached data, revalidate in background
  if (cachedData) {
    if (isStale) {
      // Revalidate in background
      fetchFullUserProfile(token)
        .then((freshData) => {
          if (onUpdate) {
            onUpdate(freshData);
          }
        })
        .catch((error) => {
          console.error("Background revalidation failed:", error);
        });
    }

    // Return cached data immediately
    return cachedData;
  }

  // No cache available, fetch fresh data
  return await fetchFullUserProfile(token);
};

/**
 * Invalidates all profile caches
 * Use this after updating profile data
 */
export const invalidateProfileCache = (): void => {
  cacheService.remove("fullProfile");
  storageService.remove("fullProfile");
};

/**
 * Force refresh profile data
 * Clears cache and fetches fresh data
 */
export const refreshProfile = async (
  token: string | null,
): Promise<FullProfileData> => {
  invalidateProfileCache();
  return await fetchFullUserProfile(token);
};
