import { BaseCrudService } from '@/integrations';
import { ClientProfiles } from '@/entities';

/**
 * Get the display name for a client with fallback order:
 * displayName → firstName → email prefix → 'Client ****' (last 4 of ID)
 */
export async function getClientDisplayName(clientId: string): Promise<string> {
  try {
    // Try to find client profile
    const { items } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
    const profile = items.find(p => p.memberId === clientId);

    if (profile) {
      // Fallback order: displayName → firstName → email prefix → 'Client ****'
      if (profile.displayName?.trim()) {
        return profile.displayName;
      }
      if (profile.firstName?.trim()) {
        return profile.firstName;
      }
      if (profile.email?.trim()) {
        const emailPrefix = profile.email.split('@')[0];
        return emailPrefix;
      }
    }
  } catch (error) {
    console.error('[getClientDisplayName] Error fetching client profile:', error);
  }

  // Final fallback: 'Client ****' (last 4 of ID)
  const lastFour = clientId.slice(-4).toUpperCase();
  return `Client ${lastFour}`;
}

/**
 * Get display names for multiple clients (batch operation)
 */
export async function getClientDisplayNames(clientIds: string[]): Promise<Map<string, string>> {
  const displayNames = new Map<string, string>();

  try {
    const { items } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
    const profileMap = new Map(items.map(p => [p.memberId, p]));

    for (const clientId of clientIds) {
      const profile = profileMap.get(clientId);
      let displayName = '';

      if (profile) {
        if (profile.displayName?.trim()) {
          displayName = profile.displayName;
        } else if (profile.firstName?.trim()) {
          displayName = profile.firstName;
        } else if (profile.email?.trim()) {
          displayName = profile.email.split('@')[0];
        }
      }

      if (!displayName) {
        const lastFour = clientId.slice(-4).toUpperCase();
        displayName = `Client ${lastFour}`;
      }

      displayNames.set(clientId, displayName);
    }
  } catch (error) {
    console.error('[getClientDisplayNames] Error fetching client profiles:', error);
    // Fallback for all clients
    for (const clientId of clientIds) {
      const lastFour = clientId.slice(-4).toUpperCase();
      displayNames.set(clientId, `Client ${lastFour}`);
    }
  }

  return displayNames;
}
