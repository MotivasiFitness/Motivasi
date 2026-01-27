/**
 * Notification Service
 * Handles creation and management of trainer notifications for client workout activities
 */

import { TrainerNotifications } from '@/entities';
import ProtectedDataService from './protected-data-service';

export type NotificationType = 'workout_completed' | 'week_completed' | 'reflection_submitted';

interface CreateNotificationParams {
  trainerId: string;
  clientId: string;
  clientName: string;
  notificationType: NotificationType;
  relatedWorkoutId?: string;
  relatedWeekNumber?: number;
  exerciseName?: string;
}

/**
 * Creates a notification for a trainer based on client activity
 */
export async function createTrainerNotification(params: CreateNotificationParams): Promise<void> {
  const { trainerId, clientId, clientName, notificationType, relatedWorkoutId, relatedWeekNumber, exerciseName } = params;

  let message = '';
  let linkUrl = '';

  switch (notificationType) {
    case 'workout_completed':
      message = `${clientName} completed a workout${exerciseName ? `: ${exerciseName}` : ''}`;
      linkUrl = relatedWorkoutId ? `/trainer/workout-feedback?workoutId=${relatedWorkoutId}` : '/trainer/workout-feedback';
      break;
    case 'week_completed':
      message = `${clientName} completed all workouts for week ${relatedWeekNumber}`;
      linkUrl = `/trainer/progress?clientId=${clientId}&week=${relatedWeekNumber}`;
      break;
    case 'reflection_submitted':
      message = `${clientName} submitted a post-workout reflection`;
      linkUrl = relatedWorkoutId ? `/trainer/workout-feedback?workoutId=${relatedWorkoutId}` : '/trainer/workout-feedback';
      break;
  }

  const notification: TrainerNotifications = {
    _id: crypto.randomUUID(),
    trainerId,
    clientId,
    notificationType,
    message,
    linkUrl,
    isRead: false,
    isDismissed: false,
    createdAt: new Date().toISOString(),
    relatedWorkoutId,
    relatedWeekNumber,
  };

  await ProtectedDataService.create('trainernotifications', notification);
}

/**
 * Fetches unread notifications for a trainer
 */
export async function getUnreadNotifications(trainerId: string): Promise<TrainerNotifications[]> {
  const { items } = await ProtectedDataService.getAll<TrainerNotifications>('trainernotifications');
  return items.filter(n => n.trainerId === trainerId && !n.isRead && !n.isDismissed);
}

/**
 * Fetches all notifications for a trainer (paginated)
 */
export async function getTrainerNotifications(trainerId: string, limit = 50, skip = 0) {
  const result = await ProtectedDataService.getAll<TrainerNotifications>('trainernotifications', { limit, skip });
  const filtered = result.items.filter(n => n.trainerId === trainerId && !n.isDismissed);
  
  return {
    items: filtered,
    totalCount: filtered.length,
    hasNext: result.hasNext,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    nextSkip: result.nextSkip,
  };
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await BaseCrudService.update<TrainerNotifications>('trainernotifications', {
    _id: notificationId,
    isRead: true,
  });
}

/**
 * Dismisses a notification
 */
export async function dismissNotification(notificationId: string): Promise<void> {
  await BaseCrudService.update<TrainerNotifications>('trainernotifications', {
    _id: notificationId,
    isDismissed: true,
  });
}

/**
 * Marks all notifications as read for a trainer
 */
export async function markAllAsRead(trainerId: string): Promise<void> {
  const { items } = await BaseCrudService.getAll<TrainerNotifications>('trainernotifications');
  const unreadNotifications = items.filter(n => n.trainerId === trainerId && !n.isRead);

  for (const notification of unreadNotifications) {
    await BaseCrudService.update<TrainerNotifications>('trainernotifications', {
      _id: notification._id,
      isRead: true,
    });
  }
}

/**
 * Gets the count of unread notifications for a trainer
 */
export async function getUnreadCount(trainerId: string): Promise<number> {
  const unread = await getUnreadNotifications(trainerId);
  return unread.length;
}
