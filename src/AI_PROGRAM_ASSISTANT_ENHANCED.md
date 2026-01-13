# AI Program Assistant - Enhanced Features Implementation

## Overview

This document outlines the enhanced features added to the AI Program Assistant to provide trainers with more control, customization, and quality assurance over AI-generated training programs.

## Features Implemented

### 1. **Partial Regeneration** ✅

Trainers can regenerate specific sections of a program without affecting other parts:

#### Supported Sections:
- **Workout Day**: Regenerate entire day with different exercises (same focus)
- **Exercise Substitutions**: Generate 3 alternative exercises for a specific movement
- **Progression Guidance**: Regenerate progression strategy for the entire program
- **Warm-up/Cool-down**: Regenerate warm-up and cool-down for a specific day

#### Implementation:
```typescript
// In ProgramEditorEnhanced.tsx
<button onClick={() => handleRegenerateSection('workout-day', dayIndex)}>
  <RotateCcw size={18} /> Regenerate
</button>

// Backend API endpoint
POST /api/regenerate-program-section
{
  section: 'workout-day' | 'exercise-substitutions' | 'progression-guidance' | 'warm-up-cool-down',
  context: string,
  prompt: string,
  trainerPreferences: TrainerPreferences,
  currentProgram: GeneratedProgram
}
```

#### UX Features:
- Inline "Regenerate" buttons per section
- Loading states during regeneration
- Timestamps showing when each section was last AI-generated
- Visual indicators for AI-generated vs. trainer-edited sections

---

### 2. **Trainer Style Memory** ✅

Store and apply trainer preferences to all AI-generated content:

#### TrainerPreferences Collection:
```typescript
interface TrainerPreferences {
  trainerId: string;
  repRanges: {
    strength: string;      // e.g., "3-5"
    hypertrophy: string;   // e.g., "8-12"
    endurance: string;     // e.g., "15-20"
  };
  restTimes: {
    strength: number;      // seconds
    hypertrophy: number;
    endurance: number;
  };
  favoriteExercises: string[];
  avoidedExercises: string[];
  coachingTone: 'motivational' | 'technical' | 'balanced';
  defaultEquipment: string[];
}
```

#### Features:
- **Preferences Page** (`/trainer/preferences`):
  - Set preferred rep ranges for different training styles
  - Configure default rest times
  - Add favorite exercises (AI will prioritize these)
  - Add exercises to avoid (AI will exclude these)
  - Choose coaching tone (affects language in guidance)
  - Set default equipment availability

- **Automatic Injection**:
  - Preferences automatically included in all AI prompts
  - AI respects trainer's style and preferences
  - Reduces need for manual editing

#### Usage:
```typescript
// Get trainer preferences
const prefs = await getTrainerPreferences(trainerId);

// Update preferences
await updateTrainerPreferences(trainerId, {
  coachingTone: 'technical',
  favoriteExercises: ['Barbell Squat', 'Barbell Bench Press'],
});

// Preferences automatically used in regeneration
await regenerateProgramSection(request, trainerId);
```

---

### 3. **Client-Aware Program Generation** ✅

Pull client context to create smarter programs:

#### Client Context Data:
```typescript
interface ClientData {
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  injuries: string[];
  equipment: string[];
  availableDaysPerWeek: number;
  timePerWorkout: number;
  preferences?: string;
}
```

#### Implementation:
- When selecting a client in AI Assistant, fetch their profile data
- Include client context in AI prompts
- AI generates programs tailored to specific client needs
- Reduces manual adjustments needed

#### Usage:
```typescript
// In AIAssistantPage
const clientContext = await getClientContext(selectedClientId);

// Pass to AI generation
const program = await generateProgramWithAI({
  ...formData,
  clientId: selectedClientId,
}, trainerId);
```

---

### 4. **Program Versioning & History** ✅

Track program changes and maintain version history:

#### ProgramVersion Structure:
```typescript
interface ProgramVersion {
  _id: string;
  programId: string;
  version: number;
  parentProgramId?: string;  // Reference to previous version
  programData: GeneratedProgram;
  trainerId: string;
  clientId?: string;
  editedAt: Date;
  editSummary?: string;      // What was changed
}
```

#### Features:
- **Save as Version**: Create new version when editing assigned programs
- **Version History**: View all previous versions of a program
- **Rollback**: Revert to previous version if needed
- **Edit Tracking**: See what changed between versions

