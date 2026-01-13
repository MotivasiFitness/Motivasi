# Workout Assignment System Implementation Guide

## Overview

This document describes the new **Workout Assignment System** that provides clean mapping between the Trainer Hub and Client Portal. The system uses a slot-based weekly assignment model (Workout 1-4) to replace the day-based system.

## Architecture

### 1. Database Schema

#### New Collection: `ClientAssignedWorkouts`

**Collection ID:** `clientassignedworkouts`

**Fields:**
- `_id` (text, system) - Unique identifier
- `_createdDate` (datetime, system) - Creation timestamp
- `_updatedDate` (datetime, system) - Last update timestamp
- `clientId` (text) - Reference to client member ID
- `trainerId` (text) - Reference to trainer member ID
- `weekStartDate` (date) - Monday of the week (ISO 8601)
- `weekNumber` (number) - Optional week number (1-52)
- `workoutSlot` (number) - Slot number 1-4 (required)
- `status` (text) - 'active' or 'archived'
- `programTitle` (text) - Program name
- `sessionTitle` (text) - Session name (e.g., "Workout 1")
- `workoutDay` (text) - Optional day name (e.g., "Monday")
- `exerciseName` (text) - Exercise name
- `sets` (number) - Number of sets
- `reps` (number) - Number of reps
- `weightOrResistance` (text) - Weight/resistance description
- `tempo` (text) - Tempo (e.g., "3-1-2")
- `restTimeSeconds` (number) - Rest time in seconds
- `exerciseNotes` (text) - Coach notes/form cues
- `exerciseOrder` (number) - Order within the workout
- `exerciseVideoUrl` (url) - Video demonstration link
- `notes` (text) - Additional notes

**Uniqueness Constraint:**
Only one active assignment per (clientId, weekStartDate, workoutSlot) combination.

### 2. Service Layer

**File:** `/src/lib/workout-assignment-service.ts`

#### Key Functions

##### Week Management
```typescript
getWeekStartDate(date?: Date): Date
// Returns Monday of the given week

getWeekEndDate(date?: Date): Date
// Returns Sunday of the given week

formatWeekDisplay(weekStartDate: Date | string): string
// Returns "Week of Aug 12" format

getDaysSinceUpdate(updatedDate?: Date | string): string
// Returns "Updated today", "Updated 3 days ago", etc.
```

##### Workout Queries
```typescript
getActiveWorkoutsForCurrentWeek(clientId: string): Promise<ClientAssignedWorkouts[]>
// Returns active workouts for current week, sorted by workoutSlot ASC

getActiveWorkoutsForWeek(clientId: string, weekStartDate: Date | string): Promise<ClientAssignedWorkouts[]>
// Returns active workouts for specific week, sorted by workoutSlot ASC

getTrainerWorkoutsForCurrentWeek(trainerId: string): Promise<ClientAssignedWorkouts[]>
// Returns all active workouts for trainer's clients in current week

getTrainerWorkoutsForWeek(trainerId: string, weekStartDate: Date | string): Promise<ClientAssignedWorkouts[]>
// Returns all active workouts for trainer's clients in specific week
```

##### Conflict Management
```typescript
checkWorkoutConflict(
  clientId: string,
  weekStartDate: Date | string,
  workoutSlot: number
): Promise<ClientAssignedWorkouts | null>
// Returns existing assignment if conflict found, null otherwise
```

##### Assignment Operations
```typescript
assignWorkout(
  clientId: string,
  trainerId: string,
  weekStartDate: Date | string,
  workoutSlot: number,
  workoutData: Partial<ClientAssignedWorkouts>,
  replaceConflict?: boolean
): Promise<{ success: boolean; workoutId: string; conflictFound?: boolean; message?: string }>
// Creates new assignment, handles conflicts

updateWorkout(workoutId: string, updates: Partial<ClientAssignedWorkouts>): Promise<void>
// Updates existing workout

deleteWorkout(workoutId: string): Promise<void>
// Deletes workout

archivePreviousWeekWorkouts(clientId: string): Promise<void>
// Archives previous week's workouts (marks as 'archived')
```

## Components

### 1. Trainer Dashboard: Workout Assignment Page

**File:** `/src/components/pages/TrainerDashboard/WorkoutAssignmentPage.tsx`

**Features:**
- View current week's workouts for assigned clients
- Create new workout assignments with conflict detection
- Edit existing workouts
- Delete workouts
- Replace conflicting assignments
- Display "Week of Aug 12" header
- Show "Updated X days ago" for each workout

**Workflow:**
1. Trainer selects a client from their assigned clients
2. Trainer selects a workout slot (1-4)
3. Trainer fills in exercise details (name, sets, reps, weight, tempo, rest time, notes, video URL)
4. System checks for conflicts
5. If conflict found, prompt trainer to replace
6. If no conflict, create assignment
7. Workouts display in sidebar sorted by slot

**Route:** `/trainer/workout-assignment`

### 2. Client Portal: My Program Page (Updated)

**File:** `/src/components/pages/ClientPortal/MyProgramPage.tsx`

**Features:**
- Automatic detection of new system (checks for active assignments)
- Falls back to legacy system if no assignments found
- Displays "Workout 1", "Workout 2", "Workout 3", "Workout 4" labels
- Shows week start date ("Week of Aug 12")
- Shows "Updated X days ago" for each workout
- Displays exercise details (name, sets, reps, weight, tempo, rest time, notes, video)
- Allows marking workouts as complete
- Responsive design for mobile and desktop

**Rendering Logic:**
1. Fetch active assignments for current week
2. Sort by workoutSlot ASC
3. Display in cards with "Workout N" label
4. Show week context and update timing
5. Expand to show exercise details
6. Mark complete functionality

