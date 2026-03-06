/**
 * Trainer Assignment Service
 * Handles automatic assignment of users to a default trainer
 * Ensures idempotency and prevents duplicate assignments
 */

import { TrainerClientAssignments, MemberRoles } from '@/entities';
import ProtectedDataService from './protected-data-service';

const DEFAULT_TRAINER_ID = 'd18a21c8-be77-496f-a2fd-ec6479ecba6d';

interface AssignmentResult {
  success: boolean;
  clientId: string;
  trainerId: string;
  message: string;
  error?: string;
}

/**
 * Assigns a single client to the default trainer
 * Idempotent: checks for existing assignment before creating
 * @param clientId - The member ID of the client to assign
 * @returns AssignmentResult with success status and details
 */
export async function assignClientToTrainer(
  clientId: string,
  trainerId: string = DEFAULT_TRAINER_ID
): Promise<AssignmentResult> {
  try {
    if (!clientId || !trainerId) {
      return {
        success: false,
        clientId,
        trainerId,
        message: 'Invalid client or trainer ID',
        error: 'Missing required IDs'
      };
    }

    // Check if assignment already exists
    const { items: existingAssignments } = await ProtectedDataService.getAll<TrainerClientAssignments>(
      'trainerclientassignments'
    );

    const existingAssignment = existingAssignments.find(
      (assignment) =>
        assignment.trainerId === trainerId &&
        assignment.clientId === clientId &&
        assignment.status === 'active'
    );

    if (existingAssignment) {
      return {
        success: true,
        clientId,
        trainerId,
        message: 'Assignment already exists (idempotent)',
      };
    }

    // Create new assignment
    const newAssignment: TrainerClientAssignments = {
      _id: crypto.randomUUID(),
      trainerId,
      clientId,
      assignmentDate: new Date(),
      status: 'active',
      notes: 'Auto-assigned to default trainer',
    };

    await ProtectedDataService.create('trainerclientassignments', newAssignment);

    return {
      success: true,
      clientId,
      trainerId,
      message: 'Successfully assigned to trainer',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to assign client ${clientId} to trainer ${trainerId}:`, error);

    return {
      success: false,
      clientId,
      trainerId,
      message: 'Failed to assign client to trainer',
      error: errorMessage,
    };
  }
}

/**
 * Backfill: Assigns all existing users to the default trainer
 * Idempotent: skips users already assigned to this trainer
 * @returns Summary of backfill operation
 */
export async function backfillExistingUsers(
  trainerId: string = DEFAULT_TRAINER_ID
): Promise<{
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  errors: AssignmentResult[];
}> {
  const results: AssignmentResult[] = [];
  let successful = 0;
  let skipped = 0;
  let failed = 0;

  try {
    // Get all member roles (which contains all users)
    const { items: memberRoles } = await BaseCrudService.getAll<MemberRoles>('memberroles');

    const uniqueClientIds = new Set(memberRoles.map((mr) => mr.memberId).filter(Boolean));

    console.log(`Starting backfill for ${uniqueClientIds.size} users...`);

    for (const clientId of uniqueClientIds) {
      const result = await assignClientToTrainer(clientId, trainerId);
      results.push(result);

      if (result.success) {
        if (result.message.includes('already exists')) {
          skipped++;
        } else {
          successful++;
        }
      } else {
        failed++;
      }
    }

    const summary = {
      total: uniqueClientIds.size,
      successful,
      skipped,
      failed,
      errors: results.filter((r) => !r.success),
    };

    console.log('Backfill complete:', summary);
    return summary;
  } catch (error) {
    console.error('Backfill operation failed:', error);
    throw error;
  }
}

/**
 * Assigns a new user to the default trainer
 * Called automatically when a new user registers
 * Non-blocking: errors are logged but don't prevent signup
 * @param memberId - The new member's ID
 */
export async function assignNewUserToTrainer(
  memberId: string,
  trainerId: string = DEFAULT_TRAINER_ID
): Promise<void> {
  try {
    const result = await assignClientToTrainer(memberId, trainerId);

    if (!result.success) {
      // Log error but don't throw - this shouldn't block user signup
      console.warn(`Failed to auto-assign new user ${memberId} to trainer:`, result.error);
    } else {
      console.log(`Successfully auto-assigned new user ${memberId} to trainer ${trainerId}`);
    }
  } catch (error) {
    // Catch and log any unexpected errors
    console.error(`Unexpected error assigning new user ${memberId} to trainer:`, error);
    // Don't re-throw - this is a non-blocking operation
  }
}

/**
 * Checks if a user is assigned to a specific trainer
 * @param clientId - The client's member ID
 * @param trainerId - The trainer's member ID
 * @returns true if assignment exists and is active
 */
export async function isUserAssignedToTrainer(
  clientId: string,
  trainerId: string = DEFAULT_TRAINER_ID
): Promise<boolean> {
  try {
    const { items: assignments } = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments'
    );

    return assignments.some(
      (assignment) =>
        assignment.trainerId === trainerId &&
        assignment.clientId === clientId &&
        assignment.status === 'active'
    );
  } catch (error) {
    console.error('Error checking user assignment:', error);
    return false;
  }
}

/**
 * Gets all clients assigned to a trainer
 * @param trainerId - The trainer's member ID
 * @returns Array of client IDs assigned to this trainer
 */
export async function getTrainerClients(
  trainerId: string = DEFAULT_TRAINER_ID
): Promise<string[]> {
  try {
    const { items: assignments } = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments'
    );

    return assignments
      .filter((assignment) => assignment.trainerId === trainerId && assignment.status === 'active')
      .map((assignment) => assignment.clientId || '')
      .filter(Boolean);
  } catch (error) {
    console.error('Error getting trainer clients:', error);
    return [];
  }
}

export { DEFAULT_TRAINER_ID };
