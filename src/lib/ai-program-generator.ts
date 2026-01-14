/**
 * AI Program Generator Service - Enhanced
 * Generates training programs using OpenAI API
 * Features:
 * - Partial regeneration of specific sections
 * - Trainer style memory and preferences
 * - Client-aware program generation
 * - Program versioning and history
 * - Exercise library mapping
 * - Quality & safety enhancements
 * - UX improvements with section tracking
 */

import { BaseCrudService } from '@/integrations';
import { FitnessPrograms } from '@/entities';
import { safeFetch } from './api-response-handler';

export interface ProgramGeneratorInput {
  programGoal: string;
  programLength: string; // e.g., "8 weeks", "12 weeks"
  daysPerWeek: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[]; // e.g., ["dumbbells", "barbell", "machines"]
  timePerWorkout: number; // in minutes
  injuries: string; // comma-separated or description
  trainingStyle: string; // e.g., "strength", "hypertrophy", "endurance"
  additionalNotes?: string;
  clientId?: string; // Optional: for client-aware generation
}

export interface WorkoutDay {
  day: string;
  exercises: Exercise[];
  warmUp: string;
  coolDown: string;
  notes: string;
  aiGenerated?: boolean; // Track if this section was AI-generated
  generatedAt?: string; // Timestamp of last AI generation
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g., "8-10", "12-15"
  weight?: string;
  restSeconds: number;
  notes: string;
  substitutions: string[];
  exerciseId?: string; // Internal exercise library ID
  aiGenerated?: boolean; // Track if AI-generated
  generatedAt?: string; // Timestamp of last AI generation
}

export interface GeneratedProgram {
  programName: string;
  overview: string;
  duration: string;
  focusArea: string;
  weeklySplit: string;
  workoutDays: WorkoutDay[];
  progressionGuidance: string;
  safetyNotes: string;
  aiGenerated: boolean;
  aiGeneratedAt?: string; // Timestamp of last full generation
  qualityScore?: number; // 0-100 quality assessment
  qualityFlags?: QualityFlag[]; // Safety/quality issues
}

export interface QualityFlag {
  type: 'excessive-volume' | 'repeated-movement' | 'missing-substitutions' | 'form-concern';
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectedExercises?: string[];
}

export interface TrainerPreferences {
  _id: string;
  trainerId: string;
  repRanges: {
    strength: string; // e.g., "3-5"
    hypertrophy: string; // e.g., "8-12"
    endurance: string; // e.g., "15-20"
  };
  restTimes: {
    strength: number; // seconds
    hypertrophy: number;
    endurance: number;
  };
  favoriteExercises: string[];
  avoidedExercises: string[];
  coachingTone: 'motivational' | 'technical' | 'balanced';
  defaultEquipment: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ProgramVersion {
  _id: string;
  programId: string;
  version: number;
  parentProgramId?: string; // Reference to previous version
  programData: GeneratedProgram;
  trainerId: string;
  clientId?: string;
  editedAt: Date | string;
  editSummary?: string; // What was changed
  createdAt?: Date | string;
}

export interface ClientData {
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  injuries: string[];
  equipment: string[];
  availableDaysPerWeek: number;
  timePerWorkout: number;
  preferences?: string;
}

export interface PartialRegenerationRequest {
  programId: string;
  section: 'workout-day' | 'exercise-substitutions' | 'progression-guidance' | 'warm-up-cool-down';
  dayIndex?: number; // For workout-day sections
  exerciseIndex?: number; // For exercise-specific sections
  context?: string; // Trainer notes or specific requests
}

/**
 * Generate a training program using OpenAI API
 * @param input - Program generation parameters
 * @param trainerId - ID of the trainer creating the program
 * @returns Generated program data
 */
export async function generateProgramWithAI(
  input: ProgramGeneratorInput,
  trainerId: string
): Promise<GeneratedProgram> {
  try {
    // Validate input
    validateProgramInput(input);

    // Call backend API to generate program with safe JSON parsing
    const response = await safeFetch<{ success: boolean; data: GeneratedProgram; error?: string; statusCode: number }>(
      '/api/generate-program',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          trainerId,
        }),
      },
      'Program generation'
    );

    // Validate wrapper response structure
    if (!response.success || !response.data) {
      throw new Error(response.error || 'API returned unsuccessful response or missing data');
    }

    // Extract and validate generated program
    const generatedProgram = response.data;
    validateGeneratedProgram(generatedProgram);

    return generatedProgram;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating program:', error);
    throw new Error(`Failed to generate program: ${errorMessage}`);
  }
}

