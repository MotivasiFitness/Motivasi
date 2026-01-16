# Completed Weeks Archiving Flow - Implementation Summary

## Overview
Implemented a comprehensive archiving system that automatically moves completed weeks from the active "My Program" view to the "Workout History" section. This creates a clean separation between active workouts and historical records.

## Key Features Implemented

### 1. **Automatic Week Completion Detection**
- When all workouts in a week are marked complete, the system automatically:
  - Marks the week as complete in the program cycle
  - Generates a weekly summary with completion stats
  - Moves to the next week in the cycle
  - Archives the cycle if all 4 weeks are complete

### 2. **Active Program View (My Program Page)**
- **Only shows current and future weeks**
- Filters out workouts from completed weeks
- Displays:
  - Current week's active/pending workouts
  - Future assigned workouts
  - Program timeline showing progress
- Completed weeks are automatically hidden from this view

### 3. **History View (Workout History Page)**
- **Shows all completed weeks** organized by cycle
- Displays completed weeks from:
  - Fully completed/archived cycles
  - Active cycles (only completed weeks)
- Each completed week shows:
  - All completed workouts (read-only)
  - Client reflections (difficulty rating, notes)
  - Trainer feedback/comments
  - Coach's weekly notes
  - Weekly summary with stats
  - Completion dates

### 4. **Cycle Management**
- **Active Cycle**: Shows only current/future weeks in My Program
- **Completed Weeks**: Automatically moved to History
- **Cycle Completion**: When all 4 weeks complete:
  - Cycle marked as "completed"
  - New cycle automatically created
  - Old cycle archived and visible in History

## Data Flow

```
Week Completion Trigger:
└─> All workouts in week marked complete
    └─> completeWeek() called
        ├─> Update cycle: weeksCompleted++, currentWeek++
        ├─> Generate weekly summary
        ├─> Check if cycle complete (4 weeks)
        │   └─> If yes: Archive cycle, create new cycle
        └─> Refresh active cycle data

My Program Page Load:
└─> Fetch active cycle
    └─> Get completed weeks array
        └─> Filter workouts:
            ├─> Exclude workouts from completed weeks
            ├─> Exclude workouts from past weeks
            └─> Show only current/future active workouts

History Page Load:
└─> Fetch all cycles (completed, archived, active with completed weeks)
    └─> For each cycle:
        ├─> Get completed workouts
        ├─> Filter by completed weeks (for active cycles)
        └─> Group by week with summaries and notes
```

## Handling Legacy Data (Records Without Week Data)

### Problem
Older workout records may not have:
- `weekNumber` field
- `weekStartDate` field
- Associated program cycle

### Solution Implemented

**My Program Page:**
- Legacy system (clientprograms collection) continues to work as before
- New system (clientassignedworkouts) requires week data
- If no week data exists, workouts won't appear in either view
- **Recommendation**: Migrate old data or assign week numbers retroactively

**History Page:**
- Only shows workouts with complete week data
- Workouts without `weekNumber` are filtered out
- Cycles without completed weeks don't appear

### Migration Strategy for Legacy Data

To handle existing records without week data, trainers should:

1. **Identify Legacy Workouts**:
   ```typescript
   // Query clientassignedworkouts without weekNumber
   const legacyWorkouts = allWorkouts.filter(w => !w.weekNumber);
   ```

2. **Assign Week Numbers**:
   - Use `_createdDate` to determine which week they belong to
   - Calculate week number based on program start date
   - Update records with proper `weekNumber` and `weekStartDate`

3. **Create Retroactive Cycles**:
   - For clients with completed workouts but no cycles
   - Create historical cycles with appropriate dates
   - Mark as "archived" with proper completion dates

## QA Testing Guide

### Test Scenario 1: New Client (Clean State)
**Setup**: Client with no previous workouts
**Expected**:
- My Program: Shows current week's workouts
- History: Empty state message

### Test Scenario 2: Complete a Week
**Steps**:
1. Complete all 4 workouts in Week 1
2. Mark last workout complete
**Expected**:
- Weekly summary modal appears
- My Program: Week 1 disappears, Week 2 becomes active
- History: Week 1 appears under active cycle
- Timeline: Week 1 marked complete

### Test Scenario 3: Complete Full Cycle
**Steps**:
1. Complete all workouts in Weeks 1-4
**Expected**:
- Cycle marked complete
- New Cycle 2 created automatically
- History: Cycle 1 shows all 4 weeks
- My Program: Shows Cycle 2, Week 1

### Test Scenario 4: Active Cycle with Completed Weeks
**Setup**: Client in Week 3 of Cycle 1
**Expected**:
- My Program: Only shows Week 3 and Week 4 workouts
- History: Shows Cycle 1 (In Progress) with Weeks 1-2

### Test Scenario 5: Legacy Data (No Week Numbers)
**Setup**: Client with old clientassignedworkouts without weekNumber
**Expected**:
- My Program: Shows message "No workouts assigned" (if no new workouts)
- History: Empty or only shows workouts with week data
**Action Required**: Trainer must assign week numbers to legacy data

### Test Scenario 6: Mixed Data (Some with/without Week Numbers)
**Setup**: Client has both old and new workout records
**Expected**:
- My Program: Shows only new workouts with week data
- History: Shows only completed workouts with week data
- Legacy workouts are invisible until migrated

