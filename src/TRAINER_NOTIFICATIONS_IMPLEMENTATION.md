# Trainer Notifications Implementation Guide

## Overview
This document describes the in-app notification system for trainers to receive real-time updates about client workout activities.

## Architecture

### 1. CMS Collection: `trainernotifications`
**Purpose:** Stores all trainer notifications with read/unread and dismissed status.

**Fields:**
- `trainerId` (text) - The trainer receiving the notification
- `clientId` (text) - The client who triggered the notification
- `notificationType` (text) - Type: `workout_completed`, `week_completed`, `reflection_submitted`
- `message` (text) - Human-readable notification message
- `linkUrl` (url) - Deep link to relevant page (workout feedback, progress, etc.)
- `isRead` (boolean) - Whether the trainer has read the notification
- `isDismissed` (boolean) - Whether the trainer has dismissed the notification
- `createdAt` (datetime) - When the notification was created
- `relatedWorkoutId` (text) - Optional link to specific workout
- `relatedWeekNumber` (number) - Optional link to specific week

### 2. CMS Collection: `trainernotificationpreferences` (To Be Created)
**Purpose:** Stores trainer preferences for which notifications they want to receive.

**Recommended Fields:**
- `trainerId` (text) - The trainer
- `workoutCompletedEnabled` (boolean) - Enable/disable workout completion notifications
- `weekCompletedEnabled` (boolean) - Enable/disable week completion notifications
- `reflectionSubmittedEnabled` (boolean) - Enable/disable reflection notifications

**Note:** This collection needs to be created via the CMS management interface or through the CMS API.

## Core Services

### `/src/lib/notification-service.ts`
Main service for managing notifications:

**Key Functions:**
- `createTrainerNotification()` - Creates a new notification
- `getUnreadNotifications()` - Fetches unread notifications for a trainer
- `getTrainerNotifications()` - Fetches all notifications (paginated)
- `markNotificationAsRead()` - Marks a notification as read
- `dismissNotification()` - Dismisses a notification
- `markAllAsRead()` - Marks all notifications as read
- `getUnreadCount()` - Gets count of unread notifications

### `/src/lib/notification-triggers.ts`
Helper functions to trigger notifications from various parts of the app:

**Key Functions:**
- `triggerWorkoutCompletedNotification()` - Call when a workout is marked complete
- `triggerWeekCompletedNotification()` - Call when a week is fully completed
- `triggerReflectionSubmittedNotification()` - Call when a reflection is submitted
- `checkAndTriggerWeekCompletion()` - Checks if week is complete and triggers notification

**Usage Example:**
```typescript
import { triggerWorkoutCompletedNotification, checkAndTriggerWeekCompletion } from '@/lib/notification-triggers';

// When marking a workout as complete:
await triggerWorkoutCompletedNotification(workoutId, clientId, exerciseName);
await checkAndTriggerWeekCompletion(clientId, weekNumber);

// When a reflection is submitted:
await triggerReflectionSubmittedNotification(workoutId, clientId);
```

## UI Components

### `/src/components/pages/TrainerDashboard/NotificationsPanel.tsx`
**Purpose:** Dropdown panel showing notifications with bell icon and unread count badge.

**Features:**
- Bell icon with unread count badge
- Dropdown panel with scrollable notification list
- Click notification to navigate to linked page
- Dismiss individual notifications
- Mark all as read
- Real-time updates
- Animated transitions

**Location:** Integrated into `TrainerDashboardLayout.tsx` in the sidebar header.

### `/src/components/pages/TrainerDashboard/TrainerNotificationSettings.tsx`
**Purpose:** Settings panel for trainers to enable/disable notification types.

**Features:**
- Toggle switches for each notification type
- Save preferences
- Integrated into the trainer preferences page

**Location:** Embedded in `TrainerPreferencesPage.tsx`.

## Integration Points

### Where to Add Notification Triggers

1. **Workout Completion** - In the component/service where workout status is updated to "completed":
   ```typescript
   import { triggerWorkoutCompletedNotification, checkAndTriggerWeekCompletion } from '@/lib/notification-triggers';
   
   // After marking workout as complete
   await triggerWorkoutCompletedNotification(workout._id, workout.clientId, workout.exerciseName);
   await checkAndTriggerWeekCompletion(workout.clientId, workout.weekNumber);
   ```

2. **Reflection Submission** - In the post-workout feedback form submission:
   ```typescript
   import { triggerReflectionSubmittedNotification } from '@/lib/notification-triggers';
   
   // After reflection is saved
   await triggerReflectionSubmittedNotification(workoutId, clientId);
   ```

3. **Week Completion** - Automatically handled by `checkAndTriggerWeekCompletion()` after each workout completion.

## Setup Checklist

### ✅ Completed
- [x] Created `trainernotifications` CMS collection
- [x] Created notification service (`notification-service.ts`)
- [x] Created notification triggers (`notification-triggers.ts`)
- [x] Created NotificationsPanel component
- [x] Created TrainerNotificationSettings component
- [x] Integrated NotificationsPanel into TrainerDashboardLayout
- [x] Integrated settings into TrainerPreferencesPage
- [x] Updated entity types (auto-generated)

### ⏳ To Be Completed
- [ ] Create `trainernotificationpreferences` CMS collection (via CMS management or API)
- [ ] Add notification triggers to workout completion logic
- [ ] Add notification triggers to reflection submission logic
- [ ] Test notification flow end-to-end
- [ ] Add notification preferences to trainer onboarding

## Creating the Preferences Collection

To create the `trainernotificationpreferences` collection, you can either:

1. **Via CMS Management Interface:**
   - Go to https://manage.wix.com/dashboard/8bfa725a-40d0-4e8a-b66f-68448e1d8df6/database
   - Create a new collection named "Trainer Notification Preferences"
   - Add fields:
     - `trainerId` (Text)
     - `workoutCompletedEnabled` (Boolean, default: true)
     - `weekCompletedEnabled` (Boolean, default: true)
     - `reflectionSubmittedEnabled` (Boolean, default: true)

2. **Via Code (using cmsDeciderServiceAgent):**
   - Request: "Create a CMS collection for trainer notification preferences with fields for trainerId and boolean toggles for each notification type"

## Best Practices

1. **Performance:** Notifications are fetched on component mount and when the dropdown is opened. Consider adding polling or WebSocket support for real-time updates.

2. **Error Handling:** All notification triggers are wrapped in try-catch blocks to prevent failures from breaking the main workflow.

3. **Privacy:** Notifications are filtered by trainerId to ensure trainers only see their own notifications.

4. **Cleanup:** Consider implementing a cleanup job to delete old dismissed notifications after 30-90 days.

5. **Testing:** Test with multiple trainers and clients to ensure notifications are properly scoped and don't leak between trainers.

## Future Enhancements

1. **Push Notifications:** Integrate with browser push notifications API
2. **Email Digests:** Send daily/weekly email summaries of notifications
3. **Notification Grouping:** Group similar notifications (e.g., "3 clients completed workouts today")
4. **Custom Notification Rules:** Allow trainers to set custom rules (e.g., only notify for specific clients)
5. **Notification History:** Add a dedicated page to view all historical notifications
6. **Sound/Visual Alerts:** Add optional sound or visual alerts for new notifications
