# AI Program Assistant - Phase 4 (Lite) Implementation
## Client Feedback & Adherence Tracking Loop

**Status**: ✅ Complete  
**Date**: January 2026  
**Version**: 4.0  
**Scope**: Minimal, non-blocking client feedback and adherence tracking

---

## Overview

Phase 4 (Lite) adds a lightweight feedback and adherence tracking loop that:

1. **Tracks workout completion** - Records when clients complete workouts
2. **Captures optional feedback** - Non-blocking post-workout difficulty ratings
3. **Generates risk signals** - Simple trainer-facing adherence indicators
4. **Improves AI suggestions** - Integrates adherence data into smart adjustments

All features are **optional, non-blocking, and degrade gracefully** if skipped.

---

## 1. Workout Completion Tracking

### Purpose
Record when clients complete workouts to track adherence patterns.

### Data Structure

#### ClientWorkoutActivity Collection
```typescript
interface ClientWorkoutActivity {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  clientId?: string;           // Client who completed the workout
  programId?: string;          // Program the workout belongs to
  workoutDayId?: string;       // Specific workout day/session ID
  completed?: boolean;         // Whether the workout was completed
  completedAt?: Date | string; // When the workout was completed
  notes?: string;              // Optional trainer/client notes
}
```

### Recording Completion

```typescript
import { recordWorkoutCompletion } from '@/lib/adherence-tracking';

// Record a completed workout
const completion = await recordWorkoutCompletion(
  clientId,
  programId,
  workoutDayId,
  'Felt strong today' // optional notes
);
```

### Idempotent Writes

The system prevents duplicate recordings:

```typescript
import { workoutCompletionExists } from '@/lib/adherence-tracking';

// Check if workout already recorded (within last hour)
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
const exists = await workoutCompletionExists(
  clientId,
  programId,
  workoutDayId,
  oneHourAgo
);

if (!exists) {
  await recordWorkoutCompletion(clientId, programId, workoutDayId);
}
```

---

## 2. Post-Workout Client Feedback

### Purpose
Capture optional, non-blocking difficulty ratings and feedback after workout completion.

### Data Structure

#### ClientWorkoutFeedback Collection
```typescript
interface ClientWorkoutFeedback {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  clientId?: string;           // Client providing feedback
  programId?: string;          // Program the feedback is about
  workoutActivityId?: string;  // Reference to the workout activity
  difficultyRating?: number;   // 1-5 scale (1=easy, 5=hard)
  feedbackNote?: string;       // Optional text feedback (max 200 chars)
  submittedAt?: Date | string; // When feedback was submitted
}
```

### Post-Workout Feedback Prompt

**Location**: `/src/components/ClientPortal/PostWorkoutFeedbackPrompt.tsx`

Mobile-friendly bottom sheet component that appears after workout completion:

```tsx
import PostWorkoutFeedbackPrompt from '@/components/ClientPortal/PostWorkoutFeedbackPrompt';

// In your workout completion page
const [showFeedback, setShowFeedback] = useState(false);

return (
  <>
    {showFeedback && (
      <PostWorkoutFeedbackPrompt
        clientId={clientId}
        programId={programId}
        workoutActivityId={activityId}
        workoutTitle="Leg Day"
        onClose={() => setShowFeedback(false)}
        onSuccess={() => console.log('Feedback submitted')}
      />
    )}
  </>
);
```

### Features

- **Non-blocking**: Users can skip feedback without penalty
- **Mobile-optimized**: Bottom sheet design for mobile devices
- **Simple UX**: 5-point difficulty scale + optional text field
- **Graceful degradation**: Works without feedback data
- **Auto-close**: Closes after successful submission

### Recording Feedback

```typescript
import { recordWorkoutFeedback } from '@/lib/adherence-tracking';

// Record feedback (only if user provides it)
const feedback = await recordWorkoutFeedback(
  clientId,
  programId,
  workoutActivityId,
  4, // difficulty rating (1-5)
  'Struggled with form on last set' // optional note
);
```

---

