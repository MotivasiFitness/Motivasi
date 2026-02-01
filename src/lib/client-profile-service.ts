/**
 * Client Profile Service
 * Manages client name and profile information
 * Provides utilities to fetch, cache, and display client names
 * 
 * CRITICAL: This is the SINGLE SOURCE OF TRUTH for client profile data.
 * All client information (name, email, metrics, goals, notes) flows through this service.
 * Cache invalidation ensures real-time updates between Client Portal and Trainer Portal.
 */

import { ClientProfiles, TrainerClientAssignments } from '@/entities';
import ProtectedDataService from './protected-data-service';
import { BaseCrudService } from '@/integrations';

// In-memory cache for client profiles with timestamp tracking
interface CachedProfile {
  profile: ClientProfiles;
  timestamp: number;
}

const clientProfileCache = new Map<string, CachedProfile>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Check if cached profile is still valid
 */
function isCacheValid(cachedItem: CachedProfile): boolean {
  return Date.now() - cachedItem.timestamp < CACHE_TTL;
}

/**
 * Get client profile by member ID
 * @param memberId - Member ID of the client
 * @param forceRefresh - Force bypass cache and fetch fresh data
 * @returns Client profile with name information
 */
export async function getClientProfile(
  memberId: string, 
  forceRefresh: boolean = false
): Promise<ClientProfiles | null> {
  // Check cache first (unless force refresh)
  if (!forceRefresh && clientProfileCache.has(memberId)) {
    const cached = clientProfileCache.get(memberId)!;
    if (isCacheValid(cached)) {
      return cached.profile;
    }
  }

  try {
    const { items } = await ProtectedDataService.getAll<ClientProfiles>('clientprofiles');
    const profile = items.find(p => p.memberId === memberId);
    
    if (profile) {
      clientProfileCache.set(memberId, {
        profile,
        timestamp: Date.now()
      });
    }
    
    return profile || null;
  } catch (error) {
    console.error(`Error fetching client profile for ${memberId}:`, error);
    return null;
  }
}

/**
 * Get multiple client profiles by member IDs
 * @param memberIds - Array of member IDs
 * @param forceRefresh - Force bypass cache and fetch fresh data
 * @returns Map of member ID to client profile
 */
export async function getClientProfiles(
  memberIds: string[],
  forceRefresh: boolean = false
): Promise<Map<string, ClientProfiles>> {
  const profiles = new Map<string, ClientProfiles>();
  
  // Determine which IDs need fetching
  const uncachedIds = memberIds.filter(id => {
    if (forceRefresh) return true;
    const cached = clientProfileCache.get(id);
    return !cached || !isCacheValid(cached);
  });

  // Fetch uncached or stale profiles
  if (uncachedIds.length > 0) {
    try {
      const { items } = await ProtectedDataService.getAll<ClientProfiles>('clientprofiles');
      
      uncachedIds.forEach(id => {
        const profile = items.find(p => p.memberId === id);
        if (profile) {
          clientProfileCache.set(id, {
            profile,
            timestamp: Date.now()
          });
        }
      });
    } catch (error) {
      console.error('Error fetching client profiles:', error);
    }
  }

  // Collect all profiles (cached + newly fetched)
  memberIds.forEach(id => {
    const cached = clientProfileCache.get(id);
    if (cached) {
      profiles.set(id, cached.profile);
    }
  });

  return profiles;
}

/**
 * Get display name for a client
 * Falls back to email or member ID if name not available
 * @param memberId - Member ID of the client
 * @param fallbackEmail - Email to use as fallback
 * @param forceRefresh - Force bypass cache and fetch fresh data
 * @returns Display name string
 */
export async function getClientDisplayName(
  memberId: string, 
  fallbackEmail?: string,
  forceRefresh: boolean = false
): Promise<string> {
  const profile = await getClientProfile(memberId, forceRefresh);
  
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  
  if (profile?.firstName) {
    return profile.firstName;
  }
  
  if (fallbackEmail) {
    return fallbackEmail;
  }
  
  return `Client ${memberId.slice(-4).toUpperCase()}`;
}

/**
 * Get display names for multiple clients
 * @param memberIds - Array of member IDs
 * @param fallbackEmails - Map of member ID to email for fallback
 * @param forceRefresh - Force bypass cache and fetch fresh data
 * @returns Map of member ID to display name
 */
