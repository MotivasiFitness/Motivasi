/**
 * Team Management Service
 * Handles multi-trainer team support with role-based permissions
 * Supports Head Coach / Trainer roles and template approval workflows
 */

import { BaseCrudService } from '@/integrations';
import { MemberRoles, FitnessPrograms } from '@/entities';

export type TeamRole = 'head-coach' | 'trainer' | 'assistant';

export interface TeamMember {
  memberId: string;
  role: TeamRole;
  joinedAt: Date;
  status: 'active' | 'inactive';
  permissions: TeamPermission[];
}

export interface TeamPermission {
  resource: 'programs' | 'templates' | 'snippets' | 'team' | 'analytics';
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'share';
  allowed: boolean;
}

export interface ProgramTemplate {
  _id: string;
  templateName: string;
  description: string;
  programData: any; // Serialized program structure
  createdBy: string;
  teamId?: string;
  isShared: boolean;
  approvalStatus: 'draft' | 'pending-approval' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalNotes?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamStylePreset {
  _id: string;
  presetName: string;
  repRanges: Record<string, string>;
  restTimes: Record<string, number>;
  favoriteExercises: string[];
  coachingTone: 'motivational' | 'technical' | 'balanced';
  createdBy: string;
  teamId?: string;
  isShared: boolean;
  usageCount: number;
  createdAt: Date;
}

/**
 * Get role-based permissions
 */
export function getRolePermissions(role: TeamRole): TeamPermission[] {
  const basePermissions: Record<TeamRole, TeamPermission[]> = {
    'head-coach': [
      { resource: 'programs', action: 'create', allowed: true },
      { resource: 'programs', action: 'read', allowed: true },
      { resource: 'programs', action: 'update', allowed: true },
      { resource: 'programs', action: 'delete', allowed: true },
      { resource: 'programs', action: 'approve', allowed: true },
      { resource: 'programs', action: 'share', allowed: true },
      { resource: 'templates', action: 'create', allowed: true },
      { resource: 'templates', action: 'read', allowed: true },
      { resource: 'templates', action: 'update', allowed: true },
      { resource: 'templates', action: 'delete', allowed: true },
      { resource: 'templates', action: 'approve', allowed: true },
      { resource: 'templates', action: 'share', allowed: true },
      { resource: 'snippets', action: 'create', allowed: true },
      { resource: 'snippets', action: 'read', allowed: true },
      { resource: 'snippets', action: 'update', allowed: true },
      { resource: 'snippets', action: 'delete', allowed: true },
      { resource: 'snippets', action: 'share', allowed: true },
      { resource: 'team', action: 'create', allowed: true },
      { resource: 'team', action: 'read', allowed: true },
      { resource: 'team', action: 'update', allowed: true },
      { resource: 'team', action: 'delete', allowed: true },
      { resource: 'analytics', action: 'read', allowed: true },
    ],
    'trainer': [
      { resource: 'programs', action: 'create', allowed: true },
      { resource: 'programs', action: 'read', allowed: true },
      { resource: 'programs', action: 'update', allowed: true },
      { resource: 'programs', action: 'delete', allowed: true },
      { resource: 'programs', action: 'approve', allowed: false },
      { resource: 'programs', action: 'share', allowed: false },
      { resource: 'templates', action: 'create', allowed: true },
      { resource: 'templates', action: 'read', allowed: true },
      { resource: 'templates', action: 'update', allowed: true },
      { resource: 'templates', action: 'delete', allowed: false },
      { resource: 'templates', action: 'approve', allowed: false },
      { resource: 'templates', action: 'share', allowed: false },
      { resource: 'snippets', action: 'create', allowed: true },
      { resource: 'snippets', action: 'read', allowed: true },
      { resource: 'snippets', action: 'update', allowed: true },
      { resource: 'snippets', action: 'delete', allowed: true },
      { resource: 'snippets', action: 'share', allowed: false },
      { resource: 'team', action: 'create', allowed: false },
      { resource: 'team', action: 'read', allowed: true },
      { resource: 'team', action: 'update', allowed: false },
      { resource: 'team', action: 'delete', allowed: false },
      { resource: 'analytics', action: 'read', allowed: true },
    ],
    'assistant': [
      { resource: 'programs', action: 'create', allowed: false },
      { resource: 'programs', action: 'read', allowed: true },
      { resource: 'programs', action: 'update', allowed: false },
      { resource: 'programs', action: 'delete', allowed: false },
      { resource: 'programs', action: 'approve', allowed: false },
      { resource: 'programs', action: 'share', allowed: false },
      { resource: 'templates', action: 'create', allowed: false },
      { resource: 'templates', action: 'read', allowed: true },
      { resource: 'templates', action: 'update', allowed: false },
      { resource: 'templates', action: 'delete', allowed: false },
      { resource: 'templates', action: 'approve', allowed: false },
      { resource: 'templates', action: 'share', allowed: false },
      { resource: 'snippets', action: 'create', allowed: false },
      { resource: 'snippets', action: 'read', allowed: true },
      { resource: 'snippets', action: 'update', allowed: false },
      { resource: 'snippets', action: 'delete', allowed: false },
      { resource: 'snippets', action: 'share', allowed: false },
      { resource: 'team', action: 'create', allowed: false },
      { resource: 'team', action: 'read', allowed: true },
      { resource: 'team', action: 'update', allowed: false },
      { resource: 'team', action: 'delete', allowed: false },
      { resource: 'analytics', action: 'read', allowed: false },
    ],
  };

  return basePermissions[role];
}

/**
 * Check if user has permission
 */
export function hasPermission(
  permissions: TeamPermission[],
  resource: string,
  action: string
): boolean {
  const permission = permissions.find(p => p.resource === resource && p.action === action);
  return permission?.allowed || false;
}

/**
 * Get user's team role
 */
export async function getUserTeamRole(memberId: string): Promise<TeamRole | null> {
  try {
    const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
    const memberRole = items.find(r => r.memberId === memberId);
    
    if (memberRole?.role === 'head-coach') return 'head-coach';
    if (memberRole?.role === 'trainer') return 'trainer';
    if (memberRole?.role === 'assistant') return 'assistant';
    
    return null;
  } catch (error) {
    console.error('Error getting user team role:', error);
    return null;
  }
}

/**
 * Create program template
 */
export async function createProgramTemplate(
  templateName: string,
  description: string,
  programData: any,
  createdBy: string,
  isShared: boolean = false,
  teamId?: string
): Promise<ProgramTemplate> {
  try {
    const template: ProgramTemplate = {
      _id: crypto.randomUUID(),
      templateName,
      description,
      programData,
      createdBy,
      teamId,
      isShared,
      approvalStatus: isShared ? 'pending-approval' : 'draft',
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in localStorage for now (would be database in production)
    const templates = JSON.parse(localStorage.getItem('program_templates') || '[]');
    templates.push(template);
    localStorage.setItem('program_templates', JSON.stringify(templates));

    return template;
  } catch (error) {
    console.error('Error creating program template:', error);
    throw new Error('Failed to create program template');
  }
}

/**
 * Get program templates
 */
export async function getProgramTemplates(
  createdBy?: string,
  teamId?: string,
  approvalStatus?: string
): Promise<ProgramTemplate[]> {
  try {
    const templates = JSON.parse(localStorage.getItem('program_templates') || '[]');
    
    return templates.filter((t: ProgramTemplate) => {
      if (createdBy && t.createdBy !== createdBy) return false;
      if (teamId && t.teamId !== teamId) return false;
      if (approvalStatus && t.approvalStatus !== approvalStatus) return false;
      return true;
    });
  } catch (error) {
    console.error('Error fetching program templates:', error);
    return [];
  }
}

/**
 * Approve program template (Head Coach only)
 */
export async function approveProgramTemplate(
  templateId: string,
  approvedBy: string,
  approvalNotes?: string
): Promise<void> {
  try {
    const templates = JSON.parse(localStorage.getItem('program_templates') || '[]');
    const template = templates.find((t: ProgramTemplate) => t._id === templateId);
    
    if (template) {
      template.approvalStatus = 'approved';
      template.approvedBy = approvedBy;
      template.approvalNotes = approvalNotes;
      template.updatedAt = new Date();
      
      localStorage.setItem('program_templates', JSON.stringify(templates));
    }
  } catch (error) {
    console.error('Error approving template:', error);
    throw new Error('Failed to approve template');
  }
}

/**
 * Reject program template (Head Coach only)
 */
export async function rejectProgramTemplate(
  templateId: string,
  rejectedBy: string,
  rejectionReason: string
): Promise<void> {
  try {
    const templates = JSON.parse(localStorage.getItem('program_templates') || '[]');
    const template = templates.find((t: ProgramTemplate) => t._id === templateId);
    
    if (template) {
      template.approvalStatus = 'rejected';
      template.approvedBy = rejectedBy;
      template.approvalNotes = rejectionReason;
      template.updatedAt = new Date();
      
      localStorage.setItem('program_templates', JSON.stringify(templates));
    }
  } catch (error) {
    console.error('Error rejecting template:', error);
    throw new Error('Failed to reject template');
  }
}

/**
 * Create team style preset
 */
export async function createTeamStylePreset(
  presetName: string,
  repRanges: Record<string, string>,
  restTimes: Record<string, number>,
  favoriteExercises: string[],
  coachingTone: 'motivational' | 'technical' | 'balanced',
  createdBy: string,
  teamId?: string,
  isShared: boolean = false
): Promise<TeamStylePreset> {
  try {
    const preset: TeamStylePreset = {
      _id: crypto.randomUUID(),
      presetName,
      repRanges,
      restTimes,
      favoriteExercises,
      coachingTone,
      createdBy,
      teamId,
      isShared,
      usageCount: 0,
      createdAt: new Date(),
    };

    // Store in localStorage for now
    const presets = JSON.parse(localStorage.getItem('team_style_presets') || '[]');
    presets.push(preset);
    localStorage.setItem('team_style_presets', JSON.stringify(presets));

    return preset;
  } catch (error) {
    console.error('Error creating team style preset:', error);
    throw new Error('Failed to create team style preset');
  }
}

/**
 * Get team style presets
 */
export async function getTeamStylePresets(
  createdBy?: string,
  teamId?: string
): Promise<TeamStylePreset[]> {
  try {
    const presets = JSON.parse(localStorage.getItem('team_style_presets') || '[]');
    
    return presets.filter((p: TeamStylePreset) => {
      if (createdBy && p.createdBy !== createdBy) return false;
      if (teamId && p.teamId !== teamId) return false;
      return true;
    });
  } catch (error) {
    console.error('Error fetching team style presets:', error);
    return [];
  }
}

/**
 * Get shared team resources (templates, presets, snippets)
 */
export async function getSharedTeamResources(teamId: string) {
  try {
    const [templates, presets] = await Promise.all([
      getProgramTemplates(undefined, teamId, 'approved'),
      getTeamStylePresets(undefined, teamId),
    ]);

    return {
      templates,
      presets,
    };
  } catch (error) {
    console.error('Error fetching shared team resources:', error);
    return {
      templates: [],
      presets: [],
    };
  }
}

export default {
  getRolePermissions,
  hasPermission,
  getUserTeamRole,
  createProgramTemplate,
  getProgramTemplates,
  approveProgramTemplate,
  rejectProgramTemplate,
  createTeamStylePreset,
  getTeamStylePresets,
  getSharedTeamResources,
};
