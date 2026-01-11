import { BaseCrudService } from '@/integrations';
import { TrainerClientAssignments } from '@/entities';
import { MemberRole } from '@/entities';

/**
 * Get the role of a member from localStorage or session
 * This is a client-side helper - in production, roles should be stored in a database
 */
export function getMemberRole(memberId: string): MemberRole | null {
  if (typeof window === 'undefined') return null;
  
  const roles = JSON.parse(localStorage.getItem('memberRoles') || '{}');
  return roles[memberId] || null;
}

/**
 * Set the role of a member in localStorage
 * This is a client-side helper - in production, roles should be stored in a database
 */
export function setMemberRole(memberId: string, role: MemberRole): void {
  if (typeof window === 'undefined') return;
  
  const roles = JSON.parse(localStorage.getItem('memberRoles') || '{}');
  roles[memberId] = role;
  localStorage.setItem('memberRoles', JSON.stringify(roles));
}

/**
 * Check if a member is a trainer
 */
export function isTrainer(memberId: string): boolean {
  return getMemberRole(memberId) === 'trainer';
}

/**
 * Check if a member is a client
 */
export function isClient(memberId: string): boolean {
  return getMemberRole(memberId) === 'client';
}

/**
 * Check if a member is an admin
 */
export function isAdmin(memberId: string): boolean {
  return getMemberRole(memberId) === 'admin';
}

/**
 * Assign a client to a trainer
 */
export async function assignClientToTrainer(
  trainerId: string,
  clientId: string,
  notes?: string
): Promise<TrainerClientAssignments> {
  const assignment: TrainerClientAssignments = {
    _id: crypto.randomUUID(),
    trainerId,
    clientId,
    assignmentDate: new Date(),
    status: 'Active',
    notes: notes || '',
  };

  await BaseCrudService.create('trainerclientassignments', assignment);
  return assignment;
}

/**
 * Get all clients assigned to a trainer
 */
export async function getTrainerClients(trainerId: string): Promise<TrainerClientAssignments[]> {
  const { items } = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
  return items.filter(
    (assignment) => assignment.trainerId === trainerId && assignment.status === 'Active'
  );
}

/**
 * Get all trainers assigned to a client
 */
export async function getClientTrainers(clientId: string): Promise<TrainerClientAssignments[]> {
  const { items } = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
  return items.filter(
    (assignment) => assignment.clientId === clientId && assignment.status === 'Active'
  );
}

/**
 * Check if a trainer is assigned to a client
 */
export async function isTrainerAssignedToClient(
  trainerId: string,
  clientId: string
): Promise<boolean> {
  const { items } = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
  return items.some(
    (assignment) =>
      assignment.trainerId === trainerId &&
      assignment.clientId === clientId &&
      assignment.status === 'Active'
  );
}

/**
 * Update assignment status
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  status: 'Active' | 'Inactive' | 'Paused'
): Promise<void> {
  await BaseCrudService.update('trainerclientassignments', {
    _id: assignmentId,
    status,
  });
}

/**
 * Remove a client from a trainer (soft delete by marking as Inactive)
 */
export async function removeClientFromTrainer(assignmentId: string): Promise<void> {
  await updateAssignmentStatus(assignmentId, 'Inactive');
}

/**
 * Check if a trainer can access a client's data
 */
export async function canTrainerAccessClient(
  trainerId: string,
  clientId: string
): Promise<boolean> {
  return isTrainerAssignedToClient(trainerId, clientId);
}

/**
 * Check if a client can access their own data
 */
export function canClientAccessOwnData(memberId: string, targetMemberId: string): boolean {
  return memberId === targetMemberId;
}
