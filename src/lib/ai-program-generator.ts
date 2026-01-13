/**
 * AI Program Generator Service
 * Generates training programs using OpenAI API
 * Handles program creation, validation, and storage
 */

import { BaseCrudService } from '@/integrations';
import { FitnessPrograms } from '@/entities';

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
}

export interface WorkoutDay {
  day: string;
  exercises: Exercise[];
  warmUp: string;
  coolDown: string;
  notes: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g., "8-10", "12-15"
  weight?: string;
  restSeconds: number;
  notes: string;
  substitutions: string[];
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

    // Call backend API to generate program
    const response = await fetch('/api/generate-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...input,
        trainerId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate program');
    }

    const generatedProgram: GeneratedProgram = await response.json();

    // Validate generated program
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

    const fitnessProgram: FitnessPrograms = {
      _id: programId,
      programName: program.programName,
      description: program.overview,
      duration: program.duration,
      focusArea: program.focusArea,
      trainerId,
      clientId: clientId || undefined,
      status: clientId ? 'Assigned' : 'Draft',
      // Store full program data as JSON in description or separate field
      // For now, we'll extend the interface to support this
    };

    await BaseCrudService.create('programs', fitnessProgram);

    // Store full program details in a separate collection or field
    // This would require extending the database schema
    // For now, we'll store it in localStorage for the session
    const programData = {
      ...program,
      _id: programId,
      trainerId,
      clientId: clientId || null,
      status: clientId ? 'Assigned' : 'Draft',
      createdAt: new Date().toISOString(),
      aiGenerated: true,
    };

    // Store in session storage for editing
    sessionStorage.setItem(`program_${programId}`, JSON.stringify(programData));

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
    // Try to load from session storage first
    const sessionData = sessionStorage.getItem(`program_${programId}`);
    if (sessionData) {
      return JSON.parse(sessionData);
    }

    // If not in session, would need to load from database
    // This requires extending the database schema to store full program data
    throw new Error('Program not found in session');
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
    const sessionData = sessionStorage.getItem(`program_${programId}`);
    if (!sessionData) {
      throw new Error('Program not found');
    }

    const program = JSON.parse(sessionData);
    const updated = { ...program, ...updates };

    // Validate updated program
    validateGeneratedProgram(updated);

    // Save back to session storage
    sessionStorage.setItem(`program_${programId}`, JSON.stringify(updated));
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
    const sessionData = sessionStorage.getItem(`program_${programId}`);
    if (!sessionData) {
      throw new Error('Program not found');
    }

    const program = JSON.parse(sessionData);
    const templateId = crypto.randomUUID();

    const template = {
      ...program,
      _id: templateId,
      programName: templateName,
      status: 'Template',
      isTemplate: true,
    };

    // Save template to session storage
    sessionStorage.setItem(`template_${templateId}`, JSON.stringify(template));

    // In a full implementation, this would save to a separate templates collection
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
    // Load the program
    const sessionData = sessionStorage.getItem(`program_${programId}`);
    if (!sessionData) {
      throw new Error('Program not found');
    }

    const program = JSON.parse(sessionData);

    // Create a client-specific copy
    const clientProgramId = crypto.randomUUID();
    const clientProgram = {
      ...program,
      _id: clientProgramId,
      clientId,
      status: 'Assigned',
      assignedAt: new Date().toISOString(),
    };

    // Save client program
    sessionStorage.setItem(`program_${clientProgramId}`, JSON.stringify(clientProgram));

    // Update database
    const fitnessProgram: FitnessPrograms = {
      _id: clientProgramId,
      programName: program.programName,
      description: program.overview,
      duration: program.duration,
      focusArea: program.focusArea,
      trainerId: program.trainerId,
      clientId,
      status: 'Assigned',
    };

    await BaseCrudService.create('programs', fitnessProgram);

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

export default {
  generateProgramWithAI,
  saveProgramDraft,
  loadProgramDraft,
  updateProgramDraft,
  saveProgramAsTemplate,
  assignProgramToClient,
  isSafeProgram,
};
