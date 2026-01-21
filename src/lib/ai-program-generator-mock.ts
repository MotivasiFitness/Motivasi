/**
 * Mock AI Program Generator - Temporary Solution
 * 
 * This provides immediate functionality while the Wix Velo backend is being deployed.
 * Generates realistic training programs without requiring OpenAI API calls.
 * 
 * TO ENABLE: Import from this file instead of '@/lib/ai-program-generator'
 * TO DISABLE: Switch back to '@/lib/ai-program-generator' once backend is deployed
 */

import { ProgramGeneratorInput, GeneratedProgram, WorkoutDay, Exercise } from '@/lib/ai-program-generator';

/**
 * Mock program generation - creates realistic programs based on input
 */
export async function generateProgramWithAI(
  input: ProgramGeneratorInput,
  trainerId: string
): Promise<GeneratedProgram> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Validate input
  if (!input.programGoal || input.programGoal.trim().length === 0) {
    throw new Error('Program goal is required');
  }

  if (!input.programTitle || input.programTitle.trim().length === 0) {
    throw new Error('Program title is required');
  }

  if (input.equipment.length === 0) {
    throw new Error('At least one equipment type must be selected');
  }

  // Generate program based on input
  const program: GeneratedProgram = {
    programName: input.programTitle,
    overview: generateOverview(input),
    duration: input.programLength,
    focusArea: input.programGoal,
    weeklySplit: generateWeeklySplit(input),
    workoutDays: generateWorkoutDays(input),
    progressionGuidance: generateProgressionGuidance(input),
    safetyNotes: generateSafetyNotes(input),
    aiGenerated: true,
    aiGeneratedAt: new Date().toISOString(),
  };

  return program;
}

/**
 * Generate program name based on input
 */
function generateProgramName(input: ProgramGeneratorInput): string {
  const goalMap: Record<string, string> = {
    'strength': 'Strength Building',
    'hypertrophy': 'Muscle Growth',
    'endurance': 'Endurance Development',
    'weight loss': 'Fat Loss',
    'general fitness': 'Total Body Fitness',
  };

  const goalKey = input.programGoal.toLowerCase();
  const goalName = Object.keys(goalMap).find(key => goalKey.includes(key)) 
    ? goalMap[Object.keys(goalMap).find(key => goalKey.includes(key))!]
    : input.programGoal;

  return `${input.programLength} ${goalName} Program`;
}

/**
 * Generate program overview
 */
function generateOverview(input: ProgramGeneratorInput): string {
  return `This ${input.programLength} program is designed to help you achieve your goal of ${input.programGoal}. ` +
    `Training ${input.daysPerWeek} days per week with ${input.timePerWorkout}-minute sessions, ` +
    `this program is tailored for ${input.experienceLevel} level athletes.\n\n` +
    `The program utilizes ${input.equipment.join(', ')} and follows a ${input.trainingStyle} approach. ` +
    `Each workout is carefully structured to maximize results while ensuring proper recovery and injury prevention.\n\n` +
    (input.injuries ? `Special considerations have been made for: ${input.injuries}.\n\n` : '') +
    `Progress will be tracked through progressive overload, ensuring continuous improvement throughout the program duration.`;
}

/**
 * Generate weekly split description
 */
function generateWeeklySplit(input: ProgramGeneratorInput): string {
  const splits: Record<number, string> = {
    2: 'Full Body Split - 2 comprehensive full-body sessions per week',
    3: 'Push/Pull/Legs Split - Balanced training across all muscle groups',
    4: 'Upper/Lower Split - Alternating upper and lower body focus',
    5: 'Push/Pull/Legs/Upper/Lower - High-frequency training with varied focus',
    6: 'Push/Pull/Legs x2 - Double frequency for advanced athletes',
    7: 'Daily Training - Varied intensity and focus each day',
  };

  return splits[input.daysPerWeek] || `${input.daysPerWeek} training days per week with balanced programming`;
}

/**
 * Generate workout days based on input
 */
