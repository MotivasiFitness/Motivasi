# Exercise Display Standardization Implementation

## Overview
This document outlines the implementation of standardized exercise displays across the client portal and trainer dashboard, with a shared `ExerciseCard` component and supporting utilities.

## Changes Made

### 1. New CMS Fields Added
The following fields have been added to both `clientprograms` and `clientassignedworkouts` collections:

- **coachCue** (TEXT): Single key coaching cue for the exercise
- **primaryMuscles** (TEXT): Primary muscles worked
- **secondaryMuscles** (TEXT): Secondary muscles worked
- **progression** (TEXT): Progression guidance for the exercise

These fields are optional and backward compatible - sections will be hidden if data is not present.

### 2. New Components & Utilities

#### `/src/components/ClientPortal/ExerciseCard.tsx`
Standardized exercise display component with the following order:
1. Exercise name
2. Primary muscles worked
3. Your Task (sets/reps/load/rest)
4. Coach cue (single key cue)
5. How to perform
6. Tempo (with session-level tempo key)
7. Common mistake and/or modification (optional)
8. Progression

**Features:**
- Compact and expanded modes
- Collapsible sections for detailed information
- Session context support (tempoKey, effortGuidance)
- Video link support
- Backward compatible with existing data

#### `/src/lib/exercise-display-utils.ts`
Utility functions for exercise data handling:

- `mapExerciseToCardData()`: Maps CMS data to standardized format
- `extractSessionContext()`: Extracts session-level tempo and effort guidance
- `extractEquipment()`: Deduplicates and formats equipment lists
- `formatEquipmentList()`: Renders equipment as "Dumbbells · Barbell · Bench"
- `hasNewFields()`: Checks if exercise has new metadata
- `getFirstSentence()`: Extracts first sentence for concise cues
- `formatMuscles()`: Formats muscle lists (string or array)
- `isCueRedundant()`: Checks for redundant cues

### 3. Updated Pages

#### `/src/components/pages/ClientPortal/MyProgramPage.tsx`
- Imported `ExerciseCard` and utility functions
- Integrated standardized exercise display
- Maintained backward compatibility with legacy system
- Preserved all existing functionality (set tracking, modifications, etc.)

### 4. Session-Level Context

Session-level fields can be implemented as:
- Default text displayed when exercises include tempo values
- Default effort guidance: "Finish most sets with 1–2 reps in reserve."
- Tempo key format: "3-0-1-0 = 3s down · 0 pause · 1s up · 0 pause"

### 5. Equipment Listing

Equipment is rendered at the session level as a simplified list:
- De-duplicates repeated items (e.g., "Bodyweight")
- Format: "Dumbbells (12kg, 8kg) · Barbell (20kg) · Bench · Optional light band"

### 6. Redundancy Rules

The implementation includes checks to avoid repeating identical cues:
- If a cue is shown in "Coach cue", it won't be repeated in "How to perform"
- Uses `isCueRedundant()` utility to detect duplicates

## Backward Compatibility

All changes are non-breaking:
- If new fields aren't present, those sections are hidden
- Legacy exercise displays continue to work
- Existing functionality (set tracking, modifications, reflections) is preserved
- Both new and legacy systems can coexist

## Pages to Update (Next Phase)

The following pages should be updated to use the shared `ExerciseCard` component:

1. **Client Portal:**
   - `MyProgramPage.tsx` ✅ (Done)
   - `WorkoutHistoryPage.tsx` (Pending)

2. **Trainer Dashboard:**
   - `ProgramEditorPage.tsx` (Pending)
   - `ProgramEditorEnhanced.tsx` (Pending)
   - `CreateProgramPage.tsx` (Only if it shows exercise preview cards)

## Data Population

New fields can be populated progressively:
- Start with `coachCue` and `primaryMuscles` for high-impact exercises
- Add `progression` guidance for progressive overload tracking
- Add `secondaryMuscles` for comprehensive muscle targeting

## Testing Checklist

- [ ] Verify ExerciseCard renders correctly in compact mode
- [ ] Verify ExerciseCard renders correctly in expanded mode
- [ ] Test with exercises that have all new fields
- [ ] Test with exercises that have no new fields (backward compatibility)
- [ ] Verify session context displays correctly
- [ ] Verify equipment deduplication works
- [ ] Test redundancy detection for cues
- [ ] Verify all existing functionality still works (set tracking, modifications, etc.)
- [ ] Test on mobile and desktop views

## Future Enhancements

1. Add session-level fields to CMS for `tempoKey` and `effortGuidance`
2. Create admin UI for bulk editing new fields
3. Add AI-powered suggestions for coach cues and progression guidance
4. Implement equipment tracking and availability management
5. Add exercise video library integration