## 3. Adherence & Risk Signals

### Purpose
Generate simple, actionable signals for trainers to identify clients needing attention.

### Signal Types

```typescript
type AdherenceStatus = 'At Risk' | 'Too Hard' | 'Too Easy' | 'Inactive' | 'On Track';

interface ClientAdherenceSignal {
  clientId: string;
  status: AdherenceStatus;
  lastWorkoutDate?: Date;
  avgDifficulty?: number;
  missedWorkoutsLast7Days?: number;
  daysSinceLastActivity?: number;
  reason?: string;
}
```

### Signal Definitions

| Status | Condition | Action |
|--------|-----------|--------|
| **On Track** | Normal adherence & difficulty | No action needed |
| **At Risk** | Missed 2+ workouts in 7 days | Check in with client |
| **Too Hard** | Avg difficulty ≥4.5/5 | Reduce volume/intensity |
| **Too Easy** | Avg difficulty ≤2/5 | Increase intensity |
| **Inactive** | No activity for 7+ days | Urgent check-in |

### Getting Signals

```typescript
import {
  getClientAdherenceSignal,
  getTrainerClientAdherenceSignals,
} from '@/lib/adherence-tracking';

// Get signal for one client-program pair
const signal = await getClientAdherenceSignal(clientId, programId);
// Returns: { status: 'At Risk', reason: 'Missed 2 workouts in last 7 days', ... }

// Get signals for all trainer's clients
const allSignals = await getTrainerClientAdherenceSignals(trainerId);
// Returns: [{ clientId, status, reason, ... }, ...]
```

### Client Adherence Panel

**Location**: `/src/components/pages/TrainerDashboard/ClientAdherencePanel.tsx`

Trainer-facing dashboard showing:
- Summary counts (On Track, At Risk, Too Hard, Inactive)
- Client cards with status badges
- Last workout date
- 7-day activity summary (completed, missed, completion rate)
- Average difficulty rating
- Quick action buttons (message, view program)

**Usage**:
```tsx
import ClientAdherencePanel from '@/components/pages/TrainerDashboard/ClientAdherencePanel';

export default function TrainerDashboard() {
  return (
    <div>
      <ClientAdherencePanel />
    </div>
  );
}
```

---

## 4. AI Adjustment Input Integration

### Purpose
Use adherence and difficulty data to improve smart adjustment suggestions.

### Enhanced Adjustment Logic

The `generateSmartAdjustments()` function now accepts optional adherence data:

```typescript
import { generateSmartAdjustments } from '@/lib/program-performance-intelligence';

const suggestions = await generateSmartAdjustments(
  programId,
  clientId,
  trainerId,
  metrics,
  {
    avgDifficulty: 4.2,        // From feedback
    missedWorkoutsLast7Days: 2, // From activity
    completionRate: 75,         // From activity
  }
);
```

### Improved Suggestions

With adherence data, the system can now suggest:

1. **Load Increase** - High completion + low difficulty
2. **Volume Decrease** - High difficulty + missed workouts
3. **Frequency Change** - Low completion + multiple missed sessions
4. **Deload Week** - Predicted drop-off week
5. **Exercise Swap** - High substitution rate
6. **Too Easy Adjustment** - Low difficulty + high completion

### Data Flow

```
Client completes workout
    ↓
Records completion (ClientWorkoutActivity)
    ↓
Provides feedback (ClientWorkoutFeedback)
    ↓
System calculates adherence signal
    ↓
Signal feeds into smart adjustment logic
    ↓
Trainer reviews suggestions
    ↓
Trainer approves/edits/ignores
    ↓
Program updated (if approved)
```

---

## 5. Utility Functions

### Activity Summary

Get completion statistics for a client-program:

```typescript
import { getActivitySummary } from '@/lib/adherence-tracking';

const summary = await getActivitySummary(clientId, programId, 7);
// Returns: {
//   completed: 5,
//   missed: 1,
//   total: 6,
//   completionRate: 83,
//   period: 'Last 7 days'
// }
```

### Recent Feedback

