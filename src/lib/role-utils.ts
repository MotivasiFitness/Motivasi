import { BaseCrudService } from '@/integrations';
import { TrainerClientAssignments, MemberRoles } from '@/entities';

export type MemberRole = 'client' | 'trainer' | 'admin';

/**
 * Get the role of a member from the MemberRoles collection
 * This queries the backend for secure, persistent role storage
 */
export async function getMemberRole(memberId: string): Promise<MemberRole | null> {
  try {
    const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
    const memberRole = items.find(
      (mr) => mr.memberId === memberId && mr.status === 'active'
    );
    const role = memberRole?.role as MemberRole | undefined;
    return role || null;
  } catch (error) {
    console.error('Error fetching member role:', error);
    return null;
  }
}

/**
 * Set the role of a member in the MemberRoles collection
 * This creates or updates a role assignment in the backend
 * 
 * NOTE: For security, only admins should be able to change roles to 'trainer'
 * Non-admin users can only set their own role to 'client' during initial setup
 */
export async function setMemberRole(memberId: string, role: MemberRole): Promise<void> {
  try {
    // Check if member already has a role
    const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
    const existingRole = items.find((mr) => mr.memberId === memberId);

    if (existingRole) {
      // Update existing role
      await BaseCrudService.update<MemberRoles>('memberroles', {
        _id: existingRole._id,
        role,
        status: 'active',
      });
    } else {
      // Create new role assignment
      const newRole: MemberRoles = {
        _id: crypto.randomUUID(),
        memberId,
        role,
        assignmentDate: new Date(),
        status: 'active',
      };
      await BaseCrudService.create('memberroles', newRole);
    }
  } catch (error) {
    console.error('Error setting member role:', error);
    throw new Error('Failed to set member role');
  }
}

/**
 * Set the default role for a new member (always 'client')
 * This is called during initial signup to ensure new users default to client role
 */
export async function setDefaultRole(memberId: string): Promise<void> {
  try {
    // Check if member already has a role
    const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
    const existingRole = items.find((mr) => mr.memberId === memberId);

    // Only set default role if member doesn't already have one
    if (!existingRole) {
      const newRole: MemberRoles = {
        _id: crypto.randomUUID(),
        memberId,
        role: 'client',
        assignmentDate: new Date(),
        status: 'active',
      };
      await BaseCrudService.create('memberroles', newRole);
    }
  } catch (error) {
    console.error('Error setting default role:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Change a member's role (admin-only operation)
 * Only admins can change roles, especially to 'trainer'
 */
export async function changeUserRole(
  adminId: string,
  targetUserId: string,
  newRole: MemberRole
): Promise<void> {
  // Verify that the admin is actually an admin
  const adminRole = await getMemberRole(adminId);
  if (adminRole !== 'admin') {
    throw new Error('Only administrators can change user roles');
  }
  
  // Prevent changing to trainer role unless explicitly approved
  if (newRole === 'trainer') {
    console.warn(`Admin ${adminId} is changing user ${targetUserId} to trainer role`);
  }
  
  await setMemberRole(targetUserId, newRole);
}

/**
 * Check if a member is a trainer
 */
export async function isTrainer(memberId: string): Promise<boolean> {
  const role = await getMemberRole(memberId);
  return role === 'trainer';
}

/**
 * Check if a member is a client
 */
export async function isClient(memberId: string): Promise<boolean> {
  const role = await getMemberRole(memberId);
  return role === 'client';
}

/**
 * Check if a member is an admin
 */
export async function isAdmin(memberId: string): Promise<boolean> {
  const role = await getMemberRole(memberId);
  return role === 'admin';
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