/**
 * Save a generated program as a draft
 * @param program - Generated program data
 * @param trainerId - ID of the trainer
 * @param clientId - Optional client ID if assigning immediately
 * @returns Saved program ID
 */
export async function saveProgramDraft(
  program: GeneratedProgram,
  trainerId: string,
  clientId?: string
): Promise<string> {
  try {
    const programId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Standardized status: "draft", "assigned", or "template" (lowercase)
    const status = clientId ? 'assigned' : 'draft';

    // Save to programdrafts collection with full JSON
    const programDraft = {
      _id: crypto.randomUUID(),
      programId,
      trainerId,
      clientId: clientId || undefined,
      programJson: JSON.stringify(program),
      status,
      createdAt: now,
      updatedAt: now,
    };

    await BaseCrudService.create('programdrafts', programDraft);

    // Also save basic metadata to programs collection for backward compatibility
    const fitnessProgram: FitnessPrograms = {
      _id: programId,
      programName: program.programName,
      description: program.overview,
      duration: program.duration,
      focusArea: program.focusArea,
      trainerId,
      clientId: clientId || undefined,
      status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize for programs collection
    };

    await BaseCrudService.create('programs', fitnessProgram);

    // Cache in sessionStorage for quick access
    sessionStorage.setItem(`program_draft_${programId}`, JSON.stringify(program));

    return programId;
  } catch (error) {
    console.error('Error saving program draft:', error);
    throw new Error('Failed to save program draft');
  }
}

/**
 * Load a program draft for editing
 * @param programId - ID of the program to load
 * @returns Program data with full details
 */
export async function loadProgramDraft(programId: string): Promise<GeneratedProgram & { _id: string; trainerId: string; clientId?: string; status: string }> {
  try {
    // Check sessionStorage cache first
    const cached = sessionStorage.getItem(`program_draft_${programId}`);
    if (cached) {
      const program = JSON.parse(cached);
      // Still need to fetch metadata for trainerId, clientId, status
      const results = await BaseCrudService.getAll<any>('programdrafts');
      const draft = results.items.find((d: any) => d.programId === programId);
      
      if (draft) {
        return {
          ...program,
          _id: draft.programId,
          trainerId: draft.trainerId,
          clientId: draft.clientId,
          status: draft.status,
        };
      }
    }

    // Load from programdrafts collection
    const results = await BaseCrudService.getAll<any>('programdrafts');
    const draft = results.items.find((d: any) => d.programId === programId);

    if (!draft) {
      throw new Error('Program draft not found');
    }

    // Parse the stored JSON
    const program = JSON.parse(draft.programJson);

    // Cache in sessionStorage for future access
    sessionStorage.setItem(`program_draft_${programId}`, JSON.stringify(program));

    return {
      ...program,
      _id: draft.programId,
      trainerId: draft.trainerId,
      clientId: draft.clientId,
      status: draft.status,
    };
  } catch (error) {
    console.error('Error loading program draft:', error);
    throw new Error('Failed to load program draft');
  }
}

/**
 * Update a program draft
 * @param programId - ID of the program to update
 * @param updates - Partial program updates
 */
export async function updateProgramDraft(
  programId: string,
  updates: Partial<GeneratedProgram>
): Promise<void> {
  try {
    // Load current draft
    const results = await BaseCrudService.getAll<any>('programdrafts');
    const draft = results.items.find((d: any) => d.programId === programId);

    if (!draft) {
      throw new Error('Program draft not found');
    }

    // Parse current program
    const currentProgram = JSON.parse(draft.programJson);

    // Merge updates
    const updatedProgram = { ...currentProgram, ...updates };

    // Validate updated program
    validateGeneratedProgram(updatedProgram);

    // Update in database
    await BaseCrudService.update('programdrafts', {
      _id: draft._id,
      programJson: JSON.stringify(updatedProgram),
      updatedAt: new Date().toISOString(),
    });

    // Update sessionStorage cache
    sessionStorage.setItem(`program_draft_${programId}`, JSON.stringify(updatedProgram));
  } catch (error) {
    console.error('Error updating program draft:', error);
    throw new Error('Failed to update program draft');
  }
}

