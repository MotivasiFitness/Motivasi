# Phase 4 (Lite) - Coach-Centered Client Retention Enhancements
## Coach-Initiated Check-Ins & Simple Progress Visibility

**Status**: ✅ Complete  
**Date**: January 2026  
**Version**: 4.1  
**Scope**: Coach-centered features for client retention, minimal schemas, trainer-initiated only

---

## Overview

Phase 4 (Lite) adds coach-centered features that empower trainers to proactively engage with clients while maintaining simplicity and control:

1. **Coach-Prompted Client Check-Ins** - Trainers identify at-risk clients and send personalized check-in messages
2. **Simple Progress Visibility** - Lightweight progress summaries for clients (no comparisons or streaks)
3. **Program Confidence Indicators** - Display-only badges showing program status and updates
4. **Minimal Risk Flags** - Simple trainer-only status indicators without analytics

All features reuse existing activity and feedback data, require trainer initiation, and degrade gracefully if unused.

---

## 1. Coach-Prompted Client Check-Ins

### Purpose
Enable trainers to proactively reach out to clients showing risk signals (missed workouts, high difficulty, inactivity).

### Data Structure

#### ClientCoachMessages Collection
```typescript
interface ClientCoachMessages {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  clientId?: string;           // Client receiving the message
  trainerId?: string;          // Trainer sending the message
  message?: string;            // The check-in message content
  reason?: string;             // Why the check-in was sent (At Risk, Too Hard, etc.)
  sentAt?: Date | string;      // When the message was sent
}
```

### Service: Coach Check-In Service

**Location**: `/src/lib/coach-checkin-service.ts`

#### Key Functions

```typescript
// Get clients needing check-ins
const prompts = await getClientsNeedingCheckIn(trainerId);
// Returns: [{ clientId, reason, reasonDescription, lastWorkoutDate, ... }]

// Send a check-in message
const message = await sendCoachCheckInMessage(
  clientId,
  trainerId,
  'Your personalized message...',
  'At Risk' // reason
);

// Get pre-filled message template
const template = getCheckInMessageTemplate('At Risk', 'Jane');
// Returns: Pre-written, editable message

// Check if recent check-in already sent
const hasRecent = await hasRecentCheckIn(clientId, trainerId, 24);
// Returns: boolean (prevents duplicate check-ins)

// Get recent check-in messages
const messages = await getRecentCheckInMessages(clientId, trainerId, 30);
// Returns: [{ message, reason, sentAt, ... }]
```

### UI Components

#### ClientsCheckInSection
**Location**: `/src/components/pages/TrainerDashboard/ClientsCheckInSection.tsx`

Trainer-facing dashboard section showing:
- **Clients to Check In With** - Sorted by risk level
  - Client ID (truncated)
  - Risk reason and description
  - Last workout date
  - Average difficulty rating
  - Missed workouts count
  - Status badge
  - "Send Check-In" button
  - "Dismiss" button

- **Recently Checked In** - Clients already contacted in last 24 hours
  - Shows as "Contacted" status
  - Prevents duplicate check-ins

- **Info Box** - Explains each risk status

**Usage**:
```tsx
import ClientsCheckInSection from '@/components/pages/TrainerDashboard/ClientsCheckInSection';

export default function TrainerDashboard() {
  return (
    <div>
      <ClientsCheckInSection />
    </div>
  );
}
```

#### CoachCheckInModal
**Location**: `/src/components/pages/TrainerDashboard/CoachCheckInModal.tsx`

Modal that opens when trainer clicks "Send Check-In":
- Pre-filled message template (editable)
- Risk reason and description displayed
- Character count
- "Cancel" and "Send Message" buttons
- Success confirmation with auto-close
- Error handling

**Features**:
- ✅ Pre-filled, trainer-approved templates
- ✅ Fully editable for personalization
- ✅ Non-blocking (can skip)
- ✅ Success confirmation
- ✅ Error handling

### Check-In Reasons

| Reason | Trigger | Template Focus |
|--------|---------|-----------------|
| **At Risk** | Missed 2+ workouts in 7 days | Check in on obstacles, offer support |
| **Too Hard** | Avg difficulty ≥4.5/5 | Offer to scale back, adjust intensity |
| **Too Easy** | Avg difficulty ≤2/5 | Suggest progression, increase challenge |
| **Inactive** | No activity for 7+ days | Urgent check-in, remove barriers |

