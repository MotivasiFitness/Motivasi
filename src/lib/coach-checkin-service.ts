/**
 * Coach Check-In Service
 * Manages trainer-initiated check-in messages with clients
 * Reuses existing adherence data to identify clients needing check-ins
 */

import { BaseCrudService } from '@/integrations';
import { ClientCoachMessages } from '@/entities';
import { getClientAdherenceSignal, AdherenceStatus, getActivitySummary } from '@/lib/adherence-tracking';

export interface ClientCheckInPrompt {
  clientId: string;
  reason: AdherenceStatus;
  reasonDescription: string;
  lastWorkoutDate?: Date;
  daysSinceLastActivity?: number;
  avgDifficulty?: number;
  missedWorkoutsLast7Days?: number;
  noResponseLabel?: string; // "No response after check-in" label
  followUpReminder?: {
    label: string;
    daysSinceLastInteraction: number;
    type: 'no-checkin' | 'no-response'; // Type of follow-up reminder
  };
}

export interface FollowUpReminderDismissal {
  _id: string;
  trainerId: string;
  clientId: string;
  dismissedAt: Date | string;
  dismissedUntil: Date | string; // 7 days from dismissal
}

export interface CoachCheckInMessage {
  _id: string;
  clientId: string;
  trainerId: string;
  message: string;
  reason: AdherenceStatus;
  sentAt: Date;
  responded?: boolean;
  respondedAt?: Date;
  reengagedWithin72h?: boolean;
}

/**
 * Get follow-up reminders for clients who need a quiet reminder
 * Surfaces clients who are At Risk/Inactive AND:
 * - No check-in sent yet, OR
 * - Check-in sent but no response and no workout logged
 * AND 5-7 days have passed since last trainer interaction
 * AND reminder hasn't been dismissed in the last 7 days
 */
