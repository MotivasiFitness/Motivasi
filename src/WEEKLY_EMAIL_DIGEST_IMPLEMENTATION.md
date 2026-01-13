# Weekly Trainer Email Digest - Implementation Guide

## Overview

The Weekly Trainer Email Digest is a **Phase 4 – Notifications** feature that sends trainers a calm, supportive weekly summary of their clients' progress. Emails are sent once per week (default: Monday 8-9 am local time) and include key metrics, a follow-up focus section, and a single call-to-action button.

**Key Principle:** This is a *passive, informational* digest—not an urgent alert system. The tone is supportive and non-judgmental.

---

## Features

### 1. Email Content

**Header:**
- "Weekly Client Check-In Summary"
- Week date range (e.g., "Jan 13 – Jan 19")

**Metrics Section:**
- Active Clients (total count)
- On Track (count)
- At Risk (count)
- Inactive (count)
- Avg Workout Completion Rate (%)
- Avg Difficulty Rating (1-5 scale)

**Follow-Up Focus Section:**
- Number of clients needing a check-in
- Optional: List of up to 3 client names (by urgency: Inactive → At Risk → Too Hard → Too Easy)

**Call to Action:**
- Single button: "Review clients who may need a check-in"
- Links to: `/trainer#clients-to-review` (Trainer Dashboard)

**Tone:**
- Calm, supportive, non-urgent
- No guilt language ("You haven't checked in with...")
- No pressure ("Your clients are falling behind...")
- Focuses on opportunity ("may benefit from a check-in")

### 2. Email Design