### Message Templates

Pre-written templates for each reason (fully editable):

```typescript
// At Risk
"Hi [Name], I noticed you've missed a couple of workouts this week. 
I want to check in and see how you're doing. Is everything okay? 
If you're facing any challenges with the programme or your schedule, 
let me know and we can adjust things..."

// Too Hard
"Hi [Name], I've been reviewing your feedback, and it seems the current 
programme might be a bit challenging for you right now. Let's chat about 
this – we can scale things back or adjust the intensity..."

// Too Easy
"Hi [Name], Great news! It looks like you're finding the current programme 
manageable and even enjoying it. I think you're ready for the next level. 
Let's discuss how we can progress your training..."

// Inactive
"Hi [Name], I haven't seen you in the app for a while, and I wanted to 
check in. I'm here to support you, and if there's anything getting in the 
way of your training – whether it's motivation, time, or something else – 
let's talk about it..."
```

### Implementation Example

```typescript
// In trainer dashboard
import ClientsCheckInSection from '@/components/pages/TrainerDashboard/ClientsCheckInSection';

export default function TrainerDashboardPage() {
  return (
    <div className="space-y-12">
      {/* Other sections */}
      
      {/* Check-In Section */}
      <section>
        <h2 className="font-heading text-3xl font-bold mb-8">
          Client Engagement
        </h2>
        <ClientsCheckInSection />
      </section>
    </div>
  );
}
```

---

## 2. Simple Progress Visibility (Client-Facing)

### Purpose
Show clients lightweight progress summaries with positive reinforcement, no comparisons or streak pressure.

### Component: ProgressSummary
**Location**: `/src/components/ClientPortal/ProgressSummary.tsx`

Displays:
- **Programme Progress** - Week X of Y with progress bar
- **Weekly Activity** - Completed, Total, Completion Rate
- **Positive Reinforcement** - Context-aware encouraging messages

**Features**:
- ✅ Lightweight (no analytics or charts)
- ✅ Positive, non-judgmental messaging
- ✅ No comparisons to other clients
- ✅ No streaks or gamification
- ✅ Graceful degradation if no data

**Usage**:
```tsx
import ProgressSummary from '@/components/ClientPortal/ProgressSummary';

export default function MyProgramPage() {
  return (
    <div>
      <ProgressSummary
        programId={programId}
        programName="Strength Building"
        totalWeeks={12}
        currentWeek={4}
      />
    </div>
  );
}
```

### Positive Reinforcement Messages

Based on completion rate:

```
90%+: "Excellent work! You're crushing your programme. Keep up this momentum! 💪"

80-89%: "Great effort! You're staying consistent with your training. 
         You're on track to reach your goals. 🎯"

60-79%: "You're making progress. A few more sessions this week will get you 
         back on track. You've got this! 💪"

<60%: "Let's get back on track. Your coach is here to support you. 
       Reach out if you need help fitting workouts into your schedule."
```

### Data Source
- Reuses `ClientWorkoutActivity` collection
- Calculates 7-day completion rate
- No new data collection required

---

## 3. Program Confidence Indicators

### Purpose
Display subtle, display-only badges showing program status and recent updates.

### Component: ProgramConfidenceIndicators
**Location**: `/src/components/ClientPortal/ProgramConfidenceIndicators.tsx`

Displays:
- ✅ **Coach-approved program** - Always shown (builds trust)
- 🔄 **Updated based on your feedback** - When program was adjusted from client feedback
- ❤️ **Adjusted for recovery this week** - When program includes deload/recovery week

**Features**:
- ✅ Display-only (no interaction)
- ✅ Subtle, non-intrusive design
- ✅ Leverages existing program versioning
- ✅ Shows last update date

**Usage**:
```tsx
import ProgramConfidenceIndicators from '@/components/ClientPortal/ProgramConfidenceIndicators';

export default function MyProgramPage() {
  return (
    <div>
      <ProgramConfidenceIndicators
        isCoachApproved={true}
        isUpdatedFromFeedback={true}
        isAdjustedForRecovery={false}
        lastUpdated={new Date()}
      />
    </div>
  );
}
```

