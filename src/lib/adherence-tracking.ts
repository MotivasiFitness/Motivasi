/**
 * Adherence Tracking Service
 * Tracks client workout completion and feedback
 * Generates risk signals for trainer visibility
 */

import { BaseCrudService } from '@/integrations';
import { ClientWorkoutActivity, ClientWorkoutFeedback } from '@/entities';

export type AdherenceStatus = 'At Risk' | 'Too Hard' | 'Too Easy' | 'Inactive' | 'On Track';

export interface WorkoutCompletion {
  _id: string;
  clientId: string;
  programId: string;
  workoutDayId: string;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface WorkoutFeedback {
  _id: string;
  clientId: string;
  programId: string;
  workoutActivityId: string;
  difficultyRating: number; // 1-5
  feedbackNote?: string;
  submittedAt: Date;
}

export interface ClientAdherenceSignal {
  clientId: string;
  status: AdherenceStatus;
  lastWorkoutDate?: Date;
  avgDifficulty?: number;
  missedWorkoutsLast7Days?: number;
  daysSinceLastActivity?: number;
  reason?: string;
}

/**
 * Record workout completion
 */
export async function recordWorkoutCompletion(
  clientId: string,
  programId: string,
  workoutDayId: string,
  notes?: string
): Promise<WorkoutCompletion> {
  try {
    const activity: ClientWorkoutActivity = {
      _id: crypto.randomUUID(),
      clientId,
      programId,
      workoutDayId,
      completed: true,
      completedAt: new Date().toISOString(),
      notes,
    };

    await BaseCrudService.create('clientworkoutactivity', activity);

    return {
      _id: activity._id,
      clientId,
      programId,
      workoutDayId,
      completed: true,
      completedAt: new Date(),
      notes,
    };
  } catch (error) {
    console.error('Error recording workout completion:', error);
    throw new Error('Failed to record workout completion');
  }
}

/**
 * Record workout feedback (optional, non-blocking)
 */
export async function recordWorkoutFeedback(
  clientId: string,
  programId: string,
  workoutActivityId: string,
  difficultyRating: number,
  feedbackNote?: string
): Promise<WorkoutFeedback> {
  try {
    // Validate difficulty rating
    if (difficultyRating < 1 || difficultyRating > 5) {
      throw new Error('Difficulty rating must be between 1 and 5');
    }

    const feedback: ClientWorkoutFeedback = {
      _id: crypto.randomUUID(),
      clientId,
      programId,
      workoutActivityId,
      difficultyRating,
      feedbackNote,
      submittedAt: new Date().toISOString(),
    };

    await BaseCrudService.create('clientworkoutfeedback', feedback);

    return {
      _id: feedback._id,
      clientId,
      programId,
      workoutActivityId,
      difficultyRating,
      feedbackNote,
      submittedAt: new Date(),
    };
  } catch (error) {
    console.error('Error recording workout feedback:', error);
    throw new Error('Failed to record workout feedback');
  }
}

/**
 * Get client adherence signal
 * Computes risk status based on recent activity and feedback
 */
export async function getClientAdherenceSignal(
  clientId: string,
  programId: string
): Promise<ClientAdherenceSignal> {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all activities for this client-program
    const { items: activities } = await BaseCrudService.getAll<ClientWorkoutActivity>(
      'clientworkoutactivity'
    );
    const clientActivities = activities.filter(
      (a) => a.clientId === clientId && a.programId === programId
    );

    // Get all feedback for this client-program
    const { items: feedbackItems } = await BaseCrudService.getAll<ClientWorkoutFeedback>(
      'clientworkoutfeedback'
    );
    const clientFeedback = feedbackItems.filter(
      (f) => f.clientId === clientId && f.programId === programId
    );

    // Calculate metrics
    const recentActivities = clientActivities.filter((a) => {
      const completedAt = a.completedAt ? new Date(a.completedAt) : null;
      return completedAt && completedAt >= sevenDaysAgo;
    });

    const missedWorkoutsLast7Days = recentActivities.filter((a) => !a.completed).length;
    const lastWorkoutDate = clientActivities
      .filter((a) => a.completed && a.completedAt)
      .sort((a, b) => {
        const dateA = new Date(a.completedAt || 0).getTime();
        const dateB = new Date(b.completedAt || 0).getTime();
        return dateB - dateA;
      })[0]?.completedAt;

    const daysSinceLastActivity = lastWorkoutDate
      ? Math.floor((now.getTime() - new Date(lastWorkoutDate).getTime()) / (24 * 60 * 60 * 1000))
      : undefined;

    // Calculate average difficulty from last 7 days
    const recentFeedback = clientFeedback.filter((f) => {
      const submittedAt = f.submittedAt ? new Date(f.submittedAt) : null;
      return submittedAt && submittedAt >= sevenDaysAgo;
    });

    const avgDifficulty =
      recentFeedback.length > 0
        ? recentFeedback.reduce((sum, f) => sum + (f.difficultyRating || 0), 0) /
          recentFeedback.length
        : undefined;

    // Determine status
    let status: AdherenceStatus = 'On Track';
    let reason: string | undefined;

    if (daysSinceLastActivity !== undefined && daysSinceLastActivity >= 7) {
      status = 'Inactive';
      reason = `No activity for ${daysSinceLastActivity} days`;
    } else if (missedWorkoutsLast7Days >= 2) {
      status = 'At Risk';
      reason = `Missed ${missedWorkoutsLast7Days} workouts in last 7 days`;
    } else if (avgDifficulty !== undefined && avgDifficulty >= 4.5) {
      status = 'Too Hard';
      reason = `Average difficulty: ${avgDifficulty.toFixed(1)}/5`;
    } else if (avgDifficulty !== undefined && avgDifficulty <= 2) {
      status = 'Too Easy';
      reason = `Average difficulty: ${avgDifficulty.toFixed(1)}/5`;
    }

    return {
      clientId,
      status,
      lastWorkoutDate: lastWorkoutDate ? new Date(lastWorkoutDate) : undefined,
      avgDifficulty,
      missedWorkoutsLast7Days,
      daysSinceLastActivity,
      reason,
    };
  } catch (error) {
    console.error('Error calculating adherence signal:', error);
    return {
      clientId,
      status: 'On Track',
      reason: 'Unable to calculate signal',
    };
  }
}

