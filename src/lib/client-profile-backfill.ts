/**
 * Client Profile Backfill Service
 * One-time migration to populate ClientProfiles collection with existing user data
 * This should be run once to initialize the collection
 */

import { BaseCrudService } from '@/integrations';
import { ClientProfiles, MemberRoles, TrainerClientAssignments } from '@/entities';

export interface BackfillResult {
  success: boolean;
  totalProcessed: number;
  created: number;
  updated: number;
  errors: Array<{ memberId: string; error: string }>;
  message: string;
}

/**
 * Backfill client profiles from existing data
 * This function:
 * 1. Gets all client assignments
 * 2. Extracts unique client IDs
 * 3. Creates profile entries for each client
 * 4. Uses member data if available, otherwise uses fallback values
 */
export async function backfillClientProfiles(): Promise<BackfillResult> {
  const result: BackfillResult = {
    success: false,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    errors: [],
    message: '',
  };

  try {
    console.log('Starting client profile backfill...');

    // Get all trainer-client assignments to find all clients
    const { items: assignments } = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments'
    );

    // Get unique client IDs
    const clientIds = new Set(assignments.map(a => a.clientId).filter(Boolean));
    console.log(`Found ${clientIds.size} unique clients`);

    // Get existing client profiles
    const { items: existingProfiles } = await BaseCrudService.getAll<ClientProfiles>(
      'clientprofiles'
    );
    const existingProfileMap = new Map(existingProfiles.map(p => [p.memberId, p]));

    // Get member roles for reference
    const { items: memberRoles } = await BaseCrudService.getAll<MemberRoles>('memberroles');
    const memberRoleMap = new Map(memberRoles.map(mr => [mr.memberId, mr]));

    // Process each client
    for (const clientId of clientIds) {
      result.totalProcessed++;

      try {
        const existingProfile = existingProfileMap.get(clientId);

        if (existingProfile) {
          // Profile already exists, skip
          result.updated++;
          continue;
        }

        // Create new profile with fallback data
        const profile: ClientProfiles = {
          _id: crypto.randomUUID(),
          memberId: clientId,
          firstName: `Client`, // Fallback first name
          lastName: clientId.slice(0, 8), // Use first 8 chars of ID as last name
          displayName: `Client ${clientId.slice(0, 8)}`, // Fallback display name
          email: undefined, // Will be populated when member data is available
          profilePhoto: undefined,
        };

        await BaseCrudService.create('clientprofiles', profile);
        result.created++;
        console.log(`Created profile for client: ${clientId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          memberId: clientId,
          error: errorMessage,
        });
        console.error(`Error creating profile for client ${clientId}:`, error);
      }
    }

    result.success = true;
    result.message = `Backfill completed: ${result.created} created, ${result.updated} already existed, ${result.errors.length} errors`;
    console.log(result.message);

    return result;
  } catch (error) {
    result.success = false;
    result.message = `Backfill failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('Backfill error:', error);
    return result;
  }
}

/**
 * Update client profiles with member data
 * This function updates existing profiles with actual member information
 * @param memberDataMap - Map of memberId to member data (firstName, lastName, email, etc.)
 */
export async function updateClientProfilesWithMemberData(
  memberDataMap: Map<string, { firstName?: string; lastName?: string; email?: string; photo?: string }>
): Promise<BackfillResult> {
  const result: BackfillResult = {
    success: false,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    errors: [],
    message: '',
  };

  try {
    console.log('Updating client profiles with member data...');

    // Get existing profiles
    const { items: profiles } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');

    for (const profile of profiles) {
      if (!profile.memberId) continue;

      result.totalProcessed++;

      try {
        const memberData = memberDataMap.get(profile.memberId);

        if (!memberData) {
          // No member data for this profile
          continue;
        }

        // Update profile with member data
        const updatedProfile: ClientProfiles = {
          ...profile,
          firstName: memberData.firstName || profile.firstName,
          lastName: memberData.lastName || profile.lastName,
          email: memberData.email || profile.email,
          profilePhoto: memberData.photo || profile.profilePhoto,
        };

        // Update display name if we have first and last name
        if (updatedProfile.firstName && updatedProfile.lastName) {
          updatedProfile.displayName = `${updatedProfile.firstName} ${updatedProfile.lastName}`;
        } else if (updatedProfile.firstName) {
          updatedProfile.displayName = updatedProfile.firstName;
        }

        await BaseCrudService.update('clientprofiles', updatedProfile);
        result.updated++;
        console.log(`Updated profile for client: ${profile.memberId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          memberId: profile.memberId,
          error: errorMessage,
        });
        console.error(`Error updating profile for client ${profile.memberId}:`, error);
      }
    }

    result.success = true;
    result.message = `Update completed: ${result.updated} updated, ${result.errors.length} errors`;
    console.log(result.message);

    return result;
  } catch (error) {
    result.success = false;
    result.message = `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('Update error:', error);
    return result;
  }
}

/**
 * Verify backfill completion
 * Checks if all clients have profiles
 */
export async function verifyBackfillCompletion(): Promise<{
  isComplete: boolean;
  totalClients: number;
  profilesCreated: number;
  missingProfiles: string[];
}> {
  try {
    // Get all clients from assignments
    const { items: assignments } = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments'
    );
    const clientIds = new Set(assignments.map(a => a.clientId).filter(Boolean));

    // Get all profiles
    const { items: profiles } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
    const profileMemberIds = new Set(profiles.map(p => p.memberId).filter(Boolean));

    // Find missing profiles
    const missingProfiles = Array.from(clientIds).filter(id => !profileMemberIds.has(id));

    return {
      isComplete: missingProfiles.length === 0,
      totalClients: clientIds.size,
      profilesCreated: profileMemberIds.size,
      missingProfiles,
    };
  } catch (error) {
    console.error('Error verifying backfill:', error);
    throw error;
  }
}

export default {
  backfillClientProfiles,
  updateClientProfilesWithMemberData,
  verifyBackfillCompletion,
};