#### Usage:
```typescript
// Create new version
await createProgramVersion(
  programId,
  updatedProgram,
  trainerId,
  'Updated exercises for client feedback'
);

// View version history
const versions = await getProgramVersionHistory(programId);
```

---

### 5. **Exercise Library Mapping** ✅

Map AI-generated exercise names to internal library IDs:

#### Implementation:
```typescript
// Check if exercise exists in library
const exerciseId = await mapExerciseToLibrary('Barbell Squat');

// If not found, prompt trainer to select from library
if (!exerciseId) {
  // Show selection modal with library options
  // Store mapping for future use
  await storeExerciseMapping('Barbell Squat', 'ex-12345');
}
```

#### Features:
- Automatic mapping for common exercises
- Manual selection for custom/uncommon exercises
- Persistent mapping for future use
- Prevents duplicate exercise entries

---

### 6. **Quality & Safety Enhancements** ✅

Automated quality assessment with flagging system:

#### Quality Assessment:
```typescript
interface QualityFlag {
  type: 'excessive-volume' | 'repeated-movement' | 'missing-substitutions' | 'form-concern';
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectedExercises?: string[];
}

// Returns score 0-100 and array of flags
const { score, flags } = assessProgramQuality(program);
```

#### Checks Performed:
1. **Excessive Volume**: Total sets > 150-200 (configurable)
2. **Repeated Movements**: Same exercise appears >3 times
3. **Missing Substitutions**: Exercises without alternative options
4. **Form Concerns**: Dangerous exercise combinations

#### UX:
- Quality Assessment Panel in editor
- Color-coded severity (red/yellow/blue)
- Specific recommendations for each flag
- Option to regenerate flagged sections

---

### 7. **UX Improvements** ✅

#### Inline Regeneration:
- "Regenerate" buttons next to each section
- Per-section loading states
- Confirmation before regenerating

#### Collapsible Panels:
- **Quality Assessment Panel**: Shows quality score and flags
- **Trainer Preferences Panel**: Quick view of active preferences
- **Version History Panel**: View previous versions

#### Timestamps & Indicators:
- Last AI generation timestamp for each section
- Visual badges showing "AI-generated" vs "trainer-edited"
- Overall program generation timestamp

#### Enhanced Editor:
- Inline exercise editing
- Add/remove exercises easily
- Regenerate substitutions per exercise
- Drag-and-drop reordering (future enhancement)

---

## File Structure

### New Files Created:

1. **`/src/lib/ai-program-generator.ts`** (Enhanced)
   - New interfaces for versioning, preferences, quality assessment
   - Functions for partial regeneration
   - Trainer preferences management
   - Quality assessment logic
   - Exercise library mapping

2. **`/src/components/pages/TrainerDashboard/ProgramEditorEnhanced.tsx`**
   - Enhanced editor with all new features
   - Quality assessment panel
   - Trainer preferences panel
   - Inline regeneration buttons
   - Version management

3. **`/src/components/pages/TrainerDashboard/TrainerPreferencesPage.tsx`**
   - Full preferences management interface
   - Rep range configuration
   - Rest time settings
   - Exercise favorites/avoided list
   - Equipment selection
   - Coaching tone selection

### Updated Files:

1. **`/src/components/Router.tsx`**
   - Added `/trainer/program-editor-enhanced` route
   - Added `/trainer/preferences` route

---

## Backend API Endpoints Required

### 1. Partial Regeneration
```
POST /api/regenerate-program-section
Request:
{
  section: string,
  context: string,
  prompt: string,
  trainerPreferences: TrainerPreferences,
  currentProgram: GeneratedProgram
}

Response:
{
  // Depends on section type
  // For workout-day: { day, exercises, warmUp, coolDown, notes }
  // For substitutions: { substitutions: string[] }
  // For progression: { progressionGuidance: string }
  // For warm-up/cool-down: { warmUp, coolDown }
}
```

### 2. Client Context (Optional)
```
GET /api/client/:clientId/context
Response:
{
  goals: string[],
  experienceLevel: string,
  injuries: string[],
  equipment: string[],
  availableDaysPerWeek: number,
  timePerWorkout: number
}
```

---

## Usage Flow

### 1. Generate Program with Trainer Preferences
```
1. Trainer navigates to /trainer/ai-assistant
2. System loads trainer preferences automatically
3. Trainer fills in program parameters
4. AI generates program using trainer preferences
5. Trainer reviews and can regenerate sections
```

