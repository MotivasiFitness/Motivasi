# Protected Data Migration Guide
## Complete Instructions for Migrating Pages to ProtectedDataService

**Purpose:** Ensure all protected collection access routes through the backend gateway for security validation.

---

## Quick Reference: Protected Collections

These 14 collections MUST use `ProtectedDataService`:
```
clientassignedworkouts, programassignments, trainerclientassignments,
trainerclientmessages, trainerclientnotes, weeklycheckins,
weeklycoachesnotes, weeklysummaries, trainernotifications,
trainernotificationpreferences, clientprofiles, clientprograms,
programdrafts, programs
```

---

## Migration Pattern

### Step 1: Add Import
```typescript
import ProtectedDataService from '@/lib/protected-data-service';
```

### Step 2: Replace BaseCrudService Calls

#### Pattern A: getAll() with destructuring
**Before:**
```typescript
const { items } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
```

**After:**
```typescript
const result = await ProtectedDataService.getAll<ClientProfiles>('clientprofiles');
const items = result.items;
```

#### Pattern B: getAll() with pagination
**Before:**
```typescript
const { items, hasNext, nextSkip } = await BaseCrudService.getAll<WeeklySummaries>(
  'weeklysummaries',
  { limit: 50, skip: 0 }
);
```

**After:**
```typescript
const result = await ProtectedDataService.getAll<WeeklySummaries>(
  'weeklysummaries',
  { limit: 50, skip: 0 }
);
const { items, hasNext, nextSkip } = result;
```

#### Pattern C: getById()
**Before:**
```typescript
const item = await BaseCrudService.getById<ClientProfiles>('clientprofiles', itemId);
```

**After:**
```typescript
const item = await ProtectedDataService.getById<ClientProfiles>('clientprofiles', itemId);
```

#### Pattern D: create()
**Before:**
```typescript
const newItem = await BaseCrudService.create<ClientProfiles>('clientprofiles', {
  _id: crypto.randomUUID(),
  memberId: userId,
  firstName: 'John',
});
```

**After:**
```typescript
const newItem = await ProtectedDataService.create<ClientProfiles>('clientprofiles', {
  _id: crypto.randomUUID(),
  memberId: userId,
  firstName: 'John',
});
```

#### Pattern E: update()
**Before:**
```typescript
await BaseCrudService.update<ClientProfiles>('clientprofiles', {
  _id: itemId,
  firstName: 'Jane',
});
```

**After:**
```typescript
await ProtectedDataService.update<ClientProfiles>(
  'clientprofiles',
  itemId,
  { firstName: 'Jane' }
);
```

#### Pattern F: delete()
**Before:**
```typescript
await BaseCrudService.delete('clientprofiles', itemId);
```

**After:**
```typescript
await ProtectedDataService.delete('clientprofiles', itemId);
```

---

## Pages to Migrate

### 1. MyProgramPage.tsx
**Location:** `/src/components/pages/ClientPortal/MyProgramPage.tsx`

**Protected Collections Used:**
- `clientassignedworkouts` - Client's assigned workouts
- `clientprograms` - Client's program details

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Find all `BaseCrudService.getAll('clientassignedworkouts'...)` calls
3. Replace with `ProtectedDataService.getAll('clientassignedworkouts'...)`
4. Find all `BaseCrudService.getAll('clientprograms'...)` calls
5. Replace with `ProtectedDataService.getAll('clientprograms'...)`
6. Update destructuring pattern from `{ items }` to `result.items`

**Example:**
```typescript
// Before
const { items: workouts } = await BaseCrudService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');

// After
const result = await ProtectedDataService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');
const workouts = result.items;
```

---

### 2. WorkoutHistoryPage.tsx
**Location:** `/src/components/pages/ClientPortal/WorkoutHistoryPage.tsx`

**Protected Collections Used:**
- `clientassignedworkouts` - Workout history

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Replace all `BaseCrudService` calls for `clientassignedworkouts` with `ProtectedDataService`
3. Update destructuring patterns

---

### 3. ProgressPage.tsx
**Location:** `/src/components/pages/ClientPortal/ProgressPage.tsx`

