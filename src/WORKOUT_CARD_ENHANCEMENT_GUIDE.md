# Workout Card Enhancement Implementation Guide

## Overview
This guide documents the enhanced workout card display system for the client portal. The implementation adds configurable session metadata to workout cards while maintaining backward compatibility with existing programs.

## What Was Changed

### 1. **CMS Fields Added to ClientPrograms Collection**
Three new optional fields have been added to support enhanced workout card display:

- **sessionDescription** (TEXT)
  - One-line focus for the workout session
  - Example: "Full Body Foundations"
  - Optional - hidden if not provided
  - Displayed under the "Training X" title

- **estimatedDuration** (TEXT)
  - Time estimate for completing the session
  - Example: "~20–30 minutes" or "Express session"
  - Optional - hidden if not provided
  - Displayed with a clock icon in the card footer

- **exerciseCountLabel** (TEXT)
  - Custom label for the number of exercises
  - Example: "focused movements", "compound exercises", "short, focused session"
  - Optional - defaults to "focused movements" if not provided
  - Replaces the generic "exercises" label

### 2. **Visual Hierarchy Enhancements**

#### "Next Up" Card Styling
- **Ring accent**: Subtle `ring-2 ring-soft-bronze/50` applied to the next recommended workout
- **Background tint**: Light `bg-soft-bronze/10` applied to the header
- **Enhanced badge**: Stronger contrast with `bg-soft-bronze text-soft-white border-soft-bronze`
- **Adaptive styling**: Badge adjusts when card is active (white text on darker background)

#### Card Layout Improvements
- **Multi-line header**: Title, description, and metadata are now clearly separated
- **Responsive spacing**: Better visual hierarchy with improved gaps and margins
- **Flexible metadata row**: Exercise count and duration display side-by-side with wrapping support

### 3. **Utility Functions**

New utility module: `/src/lib/workout-card-utils.ts`

Key functions:
- `extractWorkoutCardMetadata()` - Extracts session metadata from workout exercises
- `getDefaultExerciseCountLabel()` - Provides sensible fallback labels based on exercise count
- `formatExerciseCount()` - Formats exercise count with label
- `getNextUpCardClasses()` - Returns CSS classes for "Next up" card styling
- `getNextUpHeaderClasses()` - Returns CSS classes for "Next up" header styling
- `getNextUpBadgeClasses()` - Returns CSS classes for "Next up" badge styling

### 4. **Updated Components**

#### MyProgramPage.tsx
- Imports new utility functions from `workout-card-utils.ts`
- Uses `extractWorkoutCardMetadata()` to pull session data from exercises
- Applies enhanced styling classes for "Next up" cards
- Displays session description, exercise count label, and duration when available

## How to Use

### For New Programs
When creating or editing programs in the CMS:

1. **Set Session Description** (optional)
   - Add a one-line focus for each workout day
   - Example: "Full Body Foundations" or "Lower Body Strength"
   - This will appear directly under the "Training X" title

2. **Set Exercise Count Label** (optional)
   - Customize how the exercise count is described
   - Examples: "focused movements", "compound exercises", "short, focused session"
   - If not set, defaults to "focused movements"

3. **Set Estimated Duration** (optional)
   - Add a time estimate for the session
   - Examples: "~20–30 minutes", "Express session", "45 min"
   - Displays with a clock icon

### For Existing Programs
- All existing programs continue to work without modification
- New fields are optional and hidden if not populated
- Default fallback: "focused movements" for exercise count label

## Visual Examples

### Before Enhancement
```
Training 1
2 exercises
```

### After Enhancement (with CMS data)
```
Training 1
Full Body Foundations
2 focused movements  ~20–30 minutes
```

### "Next Up" Card (with visual hierarchy)
```
┌─────────────────────────────────────┐  ← ring-2 ring-soft-bronze/50
│ Training 1  [Next up]               │  ← bg-soft-bronze/10
│ Full Body Foundations               │
│ 2 focused movements  ~20–30 minutes │
└─────────────────────────────────────┘
```

## Backward Compatibility

✅ **Fully backward compatible**
- Existing programs without new fields continue to work
- Default values are applied automatically
- No breaking changes to existing data or logic

## Scope

These enhancements apply to:
- ✅ Client portal workout cards (MyProgramPage)
- ✅ "Next up" visual hierarchy
- ✅ All client-facing workout displays

These enhancements do NOT affect:
- ❌ Exercise content or session logic
- ❌ Trainer dashboard program creation
- ❌ Workout completion tracking
- ❌ Exercise modifications or feedback

## Future Enhancements

Potential improvements for future iterations:
1. **Auto-expand "Next up" card** - Automatically expand the next recommended workout
2. **Session type icons** - Visual indicators for session type (strength, cardio, etc.)
3. **Difficulty badges** - Show session difficulty level
4. **Trainer-side UI** - Add fields to trainer program editor for easier configuration
5. **Dynamic duration calculation** - Auto-calculate based on exercise count and rest times

## Testing Checklist

- [ ] Verify new CMS fields appear in the database
- [ ] Test with programs that have all three new fields populated
- [ ] Test with programs that have only some fields populated
- [ ] Test with programs that have no new fields (backward compatibility)
- [ ] Verify "Next up" card styling displays correctly
- [ ] Verify responsive layout on mobile and desktop
- [ ] Verify default fallback values work correctly
- [ ] Test with different exercise count values (1, 2, 3, 5+)
- [ ] Verify clock icon displays with duration
- [ ] Verify session description displays correctly

## CMS Configuration Reference

### Collection: clientprograms
**New Fields:**

| Field Name | Type | Required | Example |
|---|---|---|---|
| sessionDescription | TEXT | No | "Full Body Foundations" |
| estimatedDuration | TEXT | No | "~20–30 minutes" |
| exerciseCountLabel | TEXT | No | "focused movements" |

**Note:** These fields are stored at the exercise level but represent session-level metadata. The system extracts these values from the first exercise of each day to apply them to the entire workout session.

## Support & Questions

For questions about implementation or configuration:
1. Review the utility functions in `/src/lib/workout-card-utils.ts`
2. Check the MyProgramPage component for usage examples
3. Refer to the CMS collection schema for field definitions