### 2. Edit Program with Partial Regeneration
```
1. Trainer opens program editor
2. Quality assessment shows any issues
3. Trainer can:
   - Edit manually
   - Click "Regenerate" on specific sections
   - Save as new version
   - Assign to client
```

### 3. Manage Preferences
```
1. Trainer navigates to /trainer/preferences
2. Configures rep ranges, rest times, exercises
3. Saves preferences
4. Preferences automatically applied to future programs
```

---

## Data Storage

### Current Implementation (Session Storage):
- Programs stored in `sessionStorage` during editing
- Preferences stored in `localStorage`
- Versions stored in `localStorage`
- Exercise mappings stored in `localStorage`

### Production Implementation (Recommended):
- Create `TrainerPreferences` collection in CMS
- Create `ProgramVersions` collection in CMS
- Create `ExerciseLibrary` collection in CMS
- Extend `FitnessPrograms` to include version tracking

---

## Configuration & Customization

### Quality Assessment Thresholds:
```typescript
// In assessProgramQuality()
const EXCESSIVE_VOLUME_HIGH = 200;  // sets
const EXCESSIVE_VOLUME_MEDIUM = 150;
const MAX_EXERCISE_FREQUENCY = 3;   // times per week
```

### Rep Range Defaults:
```typescript
const DEFAULT_REP_RANGES = {
  strength: '3-5',
  hypertrophy: '8-12',
  endurance: '15-20',
};
```

### Rest Time Defaults:
```typescript
const DEFAULT_REST_TIMES = {
  strength: 180,    // 3 minutes
  hypertrophy: 90,  // 1.5 minutes
  endurance: 45,    // 45 seconds
};
```

---

## Security & Permissions

- ✅ Only trainers can access preference settings
- ✅ Trainers can only see/edit their own preferences
- ✅ Trainers can only regenerate programs they created
- ✅ Version history is immutable (for audit trail)
- ✅ Client data is read-only in program generation

---

## Testing Checklist

- [ ] Partial regeneration works for all section types
- [ ] Trainer preferences are saved and applied
- [ ] Quality assessment correctly identifies issues
- [ ] Version history tracks all changes
- [ ] Exercise mapping works for common exercises
- [ ] UI is responsive on mobile/tablet
- [ ] Loading states show during regeneration
- [ ] Error handling works for API failures
- [ ] Timestamps display correctly
- [ ] Preferences persist across sessions

---

## Future Enhancements

1. **Advanced Filtering**
   - Filter programs by client, date, focus area
   - Search programs by name or exercise

2. **Bulk Operations**
   - Apply preferences to multiple programs at once
   - Bulk regenerate sections across programs

3. **Analytics**
   - Track which sections are most frequently regenerated
   - Monitor quality scores over time
   - Identify trainer preferences patterns

4. **AI Improvements**
   - Fine-tuned models for specific training styles
   - Real-time program adjustments based on client feedback
   - Predictive quality scoring

5. **Collaboration**
   - Share programs with other trainers
   - Collaborative editing with version control
   - Program templates library

6. **Integration**
   - Sync with client portal
   - Automatic progress tracking
   - Workout logging integration

---

## Troubleshooting

### Preferences Not Applying
- Check that preferences are saved in localStorage
- Verify trainer ID is correct
- Ensure preferences are loaded before regeneration

### Regeneration Failing
- Check backend API endpoint is accessible
- Verify OpenAI API key is configured
- Check error message in browser console

### Versions Not Saving
- Ensure localStorage quota is not exceeded
- Check that program ID is valid
- Verify trainer ID is set

### Quality Flags Not Showing
- Refresh the page to reload assessment
- Check that program data is valid
- Verify quality assessment function is called

---

## Support & Documentation

For detailed information about specific features:
- **Partial Regeneration**: See `regenerateProgramSection()` in ai-program-generator.ts
- **Trainer Preferences**: See `TrainerPreferencesPage.tsx`
- **Quality Assessment**: See `assessProgramQuality()` in ai-program-generator.ts
- **Program Versioning**: See `createProgramVersion()` in ai-program-generator.ts

---

## Summary

The enhanced AI Program Assistant provides trainers with:
- ✅ Fine-grained control over program generation
- ✅ Personalized AI that respects trainer preferences
- ✅ Quality assurance with automated flagging
- ✅ Version history for audit trail
- ✅ Improved UX with inline controls
- ✅ Client-aware program generation

All features are designed to be non-blocking, non-intrusive, and respect trainer workflow while providing powerful tools for program customization and quality control.