**Protected Collections Used:**
- `progresscheckins` - Progress check-ins (has clientId field)
- `weeklycheckins` - Weekly check-ins

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Replace `BaseCrudService` calls for `progresscheckins` with `ProtectedDataService`
3. Replace `BaseCrudService` calls for `weeklycheckins` with `ProtectedDataService`
4. Update destructuring patterns

---

### 4. ProfilePage.tsx
**Location:** `/src/components/pages/ClientPortal/ProfilePage.tsx`

**Protected Collections Used:**
- `clientprofiles` - Client profile data

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Replace all `BaseCrudService.getAll('clientprofiles'...)` with `ProtectedDataService.getAll('clientprofiles'...)`
3. Replace all `BaseCrudService.update('clientprofiles'...)` with `ProtectedDataService.update('clientprofiles'...)`
4. Update destructuring patterns

**Note:** Update pattern changes:
```typescript
// Before
await BaseCrudService.update<ClientProfiles>('clientprofiles', {
  _id: profileId,
  firstName: 'Jane',
});

// After
await ProtectedDataService.update<ClientProfiles>(
  'clientprofiles',
  profileId,
  { firstName: 'Jane' }
);
```

---

### 5. TrainerDashboardPage.tsx
**Location:** `/src/components/pages/TrainerDashboard/TrainerDashboardPage.tsx`

**Protected Collections Used:**
- `trainerclientassignments` - Trainer's assigned clients
- `trainernotifications` - Trainer notifications

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Replace `BaseCrudService` calls for `trainerclientassignments` with `ProtectedDataService`
3. Replace `BaseCrudService` calls for `trainernotifications` with `ProtectedDataService`
4. Update destructuring patterns

---

### 6. TrainerClientsPage.tsx
**Location:** `/src/components/pages/TrainerDashboard/TrainerClientsPage.tsx`

**Protected Collections Used:**
- `trainerclientassignments` - Trainer's assigned clients
- `trainerclientnotes` - Trainer notes about clients

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Replace all `BaseCrudService` calls for protected collections with `ProtectedDataService`
3. Update destructuring patterns
4. Update create/update calls to use new signature

---

### 7. WorkoutAssignmentPage.tsx
**Location:** `/src/components/pages/TrainerDashboard/WorkoutAssignmentPage.tsx`

**Protected Collections Used:**
- `trainerclientassignments` - Trainer's assigned clients
- `clientassignedworkouts` - Client workouts

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Replace all `BaseCrudService` calls for protected collections with `ProtectedDataService`
3. Update destructuring patterns
4. Update CRUD operation signatures

---

### 8. WeeklySummariesView.tsx
**Location:** `/src/components/pages/TrainerDashboard/WeeklySummariesView.tsx`

**Protected Collections Used:**
- `weeklysummaries` - Weekly summaries

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Replace all `BaseCrudService.getAll('weeklysummaries'...)` with `ProtectedDataService.getAll('weeklysummaries'...)`
3. Update destructuring patterns

---

### 9. WeeklyCoachNotesPanel.tsx
**Location:** `/src/components/pages/TrainerDashboard/WeeklyCoachNotesPanel.tsx`

**Protected Collections Used:**
- `weeklycoachesnotes` - Coach notes for clients
- `trainerclientassignments` - Trainer's assigned clients

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Replace all `BaseCrudService` calls for protected collections with `ProtectedDataService`
3. Update destructuring patterns
4. Update create/update calls to use new signature

---

### 10. CompletedWorkoutsFeedbackPage.tsx
**Location:** `/src/components/pages/TrainerDashboard/CompletedWorkoutsFeedbackPage.tsx`

**Protected Collections Used:**
- `clientassignedworkouts` - Client workouts

**Migration Steps:**
1. Add import: `import ProtectedDataService from '@/lib/protected-data-service';`
2. Replace all `BaseCrudService` calls for `clientassignedworkouts` with `ProtectedDataService`
3. Update destructuring patterns

---

## Pages That DON'T Need Migration

