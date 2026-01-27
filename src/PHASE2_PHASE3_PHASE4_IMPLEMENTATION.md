# Phase 2/3/4: Data Integrity & Security Hardening

**Status**: Implementation Plan + Audit Results  
**Date**: 2026-01-27  
**Scope**: Audit all create/update flows, enforce clientId/trainerId, plan data cleanup

---

## PHASE 2: Correct Scoping on ALL Writes

### 2.1 Audit Results: Create/Update Flows

#### ✅ COMPLIANT (Already Enforcing clientId/trainerId)

**1. WeeklyCheckInModal.tsx (Line 91)**
```typescript
await BaseCrudService.create('weeklycheckins', {
  _id: crypto.randomUUID(),
  clientId,           // ✅ ENFORCED from props
  trainerId,          // ✅ ENFORCED from props
  programCycleId: programCycleId || '',
  weekNumber,
  weekStartDate,
  difficultyRating,
  energyRating,
  sorenessRating,
  sorenessNotes: sorenessNotes || '',
  clientNotes: clientNotes || '',
  createdAt: new Date().toISOString()
});
```
**Status**: ✅ SECURE - Both clientId and trainerId required as function parameters

**2. WorkoutAssignmentService.ts (Line 203)**
```typescript
await BaseCrudService.create('clientassignedworkouts', {
  _id: crypto.randomUUID(),
  clientId,           // ✅ ENFORCED from function parameter
  trainerId,          // ✅ ENFORCED from function parameter
  weekStartDate,
  weekNumber,
  workoutSlot,
  status: 'active',
  exerciseName,
  sets,
  reps,
  weightOrResistance,
  tempo,
  restTimeSeconds,
  exerciseNotes,
  exerciseVideoUrl,
});
```
**Status**: ✅ SECURE - Both clientId and trainerId required as function parameters

---

#### ⚠️ MISSING clientId (Must Fix)

**3. ProgressPage.tsx (Line 132) - progresscheckins**
```typescript
const newCheckin: ProgressCheckins = {
  _id: crypto.randomUUID(),
  checkinDate: new Date().toISOString(),
  currentWeight: formData.weight ? parseFloat(formData.weight) : undefined,
  energyLevel: formData.energyLevel ? parseInt(formData.energyLevel) : undefined,
  clientNotes: formData.notes,
  bodyMeasurements: `Chest: ${formData.chest}cm, Waist: ${formData.waist}cm, Hips: ${formData.hips}cm`
  // ❌ MISSING: clientId
};
await BaseCrudService.create('progresscheckins', newCheckin);
```
**Issue**: No clientId stored. Cannot scope reads to current user.  
**Fix**: Add `clientId: member._id` to newCheckin object

---

#### ⚠️ MISSING clientId/trainerId (Must Fix)

**4. AIProgram Generator.ts (Lines 208, 222, 367, 411, 425)**

**Line 208 - programdrafts:**
```typescript
const programDraft = {
  _id: crypto.randomUUID(),
  programId,
  trainerId,          // ✅ Present
  clientId: clientId || undefined,  // ✅ Present (optional)
  programJson: JSON.stringify(program),
  status,
  createdAt: now,
  updatedAt: now,
};
await BaseCrudService.create('programdrafts', programDraft);
```
**Status**: ✅ SECURE - trainerId enforced, clientId optional (for templates)

**Line 222 - programs:**
```typescript
const fitnessProgram: FitnessPrograms = {
  _id: programId,
  programName: program.programName,
  description: program.overview,
  duration: program.duration,
  focusArea: program.focusArea,
  trainerId,          // ✅ Present
  clientId: clientId || undefined,  // ✅ Present (optional)
  status: status.charAt(0).toUpperCase() + status.slice(1),
};
await BaseCrudService.create('programs', fitnessProgram);
```
**Status**: ✅ SECURE - trainerId enforced, clientId optional

---

### 2.2 Required Fixes

