/**
 * Client Name Service
 * Provides utilities for getting and displaying client names with fallbacks
 */

import { BaseCrudService } from '@/integrations';
import type { ClientProfiles } from '@/entities';

/**
 * Get client profile by member ID
 */
export async function getClientProfileByMemberId(memberId: string): Promise<ClientProfiles | null> {
  try {
    const { items } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
    const profile = items.find(p => p.memberId === memberId);
    return profile || null;
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return null;
  }
}

/**
 * Get display name for a client
 * Priority: firstName > email prefix > "Client"
 */
export function getClientDisplayName(
  profile: ClientProfiles | null | undefined,
  email: string | undefined
): string {
  // If we have a first name, use it
  if (profile?.firstName) {
    return profile.firstName;
  }
  
  // Fall back to email prefix
  if (email) {
    const prefix = email.split('@')[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  
  // Last resort
  return 'Client';
}

/**
 * Get full name for a client
 * Returns "firstName lastName" if both available, otherwise falls back to display name
 */
export function getClientFullName(
  profile: ClientProfiles | null | undefined,
  email: string | undefined
): string {
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  
  return getClientDisplayName(profile, email);
}

/**
 * Check if client profile is incomplete (missing name)
 */
export function isProfileIncomplete(profile: ClientProfiles | null | undefined): boolean {
  return !profile?.firstName || !profile?.lastName;
}