/**
 * Save a program draft as a template
 * @param programId - ID of the program to save as template
 * @param templateName - Name for the template
 */
export async function saveProgramAsTemplate(
  programId: string,
  templateName: string
): Promise<void> {
  try {
    // Load current draft
    const results = await BaseCrudService.getAll<any>('programdrafts');
    const draft = results.items.find((d: any) => d.programId === programId);

    if (!draft) {
      throw new Error('Program draft not found');
    }

    // Parse program
    const program = JSON.parse(draft.programJson);
    const templateId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create template with new ID
    const template = {
      _id: crypto.randomUUID(),
      programId: templateId,
      trainerId: draft.trainerId,
      clientId: undefined,
      programJson: JSON.stringify({
        ...program,
        programName: templateName,
      }),
      status: 'template',
      createdAt: now,
      updatedAt: now,
    };

    await BaseCrudService.create('programdrafts', template);

    console.log(`Template saved: ${templateId}`);
  } catch (error) {
    console.error('Error saving template:', error);
    throw new Error('Failed to save template');
  }
}

/**
 * Assign a program to a client
 * @param programId - ID of the program to assign
 * @param clientId - ID of the client to assign to
 * @returns Updated program ID
 */
export async function assignProgramToClient(
  programId: string,
  clientId: string
): Promise<string> {
  try {
    // Load the program draft
    const results = await BaseCrudService.getAll<any>('programdrafts');
    const draft = results.items.find((d: any) => d.programId === programId);

    if (!draft) {
      throw new Error('Program draft not found');
    }

    const program = JSON.parse(draft.programJson);
    const clientProgramId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create a client-specific copy in programdrafts
    const clientDraft = {
      _id: crypto.randomUUID(),
      programId: clientProgramId,
      trainerId: draft.trainerId,
      clientId,
      programJson: draft.programJson,
      status: 'assigned',
      createdAt: now,
      updatedAt: now,
    };

    await BaseCrudService.create('programdrafts', clientDraft);

    // Update programs collection for backward compatibility
    const fitnessProgram: FitnessPrograms = {
      _id: clientProgramId,
      programName: program.programName,
      description: program.overview,
      duration: program.duration,
      focusArea: program.focusArea,
      trainerId: draft.trainerId,
      clientId,
      status: 'Assigned',
    };

    await BaseCrudService.create('programs', fitnessProgram);

    // Cache in sessionStorage
    sessionStorage.setItem(`program_draft_${clientProgramId}`, JSON.stringify(program));

    return clientProgramId;
  } catch (error) {
    console.error('Error assigning program:', error);
    throw new Error('Failed to assign program to client');
  }
}

/**
 * Validate program generation input
 */
function validateProgramInput(input: ProgramGeneratorInput): void {
  if (!input.programGoal || input.programGoal.trim().length === 0) {
    throw new Error('Program goal is required');
  }

  if (!input.programLength || input.programLength.trim().length === 0) {
    throw new Error('Program length is required');
  }

  if (input.daysPerWeek < 1 || input.daysPerWeek > 7) {
    throw new Error('Days per week must be between 1 and 7');
  }

  if (!['beginner', 'intermediate', 'advanced'].includes(input.experienceLevel)) {
    throw new Error('Invalid experience level');
  }

  if (input.equipment.length === 0) {
    throw new Error('At least one equipment type must be selected');
  }

  if (input.timePerWorkout < 15 || input.timePerWorkout > 180) {
    throw new Error('Time per workout must be between 15 and 180 minutes');
  }

  if (!input.trainingStyle || input.trainingStyle.trim().length === 0) {
    throw new Error('Training style is required');
  }
}

/**
 * Validate generated program structure
 */
