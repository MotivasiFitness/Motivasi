# Follow-Up Reminder System - Implementation Guide

## Overview
The Follow-Up Reminder System is a **quiet, trainer-only, passive reminder system** that surfaces subtle prompts for trainers to check in with at-risk or inactive clients who haven't received recent trainer interaction.

This system is designed to be:
- ✅ **Non-blocking** - Doesn't interrupt workflow
- ✅ **Passive** - Subtle labels, not urgent colors
- ✅ **Trainer-only** - No client-facing indicators
- ✅ **Non-escalating** - Never stacks or escalates reminders
- ✅ **Dismissible** - Trainers can dismiss for 7 days
- ✅ **Auto-clearing** - Removes when client logs workout or responds

---

## Key Features

### 1. Follow-Up Reminder Logic

**When Reminders Appear:**
- Client is **At Risk** OR **Inactive**
- AND either:
  - No check-in has been sent yet, OR
  - Check-in was sent but client didn't respond and no workout logged
- AND **5-7 days have passed** since last trainer interaction
- AND reminder hasn't been dismissed in the last 7 days

**Reminder Window:**
- Appears after 5 days of no trainer interaction
- Disappears after 14 days (trainer should have acted by then)
- Only one reminder per client at a time

### 2. UI Display

**Location:** 
- `ClientsToReviewSection` - Small label under client name
- `ClientAdherencePanel` - Small label under client name

**Visual Style:**
```
🕒 Consider checking in (6 days)
```

**Styling:**
- Subtle background: `bg-warm-sand-beige/30`
- Small text: `text-xs`
- No urgent colors (no red, orange, or bold)
- Dismissible with small X button
- Clickable to open check-in modal

### 3. Interaction Behavior

**Clicking the Reminder:**
1. Opens the existing Coach Check-In modal
2. Auto-selects a follow-up message template
3. Pre-fills message with follow-up template text
4. Trainer can edit before sending

**Dismissing the Reminder:**
1. Click the X button on the reminder label
2. Reminder hidden for 7 days
3. Stored in localStorage (trainer-specific)
4. Can be dismissed multiple times

**Auto-Clearing:**
- Immediately removed if client logs a workout
- Immediately removed if client responds to check-in
- Automatically cleared after 7 days of dismissal

### 4. Follow-Up Message Templates

**For At Risk Clients:**

Template 1: "Gentle re-engagement"
```
Hi,

I wanted to check in again. I know life gets busy, but I'd love to help you get back on track with your training.

Is there anything I can adjust in your programme to make it easier to fit into your schedule? Let me know how I can support you.
```

Template 2: "Problem-solving approach"
```
Hi,

I've noticed you've missed a few sessions recently. Rather than pushing harder, I'd like to understand what's getting in the way.

Are there specific obstacles we can work around together? Let's find a solution that works for you.
```

**For Inactive Clients:**

Template 1: "Reconnection"
```
Hi,

I've missed seeing you in the app. I want to make sure you're okay and that your programme is still working for you.

Let's reconnect and get you back on track. What's been going on?
```

Template 2: "Support & understanding"
```
Hi,

It's been a while since we last connected. I'm here to support you, not judge.

If something's changed or you're facing challenges, let's talk about it. We can adjust your programme or find a way forward together.
```

**For Too Hard Clients:**

Template 1: "Scaling back offer"
```
Hi,

I want to check in about how the programme is feeling. If it's been too intense, we can absolutely scale things back.

Your consistency and long-term progress matter more than pushing too hard. Let me know if you'd like to adjust.
```

Template 2: "Recovery focus"
```
Hi,

I've been thinking about your training. Sometimes taking a step back to focus on recovery and form is exactly what we need.

Would you like to dial back the intensity for a bit? We can refocus on quality over quantity.
```

**For Too Easy Clients:**

Template 1: "Progression opportunity"
```
Hi,

You're doing great with your current programme! I think you're ready for the next level.

Let's discuss how we can progress your training to keep you challenged and engaged. When can we chat about this?
```

Template 2: "Momentum building"
```
Hi,

I love seeing your consistency! You're clearly ready for more.

Let's increase the challenge and keep building on this momentum. Are you open to progressing your training?
```

---

## Implementation Details

### Service Functions

**`getFollowUpReminders(trainerId, daysSinceLastInteraction = 6)`**
- Returns array of clients who need follow-up reminders
- Filters by 5-7 day window
- Excludes dismissed reminders
- Returns reminder metadata (label, days, type)

**`getDismissedReminders(trainerId)`**
- Returns currently dismissed reminders for trainer
- Filters out expired dismissals (>7 days)
- Uses localStorage as storage

**`dismissFollowUpReminder(trainerId, clientId)`**
- Dismisses reminder for 7 days
- Stores in localStorage with expiration
- Can be called multiple times

**`clearDismissedReminder(trainerId, clientId)`**
- Clears a dismissed reminder
- Called when client logs workout or responds
- Allows reminder to reappear if conditions met again

**`getFollowUpMessageTemplates(reason)`**
- Returns 2 follow-up templates per status
- Different from initial check-in templates
- Designed for re-engagement scenarios

### Component Integration

**ClientsToReviewSection:**
```typescript
// Load follow-up reminders
const followUpReminders = await getFollowUpReminders(member._id);

// Add to matching clients
for (const reminder of followUpReminders) {
  const existingClient = allSignals.find(s => s.clientId === reminder.clientId);
  if (existingClient) {
    existingClient.followUpReminder = reminder.followUpReminder;
  }
}

// Display in UI
{client.followUpReminder && (
  <button onClick={() => dismissFollowUpReminder(...)}>
    🕒 {client.followUpReminder.label}
    <X size={14} />
  </button>
)}
```