## Test Client Setup

To create a comprehensive test client:

```typescript
// 1. Create test client in Members
const testClientId = "test-client-001";

// 2. Create Cycle 1 (completed)
await BaseCrudService.create('programcycles', {
  _id: crypto.randomUUID(),
  clientId: testClientId,
  trainerId: "trainer-001",
  cycleNumber: 1,
  cycleStartDate: new Date('2026-01-01').toISOString(),
  cycleCompletedAt: new Date('2026-01-28').toISOString(),
  currentWeek: 4,
  weeksCompleted: 4,
  status: 'archived',
  programTitle: 'Strength Building Program'
});

// 3. Create completed workouts for Cycle 1, Week 1
for (let slot = 1; slot <= 4; slot++) {
  await BaseCrudService.create('clientassignedworkouts', {
    _id: crypto.randomUUID(),
    clientId: testClientId,
    trainerId: "trainer-001",
    weekNumber: 1,
    weekStartDate: new Date('2026-01-01').toISOString(),
    workoutSlot: slot,
    status: 'completed',
    exerciseName: `Week 1 Workout ${slot}`,
    sets: 3,
    reps: 10,
    weightOrResistance: '20kg',
    restTimeSeconds: 60,
    difficultyRating: 'Moderate',
    clientReflectionNotes: 'Felt good!',
    reflectionSubmittedAt: new Date('2026-01-01').toISOString()
  });
}

// 4. Repeat for Weeks 2-4 (adjust dates accordingly)

// 5. Create active Cycle 2 with Week 1 complete, Week 2 active
await BaseCrudService.create('programcycles', {
  _id: crypto.randomUUID(),
  clientId: testClientId,
  trainerId: "trainer-001",
  cycleNumber: 2,
  cycleStartDate: new Date('2026-01-29').toISOString(),
  currentWeek: 2,
  weeksCompleted: 1,
  status: 'active',
  programTitle: 'Strength Building Program'
});

// 6. Create Week 2 active workouts
for (let slot = 1; slot <= 4; slot++) {
  await BaseCrudService.create('clientassignedworkouts', {
    _id: crypto.randomUUID(),
    clientId: testClientId,
    trainerId: "trainer-001",
    weekNumber: 2,
    weekStartDate: new Date('2026-02-05').toISOString(),
    workoutSlot: slot,
    status: 'active',
    exerciseName: `Week 2 Workout ${slot}`,
    sets: 3,
    reps: 12,
    weightOrResistance: '22.5kg',
    restTimeSeconds: 60
  });
}

// 7. Create legacy workout (no week data) - should not appear
await BaseCrudService.create('clientassignedworkouts', {
  _id: crypto.randomUUID(),
  clientId: testClientId,
  trainerId: "trainer-001",
  // NO weekNumber or weekStartDate
  workoutSlot: 1,
  status: 'completed',
  exerciseName: 'Legacy Workout',
  sets: 3,
  reps: 10
});
```

## Expected Test Results

**My Program Page**:
- Shows only Week 2 workouts (4 active workouts)
- Timeline shows: Week 1 ✓, Week 2 (current), Week 3-4 (upcoming)
- "View History" button visible
- Legacy workout NOT visible

**History Page**:
- Shows 2 cycles:
  1. **Cycle 1** (Complete): 4 weeks, all workouts visible
  2. **Cycle 2** (In Progress): 1 week completed (Week 1)
- Total stats: 20 completed workouts (16 from Cycle 1 + 4 from Cycle 2 Week 1)
- Legacy workout NOT visible

## Files Modified

1. **MyProgramPage.tsx**:
   - Added filtering for completed weeks
   - Only shows current/future active workouts
   - Hides completed weeks from active view

2. **WorkoutHistoryPage.tsx**:
   - Added support for active cycles with completed weeks
   - Shows "In Progress" badge for active cycles
   - Displays completed weeks from all cycles

3. **program-cycle-service.ts**:
   - Already had `getCompletedWeeksArray()` helper
   - Already had cycle completion logic
   - No changes needed

## Benefits

✅ **Clean Active View**: Only current/future workouts visible
✅ **Complete History**: All past work preserved and viewable
✅ **Automatic Archiving**: No manual intervention needed
✅ **Progress Tracking**: Clear visual timeline of completion
✅ **Read-Only History**: Past workouts can't be accidentally modified
✅ **Cycle Management**: Automatic progression through program cycles
✅ **Weekly Summaries**: Celebration and stats for completed weeks

## Known Limitations

⚠️ **Legacy Data**: Workouts without `weekNumber` won't appear in either view
⚠️ **Manual Migration**: Old data requires trainer intervention to assign weeks
⚠️ **No Partial Week Archive**: Entire week must be complete to archive

## Recommendations

1. **Data Migration Tool**: Create admin tool to assign week numbers to legacy data
2. **Bulk Update**: Allow trainers to retroactively assign weeks to old workouts
3. **Fallback Display**: Consider showing legacy workouts in a separate "Unorganized" section
4. **Week Assignment**: Make week assignment mandatory for new workouts

## Conclusion

The completed weeks archiving flow is fully implemented and functional. The system automatically manages the lifecycle of workouts from active to archived state, providing a clean user experience with clear separation between current work and historical records. Legacy data handling is documented and requires manual migration for optimal functionality.