function validateGeneratedProgram(program: GeneratedProgram): void {
  if (!program.programName || program.programName.trim().length === 0) {
    throw new Error('Generated program must have a name');
  }

  if (!program.overview || program.overview.trim().length === 0) {
    throw new Error('Generated program must have an overview');
  }

  if (!program.workoutDays || program.workoutDays.length === 0) {
    throw new Error('Generated program must have workout days');
  }

  // Validate each workout day
  program.workoutDays.forEach((day, index) => {
    if (!day.day || day.day.trim().length === 0) {
      throw new Error(`Workout day ${index + 1} must have a name`);
    }

    if (!day.exercises || day.exercises.length === 0) {
      throw new Error(`Workout day ${index + 1} must have at least one exercise`);
    }

    // Validate each exercise
    day.exercises.forEach((exercise, exerciseIndex) => {
      if (!exercise.name || exercise.name.trim().length === 0) {
        throw new Error(`Exercise ${exerciseIndex + 1} in ${day.day} must have a name`);
      }

      if (exercise.sets < 1 || exercise.sets > 10) {
        throw new Error(`Exercise ${exerciseIndex + 1} in ${day.day} must have 1-10 sets`);
      }

      if (exercise.restSeconds < 0 || exercise.restSeconds > 300) {
        throw new Error(`Exercise ${exerciseIndex + 1} in ${day.day} must have 0-300 second rest`);
      }
    });
  });
}

/**
 * Check if a program is safe (no dangerous recommendations)
 * This is a basic safety check - in production, this would be more comprehensive
 */
export function isSafeProgram(program: GeneratedProgram): boolean {
  // Check for dangerous patterns
  const dangerousKeywords = ['extreme', 'dangerous', 'unsafe', 'risky'];
  const programText = JSON.stringify(program).toLowerCase();

  for (const keyword of dangerousKeywords) {
    if (programText.includes(keyword)) {
      console.warn(`Potential safety issue detected: ${keyword}`);
      return false;
    }
  }

  // Check for reasonable exercise counts
  for (const day of program.workoutDays) {
    if (day.exercises.length > 15) {
      console.warn('Too many exercises in a single workout');
      return false;
    }

    for (const exercise of day.exercises) {
      if (exercise.sets > 10) {
        console.warn('Too many sets for a single exercise');
        return false;
      }
    }
  }

  return true;
}

/**
 * ENHANCED FEATURES
 */

/**
 * Get or create trainer preferences
 * @param trainerId - ID of the trainer
 * @returns Trainer preferences
 */