**ClientAdherencePanel:**
```typescript
// Similar integration
// Clicking reminder opens check-in modal with follow-up templates
handleOpenCheckInModal(clientId, status, isFollowUp = true);

// Modal uses getFollowUpMessageTemplates() instead of getCheckInMessageTemplates()
```

---

## Logic Rules

### One Reminder Per Client
- Only one reminder shown at a time
- If multiple conditions met, show the most recent/relevant one
- Processed clients tracked to prevent duplicates

### Dismissal Window
- 7-day dismissal period
- Stored per trainer in localStorage
- Can be dismissed multiple times
- Expires automatically after 7 days

### Auto-Clearing
- Immediately cleared when client logs workout
- Immediately cleared when client responds to check-in
- Automatically cleared after 7 days of dismissal
- No manual intervention needed

### Time Window
- Appears after 5 days of no trainer interaction
- Disappears after 14 days (trainer should have acted)
- Calculated from last trainer message or program creation date
- Respects dismissal window (7 days)

### No Escalation
- Never stacks reminders
- Never escalates to urgent colors
- Never sends notifications
- Never auto-sends messages
- Always requires trainer action

---

## Data Storage

### localStorage Structure
```typescript
// Key: `dismissed-reminders-{trainerId}`
// Value: Array of FollowUpReminderDismissal

interface FollowUpReminderDismissal {
  _id: string;
  trainerId: string;
  clientId: string;
  dismissedAt: Date | string;
  dismissedUntil: Date | string; // 7 days from dismissal
}
```

### Example
```json
{
  "dismissed-reminders-trainer-123": [
    {
      "_id": "uuid-1",
      "trainerId": "trainer-123",
      "clientId": "client-456",
      "dismissedAt": "2026-01-13T12:00:00Z",
      "dismissedUntil": "2026-01-20T12:00:00Z"
    }
  ]
}
```

---

## User Flows

### Flow 1: Trainer Sees Reminder and Sends Check-In
1. Trainer views ClientsToReviewSection or ClientAdherencePanel
2. Sees "🕒 Consider checking in (6 days)" label
3. Clicks the label
4. Check-in modal opens with follow-up template pre-selected
5. Trainer edits message as needed
6. Trainer clicks "Send Message"
7. Message sent, reminder cleared

### Flow 2: Trainer Dismisses Reminder
1. Trainer sees reminder label
2. Clicks X button to dismiss
3. Reminder hidden for 7 days
4. After 7 days, reminder reappears if conditions still met
5. Trainer can dismiss again if needed

### Flow 3: Client Logs Workout (Auto-Clear)
1. Client logs workout in app
2. System detects workout completion
3. Reminder automatically cleared
4. Trainer no longer sees reminder for this client

### Flow 4: Client Responds to Check-In (Auto-Clear)
1. Trainer sends check-in message
2. Client responds via messages
3. System marks check-in as responded
4. Reminder automatically cleared
5. Trainer no longer sees reminder for this client

---

## Technical Implementation

### Files Modified
1. `/src/lib/coach-checkin-service.ts` - Added reminder functions
2. `/src/components/pages/TrainerDashboard/ClientsToReviewSection.tsx` - Display reminders
3. `/src/components/pages/TrainerDashboard/ClientAdherencePanel.tsx` - Display reminders + modal integration

### New Functions
- `getFollowUpReminders()` - Get reminders for trainer
- `getDismissedReminders()` - Get dismissed reminders
- `dismissFollowUpReminder()` - Dismiss a reminder
- `clearDismissedReminder()` - Clear dismissal
- `getFollowUpMessageTemplates()` - Get follow-up templates

### New Interfaces
- `FollowUpReminderDismissal` - Dismissal record structure

---

## Testing Checklist

- [ ] Reminders appear for At Risk clients after 5 days
- [ ] Reminders appear for Inactive clients after 5 days
- [ ] Reminders don't appear before 5 days
- [ ] Reminders disappear after 14 days
- [ ] Only one reminder per client shown
- [ ] Clicking reminder opens check-in modal
- [ ] Follow-up templates pre-populate message
- [ ] Dismissing reminder hides it for 7 days
- [ ] Dismissed reminders reappear after 7 days
- [ ] Reminders clear when client logs workout
- [ ] Reminders clear when client responds
- [ ] Reminders display in both ClientsToReviewSection and ClientAdherencePanel
- [ ] Reminder label shows correct days count
- [ ] No urgent colors used (subtle styling)
- [ ] Trainer-only (no client-facing indicators)

---

## Future Enhancements

Potential additions (not in scope for current release):
- Database storage instead of localStorage (for persistence across devices)
- Trainer preferences for reminder frequency
- Bulk dismiss option for multiple clients
- Reminder analytics (how many dismissed vs. acted on)
- Customizable time windows (5-7 days configurable)
- Email notifications for reminders (optional)
- Reminder history/audit log

---

## Notes

- **No Notifications:** System is passive, no push/email notifications
- **No Automation:** Messages are never auto-sent, always require trainer action
- **No Client Visibility:** Reminders are trainer-only, clients don't see them
- **Non-Blocking:** Reminders don't interrupt workflow or require immediate action
- **Dismissible:** Trainers have full control to dismiss reminders
- **Smart Clearing:** Auto-clears when conditions change (workout logged, response received)

---

**Implementation Date:** January 2026
**Status:** ✅ Complete
**Version:** Follow-Up Reminder System v1.0