Get feedback from the last N days:

```typescript
import { getRecentFeedback } from '@/lib/adherence-tracking';

const feedback = await getRecentFeedback(clientId, programId, 7);
// Returns: [
//   { difficultyRating: 4, feedbackNote: '...', submittedAt: Date },
//   { difficultyRating: 3, feedbackNote: '...', submittedAt: Date },
// ]
```

---

## Implementation Checklist

### Collections Created
- ✅ `ClientWorkoutActivity` - Tracks workout completion
- ✅ `ClientWorkoutFeedback` - Stores difficulty ratings and notes

### Services Implemented
- ✅ `adherence-tracking.ts` - Core adherence logic
- ✅ Enhanced `program-performance-intelligence.ts` - AI integration

### Components Created
- ✅ `PostWorkoutFeedbackPrompt.tsx` - Mobile-friendly feedback UI
- ✅ `ClientAdherencePanel.tsx` - Trainer dashboard panel

### Features
- ✅ Workout completion recording
- ✅ Optional feedback collection
- ✅ Risk signal generation
- ✅ Adherence dashboard
- ✅ AI adjustment integration
- ✅ Idempotent writes
- ✅ Graceful degradation

---

## Design Principles

### 1. Minimal Schema
- Only essential fields (clientId, programId, completed, difficulty)
- No complex relationships or nested data
- Flat structure for easy querying

### 2. Non-Blocking
- Feedback is completely optional
- Skipping doesn't affect core functionality
- No penalties or gamification

### 3. Trainer-Approved
- All AI suggestions require trainer approval
- No automatic program modifications
- Trainers maintain full control

### 4. Graceful Degradation
- System works without feedback data
- Signals are generated from activity alone
- Missing data doesn't break functionality

### 5. Idempotent Writes
- Duplicate submissions prevented
- Safe to retry failed requests
- No data corruption from retries

---

## Usage Examples

### Example 1: Client Completes Workout

```typescript
// In client portal workout completion page
import { recordWorkoutCompletion } from '@/lib/adherence-tracking';

const handleWorkoutComplete = async () => {
  // Record completion
  const activity = await recordWorkoutCompletion(
    clientId,
    programId,
    'workout-day-1',
    'Completed all sets with good form'
  );

  // Show feedback prompt
  setShowFeedback(true);
};
```

### Example 2: Trainer Reviews Adherence

```typescript
// In trainer dashboard
import { getTrainerClientAdherenceSignals } from '@/lib/adherence-tracking';

useEffect(() => {
  const loadSignals = async () => {
    const signals = await getTrainerClientAdherenceSignals(trainerId);
    
    // Filter for at-risk clients
    const atRisk = signals.filter(s => s.status === 'At Risk');
    
    // Show alerts for inactive clients
    const inactive = signals.filter(s => s.status === 'Inactive');
  };
  
  loadSignals();
}, [trainerId]);
```

### Example 3: AI Uses Adherence Data

```typescript
// In program editor or AI assistant
import { generateSmartAdjustments, getActivitySummary } from '@/lib/adherence-tracking';
import { generateSmartAdjustments as generateAdjustments } from '@/lib/program-performance-intelligence';

const getSmartSuggestions = async () => {
  // Get adherence data
  const activity = await getActivitySummary(clientId, programId, 7);
  const feedback = await getRecentFeedback(clientId, programId, 7);
  
  const avgDifficulty = feedback.length > 0
    ? feedback.reduce((sum, f) => sum + f.difficultyRating, 0) / feedback.length
    : undefined;

  // Generate suggestions with adherence context
  const suggestions = await generateAdjustments(
    programId,
    clientId,
    trainerId,
    metrics,
    {
      avgDifficulty,
      missedWorkoutsLast7Days: activity.missed,
      completionRate: activity.completionRate,
    }
  );

  return suggestions;
};
```

---

## What's NOT Included

This is a **Lite** implementation. The following are intentionally excluded:

