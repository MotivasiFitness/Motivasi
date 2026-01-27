import { ClientAssignedWorkouts } from '@/entities';
import { startOfWeek, endOfWeek, format, isSameWeek, parseISO } from 'date-fns';
import ProtectedDataService from './protected-data-service';

/**
 * Get the week start date (Monday) for a given date
 */
export function getWeekStartDate(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

/**
 * Get the week end date (Sunday) for a given date
 */
export function getWeekEndDate(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // Sunday
}

/**
 * Format week start date for display (e.g., "Week of Aug 12")
 */
export function formatWeekDisplay(weekStartDate: Date | string): string {
  const date = typeof weekStartDate === 'string' ? parseISO(weekStartDate) : weekStartDate;
  return `Week of ${format(date, 'MMM d')}`;
}

/**
 * Calculate days since update
 */
export function getDaysSinceUpdate(updatedDate: Date | string | undefined): string {
  if (!updatedDate) return '';
  
  const date = typeof updatedDate === 'string' ? parseISO(updatedDate) : updatedDate;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  return `Updated ${diffDays} days ago`;
}

/**
 * Get active workouts for a client in the current week
 * Returns workouts ordered by workoutSlot (1-4)
 */
export async function getActiveWorkoutsForCurrentWeek(
  clientId: string
): Promise<ClientAssignedWorkouts[]> {
  const weekStart = getWeekStartDate();
  return getActiveWorkoutsForWeek(clientId, weekStart);
}

/**
 * Get active workouts for a client in a specific week
 * Returns workouts ordered by workoutSlot (1-4)
 */
export async function getActiveWorkoutsForWeek(
  clientId: string,
  weekStartDate: Date | string
): Promise<ClientAssignedWorkouts[]> {
  const { items } = await ProtectedDataService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');
  
  const weekStart = typeof weekStartDate === 'string' ? parseISO(weekStartDate) : weekStartDate;
  
  const filtered = items.filter(workout => {
    // Match client
    if (workout.clientId !== clientId) return false;
    
    // Match status (active)
    if (workout.status !== 'active') return false;
    
    // Match week
    const workoutWeekStart = workout.weekStartDate 
      ? (typeof workout.weekStartDate === 'string' ? parseISO(workout.weekStartDate) : workout.weekStartDate)
      : null;
    
    if (!workoutWeekStart) return false;
    
    return isSameWeek(workoutWeekStart, weekStart, { weekStartsOn: 1 });
  });
  
  // Sort by workoutSlot ascending
  return filtered.sort((a, b) => (a.workoutSlot || 0) - (b.workoutSlot || 0));
}

/**
 * Check for conflicts when assigning a workout
 * Returns existing assignment if conflict found
 */
export async function checkWorkoutConflict(
  clientId: string,
  weekStartDate: Date | string,
  workoutSlot: number
): Promise<ClientAssignedWorkouts | null> {
  const { items } = await ProtectedDataService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');
  
  const weekStart = typeof weekStartDate === 'string' ? parseISO(weekStartDate) : weekStartDate;
  
  const conflict = items.find(workout => {
    if (workout.clientId !== clientId) return false;
    if (workout.status !== 'active') return false;
    if (workout.workoutSlot !== workoutSlot) return false;
    
    const workoutWeekStart = workout.weekStartDate 
      ? (typeof workout.weekStartDate === 'string' ? parseISO(workout.weekStartDate) : workout.weekStartDate)
      : null;
    
    if (!workoutWeekStart) return false;
    
    return isSameWeek(workoutWeekStart, weekStart, { weekStartsOn: 1 });
  });
  
  return conflict || null;
}

/**
 * Archive previous week's workouts for a client
 * Marks them as 'archived' instead of 'active'
 */
export async function archivePreviousWeekWorkouts(clientId: string): Promise<void> {
  const { items } = await ProtectedDataService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');
  
  const previousWeekStart = new Date();
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const prevWeekStart = getWeekStartDate(previousWeekStart);
  
  const workoutsToArchive = items.filter(workout => {
    if (workout.clientId !== clientId) return false;
    if (workout.status !== 'active') return false;
    
    const workoutWeekStart = workout.weekStartDate 
      ? (typeof workout.weekStartDate === 'string' ? parseISO(workout.weekStartDate) : workout.weekStartDate)
      : null;
    
    if (!workoutWeekStart) return false;
    
    return isSameWeek(workoutWeekStart, prevWeekStart, { weekStartsOn: 1 });
  });
  
  // Archive each workout
  for (const workout of workoutsToArchive) {
    await BaseCrudService.update<ClientAssignedWorkouts>('clientassignedworkouts', {
      _id: workout._id,
      status: 'archived',
    });
  }
}

/**
 * Create or update a workout assignment
 * Handles conflict detection and replacement
 */
export async function assignWorkout(
  clientId: string,
  trainerId: string,
  weekStartDate: Date | string,
  workoutSlot: number,
  workoutData: Partial<ClientAssignedWorkouts>,
  replaceConflict: boolean = false
): Promise<{ success: boolean; workoutId: string; conflictFound?: boolean; message?: string }> {
  // Check for conflicts
  const conflict = await checkWorkoutConflict(clientId, weekStartDate, workoutSlot);
  
  if (conflict && !replaceConflict) {
    return {
      success: false,
      workoutId: '',
      conflictFound: true,
      message: `A workout already exists for Workout ${workoutSlot} this week. Replace it?`,
    };
  }
  
  // If conflict and replaceConflict is true, archive the old one
  if (conflict && replaceConflict) {
    await BaseCrudService.update<ClientAssignedWorkouts>('clientassignedworkouts', {
      _id: conflict._id,
      status: 'archived',
    });
  }
  
  // Create new assignment
  const weekStart = typeof weekStartDate === 'string' ? parseISO(weekStartDate) : weekStartDate;
  
  const newAssignment = {
    _id: crypto.randomUUID(),
    clientId,
    trainerId,
    weekStartDate: weekStart,
    workoutSlot,
    status: 'active',
    weekNumber: workoutData.weekNumber || 1,
    exerciseName: workoutData.exerciseName,
    sets: workoutData.sets,
    reps: workoutData.reps,
    weightOrResistance: workoutData.weightOrResistance,
    tempo: workoutData.tempo,
    restTimeSeconds: workoutData.restTimeSeconds,
    exerciseNotes: workoutData.exerciseNotes,
    exerciseVideoUrl: workoutData.exerciseVideoUrl,
  };
  
  await BaseCrudService.create('clientassignedworkouts', newAssignment);
  
  return {
    success: true,
    workoutId: newAssignment._id,
    message: 'Workout assigned successfully',
  };
}

/**
 * Update a workout assignment
 */
export async function updateWorkout(
  workoutId: string,
  updates: Partial<ClientAssignedWorkouts>
): Promise<void> {
  const updateData: any = {
    _id: workoutId,
  };
  
  // Only include fields that are provided
  if (updates.exerciseName !== undefined) updateData.exerciseName = updates.exerciseName;
  if (updates.sets !== undefined) updateData.sets = updates.sets;
  if (updates.reps !== undefined) updateData.reps = updates.reps;
  if (updates.weightOrResistance !== undefined) updateData.weightOrResistance = updates.weightOrResistance;
  if (updates.tempo !== undefined) updateData.tempo = updates.tempo;
  if (updates.restTimeSeconds !== undefined) updateData.restTimeSeconds = updates.restTimeSeconds;
  if (updates.exerciseNotes !== undefined) updateData.exerciseNotes = updates.exerciseNotes;
  if (updates.exerciseVideoUrl !== undefined) updateData.exerciseVideoUrl = updates.exerciseVideoUrl;
  if (updates.weekNumber !== undefined) updateData.weekNumber = updates.weekNumber;
  
  await BaseCrudService.update('clientassignedworkouts', updateData);
}

/**
 * Delete a workout assignment
 */
export async function deleteWorkout(workoutId: string): Promise<void> {
  await BaseCrudService.delete('clientassignedworkouts', workoutId);
}

/**
 * Get all workouts for a trainer in the current week
 */
export async function getTrainerWorkoutsForCurrentWeek(
  trainerId: string
): Promise<ClientAssignedWorkouts[]> {
  const weekStart = getWeekStartDate();
  return getTrainerWorkoutsForWeek(trainerId, weekStart);
}

/**
 * Get all workouts for a trainer in a specific week
 */
export async function getTrainerWorkoutsForWeek(
  trainerId: string,
  weekStartDate: Date | string
): Promise<ClientAssignedWorkouts[]> {
  const { items } = await BaseCrudService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');
  
  const weekStart = typeof weekStartDate === 'string' ? parseISO(weekStartDate) : weekStartDate;
  
  const filtered = items.filter(workout => {
    if (workout.trainerId !== trainerId) return false;
    if (workout.status !== 'active') return false;
    
    const workoutWeekStart = workout.weekStartDate 
      ? (typeof workout.weekStartDate === 'string' ? parseISO(workout.weekStartDate) : workout.weekStartDate)
      : null;
    
    if (!workoutWeekStart) return false;
    
    return isSameWeek(workoutWeekStart, weekStart, { weekStartsOn: 1 });
  });
  
  // Sort by clientId, then by workoutSlot
  return filtered.sort((a, b) => {
    const clientCompare = (a.clientId || '').localeCompare(b.clientId || '');
    if (clientCompare !== 0) return clientCompare;
    return (a.workoutSlot || 0) - (b.workoutSlot || 0);
  });
}