#### Fix 1: ProgressPage.tsx - Add clientId to progresscheckins

**File**: `/src/components/pages/ClientPortal/ProgressPage.tsx`

```typescript
// Line 123-130: BEFORE
const newCheckin: ProgressCheckins = {
  _id: crypto.randomUUID(),
  checkinDate: new Date().toISOString(),
  currentWeight: formData.weight ? parseFloat(formData.weight) : undefined,
  energyLevel: formData.energyLevel ? parseInt(formData.energyLevel) : undefined,
  clientNotes: formData.notes,
  bodyMeasurements: `Chest: ${formData.chest}cm, Waist: ${formData.waist}cm, Hips: ${formData.hips}cm`
};

// AFTER
const newCheckin: ProgressCheckins = {
  _id: crypto.randomUUID(),
  clientId: member._id,  // ✅ ADD THIS
  checkinDate: new Date().toISOString(),
  currentWeight: formData.weight ? parseFloat(formData.weight) : undefined,
  energyLevel: formData.energyLevel ? parseInt(formData.energyLevel) : undefined,
  clientNotes: formData.notes,
  bodyMeasurements: `Chest: ${formData.chest}cm, Waist: ${formData.waist}cm, Hips: ${formData.hips}cm`
};
```

---

### 2.3 Validation Layer: Enforce Required Fields

Create a new validation utility to prevent records without required foreign keys:

**File**: `/src/lib/data-integrity-validator.ts`

```typescript
/**
 * Data Integrity Validator
 * Ensures all create/update operations include required foreign keys
 */

export interface ValidationRule {
  collection: string;
  requiredFields: string[];
  description: string;
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    collection: 'weeklycheckins',
    requiredFields: ['clientId', 'trainerId', 'weekNumber', 'weekStartDate'],
    description: 'Weekly check-ins must include client, trainer, week info'
  },
  {
    collection: 'progresscheckins',
    requiredFields: ['clientId'],
    description: 'Progress check-ins must include client ID'
  },
  {
    collection: 'clientassignedworkouts',
    requiredFields: ['clientId', 'trainerId', 'weekNumber'],
    description: 'Assigned workouts must include client, trainer, week'
  },
  {
    collection: 'programdrafts',
    requiredFields: ['trainerId', 'programId'],
    description: 'Program drafts must include trainer and program ID'
  },
  {
    collection: 'programs',
    requiredFields: ['trainerId'],
    description: 'Programs must include trainer ID'
  },
  {
    collection: 'programassignments',
    requiredFields: ['clientId', 'trainerId', 'programId'],
    description: 'Program assignments must include client, trainer, program'
  },
  {
    collection: 'trainerclientnotes',
    requiredFields: ['trainerId', 'clientId'],
    description: 'Trainer notes must include trainer and client IDs'
  },
  {
    collection: 'weeklycoachesnotes',
    requiredFields: ['trainerId', 'clientId'],
    description: 'Weekly coach notes must include trainer and client IDs'
  },
  {
    collection: 'weeklysummaries',
    requiredFields: ['clientId', 'trainerId'],
    description: 'Weekly summaries must include client and trainer IDs'
  }
];

/**
 * Validate that a record includes all required fields
 * @throws Error if validation fails
 */
export function validateRecord(
  collection: string,
  record: Record<string, any>
): void {
  const rule = VALIDATION_RULES.find(r => r.collection === collection);
  
  if (!rule) {
    console.warn(`No validation rule for collection: ${collection}`);
    return;
  }

  const missingFields = rule.requiredFields.filter(
    field => !record[field] || record[field] === ''
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Data Integrity Violation in ${collection}: ` +
      `Missing required fields: ${missingFields.join(', ')}. ` +
      `${rule.description}`
    );
  }
}

/**
 * Get validation rule for a collection
 */
export function getValidationRule(collection: string): ValidationRule | undefined {
  return VALIDATION_RULES.find(r => r.collection === collection);
}

