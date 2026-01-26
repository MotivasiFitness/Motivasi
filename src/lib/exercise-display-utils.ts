/**
 * Exercise Display Utilities
 * Handles mapping exercise data from CMS collections to standardized display format
 * Supports backward compatibility with existing data structures
 */

import { ClientPrograms, ClientAssignedWorkouts } from '@/entities';
import { ExerciseCardData, SessionContext } from '@/components/ClientPortal/ExerciseCard';

/**
 * Map ClientPrograms or ClientAssignedWorkouts to standardized ExerciseCardData
 * Handles both new fields and legacy data gracefully
 */
export function mapExerciseToCardData(
  exercise: ClientPrograms | ClientAssignedWorkouts
): ExerciseCardData {
  return {
    _id: exercise._id,
    exerciseName: exercise.exerciseName,
    sets: exercise.sets,
    reps: exercise.reps,
    weightOrResistance: exercise.weightOrResistance,
    tempo: exercise.tempo,
    restTimeSeconds: exercise.restTimeSeconds,
    exerciseNotes: exercise.exerciseNotes,
    exerciseVideoUrl: exercise.exerciseVideoUrl,
    // New fields with fallback support
    coachCue: (exercise as any).coachCue,
    primaryMuscles: (exercise as any).primaryMuscles,
    secondaryMuscles: (exercise as any).secondaryMuscles,
    modification1Title: exercise.modification1Title,
    modification1Description: exercise.modification1Description,
    modification2Title: exercise.modification2Title,
    modification2Description: exercise.modification2Description,
    modification3Title: exercise.modification3Title,
    modification3Description: exercise.modification3Description,
    progression: (exercise as any).progression,
  };
}

/**
 * Extract session-level context from a group of exercises
 * Used to display tempo key and effort guidance once per session
 */
export function extractSessionContext(exercises: ExerciseCardData[]): SessionContext {
  const context: SessionContext = {};

  // Collect unique tempos to build a key
  const tempos = exercises
    .filter((e) => e.tempo)
    .map((e) => e.tempo)
    .filter((t, i, arr) => arr.indexOf(t) === i);

  if (tempos.length > 0) {
    // If all exercises have the same tempo, use it as the key
    if (tempos.length === 1) {
      context.tempoKey = `${tempos[0]} = 3s down · 0 pause · 1s up · 0 pause`;
    } else {
      // Multiple tempos - provide generic guidance
      context.tempoKey = 'Tempo varies by exercise. Follow the tempo listed for each movement.';
    }
  }

  // Default effort guidance
  context.effortGuidance = 'Finish most sets with 1–2 reps in reserve.';

  return context;
}

/**
 * Extract and deduplicate equipment from exercises
 * Renders equipment at session level as a simplified list
 */
export function extractEquipment(exercises: ExerciseCardData[]): string[] {
  const equipmentSet = new Set<string>();

  exercises.forEach((exercise) => {
    if (exercise.weightOrResistance) {
      // Parse equipment from weight/resistance field
      const equipment = exercise.weightOrResistance
        .split(/[,·]/)
        .map((e) => e.trim())
        .filter((e) => e && e !== 'Bodyweight');

      equipment.forEach((e) => {
        // Normalize equipment names
        const normalized = e.toLowerCase();
        if (normalized !== 'bodyweight') {
          equipmentSet.add(e);
        }
      });
    }
  });

  return Array.from(equipmentSet);
}

/**
 * Format equipment list for display
 * "Dumbbells (12kg, 8kg) · Barbell (20kg) · Bench · Optional light band"
 */
export function formatEquipmentList(equipment: string[]): string {
  if (equipment.length === 0) return 'Bodyweight';
  return equipment.join(' · ');
}

/**
 * Check if exercise has any new fields populated
 * Used to determine if we should show expanded sections
 */
export function hasNewFields(exercise: ExerciseCardData): boolean {
  return !!(
    exercise.coachCue ||
    exercise.primaryMuscles ||
    exercise.secondaryMuscles ||
    exercise.progression
  );
}

/**
 * Get first sentence from text
 * Used for coach cues to keep them concise
 */
export function getFirstSentence(text: string | undefined): string {
  if (!text) return '';
  const match = text.match(/^[^.!?]*[.!?]/);
  return match ? match[0] : text;
}

/**
 * Format muscles list for display
 * Handles both string and array formats
 */
export function formatMuscles(
  muscles: string | string[] | undefined
): string {
  if (!muscles) return '';
  if (Array.isArray(muscles)) {
    return muscles.join(', ');
  }
  return muscles;
}

/**
 * Avoid redundancy - check if cue is already shown elsewhere
 * Returns true if the cue text appears in exerciseNotes
 */
export function isCueRedundant(
  coachCue: string | undefined,
  exerciseNotes: string | undefined
): boolean {
  if (!coachCue || !exerciseNotes) return false;
  const cueSentence = getFirstSentence(coachCue).toLowerCase();
  return exerciseNotes.toLowerCase().includes(cueSentence);
}