function generateWorkoutDays(input: ProgramGeneratorInput): WorkoutDay[] {
  const days: WorkoutDay[] = [];
  const dayTemplates = getDayTemplates(input);

  for (let i = 0; i < input.daysPerWeek; i++) {
    const template = dayTemplates[i % dayTemplates.length];
    days.push(generateWorkoutDay(template, input, i + 1));
  }

  return days;
}

/**
 * Get day templates based on training style and days per week
 */
function getDayTemplates(input: ProgramGeneratorInput): string[] {
  if (input.daysPerWeek <= 2) {
    return ['Full Body A', 'Full Body B'];
  } else if (input.daysPerWeek === 3) {
    return ['Push', 'Pull', 'Legs'];
  } else if (input.daysPerWeek === 4) {
    return ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'];
  } else if (input.daysPerWeek === 5) {
    return ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body'];
  } else {
    return ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];
  }
}

/**
 * Generate a single workout day
 */
function generateWorkoutDay(template: string, input: ProgramGeneratorInput, dayNumber: number): WorkoutDay {
  const exercises = generateExercises(template, input);
  
  return {
    day: `Workout ${dayNumber} - ${template}`,
    exercises,
    warmUp: generateWarmUp(template),
    coolDown: generateCoolDown(template),
    notes: generateDayNotes(template, input),
    aiGenerated: true,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate exercises for a workout day
 */
function generateExercises(template: string, input: ProgramGeneratorInput): Exercise[] {
  const exerciseDatabase = getExerciseDatabase();
  const templateExercises = exerciseDatabase[template] || exerciseDatabase['Full Body A'];
  
  // Filter exercises based on available equipment
  const availableExercises = templateExercises.filter(ex => 
    ex.equipment.some(eq => input.equipment.includes(eq))
  );

  // Adjust exercise count based on workout duration
  const exerciseCount = Math.min(
    Math.floor(input.timePerWorkout / 10),
    availableExercises.length
  );

  return availableExercises.slice(0, exerciseCount).map((ex, index) => ({
    name: ex.name,
    sets: getSetsForLevel(input.experienceLevel),
    reps: getRepsForGoal(input.programGoal),
    weight: getWeightGuidance(input.experienceLevel),
    restSeconds: getRestTime(input.trainingStyle),
    notes: ex.notes,
    substitutions: ex.substitutions,
    aiGenerated: true,
    generatedAt: new Date().toISOString(),
  }));
}

/**
 * Get sets based on experience level
 */
function getSetsForLevel(level: string): number {
  const setMap: Record<string, number> = {
    'beginner': 3,
    'intermediate': 4,
    'advanced': 5,
  };
  return setMap[level] || 3;
}

/**
 * Get reps based on goal
 */
function getRepsForGoal(goal: string): string {
  const goalLower = goal.toLowerCase();
  
  if (goalLower.includes('strength')) return '4-6';
  if (goalLower.includes('hypertrophy') || goalLower.includes('muscle')) return '8-12';
  if (goalLower.includes('endurance')) return '15-20';
  if (goalLower.includes('weight loss') || goalLower.includes('fat loss')) return '12-15';
  
  return '8-12'; // Default
}

/**
 * Get weight guidance based on experience
 */
function getWeightGuidance(level: string): string {
  const weightMap: Record<string, string> = {
    'beginner': 'Light to Moderate',
    'intermediate': 'Moderate to Heavy',
    'advanced': 'Heavy',
  };
  return weightMap[level] || 'Moderate';
}

/**
 * Get rest time based on training style
 */
function getRestTime(style: string): number {
  const styleLower = style.toLowerCase();
  
  if (styleLower.includes('strength') || styleLower.includes('power')) return 180;
  if (styleLower.includes('hypertrophy')) return 90;
  if (styleLower.includes('endurance') || styleLower.includes('hiit')) return 45;
  if (styleLower.includes('circuit')) return 30;
  
  return 90; // Default
}

/**
 * Generate warm-up routine
 */
function generateWarmUp(template: string): string {
  return `5-10 minutes of light cardio (walking, cycling, or rowing) followed by dynamic stretching. ` +
    `Include mobility work for the primary muscle groups targeted in this session. ` +
    `Perform 1-2 light warm-up sets of the first exercise before working sets.`;
}

/**
 * Generate cool-down routine
 */
function generateCoolDown(template: string): string {
  return `5-10 minutes of static stretching focusing on the muscle groups worked during this session. ` +
    `Hold each stretch for 20-30 seconds. Include foam rolling if available. ` +
    `Finish with light cardio to gradually lower heart rate.`;
}

/**
 * Generate day-specific notes
 */
function generateDayNotes(template: string, input: ProgramGeneratorInput): string {
  return `Focus on proper form and controlled movement throughout all exercises. ` +
    `Adjust weight as needed to maintain good technique. ` +
    (input.injuries ? `Be mindful of: ${input.injuries}. ` : '') +
    `Track your weights and reps to ensure progressive overload.`;
}

/**
 * Generate progression guidance
 */
function generateProgressionGuidance(input: ProgramGeneratorInput): string {
  const weeks = parseInt(input.programLength.split(' ')[0]) || 8;
  const phase1 = Math.ceil(weeks / 3);
  const phase2 = Math.ceil(weeks * 2 / 3);
  
  return `Week 1-${phase1}: Focus on learning proper form and technique. Use moderate weights that allow you to complete all reps with good form.\n\n` +
    `Week ${phase1 + 1}-${phase2}: Begin progressive overload. Increase weight by 5-10% when you can complete all sets with proper form. ` +
    `Alternatively, add 1-2 reps per set.\n\n` +
    `Week ${phase2 + 1}-${weeks}: Continue progressive overload. Consider adding an extra set to main lifts or reducing rest periods slightly. ` +
    `Focus on maintaining intensity while managing fatigue.\n\n` +
    `General Rule: Only increase weight when you can complete all prescribed sets and reps with excellent form.`;
}

/**
 * Generate safety notes
 */
function generateSafetyNotes(input: ProgramGeneratorInput): string {
  return `Always warm up properly before training. Stop immediately if you experience sharp pain. ` +
    `Maintain proper form throughout all exercises - never sacrifice form for heavier weight. ` +
    `Stay hydrated and ensure adequate nutrition to support your training. ` +
    `Get 7-9 hours of sleep per night for optimal recovery. ` +
    (input.injuries ? `Pay special attention to: ${input.injuries}. Consult with a healthcare professional if pain persists. ` : '') +
    `Listen to your body and take rest days when needed.`;
}

/**
 * Exercise database with equipment requirements
 */
function getExerciseDatabase(): Record<string, Array<{
  name: string;
  equipment: string[];
  notes: string;
  substitutions: string[];
}>> {
  return {
    'Push': [
      {
        name: 'Barbell Bench Press',
        equipment: ['Barbell', 'Machines'],
        notes: 'Keep shoulder blades retracted. Lower bar to mid-chest. Press explosively.',
        substitutions: ['Dumbbell Bench Press', 'Machine Chest Press', 'Push-ups'],
      },
      {
        name: 'Overhead Press',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Maintain core stability. Avoid excessive back arch. Press straight overhead.',
        substitutions: ['Dumbbell Shoulder Press', 'Machine Shoulder Press', 'Pike Push-ups'],
      },
      {
        name: 'Incline Dumbbell Press',
        equipment: ['Dumbbells', 'Machines'],
        notes: 'Set bench to 30-45 degrees. Control the descent. Full range of motion.',
        substitutions: ['Incline Barbell Press', 'Cable Chest Press', 'Decline Push-ups'],
      },
      {
        name: 'Tricep Dips',
        equipment: ['Bodyweight', 'Machines'],
        notes: 'Keep elbows close to body. Lower until upper arms parallel to ground.',
        substitutions: ['Close-grip Bench Press', 'Cable Tricep Pushdowns', 'Diamond Push-ups'],
      },
      {
        name: 'Lateral Raises',
        equipment: ['Dumbbells', 'Cables', 'Resistance Bands'],
        notes: 'Slight bend in elbows. Raise to shoulder height. Control the descent.',
        substitutions: ['Cable Lateral Raises', 'Band Lateral Raises', 'Machine Lateral Raises'],
      },
    ],
    'Pull': [
      {
        name: 'Barbell Rows',
        equipment: ['Barbell'],
        notes: 'Hinge at hips. Keep back flat. Pull to lower chest. Squeeze shoulder blades.',
        substitutions: ['Dumbbell Rows', 'Cable Rows', 'Inverted Rows'],
      },
      {
        name: 'Pull-ups',
        equipment: ['Bodyweight'],
        notes: 'Full range of motion. Pull chest to bar. Control the descent.',
        substitutions: ['Lat Pulldowns', 'Assisted Pull-ups', 'Band-assisted Pull-ups'],
      },
      {
        name: 'Face Pulls',
        equipment: ['Cables', 'Resistance Bands'],
        notes: 'Pull to face level. External rotation at end. Focus on rear delts.',
        substitutions: ['Band Face Pulls', 'Reverse Flyes', 'Rear Delt Rows'],
      },
      {
        name: 'Barbell Curls',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Keep elbows stationary. Full range of motion. Control the negative.',
        substitutions: ['Dumbbell Curls', 'Cable Curls', 'Hammer Curls'],
      },
      {
        name: 'Seated Cable Rows',
        equipment: ['Cables', 'Machines'],
        notes: 'Keep torso upright. Pull to lower chest. Squeeze at contraction.',
        substitutions: ['Machine Rows', 'Dumbbell Rows', 'Resistance Band Rows'],
      },
    ],
    'Legs': [
      {
        name: 'Barbell Squats',
        equipment: ['Barbell', 'Machines'],
        notes: 'Depth to parallel or below. Keep chest up. Drive through heels.',
        substitutions: ['Goblet Squats', 'Leg Press', 'Bulgarian Split Squats'],
      },
      {
        name: 'Romanian Deadlifts',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Hinge at hips. Keep back flat. Feel stretch in hamstrings.',
        substitutions: ['Dumbbell RDLs', 'Good Mornings', 'Leg Curls'],
      },
      {
        name: 'Walking Lunges',
        equipment: ['Dumbbells', 'Bodyweight'],
        notes: 'Step forward. Lower back knee to ground. Push through front heel.',
        substitutions: ['Stationary Lunges', 'Bulgarian Split Squats', 'Step-ups'],
      },
      {
        name: 'Leg Press',
        equipment: ['Machines'],
        notes: 'Feet shoulder-width. Lower until 90 degrees. Press through full foot.',
        substitutions: ['Squats', 'Goblet Squats', 'Bulgarian Split Squats'],
      },
      {
        name: 'Calf Raises',
        equipment: ['Dumbbells', 'Machines', 'Bodyweight'],
        notes: 'Full range of motion. Pause at top. Control the descent.',
        substitutions: ['Machine Calf Raises', 'Single-leg Calf Raises', 'Seated Calf Raises'],
      },
    ],
    'Upper Body': [
      {
        name: 'Bench Press',
        equipment: ['Barbell', 'Dumbbells', 'Machines'],
        notes: 'Retract shoulder blades. Lower to chest. Press explosively.',
        substitutions: ['Dumbbell Press', 'Machine Press', 'Push-ups'],
      },
      {
        name: 'Barbell Rows',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Hinge at hips. Pull to lower chest. Squeeze shoulder blades.',
        substitutions: ['Dumbbell Rows', 'Cable Rows', 'Inverted Rows'],
      },
      {
        name: 'Overhead Press',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Core tight. Press straight up. Full lockout at top.',
        substitutions: ['Dumbbell Press', 'Machine Press', 'Pike Push-ups'],
      },
      {
        name: 'Pull-ups',
        equipment: ['Bodyweight'],
        notes: 'Full range. Pull chest to bar. Control descent.',
        substitutions: ['Lat Pulldowns', 'Assisted Pull-ups', 'Band Pull-ups'],
      },
      {
        name: 'Dumbbell Curls',
        equipment: ['Dumbbells'],
        notes: 'Elbows stationary. Full range. Squeeze at top.',
        substitutions: ['Barbell Curls', 'Cable Curls', 'Hammer Curls'],
      },
    ],
    'Lower Body': [
      {
        name: 'Squats',
        equipment: ['Barbell', 'Dumbbells', 'Bodyweight'],
        notes: 'Depth to parallel. Chest up. Drive through heels.',
        substitutions: ['Goblet Squats', 'Leg Press', 'Bulgarian Split Squats'],
      },
      {
        name: 'Deadlifts',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Flat back. Hinge at hips. Drive through floor.',
        substitutions: ['Romanian Deadlifts', 'Trap Bar Deadlifts', 'Kettlebell Swings'],
      },
      {
        name: 'Leg Press',
        equipment: ['Machines'],
        notes: 'Feet shoulder-width. Lower to 90 degrees. Press through full foot.',
        substitutions: ['Squats', 'Goblet Squats', 'Bulgarian Split Squats'],
      },
      {
        name: 'Leg Curls',
        equipment: ['Machines'],
        notes: 'Control the movement. Full range. Squeeze at contraction.',
        substitutions: ['Romanian Deadlifts', 'Nordic Curls', 'Glute-Ham Raises'],
      },
      {
        name: 'Calf Raises',
        equipment: ['Dumbbells', 'Machines', 'Bodyweight'],
        notes: 'Full range. Pause at top. Control descent.',
        substitutions: ['Machine Calf Raises', 'Single-leg Calf Raises', 'Seated Calf Raises'],
      },
    ],
    'Full Body A': [
      {
        name: 'Squats',
        equipment: ['Barbell', 'Dumbbells', 'Bodyweight'],
        notes: 'Depth to parallel. Chest up. Drive through heels.',
        substitutions: ['Goblet Squats', 'Leg Press', 'Bulgarian Split Squats'],
      },
      {
        name: 'Bench Press',
        equipment: ['Barbell', 'Dumbbells', 'Machines'],
        notes: 'Retract shoulder blades. Lower to chest. Press explosively.',
        substitutions: ['Dumbbell Press', 'Machine Press', 'Push-ups'],
      },
      {
        name: 'Barbell Rows',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Hinge at hips. Pull to lower chest. Squeeze shoulder blades.',
        substitutions: ['Dumbbell Rows', 'Cable Rows', 'Inverted Rows'],
      },
      {
        name: 'Overhead Press',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Core tight. Press straight up. Full lockout at top.',
        substitutions: ['Dumbbell Press', 'Machine Press', 'Pike Push-ups'],
      },
      {
        name: 'Romanian Deadlifts',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Hinge at hips. Keep back flat. Feel stretch in hamstrings.',
        substitutions: ['Dumbbell RDLs', 'Good Mornings', 'Leg Curls'],
      },
    ],
    'Full Body B': [
      {
        name: 'Deadlifts',
        equipment: ['Barbell', 'Dumbbells'],
        notes: 'Flat back. Hinge at hips. Drive through floor.',
        substitutions: ['Romanian Deadlifts', 'Trap Bar Deadlifts', 'Kettlebell Swings'],
      },
      {
        name: 'Incline Press',
        equipment: ['Barbell', 'Dumbbells', 'Machines'],
        notes: 'Set bench to 30-45 degrees. Full range of motion.',
        substitutions: ['Flat Bench Press', 'Cable Press', 'Decline Push-ups'],
      },
      {
        name: 'Pull-ups',
        equipment: ['Bodyweight'],
        notes: 'Full range. Pull chest to bar. Control descent.',
        substitutions: ['Lat Pulldowns', 'Assisted Pull-ups', 'Band Pull-ups'],
      },
      {
        name: 'Lunges',
        equipment: ['Dumbbells', 'Bodyweight'],
        notes: 'Step forward. Lower back knee. Push through front heel.',
        substitutions: ['Bulgarian Split Squats', 'Step-ups', 'Leg Press'],
      },
      {
        name: 'Face Pulls',
        equipment: ['Cables', 'Resistance Bands'],
        notes: 'Pull to face level. External rotation. Focus on rear delts.',
        substitutions: ['Band Face Pulls', 'Reverse Flyes', 'Rear Delt Rows'],
      },
    ],
  };
}

// Re-export other functions from the original module
export * from '@/lib/ai-program-generator';
