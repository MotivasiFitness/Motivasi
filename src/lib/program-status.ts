/**
 * Program Status Constants and Utilities
 * 
 * Single source of truth for program status values.
 * All status values MUST be lowercase to ensure consistency across the application.
 */

/**
 * Valid program status values (lowercase only)
 */
export const PROGRAM_STATUS = {
  DRAFT: 'draft',
  ASSIGNED: 'assigned',
  TEMPLATE: 'template',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
} as const;

/**
 * Type for program status
 */
export type ProgramStatus = typeof PROGRAM_STATUS[keyof typeof PROGRAM_STATUS];

/**
 * All valid status values as an array
 */
export const VALID_PROGRAM_STATUSES: ProgramStatus[] = Object.values(PROGRAM_STATUS);

/**
 * Normalize status to lowercase
 * Ensures consistency even if data comes in with mixed case
 * 
 * @param status - Status value (any case)
 * @returns Normalized lowercase status, or 'draft' if invalid
 */
export function normalizeStatus(status: string | undefined | null): ProgramStatus {
  if (!status) return PROGRAM_STATUS.DRAFT;
  
  const normalized = status.toLowerCase().trim();
  
  // Validate against known statuses
  if (VALID_PROGRAM_STATUSES.includes(normalized as ProgramStatus)) {
    return normalized as ProgramStatus;
  }
  
  // Handle common aliases
  if (normalized === 'active') return PROGRAM_STATUS.ASSIGNED;
  
  // Default to draft for unknown values
  console.warn(`⚠️ Unknown program status: "${status}", defaulting to "draft"`);
  return PROGRAM_STATUS.DRAFT;
}

/**
 * Validate that a status is valid
 * 
 * @param status - Status to validate
 * @returns true if valid, false otherwise
 */
export function isValidStatus(status: string | undefined | null): boolean {
  if (!status) return false;
  return VALID_PROGRAM_STATUSES.includes(status.toLowerCase() as ProgramStatus);
}

/**
 * Get display label for a status
 * 
 * @param status - Status value
 * @returns Human-readable label
 */
export function getStatusLabel(status: string | undefined | null): string {
  const normalized = normalizeStatus(status);
  
  const labels: Record<ProgramStatus, string> = {
    [PROGRAM_STATUS.DRAFT]: 'Draft',
    [PROGRAM_STATUS.ASSIGNED]: 'Assigned',
    [PROGRAM_STATUS.TEMPLATE]: 'Template',
    [PROGRAM_STATUS.ACTIVE]: 'Active',
    [PROGRAM_STATUS.COMPLETED]: 'Completed',
    [PROGRAM_STATUS.PAUSED]: 'Paused',
    [PROGRAM_STATUS.ARCHIVED]: 'Archived',
  };
  
  return labels[normalized];
}

/**
 * Get CSS classes for status badge styling
 * 
 * @param status - Status value
 * @returns Tailwind CSS classes for styling
 */
export function getStatusBadgeClasses(status: string | undefined | null): string {
  const normalized = normalizeStatus(status);
  
  const styles: Record<ProgramStatus, string> = {
    [PROGRAM_STATUS.DRAFT]: 'bg-warm-grey/20 text-warm-grey',
    [PROGRAM_STATUS.ASSIGNED]: 'bg-soft-bronze/20 text-soft-bronze',
    [PROGRAM_STATUS.TEMPLATE]: 'bg-muted-rose/20 text-muted-rose',
    [PROGRAM_STATUS.ACTIVE]: 'bg-soft-bronze/20 text-soft-bronze',
    [PROGRAM_STATUS.COMPLETED]: 'bg-green-100 text-green-700',
    [PROGRAM_STATUS.PAUSED]: 'bg-amber-100 text-amber-700',
    [PROGRAM_STATUS.ARCHIVED]: 'bg-gray-100 text-gray-700',
  };
  
  return styles[normalized];
}