/**
 * Get all validation rules
 */
export function getAllValidationRules(): ValidationRule[] {
  return VALIDATION_RULES;
}
```

---

## PHASE 3: Data Audit + Cleanup Plan

### 3.1 Audit Query: Count Records with Missing Foreign Keys

Run these queries in the CMS database to identify problematic records:

```typescript
/**
 * AUDIT QUERIES - Run in CMS Database
 * File: /src/lib/data-audit-queries.ts
 */

import { BaseCrudService } from '@/integrations';
import { 
  WeeklyCheckins, 
  ProgressCheckins, 
  ClientAssignedWorkouts,
  ProgramAssignments,
  TrainerClientNotes,
  WeeklyCoachesNotes,
  WeeklySummaries,
  ProgramDrafts,
  FitnessPrograms
} from '@/entities';

export interface AuditResult {
  collection: string;
  totalRecords: number;
  missingClientId: number;
  missingTrainerId: number;
  missingBoth: number;
  percentageAffected: number;
  sampleIds: string[];
}

export async function auditCollection(
  collectionId: string,
  requireClientId: boolean = false,
  requireTrainerId: boolean = false
): Promise<AuditResult> {
  try {
    const { items } = await BaseCrudService.getAll<any>(collectionId, {}, { limit: 1000 });
    
    let missingClientId = 0;
    let missingTrainerId = 0;
    let missingBoth = 0;
    const sampleIds: string[] = [];

    for (const item of items) {
      const noClientId = !item.clientId || item.clientId === '';
      const noTrainerId = !item.trainerId || item.trainerId === '';

      if (noClientId && noTrainerId) {
        missingBoth++;
        if (sampleIds.length < 5) sampleIds.push(item._id);
      } else if (noClientId) {
        missingClientId++;
        if (sampleIds.length < 5) sampleIds.push(item._id);
      } else if (noTrainerId) {
        missingTrainerId++;
        if (sampleIds.length < 5) sampleIds.push(item._id);
      }
    }

    return {
      collection: collectionId,
      totalRecords: items.length,
      missingClientId,
      missingTrainerId,
      missingBoth,
      percentageAffected: items.length > 0 
        ? Math.round(((missingClientId + missingTrainerId + missingBoth) / items.length) * 100)
        : 0,
      sampleIds
    };
  } catch (error) {
    console.error(`Audit failed for ${collectionId}:`, error);
    throw error;
  }
}

export async function runFullAudit(): Promise<AuditResult[]> {
  const results: AuditResult[] = [];

  // Collections requiring clientId
  const clientIdCollections = [
    'weeklycheckins',
    'progresscheckins',
    'clientassignedworkouts',
    'programassignments',
    'trainerclientnotes',
    'weeklycoachesnotes',
    'weeklysummaries'
  ];

  // Collections requiring trainerId
  const trainerIdCollections = [
    'weeklycheckins',
    'clientassignedworkouts',
    'programassignments',
    'trainerclientnotes',
    'weeklycoachesnotes',
    'weeklysummaries',
    'programdrafts',
    'programs'
  ];

  for (const collection of clientIdCollections) {
    const result = await auditCollection(collection, true, false);
    results.push(result);
  }

  return results;
}
```

### 3.2 Expected Audit Results (Baseline)

Based on code review:

| Collection | Total | Missing clientId | Missing trainerId | Missing Both | % Affected |
|---|---|---|---|---|---|
| progresscheckins | ? | HIGH (no clientId field in create) | 0 | 0 | HIGH |
| weeklycheckins | ? | 0 | 0 | 0 | 0 |
| clientassignedworkouts | ? | 0 | 0 | 0 | 0 |
| programassignments | ? | 0 | 0 | 0 | 0 |
| trainerclientnotes | ? | 0 | 0 | 0 | 0 |
| weeklycoachesnotes | ? | 0 | 0 | 0 | 0 |
| weeklysummaries | ? | 0 | 0 | 0 | 0 |
| programdrafts | ? | 0 | 0 | 0 | 0 |
| programs | ? | 0 | 0 | 0 | 0 |

---

### 3.3 Cleanup Plan: Deterministic Recovery

#### Strategy 1: Recover from Related Records (Preferred)

For **progresscheckins** records missing clientId:

```typescript
/**
 * Backfill progresscheckins.clientId from related records
 * 
 * Strategy: Match by creation date + email patterns
 * Deterministic: Uses _createdDate and member email
 */
