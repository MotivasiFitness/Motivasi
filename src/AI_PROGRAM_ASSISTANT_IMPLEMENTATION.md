# AI Program Assistant Implementation Guide

## Overview

The AI Program Assistant is a comprehensive feature that allows trainers to generate customized training programs using OpenAI's API. The system includes:

1. **Input Form** - Collect program parameters from trainers
2. **AI Generation** - Call OpenAI API to generate structured programs
3. **Review & Edit** - Review generated programs and make adjustments
4. **Save & Assign** - Save as templates or assign to clients
5. **Program Editor** - Full editing interface for customization

## Architecture

### Components

#### 1. **AIAssistantPage** (`/src/components/pages/TrainerDashboard/AIAssistantPage.tsx`)
- Main interface for program generation
- Collects trainer input (goal, length, days/week, experience level, equipment, time, injuries, style)
- Shows loading state during AI generation
- Displays generated program for review
- Handles save and edit actions

#### 2. **ProgramEditorPage** (`/src/components/pages/TrainerDashboard/ProgramEditorPage.tsx`)
- Full editing interface for generated programs
- Edit program name, duration, focus area, overview
- Edit individual workout days (warm-up, cool-down, notes)
- Add/edit/delete exercises
- Save changes, save as template, or assign to client

#### 3. **AI Generator Service** (`/src/lib/ai-program-generator.ts`)
- Core logic for program generation
- Handles API calls to OpenAI
- Validates input and generated programs
- Manages program storage (session storage + database)
- Provides functions for saving, loading, updating programs

### Data Flow

```
Trainer Input
    ↓
AIAssistantPage (Input Form)
    ↓
generateProgramWithAI() → OpenAI API
    ↓
Validate Generated Program
    ↓
AIAssistantPage (Review)
    ↓
Edit → ProgramEditorPage
    ↓
Save as Draft/Template/Assign to Client
    ↓
Database (FitnessPrograms collection)
```

## Input Parameters

### ProgramGeneratorInput Interface

```typescript
interface ProgramGeneratorInput {
  programGoal: string;           // e.g., "Build strength and muscle"
  programLength: string;         // e.g., "8 weeks", "12 weeks"
  daysPerWeek: number;           // 1-7
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];           // e.g., ["dumbbells", "barbell"]
  timePerWorkout: number;        // 15-180 minutes
  injuries: string;              // e.g., "Lower back pain, knee issues"
  trainingStyle: string;         // e.g., "Strength Building", "HIIT"
  additionalNotes?: string;      // Optional additional context
}
```

## Generated Program Structure

### GeneratedProgram Interface

```typescript
interface GeneratedProgram {
  programName: string;           // e.g., "12-Week Strength Builder"
  overview: string;              // Program description and approach
  duration: string;              // e.g., "12 weeks"
  focusArea: string;             // e.g., "Strength Building"
  weeklySplit: string;           // e.g., "Upper/Lower Split"
  workoutDays: WorkoutDay[];     // Array of workout days
  progressionGuidance: string;   // How to progress through program
  safetyNotes: string;           // Important safety information
  aiGenerated: boolean;          // Always true for AI-generated programs
}

interface WorkoutDay {
  day: string;                   // e.g., "Monday - Chest & Triceps"
  exercises: Exercise[];         // Array of exercises
  warmUp: string;                // Warm-up instructions
  coolDown: string;              // Cool-down instructions
  notes: string;                 // Day-specific notes
}

interface Exercise {
  name: string;                  // e.g., "Barbell Bench Press"
  sets: number;                  // e.g., 4
  reps: string;                  // e.g., "6-8", "8-10"
  weight?: string;               // Optional weight recommendation
  restSeconds: number;           // Rest between sets
  notes: string;                 // Exercise-specific notes
  substitutions: string[];       // Alternative exercises
}
```

## API Integration

### Backend Endpoint Required

The frontend expects a backend endpoint at `/api/generate-program`:

```typescript
POST /api/generate-program
Content-Type: application/json

Request Body:
{
  programGoal: string,
  programLength: string,
  daysPerWeek: number,
  experienceLevel: string,
  equipment: string[],
  timePerWorkout: number,
  injuries: string,
  trainingStyle: string,
  additionalNotes?: string,
  trainerId: string
}

Response:
{
  programName: string,
  overview: string,
  duration: string,
  focusArea: string,
  weeklySplit: string,
  workoutDays: WorkoutDay[],
  progressionGuidance: string,
  safetyNotes: string,
  aiGenerated: boolean
}
```

