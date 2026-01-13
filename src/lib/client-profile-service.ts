/**
 * Client Profile Service
 * Manages client name and profile information
 * Provides utilities to fetch, cache, and display client names
 */

import { BaseCrudService } from '@/integrations';
import { ClientProfiles } from '@/entities';

// In-memory cache for client profiles
const clientProfileCache = new Map<string, ClientProfiles>();

/**
 * Get client profile by member ID
 * @param memberId - Member ID of the client
 * @returns Client profile with name information
 */
export async function getClientProfile(memberId: string): Promise<ClientProfiles | null> {
  // Check cache first
  if (clientProfileCache.has(memberId)) {
    return clientProfileCache.get(memberId) || null;
  }

  try {
    const { items } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
    const profile = items.find(p => p.memberId === memberId);
    
    if (profile) {
      clientProfileCache.set(memberId, profile);
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
 * @returns Map of member ID to client profile
 */
export async function getClientProfiles(memberIds: string[]): Promise<Map<string, ClientProfiles>> {
  const profiles = new Map<string, ClientProfiles>();
  const uncachedIds = memberIds.filter(id => !clientProfileCache.has(id));

  // Fetch uncached profiles
  if (uncachedIds.length > 0) {
    try {
      const { items } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
      
      uncachedIds.forEach(id => {
        const profile = items.find(p => p.memberId === id);
        if (profile) {
          clientProfileCache.set(id, profile);
        }
      });
    } catch (error) {
      console.error('Error fetching client profiles:', error);
    }
  }

  // Collect all profiles (cached + newly fetched)
  memberIds.forEach(id => {
    const profile = clientProfileCache.get(id);
    if (profile) {
      profiles.set(id, profile);
    }
  });

  return profiles;
}

/**
 * Get display name for a client
 * Falls back to email or member ID if name not available
 * @param memberId - Member ID of the client
 * @param fallbackEmail - Email to use as fallback
 * @returns Display name string
 */
export async function getClientDisplayName(memberId: string, fallbackEmail?: string): Promise<string> {
  const profile = await getClientProfile(memberId);
  
  if (profile?.displayName) {
    return profile.displayName;
  }
  
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  
  if (profile?.firstName) {
    return profile.firstName;
  }
  
  if (profile?.email) {
    return profile.email;
  }
  
  if (fallbackEmail) {
    return fallbackEmail;
  }
  
  return memberId;
}

/**
 * Get display names for multiple clients
 * @param memberIds - Array of member IDs
 * @param fallbackEmails - Map of member ID to email for fallback
 * @returns Map of member ID to display name
 */
export async function getClientDisplayNames(
  memberIds: string[],
  fallbackEmails?: Map<string, string>
): Promise<Map<string, string>> {
  const profiles = await getClientProfiles(memberIds);
  const displayNames = new Map<string, string>();

  memberIds.forEach(memberId => {
    const profile = profiles.get(memberId);
    
    if (profile?.displayName) {
      displayNames.set(memberId, profile.displayName);
    } else if (profile?.firstName && profile?.lastName) {
      displayNames.set(memberId, `${profile.firstName} ${profile.lastName}`);
    } else if (profile?.firstName) {
      displayNames.set(memberId, profile.firstName);
    } else if (profile?.email) {
      displayNames.set(memberId, profile.email);
    } else if (fallbackEmails?.has(memberId)) {
      displayNames.set(memberId, fallbackEmails.get(memberId) || memberId);
    } else {
      displayNames.set(memberId, memberId);
    }
  });

  return displayNames;
}

/**
 * Create or update client profile
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

    // Update cache
    clientProfileCache.set(memberId, profile);
    return profile;
  } catch (error) {
    console.error(`Error upserting client profile for ${memberId}:`, error);
    throw error;
  }
}

/**
 * Clear the client profile cache
 * Useful for testing or forcing a refresh
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

export default {
  getClientProfile,
  getClientProfiles,
  getClientDisplayName,
  getClientDisplayNames,
  upsertClientProfile,
  clearClientProfileCache,
  getClientProfileCacheSize,
};