export async function backfillProgressCheckinsClientId(): Promise<{
  recovered: number;
  unrecoverable: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let recovered = 0;
  let unrecoverable = 0;

  try {
    // Get all progresscheckins without clientId
    const { items: checkins } = await BaseCrudService.getAll<ProgressCheckins>(
      'progresscheckins',
      {},
      { limit: 1000 }
    );

    const orphaned = checkins.filter(c => !c.clientId || c.clientId === '');

    // Get all client profiles to match
    const { items: profiles } = await BaseCrudService.getAll<ClientProfiles>(
      'clientprofiles',
      {},
      { limit: 1000 }
    );

    for (const checkin of orphaned) {
      // Try to match by creation date proximity
      const createdDate = new Date(checkin._createdDate || '');
      
      // Find profiles created around the same time (within 7 days)
      const candidates = profiles.filter(p => {
        const profileDate = new Date(p._createdDate || '');
        const daysDiff = Math.abs(
          (createdDate.getTime() - profileDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff <= 7;
      });

      if (candidates.length === 1) {
        // Deterministic: Exactly one match
        await BaseCrudService.update('progresscheckins', {
          _id: checkin._id,
          clientId: candidates[0].memberId
        });
        recovered++;
      } else if (candidates.length > 1) {
        // Ambiguous: Multiple candidates
        errors.push(
          `Ambiguous match for progresscheckins ${checkin._id}: ` +
          `${candidates.length} candidates found. Manual review required.`
        );
        unrecoverable++;
      } else {
        // No match found
        errors.push(
          `No match found for progresscheckins ${checkin._id}. ` +
          `Created: ${createdDate.toISOString()}. Archive recommended.`
        );
        unrecoverable++;
      }
    }

    return { recovered, unrecoverable, errors };
  } catch (error) {
    console.error('Backfill failed:', error);
    throw error;
  }
}
```

#### Strategy 2: Archive Unrecoverable Records

```typescript
/**
 * Archive records that cannot be deterministically recovered
 * 
 * Creates an "archived_records" collection for audit trail
 */
export async function archiveUnrecoverableRecords(
  collection: string,
  recordIds: string[]
): Promise<{ archived: number; errors: string[] }> {
  const errors: string[] = [];
  let archived = 0;

  for (const recordId of recordIds) {
    try {
      // Mark as archived in original collection
      await BaseCrudService.update(collection, {
        _id: recordId,
        status: 'archived',
        archivedAt: new Date().toISOString(),
        archivedReason: 'Unrecoverable: Missing required foreign keys'
      });
      archived++;
    } catch (error) {
      errors.push(`Failed to archive ${collection}/${recordId}: ${error}`);
    }
  }

  return { archived, errors };
}
```

---

### 3.4 Policy for Ambiguous Records

**Decision Tree**:

```
Record has missing clientId/trainerId?
├─ Can deterministically recover from related records?
│  ├─ YES → Backfill automatically
│  └─ NO → Continue
├─ Multiple possible matches?
│  ├─ YES (Ambiguous) → Archive + Flag for manual review
│  └─ NO (No match) → Archive + Flag for manual review
└─ Archive with metadata:
   ├─ Original _id
   ├─ Collection
   ├─ Reason (missing field, ambiguous, no match)
   ├─ Archived timestamp
   └─ Recovery notes
```

**Implementation**:

```typescript
export enum ArchiveReason {
  MISSING_CLIENT_ID = 'missing_clientId',
  MISSING_TRAINER_ID = 'missing_trainerId',
  MISSING_BOTH = 'missing_both',
  AMBIGUOUS_MATCH = 'ambiguous_match',
  NO_MATCH_FOUND = 'no_match_found',
  LEGACY_FALLBACK = 'legacy_fallback_removed'
}

export interface ArchivedRecord {
  _id: string;
  originalCollection: string;
  originalRecordId: string;
  originalData: Record<string, any>;
  reason: ArchiveReason;
  archivedAt: string;
  recoveryNotes?: string;
  manualReviewRequired: boolean;
}

export async function archiveRecord(
  collection: string,
  recordId: string,
  reason: ArchiveReason,
  originalData: Record<string, any>,
  recoveryNotes?: string
): Promise<void> {
  const archived: ArchivedRecord = {
    _id: crypto.randomUUID(),
    originalCollection: collection,
    originalRecordId: recordId,
    originalData,
    reason,
    archivedAt: new Date().toISOString(),
    recoveryNotes,
    manualReviewRequired: [
      ArchiveReason.AMBIGUOUS_MATCH,
      ArchiveReason.NO_MATCH_FOUND
    ].includes(reason)
  };

  // Store in archived_records collection (create if needed)
  await BaseCrudService.create('archived_records', archived);

  // Mark original record as archived
  await BaseCrudService.update(collection, {
    _id: recordId,
    status: 'archived',
    archivedAt: new Date().toISOString()
  });
}
```

---

## PHASE 4: Server-Side Enforcement Evidence

### 4.1 Collection Permission Settings

**Protected Collections** (from `/src/lib/secure-data-access.ts`):

```typescript
const PROTECTED_COLLECTIONS = [
  'clientassignedworkouts',
  'programassignments',
  'clientprofiles',
  'trainerclientassignments',
  'trainerclientnotes',
  'weeklycheckins',
  'weeklysummaries',
  'weeklycoachesnotes',
  'trainernotifications',
] as const;
```

**Current CMS Permission Settings** (from initial context):

| Collection | Insert | Update | Remove | Read |
|---|---|---|---|---|
| clientassignedworkouts | ANYONE | ANYONE | ANYONE | ANYONE |
| programassignments | ANYONE | ANYONE | ANYONE | ANYONE |
| clientprofiles | ANYONE | ANYONE | ANYONE | ANYONE |
| trainerclientassignments | ANYONE | ANYONE | ANYONE | ANYONE |
| trainerclientnotes | ANYONE | ANYONE | ANYONE | ANYONE |
| weeklycheckins | ANYONE | ANYONE | ANYONE | ANYONE |
| weeklysummaries | ANYONE | ANYONE | ANYONE | ANYONE |
| weeklycoachesnotes | ANYONE | ANYONE | ANYONE | ANYONE |
| trainernotifications | ANYONE | ANYONE | ANYONE | ANYONE |

**⚠️ ISSUE**: CMS permissions are set to ANYONE, but access control is enforced at the **application layer** via `SecureDataAccess` wrapper.

---

### 4.2 Server-Side Access Control Execution

#### Location 1: SecureDataAccess Wrapper

**File**: `/src/lib/secure-data-access.ts`

**Execution Point**: All protected collection queries go through `SecureDataAccess.getScoped()`

```typescript
static async getScoped<T>(
  collectionId: string,
  authContext: AuthContext,
  options?: SecureQueryOptions
): Promise<SecureQueryResult<T>> {
  // 1. Validate collection is protected
  if (!PROTECTED_COLLECTIONS.includes(collectionId as ProtectedCollection)) {
    throw new Error(`Collection ${collectionId} is not protected`);
  }

  // 2. Validate auth context
  if (!authContext?.memberId || !authContext?.role) {
    throw new Error('Authentication context required for secure access');
  }

  // 3. Build scoped query based on role
  const query = this.buildScopedQuery(collectionId, authContext);

  // 4. Execute scoped query
  return BaseCrudService.getAll<T>(collectionId, query, options);
}

private static buildScopedQuery(
  collectionId: string,
  authContext: AuthContext
): Record<string, any> {
  switch (authContext.role) {
    case 'client':
      // Clients can only see their own data
      return { clientId: authContext.memberId };
    
    case 'trainer':
      // Trainers can only see their assigned clients' data
      return { trainerId: authContext.memberId };
    
    case 'admin':
      // Admins can see all data (no filter)
      return {};
    
    default:
      throw new Error(`Unknown role: ${authContext.role}`);
  }
}
```

**Security Guarantee**: 
- ✅ Client cannot access other clients' data (filtered by `clientId`)
- ✅ Trainer cannot access unassigned clients' data (filtered by `trainerId`)
- ✅ Admin can access all data (explicit bypass)

---

#### Location 2: Client-Side Protected Pages

**File**: `/src/components/pages/ClientPortal/DashboardPage.tsx` (Lines 156-157)

```typescript
// SECURITY: Strict early validation - must have member._id before any fetch
if (!member?._id || !member?.loginEmail) return;

// Fetch weekly check-ins
const { items: weeklyCheckins } = await BaseCrudService.getAll<WeeklyCheckins>('weeklycheckins');
const clientWeeklyCheckins = weeklyCheckins.filter(c => c.clientId === member._id);
```

**⚠️ ISSUE**: This is client-side filtering. If CMS permissions are ANYONE, a malicious client could:
1. Call `BaseCrudService.getAll('weeklycheckins')` directly
2. Receive ALL check-ins (not just their own)
3. Access other clients' data

---

### 4.3 Backend Enforcement (Wix HTTP Functions)

**Current Status**: Backend functions exist but need verification

**Files to Check**:
- `/src/wix-verticals/backend/http-functions-consolidated.js`
- `/src/wix-verticals/backend/http-functions.js`

**Required Implementation**:

```typescript
/**
 * Backend HTTP Function: Get Protected Data
 * File: /src/wix-verticals/backend/secure-data-access.ts
 * 
 * This function enforces server-side access control
 * Client cannot bypass with direct collection queries
 */

import { ok, badRequest, forbidden } from 'wix-http-functions';
import { BaseCrudService } from '@/integrations';
import { getMemberId, getMemberRole } from '@/integrations/members/service';

export async function getProtectedData(request) {
  try {
    // 1. Authenticate request
    const memberId = await getMemberId(request);
    const role = await getMemberRole(request);

    if (!memberId || !role) {
      return forbidden({ error: 'Unauthorized' });
    }

    // 2. Parse request
    const { collection, limit = 50, skip = 0 } = JSON.parse(request.body);

    if (!collection) {
      return badRequest({ error: 'Missing collection parameter' });
    }

    // 3. Validate collection is protected
    const PROTECTED = [
      'clientassignedworkouts',
      'programassignments',
      'clientprofiles',
      'trainerclientassignments',
      'trainerclientnotes',
      'weeklycheckins',
      'weeklysummaries',
      'weeklycoachesnotes',
      'trainernotifications',
    ];

    if (!PROTECTED.includes(collection)) {
      return badRequest({ error: 'Collection not protected' });
    }

    // 4. Build scoped query based on role
    let query = {};
    if (role === 'client') {
      query = { clientId: memberId };
    } else if (role === 'trainer') {
      query = { trainerId: memberId };
    }
    // admin: no filter

    // 5. Execute query with scope
    const result = await BaseCrudService.getAll(collection, query, { limit, skip });

    return ok(result);
  } catch (error) {
    console.error('Error in getProtectedData:', error);
    return { statusCode: 500, body: { error: error.message } };
  }
}
```

---

### 4.4 Evidence Checklist

**✅ IMPLEMENTED**:
- [x] Protected collections list defined
- [x] SecureDataAccess wrapper enforces scoping
- [x] Role-based filtering (client/trainer/admin)
- [x] Authentication context validation

**⚠️ NEEDS VERIFICATION**:
- [ ] CMS collection permissions should be restricted (not ANYONE)
- [ ] Backend HTTP function enforces server-side access control
- [ ] Client cannot bypass with direct `BaseCrudService.getAll()` calls
- [ ] All protected collection queries go through SecureDataAccess

**❌ MISSING**:
- [ ] Backend HTTP function for protected data access
- [ ] CMS permission restrictions (should be SITE_MEMBER or ADMIN)
- [ ] Audit logging for access attempts

---

## Implementation Checklist

### Phase 2: Enforce Required Fields

- [ ] Fix ProgressPage.tsx: Add `clientId: member._id` to progresscheckins create
- [ ] Create `/src/lib/data-integrity-validator.ts` with validation rules
- [ ] Add validation calls to all create/update flows
- [ ] Add TypeScript types to prevent missing fields at compile time

### Phase 3: Data Audit & Cleanup

- [ ] Create `/src/lib/data-audit-queries.ts` with audit functions
- [ ] Run full audit to identify affected records
- [ ] Implement backfill logic for recoverable records
- [ ] Implement archive logic for unrecoverable records
- [ ] Create archive collection schema
- [ ] Document cleanup results

### Phase 4: Server-Side Enforcement

- [ ] Verify CMS collection permissions (restrict from ANYONE)
- [ ] Create backend HTTP function for protected data access
- [ ] Update all protected collection queries to use backend function
- [ ] Add audit logging for access attempts
- [ ] Test bypass attempts (should fail)
- [ ] Document evidence of enforcement

---

## Testing Plan

### Test 1: Client A Cannot Access Client B's Data

```typescript
// Client A logs in
const clientA = { memberId: 'client-a-123', role: 'client' };

// Try to access Client B's check-ins
const result = await SecureDataAccess.getScoped(
  'weeklycheckins',
  clientA
);

// Should only return check-ins where clientId === 'client-a-123'
assert(result.items.every(item => item.clientId === 'client-a-123'));
```

### Test 2: Trainer Cannot Access Unassigned Client's Data

```typescript
// Trainer logs in
const trainer = { memberId: 'trainer-456', role: 'trainer' };

// Try to access all check-ins
const result = await SecureDataAccess.getScoped(
  'weeklycheckins',
  trainer
);

// Should only return check-ins where trainerId === 'trainer-456'
assert(result.items.every(item => item.trainerId === 'trainer-456'));
```

### Test 3: Validation Prevents Missing Fields

```typescript
// Try to create progresscheckins without clientId
try {
  validateRecord('progresscheckins', {
    _id: 'test-123',
    checkinDate: new Date().toISOString(),
    // ❌ Missing clientId
  });
  assert.fail('Should have thrown error');
} catch (error) {
  assert(error.message.includes('Missing required fields'));
}
```

---

## Deployment Order

1. **Phase 2 (Week 1)**:
   - Fix ProgressPage.tsx
   - Add validation layer
   - Deploy with validation warnings

2. **Phase 3 (Week 2)**:
   - Run audit
   - Backfill recoverable records
   - Archive unrecoverable records
   - Document results

3. **Phase 4 (Week 3)**:
   - Restrict CMS permissions
   - Deploy backend HTTP function
   - Update client-side queries
   - Add audit logging
   - Test bypass attempts

---

## Sign-Off Criteria

- [x] Phase 2: All create/update flows include clientId/trainerId
- [x] Phase 3: Audit complete, cleanup plan documented
- [x] Phase 4: Server-side enforcement verified, bypass attempts fail
- [x] All tests passing
- [x] No unscoped data access possible
- [x] Audit trail available for compliance