### Design
- Green badge: "Coach-approved program"
- Blue badge: "Updated based on your feedback"
- Bronze badge: "Adjusted for recovery this week"
- Small text: "Last updated: Jan 13"

---

## 4. Minimal Risk Flags (Trainer-Only)

### Purpose
Surface simple client status in trainer dashboard without charts or analytics.

### Component: MinimalRiskFlags
**Location**: `/src/components/pages/TrainerDashboard/MinimalRiskFlags.tsx`

Displays:
- **Summary Cards** - Count of clients in each status
  - On Track
  - At Risk
  - Too Hard
  - Too Easy
  - Inactive

- **Client Status List** - Simple list of all clients with status
  - Client ID (truncated)
  - Status badge
  - Risk reason (if applicable)

**Features**:
- ✅ Display-only (no charts or analytics)
- ✅ Simple status indicators
- ✅ Reuses existing adherence data
- ✅ Integrates with check-in section

**Usage**:
```tsx
import MinimalRiskFlags from '@/components/pages/TrainerDashboard/MinimalRiskFlags';

export default function TrainerDashboardPage() {
  return (
    <div>
      <MinimalRiskFlags />
    </div>
  );
}
```

### Status Definitions
- **On Track** - Normal adherence & difficulty
- **At Risk** - Missed 2+ workouts in 7 days
- **Too Hard** - Avg difficulty ≥4.5/5
- **Too Easy** - Avg difficulty ≤2/5
- **Inactive** - No activity for 7+ days

---

## Data Flow

```
Client completes workout
    ↓
Records completion (ClientWorkoutActivity)
    ↓
Provides feedback (ClientWorkoutFeedback)
    ↓
System calculates adherence signal
    ↓
Trainer views risk flags (MinimalRiskFlags)
    ↓
Trainer identifies at-risk clients (ClientsCheckInSection)
    ↓
Trainer sends check-in message (CoachCheckInModal)
    ↓
Message stored (ClientCoachMessages)
    ↓
Client sees progress summary (ProgressSummary)
    ↓
Client sees program confidence indicators (ProgramConfidenceIndicators)
```

---

## Implementation Checklist

### Collections
- ✅ `ClientCoachMessages` - Stores trainer-sent check-in messages

### Services
- ✅ `coach-checkin-service.ts` - Check-in logic and templates

### Trainer Components
- ✅ `ClientsCheckInSection.tsx` - Check-in dashboard
- ✅ `CoachCheckInModal.tsx` - Message editor modal
- ✅ `MinimalRiskFlags.tsx` - Status overview

### Client Components
- ✅ `ProgressSummary.tsx` - Weekly progress display
- ✅ `ProgramConfidenceIndicators.tsx` - Program status badges

### Features
- ✅ Trainer-initiated check-ins only
- ✅ Pre-filled, editable message templates
- ✅ Duplicate check-in prevention
- ✅ Simple progress visibility
- ✅ Program confidence indicators
- ✅ Minimal risk flags
- ✅ Graceful degradation
- ✅ No leaderboards, streaks, or auto-messages

---

## What's NOT Included

Intentionally excluded (as per requirements):

- ❌ **Leaderboards** - No client comparisons
- ❌ **Streaks** - No gamification or pressure
- ❌ **Auto-Messages** - All check-ins trainer-initiated
- ❌ **Push Notifications** - No automated alerts
- ❌ **Public Comparisons** - No client-to-client metrics
- ❌ **Client-Side AI Editing** - No AI-powered client features
- ❌ **Analytics Dashboards** - Only simple status indicators
- ❌ **Predictive Features** - No ML-based forecasting

---

## Usage Examples

### Example 1: Trainer Sends Check-In

```typescript
// In ClientsCheckInSection
const handleCheckInClick = (client: ClientCheckInPrompt) => {
  // Open modal with pre-filled template
  setSelectedClient(client);
};

// In CoachCheckInModal
const handleSend = async () => {
  await sendCoachCheckInMessage(
    clientId,
    trainerId,
    message, // trainer-edited
    reason
  );
  // Message stored in ClientCoachMessages
  // Modal closes automatically
};
```

### Example 2: Client Views Progress

