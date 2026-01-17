/**
 * Client Assigned Workouts Access Control Service
 * 
 * Implements server-side access control for client assigned workouts:
 * - Clients can only read their own workouts
 * - Trainers can only read workouts for their managed clients
 * 
 * SECURITY: All filtering by clientId MUST happen server-side before
 * returning data to the client.
 */

import { BaseCrudService } from '@/integrations';
import type { ClientAssignedWorkouts } from '@/entities/clientassignedworkouts';
import type { TrainerClientAssignments } from '@/entities/trainerclientassignments';

export interface ClientWorkoutFilters {
  memberId: string;
  role: 'client' | 'trainer';
  status?: 'active' | 'pending' | 'completed';
  weekNumber?: number;
}

/**
 * Get client assigned workouts with proper access control
 * @param filters - Contains memberId, role, and optional status/week filters
 * @returns Filtered workouts based on user role and permissions
 */
export async function getAuthorizedClientWorkouts(
  filters: ClientWorkoutFilters
): Promise<ClientAssignedWorkouts[]> {
  const { memberId, role, status, weekNumber } = filters;

  if (role === 'client') {
    // Clients can only see their own workouts
    const result = await BaseCrudService.getAll<ClientAssignedWorkouts>(
      'clientassignedworkouts',
      [],
      { limit: 1000 }
    );
    
    // SECURITY: Filter server-side by clientId matching the memberId
    let workouts = result.items.filter(workout => workout.clientId === memberId);
    
    // Apply additional filters if provided
    if (status) {
      workouts = workouts.filter(w => w.status === status);
    }
    if (weekNumber !== undefined) {
      workouts = workouts.filter(w => w.weekNumber === weekNumber);
    }
    
    return workouts;
  } else if (role === 'trainer') {
    // Trainers can only see workouts for their managed clients
    
    // First, get all clients assigned to this trainer
    const trainerAssignments = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments',
      [],
      { limit: 1000 }
    );
    
    const managedClientIds = trainerAssignments.items
      .filter(assignment => 
        assignment.trainerId === memberId && 
        assignment.status === 'active'
      )
      .map(assignment => assignment.clientId);
    
    // Get all workouts
    const result = await BaseCrudService.getAll<ClientAssignedWorkouts>(
      'clientassignedworkouts',
      [],
      { limit: 1000 }
    );
    
    // SECURITY: Filter to only workouts for managed clients or created by this trainer
    let workouts = result.items.filter(workout => 
      workout.trainerId === memberId || 
      (workout.clientId && managedClientIds.includes(workout.clientId))
    );
    
    // Apply additional filters if provided
    if (status) {
      workouts = workouts.filter(w => w.status === status);
    }
    if (weekNumber !== undefined) {
      workouts = workouts.filter(w => w.weekNumber === weekNumber);
    }
    
    return workouts;
  }

  // Default: no access
  return [];
}

/**
 * Get workouts for a specific client with access control
 * @param clientId - The client's member ID
 * @param requestingMemberId - The ID of the member making the request
 * @param requestingRole - The role of the member making the request
 * @param options - Optional filters for status and week number
 * @returns Array of client workouts
 */
export async function getClientWorkouts(
  clientId: string,
  requestingMemberId: string,
  requestingRole: 'client' | 'trainer',
  options?: {
    status?: 'active' | 'pending' | 'completed';
    weekNumber?: number;
  }
): Promise<ClientAssignedWorkouts[]> {
  // SECURITY: Clients can only request their own workouts
  if (requestingRole === 'client' && clientId !== requestingMemberId) {
    throw new Error('Unauthorized: Clients can only access their own workouts');
  }

  // SECURITY: Trainers can only request workouts for their managed clients
  if (requestingRole === 'trainer') {
    const trainerAssignments = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments',
      [],
      { limit: 1000 }
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

  const result = await BaseCrudService.getAll<ClientAssignedWorkouts>(
    'clientassignedworkouts',
    [],
    { limit: 1000 }
  );

  // SECURITY: Filter server-side by clientId
  let workouts = result.items.filter(workout => workout.clientId === clientId);
  
  // Apply optional filters
  if (options?.status) {
    workouts = workouts.filter(w => w.status === options.status);
  }
  if (options?.weekNumber !== undefined) {
    workouts = workouts.filter(w => w.weekNumber === options.weekNumber);
  }

  return workouts;
}

/**
 * Get a single workout with access control
 * @param workoutId - The ID of the workout to retrieve
 * @param requestingMemberId - The ID of the member making the request
 * @param requestingRole - The role of the member making the request
 * @returns The workout if authorized, null otherwise
 */
export async function getAuthorizedWorkout(
  workoutId: string,
  requestingMemberId: string,
  requestingRole: 'client' | 'trainer'
): Promise<ClientAssignedWorkouts | null> {
  const workout = await BaseCrudService.getById<ClientAssignedWorkouts>(
    'clientassignedworkouts',
    workoutId
  );

  if (!workout) {
    return null;
  }

  // SECURITY: Check access based on role
  if (requestingRole === 'client') {
    // Clients can only access their own workouts
    return workout.clientId === requestingMemberId ? workout : null;
  } else if (requestingRole === 'trainer') {
    // Trainers can access workouts they created or for their managed clients
    if (workout.trainerId === requestingMemberId) {
      return workout;
    }

    // Check if the client is managed by this trainer
    const trainerAssignments = await BaseCrudService.getAll<TrainerClientAssignments>(
      'trainerclientassignments',
      [],
      { limit: 1000 }
    );
    
    const isManaged = trainerAssignments.items.some(
      ta => ta.trainerId === requestingMemberId && 
           ta.clientId === workout.clientId && 
           ta.status === 'active'
    );

    return isManaged ? workout : null;
  }

  return null;
}

/**
 * Update a workout (clients can update their own, trainers can update their managed clients')
 * @param workoutId - The ID of the workout to update
 * @param updates - The fields to update
 * @param requestingMemberId - The ID of the member updating the workout
 * @param requestingRole - The role of the member updating the workout
 * @returns The updated workout
 */
export async function updateAuthorizedWorkout(
  workoutId: string,
  updates: Partial<ClientAssignedWorkouts>,
  requestingMemberId: string,
  requestingRole: 'client' | 'trainer'
): Promise<ClientAssignedWorkouts | null> {
  const workout = await BaseCrudService.getById<ClientAssignedWorkouts>(
    'clientassignedworkouts',
    workoutId
  );

  if (!workout) {
    throw new Error('Workout not found');
  }

  // SECURITY: Verify authorization
  if (requestingRole === 'client') {
    // Clients can only update their own workouts
    if (workout.clientId !== requestingMemberId) {
      throw new Error('Unauthorized: Clients can only update their own workouts');
    }
  } else if (requestingRole === 'trainer') {
    // Trainers can update workouts they created or for their managed clients
    if (workout.trainerId !== requestingMemberId) {
      const trainerAssignments = await BaseCrudService.getAll<TrainerClientAssignments>(
        'trainerclientassignments',
        [],
        { limit: 1000 }
      );
      
      const isAuthorized = trainerAssignments.items.some(
        ta => ta.trainerId === requestingMemberId && 
             ta.clientId === workout.clientId && 
             ta.status === 'active'
      );

      if (!isAuthorized) {
        throw new Error('Unauthorized: Trainer is not assigned to this client');
      }
    }
  }

  await BaseCrudService.update('clientassignedworkouts', {
    _id: workoutId,
    ...updates
  });

  return await BaseCrudService.getById<ClientAssignedWorkouts>(
    'clientassignedworkouts',
    workoutId
  );
}
