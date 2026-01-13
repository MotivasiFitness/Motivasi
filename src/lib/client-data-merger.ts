/**
 * Client Data Merger
 * Utility to merge client profile data with other entities
 * Provides helpers to enrich data with client names
 */

import { ClientProfiles } from '@/entities';
import { getClientProfiles, getClientDisplayNames } from './client-profile-service';

export interface ClientDataWithProfile<T> {
  data: T;
  clientProfile?: ClientProfiles;
  clientDisplayName?: string;
}

/**
 * Enrich data items with client profile information
 * @param items - Array of items with clientId field
 * @param clientIdField - Name of the field containing client ID (default: 'clientId')
 * @returns Array of items enriched with client profile data
 */
export async function enrichWithClientProfiles<T extends Record<string, any>>(
  items: T[],
  clientIdField: string = 'clientId'
): Promise<ClientDataWithProfile<T>[]> {
  // Extract unique client IDs
  const clientIds = Array.from(new Set(
    items
      .map(item => item[clientIdField])
      .filter(Boolean)
  ));

  if (clientIds.length === 0) {
    return items.map(item => ({ data: item }));
  }

  // Fetch all client profiles
  const profiles = await getClientProfiles(clientIds);
  const displayNames = await getClientDisplayNames(clientIds);

  // Enrich items with profile data
  return items.map(item => {
    const clientId = item[clientIdField];
    const profile = profiles.get(clientId);
    const displayName = displayNames.get(clientId);

    return {
      data: item,
      clientProfile: profile,
      clientDisplayName: displayName,
    };
  });
}

/**
 * Get enriched data with client names
 * Simpler version that just returns items with client names added
 * @param items - Array of items with clientId field
 * @param clientIdField - Name of the field containing client ID
 * @returns Array of items with clientName field added
 */
export async function addClientNamesToItems<T extends Record<string, any>>(
  items: T[],
  clientIdField: string = 'clientId'
): Promise<(T & { clientName?: string })[]> {
  // Extract unique client IDs
  const clientIds = Array.from(new Set(
    items
      .map(item => item[clientIdField])
      .filter(Boolean)
  ));

  if (clientIds.length === 0) {
    return items.map(item => ({ ...item, clientName: undefined }));
  }

  // Fetch display names
  const displayNames = await getClientDisplayNames(clientIds);

  // Add client names to items
  return items.map(item => ({
    ...item,
    clientName: displayNames.get(item[clientIdField]),
  }));
}

/**
 * Group items by client with profile information
 * @param items - Array of items with clientId field
 * @param clientIdField - Name of the field containing client ID
 * @returns Map of clientId to items and profile
 */
export async function groupItemsByClientWithProfiles<T extends Record<string, any>>(
  items: T[],
  clientIdField: string = 'clientId'
): Promise<Map<string, { profile?: ClientProfiles; displayName?: string; items: T[] }>> {
  // Extract unique client IDs
  const clientIds = Array.from(new Set(
    items
      .map(item => item[clientIdField])
      .filter(Boolean)
  ));

  // Fetch all client profiles and display names
  const profiles = await getClientProfiles(clientIds);
  const displayNames = await getClientDisplayNames(clientIds);

  // Group items by client
  const grouped = new Map<string, { profile?: ClientProfiles; displayName?: string; items: T[] }>();

  for (const clientId of clientIds) {
    grouped.set(clientId, {
      profile: profiles.get(clientId),
      displayName: displayNames.get(clientId),
      items: items.filter(item => item[clientIdField] === clientId),
    });
  }

  return grouped;
}

/**
 * Create a lookup map for quick client name access
 * @param clientIds - Array of client IDs
 * @returns Map of clientId to display name
 */
export async function createClientNameLookup(clientIds: string[]): Promise<Map<string, string>> {
  return getClientDisplayNames(clientIds);
}

export default {
  enrichWithClientProfiles,
  addClientNamesToItems,
  groupItemsByClientWithProfiles,
  createClientNameLookup,
};
