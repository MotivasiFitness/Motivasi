/**
 * Program Assignment Access Control Service
 * 
 * Implements server-side access control for program assignments:
 * - Clients can only read their own assignments
 * - Trainers can only read assignments for their managed clients
 */

import type { ProgramAssignments } from '@/entities/programassignments';
import type { TrainerClientAssignments } from '@/entities/trainerclientassignments';
import ProtectedDataService from './protected-data-service';

export interface ProgramAssignmentFilters {
  memberId: string;
  role: 'client' | 'trainer';
}

/**
 * Get program assignments with proper access control
 * @param filters - Contains memberId and role for access control
 * @returns Filtered program assignments based on user role
 */
export async function getAuthorizedProgramAssignments(
  filters: ProgramAssignmentFilters
): Promise<ProgramAssignments[]> {
  const { memberId, role } = filters;

  if (role === 'client') {
    // Clients can only see their own assignments
    const result = await ProtectedDataService.getAll<ProgramAssignments>(
      'programassignments',
      { limit: 100 }
    );
    
    // Filter by clientId matching the memberId
    return result.items.filter(assignment => assignment.clientId === memberId);
  } else if (role === 'trainer') {
    // Trainers can only see assignments for their managed clients
    
    // First, get all clients assigned to this trainer
    const trainerAssignments = await ProtectedDataService.getAll<TrainerClientAssignments>(
      'trainerclientassignments',
      { limit: 100 }
    );
    
    const managedClientIds = trainerAssignments.items
      .filter(assignment => 
        assignment.trainerId === memberId && 
        assignment.status === 'active'
      )
      .map(assignment => assignment.clientId);
    
    // Get all program assignments
    const result = await ProtectedDataService.getAll<ProgramAssignments>(
      'programassignments',
      { limit: 100 }
    );
    
    // Filter to only assignments for managed clients or created by this trainer
    return result.items.filter(assignment => 
      assignment.trainerId === memberId || 
      (assignment.clientId && managedClientIds.includes(assignment.clientId))
    );
  }

  // Default: no access
  return [];
}

/**
 * Get a single program assignment with access control
 * @param assignmentId - The ID of the assignment to retrieve
 * @param filters - Contains memberId and role for access control
 * @returns The assignment if authorized, null otherwise
 */
export async function getAuthorizedProgramAssignment(
  assignmentId: string,
  filters: ProgramAssignmentFilters
): Promise<ProgramAssignments | null> {
  const assignment = await BaseCrudService.getById<ProgramAssignments>(
    'programassignments',
    assignmentId
  );

  if (!assignment) {
    return null;
  }

  const { memberId, role } = filters;

  // Check access based on role
  if (role === 'client') {
    // Clients can only access their own assignments
    return assignment.clientId === memberId ? assignment : null;
  } else if (role === 'trainer') {
    // Trainers can access assignments they created or for their managed clients
    if (assignment.trainerId === memberId) {
      return assignment;
    }

    // Check if the client is managed by this trainer
    const trainerAssignments = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments',
      [],
      { limit: 100 }
    );
    
    const isManaged = trainerAssignments.items.some(
      ta => ta.trainerId === memberId && 
           ta.clientId === assignment.clientId && 
           ta.status === 'active'
    );

    return isManaged ? assignment : null;
  }

  return null;
}

/**
 * Create a program assignment (trainers only)
 * @param assignment - The assignment data to create
 * @param trainerId - The ID of the trainer creating the assignment
 * @returns The created assignment
 */
export async function createProgramAssignment(
  assignment: Omit<ProgramAssignments, '_id' | '_createdDate' | '_updatedDate'>,
  trainerId: string
): Promise<ProgramAssignments> {
  // Verify the trainer is authorized to assign to this client
  const trainerAssignments = await BaseCrudService.getAll<TrainerClientAssignments>(
    'trainerclientassignments',
    [],
    { limit: 100 }
  );
  
  const isAuthorized = trainerAssignments.items.some(
    ta => ta.trainerId === trainerId && 
         ta.clientId === assignment.clientId && 
         ta.status === 'active'
  );

  if (!isAuthorized) {
    throw new Error('Unauthorized: Trainer is not assigned to this client');
  }

  const newAssignment: ProgramAssignments = {
    ...assignment,
    _id: crypto.randomUUID(),
    trainerId,
    assignedAt: assignment.assignedAt || new Date().toISOString(),
    status: assignment.status || 'active'
  };

  await BaseCrudService.create('programassignments', newAssignment);
  return newAssignment;
}

/**
 * Update a program assignment (trainers only)
 * @param assignmentId - The ID of the assignment to update
 * @param updates - The fields to update
 * @param trainerId - The ID of the trainer updating the assignment
 * @returns The updated assignment
 */
export async function updateProgramAssignment(
  assignmentId: string,
  updates: Partial<ProgramAssignments>,
  trainerId: string
): Promise<ProgramAssignments | null> {
  const assignment = await BaseCrudService.getById<ProgramAssignments>(
    'programassignments',
    assignmentId
  );

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  // Verify the trainer is authorized
  if (assignment.trainerId !== trainerId) {
    const trainerAssignments = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments',
      [],
      { limit: 100 }
    );
    
    const isAuthorized = trainerAssignments.items.some(
      ta => ta.trainerId === trainerId && 
           ta.clientId === assignment.clientId && 
           ta.status === 'active'
    );

    if (!isAuthorized) {
      throw new Error('Unauthorized: Trainer is not assigned to this client');
    }
  }

  await BaseCrudService.update('programassignments', {
    _id: assignmentId,
    ...updates
  });

  return await BaseCrudService.getById<ProgramAssignments>(
    'programassignments',
    assignmentId
  );
}

/**
 * Get program assignments for a specific client (with access control)
 * @param clientId - The client's member ID
 * @param requestingMemberId - The ID of the member making the request
 * @param requestingRole - The role of the member making the request
 * @returns Array of program assignments
 */
export async function getClientProgramAssignments(
  clientId: string,
  requestingMemberId: string,
  requestingRole: 'client' | 'trainer'
): Promise<ProgramAssignments[]> {
  // Clients can only request their own assignments
  if (requestingRole === 'client' && clientId !== requestingMemberId) {
    throw new Error('Unauthorized: Clients can only access their own assignments');
  }

  // Trainers can only request assignments for their managed clients
  if (requestingRole === 'trainer') {
    const trainerAssignments = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments',
      [],
      { limit: 100 }
    );
    
    const isAuthorized = trainerAssignments.items.some(
      ta => ta.trainerId === requestingMemberId && 
           ta.clientId === clientId && 
           ta.status === 'active'
    );

    if (!isAuthorized) {
      throw new Error('Unauthorized: Trainer is not assigned to this client');
    }
  }

  const result = await BaseCrudService.getAll<ProgramAssignments>(
    'programassignments',
    [],
    { limit: 100 }
  );

  return result.items.filter(assignment => assignment.clientId === clientId);
}