export async function getTrainerPreferences(trainerId: string): Promise<TrainerPreferences> {
  try {
    // In production, this would query a TrainerPreferences collection
    // For now, return default preferences
    const stored = localStorage.getItem(`trainer_prefs_${trainerId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    const defaults: TrainerPreferences = {
      _id: crypto.randomUUID(),
      trainerId,
      repRanges: {
        strength: '3-5',
        hypertrophy: '8-12',
        endurance: '15-20',
      },
      restTimes: {
        strength: 180,
        hypertrophy: 90,
        endurance: 45,
      },
      favoriteExercises: [],
      avoidedExercises: [],
      coachingTone: 'balanced',
      defaultEquipment: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`trainer_prefs_${trainerId}`, JSON.stringify(defaults));
    return defaults;
  } catch (error) {
    console.error('Error getting trainer preferences:', error);
    throw new Error('Failed to get trainer preferences');
  }
}

/**
 * Update trainer preferences
 * @param trainerId - ID of the trainer
 * @param updates - Partial preference updates
 */
export async function updateTrainerPreferences(
  trainerId: string,
  updates: Partial<TrainerPreferences>
): Promise<TrainerPreferences> {
  try {
    const current = await getTrainerPreferences(trainerId);
    const updated: TrainerPreferences = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`trainer_prefs_${trainerId}`, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating trainer preferences:', error);
    throw new Error('Failed to update trainer preferences');
  }
}

/**
 * Fetch client data for context-aware program generation
 * @param clientId - ID of the client
 * @returns Client data
 */
export async function getClientContext(clientId: string): Promise<ClientData | null> {
  try {
    // In production, this would fetch from client profile/assignments
    // For now, return null (trainer must provide context)
    const stored = localStorage.getItem(`client_context_${clientId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting client context:', error);
    return null;
  }
}

/**
 * Regenerate a specific section of a program
 * @param request - Partial regeneration request
 * @param trainerId - ID of the trainer
 * @returns Updated program section
 */
export async function regenerateProgramSection(
  request: PartialRegenerationRequest,
  trainerId: string
): Promise<GeneratedProgram> {
  try {
    // Load current program
    const program = await loadProgramDraft(request.programId);
    if (!program) {
      throw new Error('Program not found');
    }

    // Get trainer preferences for context
    const prefs = await getTrainerPreferences(trainerId);

    // Build regeneration prompt based on section type
    let prompt = '';
    let context = '';

    switch (request.section) {
      case 'workout-day':
        if (request.dayIndex === undefined) throw new Error('dayIndex required for workout-day regeneration');
        const day = program.workoutDays[request.dayIndex];
        context = `Current day: ${day.day}\nCurrent exercises: ${day.exercises.map(e => `${e.name} (${e.sets}x${e.reps})`).join(', ')}`;
        prompt = `Regenerate this workout day with the same focus but different exercises. ${request.context || ''}`;
        break;

      case 'exercise-substitutions':
        if (request.dayIndex === undefined || request.exerciseIndex === undefined) {
          throw new Error('dayIndex and exerciseIndex required for substitutions');
        }
        const exercise = program.workoutDays[request.dayIndex].exercises[request.exerciseIndex];
        context = `Exercise: ${exercise.name} (${exercise.sets}x${exercise.reps}, ${exercise.restSeconds}s rest)`;
        prompt = `Generate 3 alternative exercises for this movement pattern. ${request.context || ''}`;
        break;

      case 'progression-guidance':
        context = `Program: ${program.programName}\nDuration: ${program.duration}\nFocus: ${program.focusArea}`;
        prompt = `Regenerate progression guidance for this program. ${request.context || ''}`;
        break;

      case 'warm-up-cool-down':
        if (request.dayIndex === undefined) throw new Error('dayIndex required for warm-up-cool-down');
        const warmupDay = program.workoutDays[request.dayIndex];
        context = `Day: ${warmupDay.day}\nExercises: ${warmupDay.exercises.map(e => e.name).join(', ')}`;
        prompt = `Regenerate warm-up and cool-down for this workout day. ${request.context || ''}`;
        break;
    }

    // Call backend API with section-specific prompt using safe JSON parsing
    const response = await safeFetch<{ success: boolean; data: any; statusCode: number }>(
      '/api/regenerate-program-section',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: request.section,
          context,
          prompt,
          trainerPreferences: prefs,
          currentProgram: program,
        }),
      },
      'Program section regeneration'
    );

    // Extract data from wrapper response
    const regeneratedData = response.data;

    // Update program with regenerated section
    const updated = { ...program };
    const now = new Date().toISOString();

    switch (request.section) {
      case 'workout-day':
        updated.workoutDays[request.dayIndex!] = {
          ...regeneratedData,
          aiGenerated: true,
          generatedAt: now,
        };
        break;

      case 'exercise-substitutions':
        updated.workoutDays[request.dayIndex!].exercises[request.exerciseIndex!].substitutions =
          regeneratedData.substitutions;
        updated.workoutDays[request.dayIndex!].exercises[request.exerciseIndex!].generatedAt = now;
        break;

      case 'progression-guidance':
        updated.progressionGuidance = regeneratedData.progressionGuidance;
        break;

      case 'warm-up-cool-down':
        updated.workoutDays[request.dayIndex!].warmUp = regeneratedData.warmUp;
        updated.workoutDays[request.dayIndex!].coolDown = regeneratedData.coolDown;
        updated.workoutDays[request.dayIndex!].generatedAt = now;
        break;
    }

    // Save updated program to database
    await updateProgramDraft(request.programId, updated);

    return updated;
  } catch (error) {
    console.error('Error regenerating program section:', error);
    throw new Error(`Failed to regenerate ${request.section}`);
  }
}

/**
 * Create a new version of a program
 * @param programId - ID of the program to version
 * @param program - Updated program data
 * @param trainerId - ID of the trainer
 * @param editSummary - Summary of changes
 * @returns New program version
 */
export async function createProgramVersion(
  programId: string,
  program: GeneratedProgram,
  trainerId: string,
  editSummary?: string
): Promise<ProgramVersion> {
  try {
    // In production, this would query version history
    // For now, assume version 1
    const version: ProgramVersion = {
      _id: crypto.randomUUID(),
      programId,
      version: 2, // Would be incremented based on history
      parentProgramId: programId,
      programData: program,
      trainerId,
      editedAt: new Date().toISOString(),
      editSummary,
      createdAt: new Date().toISOString(),
    };

    // Store version in localStorage
    localStorage.setItem(`program_version_${version._id}`, JSON.stringify(version));

    return version;
  } catch (error) {
    console.error('Error creating program version:', error);
    throw new Error('Failed to create program version');
  }
}

