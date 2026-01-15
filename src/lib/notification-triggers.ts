/**
 * Notification Triggers
 * Helper functions to trigger notifications based on client workout activities
 * These should be called from the appropriate places in the app when events occur
 */

import { createTrainerNotification } from './notification-service';
import { BaseCrudService } from '@/integrations';
import { ClientAssignedWorkouts, WeeklySummaries, TrainerClientAssignments } from '@/entities';
import { getClientDisplayName } from './client-display-name';

/**
 * Checks if trainer has notifications enabled for a specific type
 */
async function isNotificationEnabled(trainerId: string, notificationType: string): Promise<boolean> {
  try {
    const { items } = await BaseCrudService.getAll('trainernotificationpreferences');
    const prefs = items.find((p: any) => p.trainerId === trainerId);
    
    if (!prefs) return true; // Default to enabled if no preferences set
    
    switch (notificationType) {
      case 'workout_completed':
        return prefs.workoutCompletedEnabled !== false;
      case 'week_completed':
        return prefs.weekCompletedEnabled !== false;
      case 'reflection_submitted':
        return prefs.reflectionSubmittedEnabled !== false;
      default:
        return true;
    }
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return true; // Default to enabled on error
  }
}

/**
 * Gets the trainer ID for a given client
 */
async function getTrainerForClient(clientId: string): Promise<string | null> {
  try {
    const { items } = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
    const assignment = items.find(a => a.clientId === clientId && a.status === 'active');
    return assignment?.trainerId || null;
  } catch (error) {
    console.error('Error getting trainer for client:', error);
    return null;
  }
}

/**
 * Trigger notification when a client completes a workout
 * Call this when a workout status is updated to 'completed'
 */
export async function triggerWorkoutCompletedNotification(
  workoutId: string,
  clientId: string,
  exerciseName?: string
): Promise<void> {
  try {
    const trainerId = await getTrainerForClient(clientId);
    if (!trainerId) return;

    const enabled = await isNotificationEnabled(trainerId, 'workout_completed');
    if (!enabled) return;

    const clientName = await getClientDisplayName(clientId);

    await createTrainerNotification({
      trainerId,
      clientId,
      clientName,
      notificationType: 'workout_completed',
      relatedWorkoutId: workoutId,
      exerciseName,
    });
  } catch (error) {
    console.error('Error triggering workout completed notification:', error);
  }
}

/**
 * Trigger notification when a client completes all workouts in a week
 * Call this when checking weekly completion status
 */
export async function triggerWeekCompletedNotification(
  clientId: string,
  weekNumber: number
): Promise<void> {
  try {
    const trainerId = await getTrainerForClient(clientId);
    if (!trainerId) return;

    const enabled = await isNotificationEnabled(trainerId, 'week_completed');
    if (!enabled) return;

    const clientName = await getClientDisplayName(clientId);

    await createTrainerNotification({
      trainerId,
      clientId,
      clientName,
      notificationType: 'week_completed',
      relatedWeekNumber: weekNumber,
    });
  } catch (error) {
    console.error('Error triggering week completed notification:', error);
  }
}

/**
 * Trigger notification when a client submits a post-workout reflection
 * Call this when a reflection is submitted
 */
export async function triggerReflectionSubmittedNotification(
  workoutId: string,
  clientId: string
): Promise<void> {
  try {
    const trainerId = await getTrainerForClient(clientId);
    if (!trainerId) return;

    const enabled = await isNotificationEnabled(trainerId, 'reflection_submitted');
    if (!enabled) return;

    const clientName = await getClientDisplayName(clientId);

    await createTrainerNotification({
      trainerId,
      clientId,
      clientName,
      notificationType: 'reflection_submitted',
      relatedWorkoutId: workoutId,
    });
  } catch (error) {
    console.error('Error triggering reflection submitted notification:', error);
  }
}

/**
 * Check if a week is completed and trigger notification if needed
 * This should be called after a workout is marked complete
 */
export async function checkAndTriggerWeekCompletion(
  clientId: string,
  weekNumber: number
): Promise<void> {
  try {
    // Get all workouts for this client and week
    const { items: workouts } = await BaseCrudService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');
    const weekWorkouts = workouts.filter(w => 
      w.clientId === clientId && 
      w.weekNumber === weekNumber
    );

    if (weekWorkouts.length === 0) return;

    // Check if all workouts are completed
    const allCompleted = weekWorkouts.every(w => w.status === 'completed');

    if (allCompleted) {
      // Check if we already sent a notification for this week
      const { items: summaries } = await BaseCrudService.getAll<WeeklySummaries>('weeklysummaries');
      const existingSummary = summaries.find(s => 
        s.clientId === clientId && 
        s.weekNumber === weekNumber &&
        s.completionStatus === 'completed'
      );

      // Only trigger if we haven't already marked this week as complete
      if (!existingSummary) {
        await triggerWeekCompletedNotification(clientId, weekNumber);
      }
    }
  } catch (error) {
    console.error('Error checking week completion:', error);
  }
}
