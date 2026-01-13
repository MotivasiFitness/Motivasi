/**
 * Coach Check-In Service
 * Manages trainer-initiated check-in messages with clients
 * Reuses existing adherence data to identify clients needing check-ins
 */

import { BaseCrudService } from '@/integrations';
import { ClientCoachMessages } from '@/entities';
import { getClientAdherenceSignal, AdherenceStatus } from '@/lib/adherence-tracking';

export interface ClientCheckInPrompt {
  clientId: string;
  reason: AdherenceStatus;
  reasonDescription: string;
  lastWorkoutDate?: Date;
  daysSinceLastActivity?: number;
  avgDifficulty?: number;
  missedWorkoutsLast7Days?: number;
}

export interface CoachCheckInMessage {
  _id: string;
  clientId: string;
  trainerId: string;
  message: string;
  reason: AdherenceStatus;
  sentAt: Date;
}

/**
 * Get clients that need check-ins for a trainer
 * Returns clients with risk signals (At Risk, Too Hard, Too Easy, Inactive)
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

    return checkInPrompts;
  } catch (error) {
    console.error('Error getting clients needing check-in:', error);
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
    };

    await BaseCrudService.create('clientcoachmessages', checkInMessage);

    return {
      _id: checkInMessage._id,
      clientId,
      trainerId,
      message,
      reason,
      sentAt: new Date(),
    };
  } catch (error) {
    console.error('Error sending check-in message:', error);
    throw new Error('Failed to send check-in message');
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

export default {
  getClientsNeedingCheckIn,
  sendCoachCheckInMessage,
  getCheckInMessageTemplate,
  getRecentCheckInMessages,
  hasRecentCheckIn,
};