/**
 * Get program version history
 * @param programId - ID of the program
 * @returns Array of program versions
 */
export async function getProgramVersionHistory(programId: string): Promise<ProgramVersion[]> {
  try {
    // In production, this would query all versions from database
    // For now, return empty array
    const versions: ProgramVersion[] = [];
    return versions;
  } catch (error) {
    console.error('Error getting program version history:', error);
    return [];
  }
}

/**
 * Assess program quality and safety
 * @param program - Program to assess
 * @returns Quality assessment with flags
 */
export function assessProgramQuality(program: GeneratedProgram): { score: number; flags: QualityFlag[] } {
  const flags: QualityFlag[] = [];
  let score = 100;

  // Check for excessive volume
  let totalSets = 0;
  const exerciseFrequency: Record<string, number> = {};

  program.workoutDays.forEach(day => {
    day.exercises.forEach(exercise => {
      totalSets += exercise.sets;
      exerciseFrequency[exercise.name] = (exerciseFrequency[exercise.name] || 0) + 1;
    });
  });

  if (totalSets > 200) {
    flags.push({
      type: 'excessive-volume',
      severity: 'high',
      message: `Total volume is very high (${totalSets} sets). Consider reducing for recovery.`,
    });
    score -= 20;
  } else if (totalSets > 150) {
    flags.push({
      type: 'excessive-volume',
      severity: 'medium',
      message: `Total volume is moderate-high (${totalSets} sets). Monitor client fatigue.`,
    });
    score -= 10;
  }

  // Check for repeated movements
  Object.entries(exerciseFrequency).forEach(([exercise, count]) => {
    if (count > 3) {
      flags.push({
        type: 'repeated-movement',
        severity: 'medium',
        message: `"${exercise}" appears ${count} times. Consider variation.`,
        affectedExercises: [exercise],
      });
      score -= 5;
    }
  });

  // Check for missing substitutions
  const exercisesWithoutSubs: string[] = [];
  program.workoutDays.forEach(day => {
    day.exercises.forEach(exercise => {
      if (!exercise.substitutions || exercise.substitutions.length === 0) {
        exercisesWithoutSubs.push(exercise.name);
      }
    });
  });

  if (exercisesWithoutSubs.length > 0) {
    flags.push({
      type: 'missing-substitutions',
      severity: 'low',
      message: `${exercisesWithoutSubs.length} exercises lack substitutions.`,
      affectedExercises: exercisesWithoutSubs,
    });
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    flags,
  };
}

/**
 * Map exercise names to internal library IDs
 * Normalizes exercise names (lowercase, trim) to prevent filtering issues
 * @param exerciseName - Name of the exercise
 * @returns Exercise ID if found, null otherwise
 */
export async function mapExerciseToLibrary(exerciseName: string): Promise<string | null> {
  try {
    // Normalize the exercise name: lowercase and trim
    const normalizedName = exerciseName.toLowerCase().trim();
    
    // In production, this would query an exercise library collection
    // For now, return null (trainer must manually map)
    const stored = localStorage.getItem(`exercise_map_${normalizedName}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error mapping exercise:', error);
    return null;
  }
}

/**
 * Store exercise library mapping
 * Normalizes exercise names (lowercase, trim) to prevent filtering issues
 * @param exerciseName - Display name
 * @param exerciseId - Internal library ID
 */
export async function storeExerciseMapping(exerciseName: string, exerciseId: string): Promise<void> {
  try {
    // Normalize the exercise name: lowercase and trim
    const normalizedName = exerciseName.toLowerCase().trim();
    
    localStorage.setItem(`exercise_map_${normalizedName}`, JSON.stringify(exerciseId));
  } catch (error) {
    console.error('Error storing exercise mapping:', error);
    throw new Error('Failed to store exercise mapping');
  }
}

export default {
  generateProgramWithAI,
  saveProgramDraft,
  loadProgramDraft,
  updateProgramDraft,
  saveProgramAsTemplate,
  assignProgramToClient,
  isSafeProgram,
  getTrainerPreferences,
  updateTrainerPreferences,
  getClientContext,
  regenerateProgramSection,
  createProgramVersion,
  getProgramVersionHistory,
  assessProgramQuality,
  mapExerciseToLibrary,
  storeExerciseMapping,
};