**Visual Style:**
- Simple HTML/text email
- Mobile-friendly responsive design
- Brand colors: warm sand beige (#E8DED3), soft bronze (#B08D57), charcoal black (#1F1F1F)
- No charts, graphs, or complex visualizations
- Clean, minimal layout

**Sections:**
1. Header with title and week range
2. Greeting paragraph
3. Metrics grid (2 columns on desktop, 1 on mobile)
4. Divider
5. Follow-up focus section
6. Call-to-action button
7. Footer with disclaimer

### 3. Data Handling

**Metrics Calculation:**
- Reuses existing `getTrainerClientAdherenceSignals()` from adherence-tracking service
- Reuses `getActivitySummary()` for completion rates
- Reuses `getRecentFeedback()` for difficulty ratings
- Reuses `getClientsNeedingCheckIn()` from coach-checkin-service

**Missing Data:**
- If a metric can't be calculated, it defaults to 0
- Email is still sent with available metrics
- No error messages shown to trainer

**Error Handling:**
- Email sending errors are logged silently
- No retries (one attempt per week)
- Failed emails don't block other trainers' emails

### 4. Scheduling

**Default Schedule:**
- Every Monday at 8:00 AM (local trainer timezone)
- One email per trainer per week
- No daily emails, no individual client alerts

**Implementation Options:**
- AWS EventBridge + Lambda
- Google Cloud Scheduler + Cloud Functions
- Node.js node-cron
- Traditional cron jobs
- Third-party services (e.g., Zapier, Make)

---

## Technical Implementation

### Service Functions

**`calculateWeeklyMetrics(trainerId: string)`**
- Returns `WeeklyDigestMetrics` object
- Calculates all metrics for a trainer's clients
- Handles missing data gracefully (returns 0 for unavailable metrics)
- Includes top 3 clients needing check-in (sorted by urgency)

**`generateWeeklyDigestEmail(data: TrainerEmailData)`**
- Returns HTML email template string
- Responsive design (mobile-friendly)
- Includes all metrics and follow-up focus
- Single CTA button

**`sendWeeklyDigestEmail(trainerId, trainerEmail, trainerName)`**
- Calculates metrics
- Generates email HTML
- Sends email via `sendEmail()` service
- Returns boolean (success/failure)
- Logs errors silently

**`sendWeeklyDigestToAllTrainers()`**
- Sends emails to all trainers
- Returns summary: { sent, failed, errors }
- Called by backend scheduler

**`scheduleWeeklyDigest()`**
- Placeholder for scheduler initialization
- Logs confirmation message
- Actual scheduling done in backend service

### Data Structures

```typescript
interface WeeklyDigestMetrics {
  activeClients: number;
  onTrackCount: number;
  atRiskCount: number;
  inactiveCount: number;
  avgCompletionRate: number;
  avgDifficultyRating: number;
  clientsNeedingCheckIn: number;
  clientsNeedingCheckInList: Array<{
    clientId: string;
    firstName?: string;
  }>;
}

interface TrainerEmailData {
  trainerId: string;
  trainerEmail: string;
  trainerName: string;
  metrics: WeeklyDigestMetrics;
  generatedAt: Date;
}
```

### Integration Points

**Existing Services Used:**
- `getTrainerClientAdherenceSignals()` - Get client adherence data
- `getActivitySummary()` - Get workout completion rates
- `getRecentFeedback()` - Get difficulty ratings
- `getClientsNeedingCheckIn()` - Get clients needing check-in
- `sendEmail()` - Send email via email service

**Database Collections:**
- `memberroles` - Get all trainers
- `programs` - Get trainer's clients
- `progresscheckins` - Get client progress data
- `clientcoachmessages` - Get check-in history

---

## Email Template

### HTML Structure

```
┌─────────────────────────────────────┐
│  HEADER                             │
│  Weekly Client Check-In Summary     │
│  Week of Jan 13 – Jan 19            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  CONTENT                            │
│                                     │
│  Hi [Trainer Name],                 │
│  Here's a snapshot...               │
│                                     │
│  Your Clients This Week             │
│  ┌──────────┬──────────┐            │
│  │ 12       │ 8        │            │
│  │ Active   │ On Track │            │
│  ├──────────┼──────────┤            │
│  │ 2        │ 1        │            │
│  │ At Risk  │ Inactive │            │
│  ├──────────┼──────────┤            │
│  │ 85%      │ 3.5      │            │
│  │ Avg Comp │ Avg Diff │            │
│  └──────────┴──────────┘            │
│                                     │
│  Follow-Up Focus                    │
│  3 clients may benefit from check-in│
│  • Client ABC123                    │
│  • Client DEF456                    │
│  • Client GHI789                    │
│                                     │
│  [Review clients who may need...]   │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  FOOTER                             │
│  © 2026 Motivasi                    │
└─────────────────────────────────────┘
```

### Responsive Design

**Desktop (600px+):**
- 2-column metrics grid
- Full-width layout
- Larger fonts

**Mobile (<600px):**
- 1-column metrics grid
- Optimized padding
- Smaller fonts
- Full-width button

---

## Scheduling Implementation

### Option 1: AWS EventBridge + Lambda

```typescript
// Lambda function handler
export async function handler(event: any) {
  const result = await sendWeeklyDigestToAllTrainers();
  console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
  return result;
}

// EventBridge rule (cron expression)
// cron(0 8 ? * MON *) = Every Monday at 8:00 AM UTC
// For local timezone, adjust offset or use Lambda timezone env var
```

### Option 2: Google Cloud Scheduler + Cloud Functions

```typescript
// Cloud Function
export async function sendWeeklyDigest(req: any, res: any) {
  const result = await sendWeeklyDigestToAllTrainers();
  res.json(result);
}

// Cloud Scheduler job
// Frequency: 0 8 * * MON (Monday 8 AM)
// Timezone: Europe/London (or trainer's local timezone)
```

### Option 3: Node.js node-cron

```typescript
import cron from 'node-cron';

// Run every Monday at 8:00 AM
cron.schedule('0 8 * * 1', async () => {
  const result = await sendWeeklyDigestToAllTrainers();
  console.log(`Weekly digest sent: ${result.sent} emails`);
});
```

### Option 4: Traditional Cron Job

```bash
# /etc/cron.d/motivasi-weekly-digest
# Run every Monday at 8:00 AM
0 8 * * 1 /usr/bin/node /app/scripts/send-weekly-digest.js
```

---

## Usage Examples

### Send Email to Single Trainer

```typescript
import { sendWeeklyDigestEmail } from '@/lib/weekly-email-digest';

const success = await sendWeeklyDigestEmail(
  'trainer-123',
  'trainer@example.com',
  'Sarah'
);

if (success) {
  console.log('Email sent successfully');
} else {
  console.log('Failed to send email');
}
```

### Send to All Trainers

```typescript
import { sendWeeklyDigestToAllTrainers } from '@/lib/weekly-email-digest';

const result = await sendWeeklyDigestToAllTrainers();
console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);

if (result.errors.length > 0) {
  console.log('Errors:', result.errors);
}
```

### Calculate Metrics Only

```typescript
import { calculateWeeklyMetrics } from '@/lib/weekly-email-digest';

const metrics = await calculateWeeklyMetrics('trainer-123');
console.log(`Active clients: ${metrics.activeClients}`);
console.log(`On track: ${metrics.onTrackCount}`);
console.log(`At risk: ${metrics.atRiskCount}`);
```

### Generate Email HTML

```typescript
import { generateWeeklyDigestEmail } from '@/lib/weekly-email-digest';

const html = generateWeeklyDigestEmail({
  trainerId: 'trainer-123',
  trainerEmail: 'trainer@example.com',
  trainerName: 'Sarah',
  metrics: {
    activeClients: 12,
    onTrackCount: 8,
    atRiskCount: 2,
    inactiveCount: 1,
    avgCompletionRate: 85,
    avgDifficultyRating: 3.5,
    clientsNeedingCheckIn: 3,
    clientsNeedingCheckInList: [
      { clientId: 'client-1', firstName: 'Client ABC' },
      { clientId: 'client-2', firstName: 'Client DEF' },
      { clientId: 'client-3', firstName: 'Client GHI' },
    ],
  },
  generatedAt: new Date(),
});

// Use html in email template or save to file
```

---

## Error Handling

### Silent Error Logging

All errors are logged to console but **do not** throw exceptions:

```typescript
try {
  await sendWeeklyDigestEmail(trainerId, email, name);
} catch (error) {
  // Log silently
  console.error(`Failed to send email to ${trainerId}:`, error);
  // Continue to next trainer
}
```

### Missing Data Handling

If metrics can't be calculated, defaults to 0:

```typescript
const metrics = await calculateWeeklyMetrics(trainerId);
// If calculation fails:
// {
//   activeClients: 0,
//   onTrackCount: 0,
//   atRiskCount: 0,
//   inactiveCount: 0,
//   avgCompletionRate: 0,
//   avgDifficultyRating: 0,
//   clientsNeedingCheckIn: 0,
//   clientsNeedingCheckInList: []
// }
```

### No Retries

- One attempt per trainer per week
- Failed emails are not retried
- Errors logged for manual review

---

## Tone & Language Guidelines

### ✅ DO Use

- "may benefit from a check-in"
- "Here's a snapshot of your clients' progress"
- "Use this summary to identify who might benefit"
- "Top priority" (for clients needing check-in)
- Supportive, encouraging language

### ❌ DON'T Use

- "Your clients are falling behind"
- "You haven't checked in with..."
- "Urgent action required"
- "Clients are at risk of dropping out"
- "You're not engaging enough"
- Guilt or pressure language

### Tone Examples

**Good:**
> "Here's a snapshot of your clients' progress this week. Use this summary to identify who might benefit from a quick check-in."

**Bad:**
> "Alert: 2 clients are at risk and need immediate attention. You must check in with them today."

---

## Testing Checklist

- [ ] Metrics calculated correctly for trainer with multiple clients
- [ ] Metrics handle missing data gracefully (defaults to 0)
- [ ] Email HTML renders correctly on desktop
- [ ] Email HTML renders correctly on mobile
- [ ] Email includes all 6 metrics
- [ ] Follow-up focus shows correct count
- [ ] Top 3 clients listed by urgency (Inactive → At Risk → Too Hard → Too Easy)
- [ ] CTA button links to correct URL
- [ ] Email sent successfully via email service
- [ ] Error logged silently if email fails
- [ ] All trainers receive emails when batch function called
- [ ] Batch function returns correct sent/failed counts
- [ ] No retries on failed emails
- [ ] Tone is calm and supportive (no guilt language)
- [ ] No charts, graphs, or complex visualizations
- [ ] Email works without JavaScript
- [ ] Plain text fallback included

---

## Future Enhancements

Potential additions (not in scope for current release):

- Trainer timezone preferences (send at local 8 AM)
- Customizable email frequency (weekly, bi-weekly, monthly)
- Customizable metrics selection
- Trainer email preferences/unsubscribe (Phase 5)
- Email analytics (open rate, click rate)
- A/B testing different email templates
- Integration with email service provider (SendGrid, Mailgun)
- Email scheduling UI in trainer dashboard
- Digest history/archive
- Export metrics as CSV/PDF

---

## Notes

- **No Daily Emails:** Only weekly, not daily
- **No Individual Alerts:** No per-client notifications
- **No Automation:** No auto-generated recommendations
- **No Client Visibility:** Trainers only, not client-facing
- **No Unsubscribe:** Not implemented in Phase 4
- **Passive Tone:** Informational, not urgent
- **Graceful Degradation:** Works with missing data
- **Silent Errors:** No retry logic, errors logged only

---

## Files

**Created:**
- `/src/lib/weekly-email-digest.ts` - Main service implementation

**Modified:**
- None (standalone service)

**Dependencies:**
- `@/lib/adherence-tracking` - Adherence signals
- `@/lib/coach-checkin-service` - Check-in data
- `@/lib/email-service` - Email sending
- `@/integrations` - Database access

---

**Implementation Date:** January 2026
**Status:** ✅ Complete
**Version:** Weekly Email Digest v1.0