### TrainerProfilePage.tsx
- Uses `trainerprofiles` (NOT in protected list)
- Can continue using `BaseCrudService`

### VideoLibraryManagementPage.tsx
- Uses `privatevideolibrary` (NOT in protected list)
- Can continue using `BaseCrudService`

---

## Testing After Migration

### For Each Migrated Page:

1. **Local Testing**
   ```bash
   npm run dev
   # Navigate to the page
   # Verify data loads correctly
   # Verify CRUD operations work
   ```

2. **Network Inspection**
   - Open DevTools → Network tab
   - Perform action on the page
   - Verify requests go to `/_functions/protected-data-gateway`
   - Verify response includes data

3. **Error Handling**
   - Test with invalid IDs
   - Test with unauthorized access
   - Verify error messages are user-friendly

4. **Performance**
   - Check page load time
   - Verify no unnecessary requests
   - Check for memory leaks

---

## Common Issues & Solutions

### Issue 1: Destructuring Pattern Error
**Error:** `Cannot read property 'items' of undefined`

**Cause:** Forgot to update destructuring pattern

**Solution:**
```typescript
// Wrong
const { items } = await ProtectedDataService.getAll(...);

// Right
const result = await ProtectedDataService.getAll(...);
const items = result.items;
```

### Issue 2: Update Signature Error
**Error:** `TypeError: update is not a function` or unexpected parameters

**Cause:** Using old BaseCrudService signature

**Solution:**
```typescript
// Wrong (BaseCrudService style)
await ProtectedDataService.update('collection', { _id: id, field: value });

// Right (ProtectedDataService style)
await ProtectedDataService.update('collection', id, { field: value });
```

### Issue 3: Missing Import
**Error:** `ProtectedDataService is not defined`

**Cause:** Forgot to add import statement

**Solution:**
```typescript
import ProtectedDataService from '@/lib/protected-data-service';
```

### Issue 4: 401 Unauthorized Error
**Error:** `Request failed: Unauthorized`

**Cause:** User not authenticated or doesn't have access to data

**Solution:**
- Verify user is logged in
- Verify user has correct role
- Check backend gateway logs for details

---

## Verification Checklist

After migrating each page:

- [ ] Import statement added
- [ ] All protected collection calls use ProtectedDataService
- [ ] Destructuring patterns updated
- [ ] CRUD operation signatures updated
- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] CRUD operations work
- [ ] Network requests go to backend gateway
- [ ] No console errors
- [ ] Tests pass

---

## Migration Priority

**High Priority (Core Flows):**
1. DashboardPage.tsx - Client dashboard
2. MyProgramPage.tsx - Client workouts
3. TrainerDashboardPage.tsx - Trainer dashboard
4. TrainerClientsPage.tsx - Trainer client list

**Medium Priority (Important Features):**
5. WorkoutHistoryPage.tsx - Client history
6. ProgressPage.tsx - Client progress
7. ProfilePage.tsx - Client profile
8. WorkoutAssignmentPage.tsx - Trainer assignments

**Lower Priority (Supporting Features):**
9. WeeklySummariesView.tsx - Weekly summaries
10. WeeklyCoachNotesPanel.tsx - Coach notes
11. CompletedWorkoutsFeedbackPage.tsx - Feedback

---

## Rollback Instructions

If migration causes issues:

1. **Revert changes to file:**
   ```bash
   git checkout [filename]
   ```

2. **Restore BaseCrudService calls:**
   - Remove ProtectedDataService import
   - Restore original BaseCrudService calls
   - Restore original destructuring patterns

3. **Test locally:**
   ```bash
   npm run dev
   ```

4. **Commit revert:**
   ```bash
   git commit -m "Revert migration for [filename]"
   ```

---

## Questions?

Refer to:
- `/src/lib/protected-data-service.ts` - Service implementation
- `/src/lib/__tests__/bypass-attempt-tests.test.ts` - Test examples
- `/src/SECURITY_SIGN_OFF_DOCUMENTATION.md` - Security overview

---

**Last Updated:** January 27, 2026  
**Status:** READY FOR MIGRATION