### Backend Implementation (Node.js/Express Example)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/generate-program', async (req, res) => {
  try {
    const {
      programGoal,
      programLength,
      daysPerWeek,
      experienceLevel,
      equipment,
      timePerWorkout,
      injuries,
      trainingStyle,
      additionalNotes,
      trainerId,
    } = req.body;

    // Validate input
    if (!programGoal || !equipment.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build prompt
    const prompt = `
      Create a detailed ${programLength} training program with the following specifications:
      
      Goal: ${programGoal}
      Days per week: ${daysPerWeek}
      Experience level: ${experienceLevel}
      Available equipment: ${equipment.join(', ')}
      Time per workout: ${timePerWorkout} minutes
      Injuries/Limitations: ${injuries || 'None'}
      Training style: ${trainingStyle}
      Additional notes: ${additionalNotes || 'None'}
      
      Generate a complete program in JSON format with:
      - Program name
      - Overview (2-3 sentences)
      - Duration
      - Focus area
      - Weekly split description
      - Array of workout days with:
        - Day name
        - Warm-up instructions
        - Array of exercises (name, sets, reps, rest seconds, notes, substitutions)
        - Cool-down instructions
        - Day notes
      - Progression guidance
      - Safety notes
      
      Ensure the program is:
      - Safe and appropriate for the experience level
      - Realistic and achievable
      - Specific with exercise names, sets, reps, and rest periods
      - Includes modifications for the mentioned injuries
      - Fits within the time constraint per workout
      - Uses only the available equipment
      
      Return ONLY valid JSON, no markdown or extra text.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    // Parse response
    const content = response.choices[0].message.content;
    const program = JSON.parse(content);

    // Validate program structure
    if (!program.programName || !program.workoutDays) {
      return res.status(500).json({ error: 'Invalid program structure' });
    }

    // Return program
    res.json(program);
  } catch (error) {
    console.error('Error generating program:', error);
    res.status(500).json({ error: 'Failed to generate program' });
  }
});
```

## Usage Flow

### 1. Generate Program

```typescript
// In AIAssistantPage
const program = await generateProgramWithAI(formData, trainerId);
// Shows loading state, then displays generated program
```

### 2. Review Program

```typescript
// Trainer reviews the generated program
// Can see:
// - Program name, duration, focus area
// - Overview and weekly split
// - All workout days with exercises
// - Safety notes and progression guidance
```

### 3. Edit Program

```typescript
// Trainer clicks "Edit Program"
// Navigates to ProgramEditorPage
// Can edit:
// - Program metadata (name, duration, focus area)
// - Workout day details (warm-up, cool-down, notes)
// - Individual exercises (add, edit, delete)
// - Progression guidance
```

### 4. Save Program

#### Option A: Save as Draft
```typescript
const programId = await saveProgramDraft(program, trainerId);
// Saves to database with status='Draft'
// Can be edited later
```

#### Option B: Save as Template
```typescript
await saveProgramAsTemplate(programId, templateName);
// Saves as reusable template
// Can be used for multiple clients
```

#### Option C: Assign to Client
```typescript
const assignedProgramId = await assignProgramToClient(programId, clientId);
// Creates client-specific copy
// Saves with status='Assigned'
// Client can see in their portal
```

## Database Schema

### FitnessPrograms Collection

The existing `FitnessPrograms` collection stores:

```typescript
interface FitnessPrograms {
  _id: string;                    // Unique ID
  programName?: string;           // Program name
  description?: string;           // Program overview
  duration?: string;              // Duration (e.g., "12 weeks")
  focusArea?: string;             // Focus area
  status?: string;                // 'Draft', 'Template', 'Assigned'
  trainerId?: string;             // Trainer who created it
  clientId?: string;              // Client assigned to (if applicable)
  // Additional fields for AI-generated programs:
  // aiGenerated?: boolean;        // Indicates AI-generated
  // createdByTrainerId?: string;  // Trainer who created it
  // weeklySplit?: string;         // Weekly split description
  // progressionGuidance?: string; // How to progress
}
```

**Note:** Full program details (workout days, exercises) are currently stored in session storage. For production, extend the schema to include a `programData` JSON field or create a separate `ProgramDetails` collection.

## Session Storage

Programs are stored in session storage during the current session:

```typescript
// Store program
sessionStorage.setItem(`program_${programId}`, JSON.stringify(program));

// Load program
const program = JSON.parse(sessionStorage.getItem(`program_${programId}`));

// Store template
sessionStorage.setItem(`template_${templateId}`, JSON.stringify(template));
```

**Note:** Session storage is cleared when the browser tab closes. For persistent storage, implement a backend collection for program details.

## Safety & Validation

### Input Validation

```typescript
validateProgramInput(input): void
// Validates:
// - Program goal is not empty
// - Program length is specified
// - Days per week is 1-7
// - Experience level is valid
// - At least one equipment type selected
// - Time per workout is 15-180 minutes
// - Training style is specified
```

### Generated Program Validation

```typescript
validateGeneratedProgram(program): void
// Validates:
// - Program has name and overview
// - Has at least one workout day
// - Each day has name and exercises
// - Each exercise has valid sets (1-10)
// - Rest periods are 0-300 seconds
```

### Safety Check

```typescript
isSafeProgram(program): boolean
// Checks for:
// - Dangerous keywords in program text
// - Excessive exercise counts (>15 per day)
// - Excessive sets per exercise (>10)
// - Returns false if unsafe patterns detected
```

## Error Handling

### Non-Blocking Errors

The implementation ensures that:

1. **AI Generation Errors** - Don't prevent signup or block other features
2. **Validation Errors** - Show user-friendly messages
3. **API Errors** - Graceful fallback with retry option
4. **Safety Issues** - Prevent unsafe programs from being saved

### Error Messages

```typescript
// User-friendly error messages
"Failed to generate program: [specific error]"
"Please fill in all required fields"
"Generated program contains unsafe recommendations"
"Failed to save program draft"
"Failed to assign program to client"
```

## Routes

### Trainer Dashboard Routes

```typescript
// AI Assistant
/trainer/ai-assistant          // Generate programs
/trainer/program-editor        // Edit programs
/trainer/programs              // Create/manage programs (existing)
```

### Navigation

Add to trainer navigation:

```typescript
<Link to="/trainer/ai-assistant">
  <Sparkles size={20} />
  AI Program Assistant
</Link>
```

## Features

### 1. Program Generation
- ✅ Collect trainer input
- ✅ Call OpenAI API
- ✅ Validate generated program
- ✅ Show loading state
- ✅ Display results

### 2. Program Review
- ✅ Show program overview
- ✅ Display all workout days
- ✅ Show exercises with details
- ✅ Display safety notes
- ✅ Option to edit or save

### 3. Program Editing
- ✅ Edit program metadata
- ✅ Edit workout days
- ✅ Add/edit/delete exercises
- ✅ Save changes
- ✅ Save as template
- ✅ Assign to client

### 4. Program Management
- ✅ Save as draft
- ✅ Save as template
- ✅ Assign to client
- ✅ Track program status
- ✅ Mark as AI-generated

## Testing

### Test Cases

1. **Generate Program**
   - Valid input → generates program
   - Missing required fields → shows error
   - Invalid experience level → shows error

2. **Review Program**
   - Generated program displays correctly
   - All sections visible
   - Edit button works

3. **Edit Program**
   - Can edit program metadata
   - Can add/edit/delete exercises
   - Changes persist in session

4. **Save Program**
   - Save as draft → creates database entry
   - Save as template → stores template
   - Assign to client → creates client copy

5. **Safety**
   - Unsafe programs rejected
   - Dangerous keywords detected
   - Excessive exercises prevented

## Troubleshooting

### Program Not Generating

1. Check OpenAI API key is set
2. Verify API endpoint is accessible
3. Check network connection
4. Review error message for details

### Program Not Saving

1. Verify database connection
2. Check trainer ID is valid
3. Ensure required fields are filled
4. Check browser console for errors

### Program Not Loading in Editor

1. Verify session storage has program
2. Check browser's storage quota
3. Try refreshing page
4. Check browser console for errors

## Future Enhancements

1. **Program Templates Library**
   - Pre-built templates by focus area
   - Community templates
   - Template ratings/reviews

2. **Advanced Editing**
   - Drag-and-drop exercise reordering
   - Exercise library with video demos
   - Bulk exercise editing

3. **Program Variations**
   - Generate multiple program options
   - A/B testing different approaches
   - Client feedback integration

4. **Analytics**
   - Track program completion rates
   - Monitor client progress
   - Program effectiveness metrics

5. **Integration**
   - Sync with client portal
   - Automatic progress tracking
   - Workout logging

6. **AI Improvements**
   - Fine-tuned models for fitness
   - Real-time program adjustments
   - Injury-specific recommendations

## Security Considerations

1. **API Key Protection**
   - Store OpenAI API key on backend only
   - Never expose in frontend code
   - Use environment variables

2. **Data Privacy**
   - Don't send sensitive client data to OpenAI
   - Anonymize trainer/client IDs
   - Comply with data protection regulations

3. **Access Control**
   - Only trainers can generate programs
   - Trainers can only see their own programs
   - Clients can only see assigned programs

4. **Input Validation**
   - Validate all user inputs
   - Sanitize before sending to API
   - Prevent injection attacks

## Performance Optimization

1. **Caching**
   - Cache generated programs in session
   - Reuse templates to avoid regeneration
   - Cache API responses

2. **Lazy Loading**
   - Load workout days on demand
   - Paginate exercise lists
   - Defer non-critical data

3. **Async Operations**
   - Use async/await for API calls
   - Show loading states
   - Don't block UI during generation

## Conclusion

The AI Program Assistant provides trainers with a powerful tool to generate customized training programs efficiently. The implementation is safe, user-friendly, and extensible for future enhancements.

For questions or issues, refer to the troubleshooting section or check the browser console for detailed error messages.