export async function getClientDisplayNames(
  memberIds: string[],
  fallbackEmails?: Map<string, string>,
  forceRefresh: boolean = false
): Promise<Map<string, string>> {
  const profiles = await getClientProfiles(memberIds, forceRefresh);
  const displayNames = new Map<string, string>();

  memberIds.forEach(memberId => {
    const profile = profiles.get(memberId);
    
    if (profile?.firstName && profile?.lastName) {
      displayNames.set(memberId, `${profile.firstName} ${profile.lastName}`);
    } else if (profile?.firstName) {
      displayNames.set(memberId, profile.firstName);
    } else if (fallbackEmails?.has(memberId)) {
      displayNames.set(memberId, fallbackEmails.get(memberId) || `Client ${memberId.slice(-4).toUpperCase()}`);
    } else {
      displayNames.set(memberId, `Client ${memberId.slice(-4).toUpperCase()}`);
    }
  });

  return displayNames;
}

/**
 * Create or update client profile
 * CRITICAL: This invalidates cache to ensure real-time updates across portals
 * Also auto-assigns new clients to the default trainer
 * @param memberId - Member ID of the client
 * @param data - Profile data to save
 * @returns Created/updated profile
 */
export async function upsertClientProfile(
  memberId: string,
  data: Partial<ClientProfiles>
): Promise<ClientProfiles> {
  try {
    // Check if profile exists
    const { items } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
    const existingProfile = items.find(p => p.memberId === memberId);

    let profile: ClientProfiles;
    const isNewProfile = !existingProfile;

    if (existingProfile) {
      // Update existing profile
      profile = {
        ...existingProfile,
        ...data,
        memberId, // Ensure memberId is set
      };
      await BaseCrudService.update('clientprofiles', profile);
    } else {
      // Create new profile
      profile = {
        _id: crypto.randomUUID(),
        memberId,
        ...data,
      };
      await BaseCrudService.create('clientprofiles', profile);
    }

    // Auto-assign new clients to default trainer
    if (isNewProfile) {
      await assignClientToDefaultTrainer(memberId);
    }

    // CRITICAL: Invalidate cache immediately to ensure real-time updates
    invalidateClientProfileCache(memberId);
    
    // Update cache with new data
    clientProfileCache.set(memberId, {
      profile,
      timestamp: Date.now()
    });
    
    return profile;
  } catch (error) {
    console.error(`Error upserting client profile for ${memberId}:`, error);
    throw error;
  }
}

/**
 * Auto-assign a new client to the default trainer
 * @param clientId - Client member ID to assign
 */
async function assignClientToDefaultTrainer(clientId: string): Promise<void> {
  const DEFAULT_TRAINER_ID = 'd18a21c8-be77-496f-a2fd-ec6479ecba6d';
  
  try {
    // Check if assignment already exists
    const { items } = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
    const existingAssignment = items.find(
      a => a.clientId === clientId && a.trainerId === DEFAULT_TRAINER_ID
    );

    if (!existingAssignment) {
      // Create new assignment
      const assignment: TrainerClientAssignments = {
        _id: crypto.randomUUID(),
        trainerId: DEFAULT_TRAINER_ID,
        clientId,
        assignmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: 'Auto-assigned on profile creation'
      };
      await BaseCrudService.create('trainerclientassignments', assignment);
      console.log(`Client ${clientId} auto-assigned to trainer ${DEFAULT_TRAINER_ID}`);
    }
  } catch (error) {
    console.error(`Error auto-assigning client ${clientId} to trainer:`, error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Invalidate cache for a specific client
 * Use this when you know data has changed and want to force a refresh
 * @param memberId - Member ID to invalidate
 */
export function invalidateClientProfileCache(memberId: string): void {
  clientProfileCache.delete(memberId);
}

/**
 * Invalidate cache for multiple clients
 * @param memberIds - Array of member IDs to invalidate
 */
export function invalidateClientProfileCaches(memberIds: string[]): void {
  memberIds.forEach(id => clientProfileCache.delete(id));
}

/**
 * Clear the entire client profile cache
 * Useful for testing or forcing a complete refresh
 */
export function clearClientProfileCache(): void {
  clientProfileCache.clear();
}

/**
 * Get cache size (for debugging)
 */
export function getClientProfileCacheSize(): number {
  return clientProfileCache.size;
}

/**
 * Get cache statistics (for debugging)
 */
export function getClientProfileCacheStats(): {
  size: number;
  entries: Array<{ memberId: string; age: number; valid: boolean }>;
} {
  const entries: Array<{ memberId: string; age: number; valid: boolean }> = [];
  
  clientProfileCache.forEach((cached, memberId) => {
    const age = Date.now() - cached.timestamp;
    entries.push({
      memberId,
      age,
      valid: isCacheValid(cached)
    });
  });
  
  return {
    size: clientProfileCache.size,
    entries
  };
}

export default {
  getClientProfile,
  getClientProfiles,
  getClientDisplayName,
  getClientDisplayNames,
  upsertClientProfile,
  invalidateClientProfileCache,
  invalidateClientProfileCaches,
  clearClientProfileCache,
  getClientProfileCacheSize,
  getClientProfileCacheStats,
};