export async function getFollowUpReminders(
  trainerId: string,
  daysSinceLastInteraction: number = 6 // 5-7 days, default 6
): Promise<ClientCheckInPrompt[]> {
  try {
    const { items: programs } = await BaseCrudService.getAll<any>('programs');
    const trainerPrograms = programs.filter((p) => p.trainerId === trainerId);

    const { items: checkInMessages } = await BaseCrudService.getAll<ClientCoachMessages>(
      'clientcoachmessages'
    );

    // Get dismissed reminders for this trainer
    const dismissedReminders = await getDismissedReminders(trainerId);
    const dismissedClientIds = new Set(dismissedReminders.map((r) => r.clientId));

    const reminders: ClientCheckInPrompt[] = [];
    const processedClients = new Set<string>();

    const cutoffDate = new Date(Date.now() - daysSinceLastInteraction * 24 * 60 * 60 * 1000);

    for (const program of trainerPrograms) {
      if (!program.clientId || processedClients.has(program.clientId)) continue;
      if (dismissedClientIds.has(program.clientId)) continue; // Skip dismissed reminders

      const signal = await getClientAdherenceSignal(program.clientId, program._id);

      // Only show reminders for At Risk or Inactive clients
      if (signal.status !== 'At Risk' && signal.status !== 'Inactive') {
        continue;
      }

      // Check if there's a recent check-in from this trainer
      const recentCheckIn = checkInMessages.find(
        (m) =>
          m.clientId === program.clientId &&
          m.trainerId === trainerId &&
          m.sentAt &&
          new Date(m.sentAt) >= cutoffDate
      );

      // If there's a recent check-in, skip (we already have a no-response label for that)
      if (recentCheckIn) {
        continue;
      }

      // Check last trainer interaction (any message sent)
      const lastTrainerMessage = checkInMessages
        .filter((m) => m.clientId === program.clientId && m.trainerId === trainerId)
        .sort((a, b) => {
          const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
          const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
          return dateB - dateA;
        })[0];

      const lastInteractionDate = lastTrainerMessage
        ? new Date(lastTrainerMessage.sentAt || new Date())
        : new Date(program._createdDate || new Date());

      const daysSinceLastInteractionActual = Math.floor(
        (Date.now() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only show reminder if 5-7 days have passed since last interaction
      if (daysSinceLastInteractionActual < 5 || daysSinceLastInteractionActual > 14) {
        continue;
      }

      // Determine reminder type
      const hasCheckIn = checkInMessages.some(
        (m) => m.clientId === program.clientId && m.trainerId === trainerId
      );

      reminders.push({
        clientId: program.clientId,
        reason: signal.status,
        reasonDescription: signal.status === 'At Risk' 
          ? `Missed ${signal.missedWorkoutsLast7Days} workouts in last 7 days`
          : `No activity for ${signal.daysSinceLastActivity} days`,
        lastWorkoutDate: signal.lastWorkoutDate,
        daysSinceLastActivity: signal.daysSinceLastActivity,
        avgDifficulty: signal.avgDifficulty,
        missedWorkoutsLast7Days: signal.missedWorkoutsLast7Days,
        followUpReminder: {
          label: `🕒 Consider checking in (${daysSinceLastInteractionActual} days)`,
          daysSinceLastInteraction: daysSinceLastInteractionActual,
          type: hasCheckIn ? 'no-response' : 'no-checkin',
        },
      });

      processedClients.add(program.clientId);
    }

    return reminders;
  } catch (error) {
    console.error('Error getting follow-up reminders:', error);
    return [];
  }
}

/**
 * Get dismissed reminders for a trainer
 * Returns reminders that are still within the 7-day dismissal window
 */
export async function getDismissedReminders(trainerId: string): Promise<FollowUpReminderDismissal[]> {
  try {
    // In a real implementation, this would fetch from a database
    // For now, we'll use localStorage as a fallback
    const key = `dismissed-reminders-${trainerId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    const dismissed: FollowUpReminderDismissal[] = JSON.parse(stored);
    const now = new Date();

    // Filter out expired dismissals (older than 7 days)
    return dismissed.filter((d) => new Date(d.dismissedUntil) > now);
  } catch (error) {
    console.error('Error getting dismissed reminders:', error);
    return [];
  }
}

/**
 * Dismiss a follow-up reminder for 7 days
 */
export async function dismissFollowUpReminder(
  trainerId: string,
  clientId: string
): Promise<void> {
  try {
    const key = `dismissed-reminders-${trainerId}`;
    const stored = localStorage.getItem(key);
    const dismissed: FollowUpReminderDismissal[] = stored ? JSON.parse(stored) : [];

    const now = new Date();
    const dismissedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Check if already dismissed
    const existingIndex = dismissed.findIndex((d) => d.clientId === clientId);
    if (existingIndex >= 0) {
      dismissed[existingIndex] = {
        ...dismissed[existingIndex],
        dismissedAt: now,
        dismissedUntil,
      };
    } else {
      dismissed.push({
        _id: crypto.randomUUID(),
        trainerId,
        clientId,
        dismissedAt: now,
        dismissedUntil,
      });
    }

    localStorage.setItem(key, JSON.stringify(dismissed));
  } catch (error) {
    console.error('Error dismissing follow-up reminder:', error);
  }
}

/**
 * Clear a dismissed reminder (when client logs workout or responds)
 */
export async function clearDismissedReminder(trainerId: string, clientId: string): Promise<void> {
  try {
    const key = `dismissed-reminders-${trainerId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return;

    const dismissed: FollowUpReminderDismissal[] = JSON.parse(stored);
    const filtered = dismissed.filter((d) => d.clientId !== clientId);

    if (filtered.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error clearing dismissed reminder:', error);
  }
}

/**
 * Get clients needing check-in based on adherence signals
 */
export async function getClientsNeedingCheckIn(
  trainerId: string
): Promise<ClientCheckInPrompt[]> {
  try {
    // Get all programs for this trainer
    const { items: programs } = await BaseCrudService.getAll<any>('programs');
    const trainerPrograms = programs.filter((p) => p.trainerId === trainerId);

    const checkInPrompts: ClientCheckInPrompt[] = [];
    const processedClients = new Set<string>();

    for (const program of trainerPrograms) {
      if (program.clientId && !processedClients.has(program.clientId)) {
        const signal = await getClientAdherenceSignal(program.clientId, program._id);

        // Only include clients with risk signals (not "On Track")
        if (signal.status !== 'On Track') {
          let reasonDescription = '';

          switch (signal.status) {
            case 'At Risk':
              reasonDescription = `Missed ${signal.missedWorkoutsLast7Days} workouts in last 7 days`;
              break;
            case 'Too Hard':
              reasonDescription = `Average difficulty: ${signal.avgDifficulty?.toFixed(1)}/5 - may need adjustment`;
              break;
            case 'Too Easy':
              reasonDescription = `Average difficulty: ${signal.avgDifficulty?.toFixed(1)}/5 - ready for progression`;
              break;
            case 'Inactive':
              reasonDescription = `No activity for ${signal.daysSinceLastActivity} days`;
              break;
          }

          checkInPrompts.push({
            clientId: program.clientId,
            reason: signal.status,
            reasonDescription,
            lastWorkoutDate: signal.lastWorkoutDate,
            daysSinceLastActivity: signal.daysSinceLastActivity,
            avgDifficulty: signal.avgDifficulty,
            missedWorkoutsLast7Days: signal.missedWorkoutsLast7Days,
          });

          processedClients.add(program.clientId);
        }
      }
    }

    // Check for clients with no response after check-in
    const noResponseClients = await getClientsWithNoResponseAfterCheckIn(trainerId);
    for (const client of noResponseClients) {
      if (!processedClients.has(client.clientId)) {
        checkInPrompts.push(client);
        processedClients.add(client.clientId);
      }
    }

    return checkInPrompts;
  } catch (error) {
    console.error('Error getting clients needing check-in:', error);
    return [];
  }
}

/**
 * Get clients who received a check-in but didn't respond/complete workout within 3-5 days
 * This is trainer-controlled and only surfaces clients who are At Risk or Inactive
 */
export async function getClientsWithNoResponseAfterCheckIn(
  trainerId: string,
  daysSinceCheckIn: number = 4 // 3-5 days, default 4
): Promise<ClientCheckInPrompt[]> {
  try {
    const { items: checkInMessages } = await BaseCrudService.getAll<ClientCoachMessages>(
      'clientcoachmessages'
    );

    const { items: programs } = await BaseCrudService.getAll<any>('programs');
    const trainerPrograms = programs.filter((p) => p.trainerId === trainerId);

    const noResponseClients: ClientCheckInPrompt[] = [];
    const cutoffDate = new Date(Date.now() - daysSinceCheckIn * 24 * 60 * 60 * 1000);

    // Get check-ins sent by this trainer that are old enough to check for response
    const relevantCheckIns = checkInMessages.filter(
      (m) =>
        m.trainerId === trainerId &&
        m.sentAt &&
        new Date(m.sentAt) <= cutoffDate &&
        !m.responded // No response yet
    );

    for (const checkIn of relevantCheckIns) {
      if (!checkIn.clientId) continue;

      // Check if client completed a workout since the check-in
      const activitySummary = await getActivitySummary(checkIn.clientId, '', daysSinceCheckIn);
      const hasCompletedWorkout = activitySummary.completed > 0;

      if (!hasCompletedWorkout) {
        // Get the client's current adherence signal
        const program = trainerPrograms.find((p) => p.clientId === checkIn.clientId);
        if (program) {
          const signal = await getClientAdherenceSignal(checkIn.clientId, program._id);

          // Only surface if still At Risk or Inactive
          if (signal.status === 'At Risk' || signal.status === 'Inactive') {
            noResponseClients.push({
              clientId: checkIn.clientId,
              reason: signal.status,
              reasonDescription: `No response after check-in (${daysSinceCheckIn} days)`,
              lastWorkoutDate: signal.lastWorkoutDate,
              daysSinceLastActivity: signal.daysSinceLastActivity,
              avgDifficulty: signal.avgDifficulty,
              missedWorkoutsLast7Days: signal.missedWorkoutsLast7Days,
              noResponseLabel: '⚠️ No response after check-in',
            });
          }
        }
      }
    }

    return noResponseClients;
  } catch (error) {
    console.error('Error getting clients with no response after check-in:', error);
    return [];
  }
}

/**
 * Send a coach check-in message to a client
 */
export async function sendCoachCheckInMessage(
  clientId: string,
  trainerId: string,
  message: string,
  reason: AdherenceStatus
): Promise<CoachCheckInMessage> {
  try {
    const checkInMessage: ClientCoachMessages = {
      _id: crypto.randomUUID(),
      clientId,
      trainerId,
      message,
      reason,
      sentAt: new Date().toISOString(),
      responded: false,
      reengagedWithin72h: false,
    };

    await BaseCrudService.create('clientcoachmessages', checkInMessage);

    return {
      _id: checkInMessage._id,
      clientId,
      trainerId,
      message,
      reason: reason as AdherenceStatus,
      sentAt: new Date(),
      responded: false,
      reengagedWithin72h: false,
    };
  } catch (error) {
    console.error('Error sending check-in message:', error);
    throw new Error('Failed to send check-in message');
  }
}

/**
 * Mark a check-in as responded
 */
export async function markCheckInAsResponded(
  checkInId: string
): Promise<void> {
  try {
    await BaseCrudService.update<ClientCoachMessages>('clientcoachmessages', {
      _id: checkInId,
      responded: true,
      respondedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking check-in as responded:', error);
    throw new Error('Failed to mark check-in as responded');
  }
}

/**
 * Track if client re-engaged within 72 hours of check-in
 */
export async function trackCheckInReengagement(
  checkInId: string,
  clientId: string,
  trainerId: string,
  hoursToCheck: number = 72
): Promise<void> {
  try {
    // Get the check-in message
    const { items } = await BaseCrudService.getAll<ClientCoachMessages>(
      'clientcoachmessages'
    );
    const checkIn = items.find((m) => m._id === checkInId);

    if (!checkIn || !checkIn.sentAt) return;

    // Check if client completed a workout within the specified hours
    const checkInTime = new Date(checkIn.sentAt);
    const cutoffTime = new Date(checkInTime.getTime() + hoursToCheck * 60 * 60 * 1000);

    const { items: activities } = await BaseCrudService.getAll<any>(
      'clientworkoutactivity'
    );
    const reengaged = activities.some(
      (a) =>
        a.clientId === clientId &&
        a.completed &&
        a.completedAt &&
        new Date(a.completedAt) >= checkInTime &&
        new Date(a.completedAt) <= cutoffTime
    );

    // Update the check-in with re-engagement status
    await BaseCrudService.update<ClientCoachMessages>('clientcoachmessages', {
      _id: checkInId,
      reengagedWithin72h: reengaged,
    });
  } catch (error) {
    console.error('Error tracking check-in re-engagement:', error);
    // Don't throw - this is non-blocking tracking
  }
}

/**
 * Get pre-filled message templates based on reason
 */
export function getCheckInMessageTemplate(
  reason: AdherenceStatus,
  clientName?: string,
  additionalContext?: {
    missedWorkouts?: number;
    difficulty?: number;
    daysSinceActivity?: number;
  }
): string {
  const name = clientName ? ` ${clientName}` : '';

  switch (reason) {
    case 'At Risk':
      return `Hi${name},

I noticed you've missed a couple of workouts this week. I want to check in and see how you're doing. 

Is everything okay? If you're facing any challenges with the programme or your schedule, let me know and we can adjust things to make it work better for you.

Looking forward to hearing from you.`;

    case 'Too Hard':
      return `Hi${name},

I've been reviewing your feedback, and it seems the current programme might be a bit challenging for you right now. 

Let's chat about this – we can scale things back or adjust the intensity to make sure you're getting the most out of your training without feeling overwhelmed.

When you have a moment, let me know your thoughts.`;

    case 'Too Easy':
      return `Hi${name},

Great news! It looks like you're finding the current programme manageable and even enjoying it. 

I think you're ready for the next level. Let's discuss how we can progress your training to keep challenging you and help you reach your goals.

Let me know when you're free to chat.`;

    case 'Inactive':
      return `Hi${name},

I haven't seen you in the app for a while, and I wanted to check in. 

I'm here to support you, and if there's anything getting in the way of your training – whether it's motivation, time, or something else – let's talk about it. We can find a way forward together.

Hope to hear from you soon.`;

    default:
      return `Hi${name},

I wanted to check in and see how you're getting on with your programme. Let me know if you have any questions or if there's anything I can help with.`;
  }
}

/**
 * Get follow-up message templates (specific to follow-up reminders)
 * These are different from initial check-in templates
 */
export function getFollowUpMessageTemplates(
  reason: AdherenceStatus
): Array<{ label: string; text: string }> {
  switch (reason) {
    case 'At Risk':
      return [
        {
          label: 'Gentle re-engagement',
          text: `Hi,

I wanted to check in again. I know life gets busy, but I'd love to help you get back on track with your training.

Is there anything I can adjust in your programme to make it easier to fit into your schedule? Let me know how I can support you.`,
        },
        {
          label: 'Problem-solving approach',
          text: `Hi,

I've noticed you've missed a few sessions recently. Rather than pushing harder, I'd like to understand what's getting in the way.

Are there specific obstacles we can work around together? Let's find a solution that works for you.`,
        },
      ];

    case 'Inactive':
      return [
        {
          label: 'Reconnection',
          text: `Hi,

I've missed seeing you in the app. I want to make sure you're okay and that your programme is still working for you.

Let's reconnect and get you back on track. What's been going on?`,
        },
        {
          label: 'Support & understanding',
          text: `Hi,

It's been a while since we last connected. I'm here to support you, not judge.

If something's changed or you're facing challenges, let's talk about it. We can adjust your programme or find a way forward together.`,
        },
      ];

    case 'Too Hard':
      return [
        {
          label: 'Scaling back offer',
          text: `Hi,

I want to check in about how the programme is feeling. If it's been too intense, we can absolutely scale things back.

Your consistency and long-term progress matter more than pushing too hard. Let me know if you'd like to adjust.`,
        },
        {
          label: 'Recovery focus',
          text: `Hi,

I've been thinking about your training. Sometimes taking a step back to focus on recovery and form is exactly what we need.

Would you like to dial back the intensity for a bit? We can refocus on quality over quantity.`,
        },
      ];

    case 'Too Easy':
      return [
        {
          label: 'Progression opportunity',
          text: `Hi,

You're doing great with your current programme! I think you're ready for the next level.

Let's discuss how we can progress your training to keep you challenged and engaged. When can we chat about this?`,
        },
        {
          label: 'Momentum building',
          text: `Hi,

I love seeing your consistency! You're clearly ready for more.

Let's increase the challenge and keep building on this momentum. Are you open to progressing your training?`,
        },
      ];

    default:
      return [
        {
          label: 'General check-in',
          text: `Hi,

I wanted to check in and see how you're getting on. Let me know if there's anything I can help with.`,
        },
      ];
  }
}

/**
 * Get recent check-in messages sent to a client
 */
export async function getRecentCheckInMessages(
  clientId: string,
  trainerId: string,
  days: number = 30
): Promise<CoachCheckInMessage[]> {
  try {
    const { items } = await BaseCrudService.getAll<ClientCoachMessages>(
      'clientcoachmessages'
    );

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return items
      .filter(
        (m) =>
          m.clientId === clientId &&
          m.trainerId === trainerId &&
          m.sentAt &&
          new Date(m.sentAt) >= cutoffDate
      )
      .map((m) => ({
        _id: m._id,
        clientId: m.clientId || '',
        trainerId: m.trainerId || '',
        message: m.message || '',
        reason: (m.reason as AdherenceStatus) || 'At Risk',
        sentAt: new Date(m.sentAt || new Date()),
        responded: m.responded,
        respondedAt: m.respondedAt ? new Date(m.respondedAt) : undefined,
        reengagedWithin72h: m.reengagedWithin72h,
      }))
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  } catch (error) {
    console.error('Error getting check-in messages:', error);
    return [];
  }
}

/**
 * Check if a check-in was already sent recently (prevent duplicates)
 */
export async function hasRecentCheckIn(
  clientId: string,
  trainerId: string,
  hoursAgo: number = 24
): Promise<boolean> {
  try {
    const { items } = await BaseCrudService.getAll<ClientCoachMessages>(
      'clientcoachmessages'
    );

    const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    return items.some(
      (m) =>
        m.clientId === clientId &&
        m.trainerId === trainerId &&
        m.sentAt &&
        new Date(m.sentAt) >= cutoffDate
    );
  } catch (error) {
    console.error('Error checking recent check-in:', error);
    return false;
  }
}

/**
 * Get check-in effectiveness metrics for a trainer
 * Returns data on how many clients re-engaged within 72h of check-in
 */
export async function getCheckInEffectivenessMetrics(
  trainerId: string,
  days: number = 30
): Promise<{
  totalCheckInsSent: number;
  clientsReengagedWithin72h: number;
  effectivenessRate: number;
}> {
  try {
    const { items } = await BaseCrudService.getAll<ClientCoachMessages>(
      'clientcoachmessages'
    );

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const relevantCheckIns = items.filter(
      (m) =>
        m.trainerId === trainerId &&
        m.sentAt &&
        new Date(m.sentAt) >= cutoffDate
    );

    const reengaged = relevantCheckIns.filter((m) => m.reengagedWithin72h).length;

    return {
      totalCheckInsSent: relevantCheckIns.length,
      clientsReengagedWithin72h: reengaged,
      effectivenessRate: relevantCheckIns.length > 0 ? (reengaged / relevantCheckIns.length) * 100 : 0,
    };
  } catch (error) {
    console.error('Error getting check-in effectiveness metrics:', error);
    return {
      totalCheckInsSent: 0,
      clientsReengagedWithin72h: 0,
      effectivenessRate: 0,
    };
  }
}

export default {
  getClientsNeedingCheckIn,
  getClientsWithNoResponseAfterCheckIn,
  getFollowUpReminders,
  getDismissedReminders,
  dismissFollowUpReminder,
  clearDismissedReminder,
  sendCoachCheckInMessage,
  markCheckInAsResponded,
  trackCheckInReengagement,
  getCheckInMessageTemplate,
  getCheckInMessageTemplates,
  getFollowUpMessageTemplates,
  getRecentCheckInMessages,
  hasRecentCheckIn,
  getCheckInEffectivenessMetrics,
};
