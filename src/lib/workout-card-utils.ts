/**
 * Utility functions for enhanced workout card display
 * Handles extraction and formatting of session metadata
 */

import { ClientPrograms } from '@/entities';

export interface WorkoutCardMetadata {
  sessionDescription?: string;
  estimatedDuration?: string;
  exerciseCountLabel: string;
}

/**
 * Extract session metadata from workout exercises
 * Uses first exercise in the day as the source of session-level data
 */
export function extractWorkoutCardMetadata(
  dayExercises: ClientPrograms[]
): WorkoutCardMetadata {
  if (!dayExercises || dayExercises.length === 0) {
    return {
      exerciseCountLabel: 'focused movements',
    };
  }

  const firstExercise = dayExercises[0];

  return {
    sessionDescription: firstExercise?.sessionDescription,
    estimatedDuration: firstExercise?.estimatedDuration,
    exerciseCountLabel: firstExercise?.exerciseCountLabel || 'focused movements',
  };
}

/**
 * Get default exercise count label based on number of exercises
 * Provides sensible fallback if no custom label is set
 */
export function getDefaultExerciseCountLabel(count: number): string {
  if (count === 1) return 'focused movement';
  if (count <= 3) return 'focused movements';
  if (count <= 5) return 'compound exercises';
  return 'comprehensive session';
}

/**
 * Format exercise count with label
 */
export function formatExerciseCount(
  count: number,
  customLabel?: string
): string {
  const label = customLabel || getDefaultExerciseCountLabel(count);
  return `${count} ${label}`;
}

/**
 * Get visual hierarchy class for "Next up" card
 * Applies subtle styling to highlight the next recommended workout
 */
export function getNextUpCardClasses(
  isNextRecommended: boolean,
  isCompleted: boolean,
  isActive: boolean
): string {
  if (!isNextRecommended || isCompleted || isActive) {
    return '';
  }

  return 'ring-2 ring-soft-bronze/50';
}

/**
 * Get background class for "Next up" card header
 */
export function getNextUpHeaderClasses(
  isNextRecommended: boolean,
  isCompleted: boolean,
  isActive: boolean
): string {
  if (!isNextRecommended || isCompleted || isActive) {
    return '';
  }

  return 'bg-soft-bronze/10';
}

/**
 * Get badge styling for "Next up" indicator
 */
export function getNextUpBadgeClasses(isActive: boolean): string {
  if (isActive) {
    return 'bg-soft-white/20 text-soft-white border-soft-white/40';
  }
  return 'bg-soft-bronze text-soft-white border-soft-bronze';
}