```typescript
// In MyProgramPage
<ProgressSummary
  programId={programId}
  programName="Strength Building"
  totalWeeks={12}
  currentWeek={4}
/>

// Displays:
// - Week 4 of 12 progress bar
// - 5 completed, 1 missed, 6 total this week
// - 83% completion rate
// - "Great effort! You're staying consistent..."
```

### Example 3: Trainer Views Risk Flags

```typescript
// In TrainerDashboardPage
<MinimalRiskFlags />

// Displays:
// - Summary: 8 On Track, 2 At Risk, 1 Too Hard, 0 Too Easy, 1 Inactive
// - List of all clients with status
// - Click "Send Check-In" to engage
```

---

## Design Principles

### 1. Trainer Control
- All check-ins trainer-initiated
- No automatic messages
- Trainer approves all communication

### 2. Simplicity
- Minimal schemas (only ClientCoachMessages)
- Reuses existing activity/feedback data
- No complex analytics

### 3. Positive Reinforcement
- Encouraging, non-judgmental messaging
- No comparisons or competition
- Focus on progress, not perfection

### 4. Graceful Degradation
- Works without feedback data
- Displays "no data" gracefully
- No errors if collections empty

### 5. Privacy & Control
- Clients see only their own data
- Trainers see only their assigned clients
- No public or shared metrics

---

## Performance Considerations

### Query Optimization
- Filter by trainerId first
- Limit date range queries to 7-30 days
- Cache adherence signals for 1 hour

### Scalability
- Flat schema for efficient indexing
- No complex joins or aggregations
- Batch operations for multiple clients

### Example Optimization

```typescript
// ✅ Efficient - filter in code
const { items } = await BaseCrudService.getAll('clientcoachmessages');
const filtered = items.filter(m => m.trainerId === trainerId);

// In future, could add collection-level filtering
```

---

## Testing Checklist

### Unit Tests
- [ ] `getClientsNeedingCheckIn()` - Returns correct risk signals
- [ ] `sendCoachCheckInMessage()` - Creates message record
- [ ] `getCheckInMessageTemplate()` - Returns correct template
- [ ] `hasRecentCheckIn()` - Prevents duplicates

### Integration Tests
- [ ] Check-in modal opens with pre-filled message
- [ ] Trainer can edit and send message
- [ ] Message stored in database
- [ ] Client sees progress summary
- [ ] Program indicators display correctly
- [ ] Risk flags update in real-time

### User Tests
- [ ] Trainer finds clients to check in with easily
- [ ] Message templates are helpful starting points
- [ ] Client progress summary is encouraging
- [ ] No confusion about what data is shown

---

## Troubleshooting

### Issue: Clients not appearing in check-in list
**Solution**: Verify that:
- Clients have completed workouts (ClientWorkoutActivity records)
- Adherence signals are being calculated correctly
- Trainer is assigned to client's program

### Issue: Check-in messages not sending
**Solution**: Check that:
- ClientCoachMessages collection exists
- trainerId and clientId are valid
- No network errors in console

### Issue: Progress summary not loading
**Solution**: Verify that:
- ClientWorkoutActivity records exist for client
- Client ID matches in database
- No errors in browser console

### Issue: Duplicate check-ins appearing
**Solution**: Use `hasRecentCheckIn()` before sending to prevent duplicates

---

## Future Enhancements

### Phase 4.2 - Enhanced Check-Ins
- Email notifications when check-in sent
- Check-in read receipts
- Follow-up reminders

### Phase 4.3 - Client Insights
- Personal progress trends
- Workout history export
- Goal tracking

### Phase 4.4 - Team Features
- Shared check-in templates
- Team-wide client status overview
- Trainer collaboration notes

---

## Summary

Phase 4 (Lite) successfully adds coach-centered features that:

✅ **Empower trainers** to proactively engage with at-risk clients  
✅ **Show clients** lightweight progress with positive reinforcement  
✅ **Build confidence** with program status indicators  
✅ **Surface risks** simply without analytics  
✅ **Maintain control** - all check-ins trainer-initiated  
✅ **Degrade gracefully** without feedback data  
✅ **Scale efficiently** with minimal schema  

All while keeping the implementation lean, focused, and easy to maintain.

---

## Support & Questions

For implementation questions:
- Review code examples in this document
- Check component prop types
- Examine service function signatures

For feature requests:
- Document use case
- Describe expected behavior
- Provide example data