- ❌ **Leaderboards** - No competitive features
- ❌ **Streaks** - No gamification
- ❌ **Multi-trainer features** - Single trainer per program
- ❌ **Automatic adjustments** - All changes require approval
- ❌ **Heavy analytics** - Simple signals only
- ❌ **Notifications** - No push/email alerts
- ❌ **Predictions** - No ML-based forecasting
- ❌ **Comparisons** - No client-to-client metrics

---

## Data Privacy & Security

### Minimal Data Collection
- Only essential workout and feedback data
- No tracking of non-workout activities
- No location or device data

### Access Control
- Clients only see their own data
- Trainers only see their assigned clients
- Admins have full access

### Data Retention
- Activity records kept indefinitely
- Feedback records kept for 12 months
- Automatic cleanup of orphaned records

---

## Performance Considerations

### Query Optimization
- Filter by clientId and programId first
- Limit date range queries to 7-30 days
- Cache adherence signals for 1 hour

### Scalability
- Flat schema allows efficient indexing
- No complex joins or aggregations
- Batch operations for multiple clients

### Example Optimization

```typescript
// ❌ Inefficient - loads all records
const { items } = await BaseCrudService.getAll('clientworkoutactivity');
const filtered = items.filter(a => a.clientId === clientId);

// ✅ Better - filter in query if possible
// (Note: Current API doesn't support filtering, so above is necessary)
// In future, could add collection-level filtering
```

---

## Testing Checklist

### Unit Tests
- [ ] `recordWorkoutCompletion()` - Creates activity record
- [ ] `recordWorkoutFeedback()` - Validates rating (1-5)
- [ ] `getClientAdherenceSignal()` - Calculates correct status
- [ ] `workoutCompletionExists()` - Prevents duplicates

### Integration Tests
- [ ] Feedback prompt appears after completion
- [ ] Adherence panel loads and displays signals
- [ ] Smart adjustments use adherence data
- [ ] Graceful degradation without feedback

### User Tests
- [ ] Feedback prompt is easy to use on mobile
- [ ] Skipping feedback doesn't cause errors
- [ ] Trainer can understand adherence signals
- [ ] Suggestions are actionable

---

## Troubleshooting

### Issue: Adherence signals not updating
**Solution**: Check that `ClientWorkoutActivity` records are being created. Verify `clientId` and `programId` match.

### Issue: Feedback prompt not appearing
**Solution**: Ensure `PostWorkoutFeedbackPrompt` is rendered after workout completion. Check that `workoutActivityId` is valid.

### Issue: Smart adjustments not using adherence data
**Solution**: Pass adherence data object to `generateSmartAdjustments()`. Verify feedback records exist in database.

### Issue: Duplicate workout completions
**Solution**: Use `workoutCompletionExists()` before recording. Check that timestamps are accurate.

---

## Future Enhancements

### Phase 4.1 - Notifications
- Email alerts for at-risk clients
- In-app notifications for adherence changes
- Trainer preference settings

### Phase 4.2 - Advanced Signals
- Trend detection (improving/declining)
- Predictive drop-off warnings
- Seasonal patterns

### Phase 4.3 - Client Insights
- Personal progress dashboard
- Difficulty trends over time
- Workout history export

### Phase 4.4 - Team Features
- Shared adherence benchmarks
- Team-wide patterns
- Trainer comparison (anonymized)

---

## Summary

Phase 4 (Lite) successfully adds a minimal, non-blocking feedback and adherence tracking loop that:

✅ **Tracks** workout completion with simple records  
✅ **Captures** optional difficulty ratings and feedback  
✅ **Generates** actionable risk signals for trainers  
✅ **Improves** AI suggestions with real adherence data  
✅ **Maintains** trainer control and approval  
✅ **Degrades** gracefully without feedback  
✅ **Scales** efficiently with minimal schema  

All while keeping the implementation lean, focused, and easy to maintain.

---

## Support & Questions

For implementation questions:
- Review code examples in this document
- Check component prop types
- Examine test files for usage patterns

For feature requests:
- Document use case
- Describe expected behavior
- Provide example data
