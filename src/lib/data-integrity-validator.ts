/**
 * Data Integrity Validator
 * 
 * Ensures all create/update operations include required foreign keys.
 * Prevents records from being created without critical scoping fields.
 * 
 * SECURITY: This validator is the first line of defense against
 * unscoped data creation. All create/update flows MUST call this.
 */

export interface ValidationRule {
  collection: string;
  requiredFields: string[];
  description: string;
  severity: 'critical' | 'warning';
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    collection: 'weeklycheckins',
    requiredFields: ['clientId', 'trainerId', 'weekNumber', 'weekStartDate'],
    description: 'Weekly check-ins must include client, trainer, and week info',
    severity: 'critical'
  },
  {
    collection: 'progresscheckins',
    requiredFields: ['clientId'],
    description: 'Progress check-ins must include client ID for scoping',
    severity: 'critical'
  },
  {
    collection: 'clientassignedworkouts',
    requiredFields: ['clientId', 'trainerId', 'weekNumber'],
    description: 'Assigned workouts must include client, trainer, and week',
    severity: 'critical'
  },
  {
    collection: 'programdrafts',
    requiredFields: ['trainerId', 'programId'],
    description: 'Program drafts must include trainer and program ID',
    severity: 'critical'
  },
  {
    collection: 'programs',
    requiredFields: ['trainerId'],
    description: 'Programs must include trainer ID for scoping',
    severity: 'critical'
  },
  {
    collection: 'programassignments',
    requiredFields: ['clientId', 'trainerId', 'programId'],
    description: 'Program assignments must include client, trainer, and program',
    severity: 'critical'
  },
  {
    collection: 'trainerclientnotes',
    requiredFields: ['trainerId', 'clientId'],
    description: 'Trainer notes must include trainer and client IDs',
    severity: 'critical'
  },
  {
    collection: 'weeklycoachesnotes',
    requiredFields: ['trainerId', 'clientId'],
    description: 'Weekly coach notes must include trainer and client IDs',
    severity: 'critical'
  },
  {
    collection: 'weeklysummaries',
    requiredFields: ['clientId', 'trainerId'],
    description: 'Weekly summaries must include client and trainer IDs',
    severity: 'critical'
  },
  {
    collection: 'trainernotifications',
    requiredFields: ['trainerId'],
    description: 'Trainer notifications must include trainer ID',
    severity: 'critical'
  }
];

/**
 * Validation error with detailed context
 */
export class DataIntegrityError extends Error {
  constructor(
    public collection: string,
    public missingFields: string[],
    public rule: ValidationRule
  ) {
    super(
      `Data Integrity Violation in ${collection}: ` +
      `Missing required fields: ${missingFields.join(', ')}. ` +
      `${rule.description}`
    );
    this.name = 'DataIntegrityError';
  }
}

/**
 * Validate that a record includes all required fields for its collection
 * 
 * @param collection - The collection ID
 * @param record - The record to validate
 * @throws DataIntegrityError if validation fails
 * 
 * @example
 * // This will throw an error
 * validateRecord('weeklycheckins', {
 *   _id: '123',
 *   clientId: 'client-123',
 *   // ❌ Missing trainerId, weekNumber, weekStartDate
 * });
 * 
 * @example
 * // This will pass
 * validateRecord('weeklycheckins', {
 *   _id: '123',
 *   clientId: 'client-123',
 *   trainerId: 'trainer-456',
 *   weekNumber: 1,
 *   weekStartDate: '2026-01-27'
 * });
 */
export function validateRecord(
  collection: string,
  record: Record<string, any>
): void {
  const rule = VALIDATION_RULES.find(r => r.collection === collection);
  
  if (!rule) {
    // No validation rule for this collection - skip validation
    return;
  }

  // Check for missing or empty required fields
  const missingFields = rule.requiredFields.filter(
    field => record[field] === undefined || record[field] === null || record[field] === ''
  );

  if (missingFields.length > 0) {
    throw new DataIntegrityError(collection, missingFields, rule);
  }
}

/**
 * Get validation rule for a collection
 * 
 * @param collection - The collection ID
 * @returns The validation rule, or undefined if not found
 */
export function getValidationRule(collection: string): ValidationRule | undefined {
  return VALIDATION_RULES.find(r => r.collection === collection);
}

/**
 * Get all validation rules
 * 
 * @returns Array of all validation rules
 */
export function getAllValidationRules(): ValidationRule[] {
  return VALIDATION_RULES;
}

/**
 * Check if a collection has validation rules
 * 
 * @param collection - The collection ID
 * @returns true if the collection has validation rules
 */
export function hasValidationRule(collection: string): boolean {
  return VALIDATION_RULES.some(r => r.collection === collection);
}

/**
 * Get all collections that require validation
 * 
 * @returns Array of collection IDs with validation rules
 */
export function getValidatedCollections(): string[] {
  return VALIDATION_RULES.map(r => r.collection);
}

/**
 * Validate multiple records at once
 * 
 * @param collection - The collection ID
 * @param records - Array of records to validate
 * @returns Object with validation results
 * 
 * @example
 * const results = validateRecords('weeklycheckins', [
 *   { _id: '1', clientId: 'a', trainerId: 'b', weekNumber: 1, weekStartDate: '2026-01-27' },
 *   { _id: '2', clientId: 'a' } // ❌ Missing fields
 * ]);
 * console.log(results.valid); // 1
 * console.log(results.invalid); // 1
 * console.log(results.errors); // [DataIntegrityError]
 */
export function validateRecords(
  collection: string,
  records: Record<string, any>[]
): {
  valid: number;
  invalid: number;
  errors: DataIntegrityError[];
} {
  const errors: DataIntegrityError[] = [];
  let valid = 0;
  let invalid = 0;

  for (const record of records) {
    try {
      validateRecord(collection, record);
      valid++;
    } catch (error) {
      if (error instanceof DataIntegrityError) {
        errors.push(error);
        invalid++;
      } else {
        throw error;
      }
    }
  }

  return { valid, invalid, errors };
}