**Route:** `/portal/program`

## Workflow: Weekly Update Process

### For Trainers

**Current Week:**
1. Trainer navigates to `/trainer/workout-assignment`
2. Selects a client
3. For each slot (1-4):
   - Enters exercise details
   - System checks for conflicts
   - Creates or updates assignment
4. Workouts display in sidebar with update timestamps

**Previous Week:**
- Workouts remain visible but marked as 'archived'
- Can be deleted if needed
- Not displayed to clients

### For Clients

**Current Week:**
1. Client navigates to `/portal/program`
2. Sees "Workout 1", "Workout 2", "Workout 3", "Workout 4"
3. Each shows:
   - Exercise name
   - Sets × Reps
   - Suggested weight
   - "Updated X days ago"
4. Can expand to see full details
5. Can mark as complete

**Previous Weeks:**
- Not displayed (archived)
- Can be viewed in history if needed (future enhancement)

## Data Flow

### Assignment Creation

```
Trainer Form
    ↓
Check Conflict (clientId, weekStartDate, workoutSlot)
    ↓
Conflict Found?
    ├─ Yes → Prompt to Replace
    │         ├─ Yes → Archive Old → Create New
    │         └─ No → Cancel
    └─ No → Create New
    ↓
Update UI
    ↓
Client Sees Updated Workout
```

### Client Portal Display

```
Client Opens /portal/program
    ↓
Fetch Active Assignments (clientId, current week)
    ↓
Sort by workoutSlot ASC
    ↓
Render "Workout 1", "Workout 2", "Workout 3", "Workout 4"
    ↓
Show Exercise Details on Expand
    ↓
Allow Mark Complete
```

## API Integration

### BaseCrudService Usage

```typescript
// Create assignment
await BaseCrudService.create('clientassignedworkouts', {
  _id: crypto.randomUUID(),
  clientId: 'client-123',
  trainerId: 'trainer-456',
  weekStartDate: new Date('2024-01-08'),
  workoutSlot: 1,
  status: 'active',
  exerciseName: 'Barbell Squat',
  sets: 4,
  reps: 8,
  // ... other fields
});

// Get all assignments
const { items } = await BaseCrudService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');

// Update assignment
await BaseCrudService.update<ClientAssignedWorkouts>('clientassignedworkouts', {
  _id: 'workout-123',
  exerciseName: 'Dumbbell Squat',
  // ... other updates
});

// Delete assignment
await BaseCrudService.delete('clientassignedworkouts', 'workout-123');
```

## Error Handling

### Conflict Detection

When a trainer tries to assign a workout to a slot that already has an active assignment:

1. System detects conflict
2. Shows dialog with existing workout details
3. Prompts: "Replace this workout?"
4. If yes: Archives old, creates new
5. If no: Cancels operation

### Validation

- Client ID required
- Workout slot required (1-4)
- Exercise name required
- Week start date required
- Status defaults to 'active'

## Future Enhancements

1. **Workout History:** View archived workouts from previous weeks
2. **Bulk Assignment:** Assign same workout to multiple clients
3. **Templates:** Save workout templates for reuse
4. **Scheduling:** Auto-assign based on schedule
5. **Performance Tracking:** Link to performance metrics
6. **Progression:** Auto-suggest weight increases based on completion
7. **Mobile App:** Native mobile experience
8. **Notifications:** Notify clients of new assignments
9. **Comments:** Trainer-client comments on workouts
10. **Video Upload:** Clients upload form check videos

## Testing Checklist

- [ ] Create assignment without conflict
- [ ] Create assignment with conflict → Replace
- [ ] Create assignment with conflict → Cancel
- [ ] Update existing assignment
- [ ] Delete assignment
- [ ] View assignments in trainer dashboard
- [ ] View assignments in client portal
- [ ] Verify sorting by workoutSlot
- [ ] Verify week display format
- [ ] Verify update timestamp display
- [ ] Test mobile responsiveness
- [ ] Test fallback to legacy system
- [ ] Test with multiple clients
- [ ] Test with multiple weeks

## Migration Guide

### From Legacy System to New System

**Option 1: Gradual Migration**
1. Keep legacy system active
2. New assignments use new system
3. Clients see new system if assignments exist
4. Fall back to legacy if no assignments
5. Eventually deprecate legacy system

**Option 2: Bulk Migration**
1. Export all legacy assignments
2. Transform to new format
3. Import to new collection
4. Verify data integrity
5. Deactivate legacy system

**Recommended:** Option 1 (Gradual) for safety

## Configuration

### Week Start Day

Currently set to Monday (ISO 8601 standard).

To change:
```typescript
// In workout-assignment-service.ts
startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday, 0 = Sunday
```

### Workout Slots

Currently 4 slots per week (Workout 1-4).

To change:
```typescript
// Update UI to show [1, 2, 3, 4, 5, 6, 7] etc.
// Update validation to accept 1-N
```

## Performance Considerations

- Queries filter by clientId and weekStartDate for efficiency
- Consider indexing on (clientId, weekStartDate, workoutSlot)
- Sorting by workoutSlot is done in-memory (small dataset)
- Archive old workouts to keep active set small

## Security

- Only trainers can create/update assignments for their clients
- Only clients can view their own assignments
- Verify trainerId matches member._id before allowing updates
- Verify clientId matches member._id before allowing view

## Support

For issues or questions:
1. Check error messages in browser console
2. Verify collection exists in CMS
3. Verify fields match schema
4. Check member roles and permissions
5. Review service layer logs