/**
 * Get adherence signals for all clients of a trainer
 */
export async function getTrainerClientAdherenceSignals(
  trainerId: string
): Promise<ClientAdherenceSignal[]> {
  try {
    // Get all programs for this trainer
    const { items: programs } = await BaseCrudService.getAll<any>('programs');
    const trainerPrograms = programs.filter((p) => p.trainerId === trainerId);

    // Get signals for each client-program pair
    const signals: ClientAdherenceSignal[] = [];
    const processedClients = new Set<string>();

    for (const program of trainerPrograms) {
      if (program.clientId && !processedClients.has(program.clientId)) {
        const signal = await getClientAdherenceSignal(program.clientId, program._id);
        signals.push(signal);
        processedClients.add(program.clientId);
      }
    }

    return signals;
  } catch (error) {
    console.error('Error getting trainer adherence signals:', error);
    return [];
  }
}

/**
 * Get recent feedback for a client-program
 */
export async function getRecentFeedback(
  clientId: string,
  programId: string,
  days: number = 7
): Promise<WorkoutFeedback[]> {
  try {
    const { items } = await BaseCrudService.getAll<ClientWorkoutFeedback>(
      'clientworkoutfeedback'
    );

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return items
      .filter(
        (f) =>
          f.clientId === clientId &&
          f.programId === programId &&
          f.submittedAt &&
          new Date(f.submittedAt) >= cutoffDate
      )
      .map((f) => ({
        _id: f._id,
        clientId: f.clientId || '',
        programId: f.programId || '',
        workoutActivityId: f.workoutActivityId || '',
        difficultyRating: f.difficultyRating || 0,
        feedbackNote: f.feedbackNote,
        submittedAt: new Date(f.submittedAt || new Date()),
      }))
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  } catch (error) {
    console.error('Error getting recent feedback:', error);
    return [];
  }
}

/**
 * Get activity summary for a client-program
 */
export async function getActivitySummary(
  clientId: string,
  programId: string,
  days: number = 7
) {
  try {
    const { items: activities } = await BaseCrudService.getAll<ClientWorkoutActivity>(
      'clientworkoutactivity'
    );

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const recentActivities = activities.filter(
      (a) =>
        a.clientId === clientId &&
        a.programId === programId &&
        a.completedAt &&
        new Date(a.completedAt) >= cutoffDate
    );

    const completed = recentActivities.filter((a) => a.completed).length;
    const missed = recentActivities.filter((a) => !a.completed).length;
    const total = recentActivities.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      missed,
      total,
      completionRate,
      period: `Last ${days} days`,
    };
  } catch (error) {
    console.error('Error getting activity summary:', error);
    return {
      completed: 0,
      missed: 0,
      total: 0,
      completionRate: 0,
      period: `Last ${days} days`,
    };
  }
}

/**
 * Check if a workout completion record already exists (idempotent)
 */
export async function workoutCompletionExists(
  clientId: string,
  programId: string,
  workoutDayId: string,
  completedAfter: Date
): Promise<boolean> {
  try {
    const { items } = await BaseCrudService.getAll<ClientWorkoutActivity>(
      'clientworkoutactivity'
    );

    return items.some(
      (a) =>
        a.clientId === clientId &&
        a.programId === programId &&
        a.workoutDayId === workoutDayId &&
        a.completed &&
        a.completedAt &&
        new Date(a.completedAt) >= completedAfter
    );
  } catch (error) {
    console.error('Error checking workout completion:', error);
    return false;
  }
}

export default {
  recordWorkoutCompletion,
  recordWorkoutFeedback,
  getClientAdherenceSignal,
  getTrainerClientAdherenceSignals,
  getRecentFeedback,
  getActivitySummary,
  workoutCompletionExists,
};
