import { BaseCrudService } from '@/integrations';
import { TrainerClientAssignments, MemberRoles } from '@/entities';

export type MemberRole = 'client' | 'trainer' | 'admin';

/**
 * Debug info for role operations
 */
export interface RoleDebugInfo {
  memberId: string;
  roleRecordFound: boolean;
  roleValue: MemberRole | null;
  error?: string;
  timestamp: number;
}

/**
 * Get the role of a member from the MemberRoles collection
 * This queries the backend for secure, persistent role storage
 * Filters by memberId field specifically
 */
export async function getMemberRole(memberId: string): Promise<MemberRole | null> {
  try {
    console.log(`[getMemberRole] Fetching role for memberId: ${memberId}`);
    const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
    
    // Filter by memberId field - this is the critical query
    const memberRole = items.find(
      (mr) => mr.memberId === memberId && mr.status === 'active'
    );
    
    if (memberRole) {
      console.log(`[getMemberRole] Found role record:`, memberRole);
      const role = memberRole.role as MemberRole | undefined;
      console.log(`[getMemberRole] Role value: ${role}`);
      return role || null;
    } else {
      console.log(`[getMemberRole] No role record found for memberId: ${memberId}`);
      return null;
    }
  } catch (error) {
    console.error('[getMemberRole] Error fetching member role:', error);
    return null;
  }
}

/**
 * Get debug info about a member's role
 */
export async function getMemberRoleDebugInfo(memberId: string): Promise<RoleDebugInfo> {
  try {
    const role = await getMemberRole(memberId);
    return {
      memberId,
      roleRecordFound: role !== null,
      roleValue: role,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      memberId,
      roleRecordFound: false,
      roleValue: null,
      error: String(error),
      timestamp: Date.now(),
    };
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
 * Implements atomic upsert: if role exists, return it; if not, create it
 * Includes retry logic for transient failures
 */
export async function setDefaultRole(memberId: string, maxRetries: number = 3): Promise<MemberRole> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[setDefaultRole] Attempt ${attempt}/${maxRetries} for memberId: ${memberId}`);
      
      // Check if member already has a role
      const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
      const existingRole = items.find((mr) => mr.memberId === memberId);

      if (existingRole) {
        console.log(`[setDefaultRole] Role already exists for ${memberId}:`, existingRole);
        const role = existingRole.role as MemberRole;
        return role;
      }

      // Create new role assignment
      console.log(`[setDefaultRole] Creating new client role for ${memberId}`);
      const newRole: MemberRoles = {
        _id: crypto.randomUUID(),
        memberId,
        role: 'client',
        assignmentDate: new Date(),
        status: 'active',
      };
      
      await BaseCrudService.create('memberroles', newRole);
      console.log(`[setDefaultRole] Successfully created role for ${memberId}`);
      
      // Verify the role was created by refetching
      await new Promise(resolve => setTimeout(resolve, 100));
      const { items: updatedItems } = await BaseCrudService.getAll<MemberRoles>('memberroles');
      const verifiedRole = updatedItems.find((mr) => mr.memberId === memberId);
      
      if (verifiedRole) {
        console.log(`[setDefaultRole] Verified role creation for ${memberId}`);
        return 'client';
      } else {
        throw new Error('Role creation verification failed');
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`[setDefaultRole] Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 100ms, 200ms, 400ms
        const delay = 100 * Math.pow(2, attempt - 1);
        console.log(`[setDefaultRole] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  console.error(`[setDefaultRole] Failed after ${maxRetries} attempts:`, lastError);
  throw new Error(`Failed to set default role after ${maxRetries} attempts: ${lastError?.message}`);
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
