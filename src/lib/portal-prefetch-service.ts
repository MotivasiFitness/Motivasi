/**
 * Portal Prefetch Service
 * Preloads data for client portal pages to improve navigation speed
 */

import { BaseCrudService } from '@/integrations';
import {
  ClientPrograms,
  ClientAssignedWorkouts,
  ProgressCheckins,
  NutritionGuidance,
  ClientBookings,
  ClientProfiles,
  WeeklyCoachesNotes,
  WeeklyCheckins,
  WeeklySummaries,
  PrivateVideoLibrary,
} from '@/entities';

// Cache for prefetched data
const prefetchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (key: string): boolean => {
  const cached = prefetchCache.get(key);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
};

const getCachedData = (key: string) => {
  if (isCacheValid(key)) {
    return prefetchCache.get(key)?.data;
  }
  prefetchCache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any) => {
  prefetchCache.set(key, { data, timestamp: Date.now() });
};

/**
 * Prefetch data for History page
 */
export const prefetchHistoryData = async (memberId?: string) => {
  if (!memberId) return;
  
  const cacheKey = `history-${memberId}`;
  if (isCacheValid(cacheKey)) return;

  try {
    const [workouts, coachNotes, weeklySummaries] = await Promise.all([
      BaseCrudService.getAll<ClientAssignedWorkouts>('clientassignedworkouts'),
      BaseCrudService.getAll<WeeklyCoachesNotes>('weeklycoachesnotes'),
      BaseCrudService.getAll<WeeklySummaries>('weeklysummaries'),
    ]);

    setCachedData(cacheKey, {
      workouts: workouts.items,
      coachNotes: coachNotes.items,
      weeklySummaries: weeklySummaries.items,
    });
  } catch (error) {
    console.error('Error prefetching history data:', error);
  }
};

/**
 * Prefetch data for Progress page
 */
export const prefetchProgressData = async (memberId?: string) => {
  if (!memberId) return;
  
  const cacheKey = `progress-${memberId}`;
  if (isCacheValid(cacheKey)) return;

  try {
    const [checkins, videos] = await Promise.all([
      BaseCrudService.getAll<ProgressCheckins>('progresscheckins'),
      BaseCrudService.getAll<PrivateVideoLibrary>('privatevideolibrary'),
    ]);

    setCachedData(cacheKey, {
      checkins: checkins.items,
      videos: videos.items,
    });
  } catch (error) {
    console.error('Error prefetching progress data:', error);
  }
};

/**
 * Prefetch data for Profile page
 */
export const prefetchProfileData = async (memberId?: string) => {
  if (!memberId) return;
  
  const cacheKey = `profile-${memberId}`;
  if (isCacheValid(cacheKey)) return;

  try {
    const profiles = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
    setCachedData(cacheKey, {
      profiles: profiles.items,
    });
  } catch (error) {
    console.error('Error prefetching profile data:', error);
  }
};

/**
 * Prefetch data for Nutrition page
 */
export const prefetchNutritionData = async (memberId?: string) => {
  if (!memberId) return;
  
  const cacheKey = `nutrition-${memberId}`;
  if (isCacheValid(cacheKey)) return;

  try {
    const nutrition = await BaseCrudService.getAll<NutritionGuidance>('nutritionguidance');
    setCachedData(cacheKey, {
      nutrition: nutrition.items,
    });
  } catch (error) {
    console.error('Error prefetching nutrition data:', error);
  }
};

/**
 * Prefetch data for Bookings page
 */
export const prefetchBookingsData = async (memberId?: string) => {
  if (!memberId) return;
  
  const cacheKey = `bookings-${memberId}`;
  if (isCacheValid(cacheKey)) return;

  try {
    const [bookings, profiles] = await Promise.all([
      BaseCrudService.getAll<ClientBookings>('clientbookings'),
      BaseCrudService.getAll<ClientProfiles>('clientprofiles'),
    ]);

    setCachedData(cacheKey, {
      bookings: bookings.items,
      profiles: profiles.items,
    });
  } catch (error) {
    console.error('Error prefetching bookings data:', error);
  }
};

/**
 * Prefetch all secondary navigation data
 * Call this when user is on dashboard or program page
 */
export const prefetchAllSecondaryPages = async (memberId?: string) => {
  if (!memberId) return;

  // Prefetch all in parallel, but don't await to avoid blocking
  Promise.all([
    prefetchHistoryData(memberId),
    prefetchProgressData(memberId),
    prefetchProfileData(memberId),
    prefetchNutritionData(memberId),
    prefetchBookingsData(memberId),
  ]).catch(error => {
    console.error('Error in prefetch batch:', error);
  });
};

/**
 * Get cached data for a page
 */
export const getCachedPageData = (pageKey: string, memberId?: string) => {
  if (!memberId) return null;
  const cacheKey = `${pageKey}-${memberId}`;
  return getCachedData(cacheKey);
};

/**
 * Clear all cached data
 */
export const clearPrefetchCache = () => {
  prefetchCache.clear();
};

/**
 * Clear specific page cache
 */
export const clearPageCache = (pageKey: string, memberId?: string) => {
  if (memberId) {
    prefetchCache.delete(`${pageKey}-${memberId}`);
  }
};
