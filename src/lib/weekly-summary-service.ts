/**
 * Weekly Summary Service
 * Handles automatic generation and management of end-of-week workout summaries
 * 
 * SECURITY: This service uses access-controlled workout fetching to ensure
 * proper data isolation between clients and trainers.
 */

import { getClientWorkouts } from './client-workout-access-control';
import ProtectedDataService from './protected-data-service';

export interface WeeklySummary {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  clientId?: string;
  trainerId?: string;
  weekNumber?: number;
  startDate?: Date | string;
  programTitle?: string;
  workoutsAssigned?: number;
  workoutsCompleted?: number;
  completionStatus?: string;
  completedAt?: Date | string;
  encouragingMessage?: string;
}

const ENCOURAGING_MESSAGES = [
  "Outstanding work this week! Your consistency is paying off! 💪",
  "Week completed! You're building incredible momentum! 🔥",
  "Amazing dedication! Every workout brings you closer to your goals! 🌟",
  "You crushed it this week! Keep up the fantastic work! 🎯",
  "Week complete! Your commitment is truly inspiring! ⭐",
  "Incredible effort! You're proving what consistency can achieve! 💯",
  "Another week in the books! Your progress is unstoppable! 🚀",
  "Phenomenal work! You're setting a great example! 👏",
  "Week finished strong! Your dedication is remarkable! 💪",
  "Excellent completion! You're on fire this program! 🔥"
];

/**
 * Check if all workouts for a week are completed and generate summary if needed
 * 
 * SECURITY: Uses access-controlled workout fetching to ensure proper data isolation
 */
export async function checkAndGenerateWeeklySummary(
  clientId: string,
  trainerId: string,
  weekNumber: number,
  weekStartDate: Date | string,
  programTitle: string
): Promise<WeeklySummary | null> {
  try {
    // Check if summary already exists for this week
    const existingSummaries = await ProtectedDataService.getAll<WeeklySummary>('weeklysummaries');
    const existingSummary = existingSummaries.items.find(
      s => s.clientId === clientId && s.weekNumber === weekNumber && s.programTitle === programTitle
    );

    if (existingSummary) {
      return existingSummary;
    }

    // SECURITY: Get workouts using access-controlled method
    // This ensures we only access workouts for the specified client
    const allWorkouts = await getClientWorkouts(
      clientId,
      trainerId,
      'trainer',
      { weekNumber }
    );
    
    // Filter to this specific week (already filtered by access control, but double-check)
    const weekWorkouts = allWorkouts.filter(
      (w: any) => 
        w.clientId === clientId && 
        w.weekNumber === weekNumber &&
        w.trainerId === trainerId
    );

    if (weekWorkouts.length === 0) {
      return null;
    }

    const completedWorkouts = weekWorkouts.filter((w: any) => w.status === 'completed');
    const totalAssigned = weekWorkouts.length;
    const totalCompleted = completedWorkouts.length;
    const isFullyCompleted = totalCompleted === totalAssigned && totalAssigned > 0;

    // Only generate summary if week is fully completed
    if (!isFullyCompleted) {
      return null;
    }

    // Generate encouraging message
    const randomMessage = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];

    // Create the weekly summary
    const summary: WeeklySummary = {
      _id: crypto.randomUUID(),
      clientId,
      trainerId,
      weekNumber,
      startDate: weekStartDate,
      programTitle,
      workoutsAssigned: totalAssigned,
      workoutsCompleted: totalCompleted,
      completionStatus: 'completed',
      completedAt: new Date().toISOString(),
      encouragingMessage: randomMessage
    };

    await ProtectedDataService.create('weeklysummaries', summary);
    return summary;
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return null;
  }
}

/**
 * Get weekly summary for a specific week
 */
export async function getWeeklySummary(
  clientId: string,
  weekNumber: number,
  programTitle: string
): Promise<WeeklySummary | null> {
  try {
    const summaries = await ProtectedDataService.getAll<WeeklySummary>('weeklysummaries');
    return summaries.items.find(
      s => s.clientId === clientId && s.weekNumber === weekNumber && s.programTitle === programTitle
    ) || null;
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    return null;
  }
}

/**
 * Get all weekly summaries for a client
 */
export async function getClientWeeklySummaries(clientId: string): Promise<WeeklySummary[]> {
  try {
    const summaries = await ProtectedDataService.getAll<WeeklySummary>('weeklysummaries');
    return summaries.items.filter(s => s.clientId === clientId);
  } catch (error) {
    console.error('Error fetching client summaries:', error);
    return [];
  }
}

/**
 * Get all weekly summaries for a trainer's clients
 */
export async function getTrainerWeeklySummaries(trainerId: string): Promise<WeeklySummary[]> {
  try {
    const summaries = await BaseCrudService.getAll<WeeklySummary>('weeklysummaries');
    return summaries.items.filter(s => s.trainerId === trainerId);
  } catch (error) {
    console.error('Error fetching trainer summaries:', error);
    return [];
  }
}

/**
 * Update weekly summary progress (for partial completion tracking)
 */
export async function updateWeeklySummaryProgress(
  clientId: string,
  weekNumber: number,
  programTitle: string,
  workoutsCompleted: number,
  workoutsAssigned: number
): Promise<void> {
  try {
    const summaries = await BaseCrudService.getAll<WeeklySummary>('weeklysummaries');
    const existingSummary = summaries.items.find(
      s => s.clientId === clientId && s.weekNumber === weekNumber && s.programTitle === programTitle
    );

    if (existingSummary) {
      const isComplete = workoutsCompleted === workoutsAssigned && workoutsAssigned > 0;
      await BaseCrudService.update<WeeklySummary>('weeklysummaries', {
        _id: existingSummary._id,
        workoutsCompleted,
        workoutsAssigned,
        completionStatus: isComplete ? 'completed' : 'in-progress',
        completedAt: isComplete ? new Date().toISOString() : undefined
      });
    }
  } catch (error) {
    console.error('Error updating weekly summary progress:', error);
  }
}

/**
 * Calculate current week progress without creating a summary
 * 
 * SECURITY: Uses access-controlled workout fetching to ensure proper data isolation
 */
export async function calculateWeekProgress(
  clientId: string,
  weekNumber: number,
  trainerId: string
): Promise<{ completed: number; total: number; percentage: number }> {
  try {
    // SECURITY: Get workouts using access-controlled method
    const allWorkouts = await getClientWorkouts(
      clientId,
      trainerId,
      'trainer',
      { weekNumber }
    );
    
    // Filter to this specific week (already filtered by access control, but double-check)
    const weekWorkouts = allWorkouts.filter(
      (w: any) => 
        w.clientId === clientId && 
        w.weekNumber === weekNumber &&
        w.trainerId === trainerId
    );

    const completedWorkouts = weekWorkouts.filter((w: any) => w.status === 'completed');
    const total = weekWorkouts.length;
    const completed = completedWorkouts.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  } catch (error) {
    console.error('Error calculating week progress:', error);
    return { completed: 0, total: 0, percentage: 0 };
  }
}
