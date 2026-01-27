# Phase 3 Security Hardening - Implementation Guide

## Overview

This document outlines the complete security hardening implementation for pre-deployment. All protected collections now require authentication and role-based access control through a backend gateway.

## What Changed

### 1. Protected Collections (14 total)

All of the following collections are now **LOCKED DOWN** and require backend gateway access:

```
✓ clientassignedworkouts
✓ programassignments
✓ trainerclientassignments
✓ trainerclientmessages
✓ trainerclientnotes
✓ weeklycheckins
✓ weeklycoachesnotes
✓ weeklysummaries
✓ trainernotifications
✓ trainernotificationpreferences
✓ clientprofiles
✓ clientprograms
✓ programdrafts
✓ programs
```

### 2. Permission Changes

**BEFORE:**
```
insert: ANYONE
update: ANYONE
remove: ANYONE
read: ANYONE
```

**AFTER:**
```
insert: SITE_MEMBER
update: SITE_MEMBER
remove: SITE_MEMBER
read: SITE_MEMBER
```

### 3. New Backend Gateway

**Endpoint:** `/_functions/protected-data-gateway`

**File:** `/src/wix-verticals/backend/protected-data-gateway.ts`

**Features:**
- Strict authentication required (Wix member context)
- Role-based access control (client/trainer/admin)
- Ownership validation (clientId === currentUserId for clients)
- Trainer-client relationship validation
- Audit logging of all access

**Supported Operations:**
- `getAll` - Get items with role-based filtering
- `getById` - Get single item with access validation
- `getForClient` - Get items for specific client (trainer/admin only)
- `getForTrainer` - Get items for specific trainer (admin only)
- `create` - Create new item with ownership validation
- `update` - Update item with ownership validation
- `delete` - Delete item (admin only)

### 4. Client-Side Gateway Service

**File:** `/src/lib/protected-data-service.ts`

**Usage:**
```typescript
import ProtectedDataService from '@/lib/protected-data-service';

// Get all items (role-scoped)
const result = await ProtectedDataService.getAll('clientassignedworkouts', {
  limit: 50,
  skip: 0
});

// Get single item
const item = await ProtectedDataService.getById('clientassignedworkouts', 'item-id');

// Get items for specific client (trainer/admin only)
const clientItems = await ProtectedDataService.getForClient(
  'clientassignedworkouts',
  'client-id'
);

// Create new item
const newItem = await ProtectedDataService.create('clientassignedworkouts', {
  _id: crypto.randomUUID(),
  clientId: 'client-123',
  exerciseName: 'Squats',
  // ... other fields
});

// Update item
const updated = await ProtectedDataService.update(
  'clientassignedworkouts',
  'item-id',
  { exerciseName: 'Bench Press' }
);

// Delete item (admin only)
await ProtectedDataService.delete('clientassignedworkouts', 'item-id');
```

## Migration Guide

### Step 1: Update Imports

**BEFORE:**
```typescript
import { BaseCrudService } from '@/integrations';

const items = await BaseCrudService.getAll('clientassignedworkouts');
```

**AFTER:**
```typescript
import ProtectedDataService from '@/lib/protected-data-service';

const items = await ProtectedDataService.getAll('clientassignedworkouts');
```

### Step 2: Update All Affected Pages

The following pages need to be updated to use `ProtectedDataService`:

#### Client Portal Pages
- `DashboardPage.tsx` - Uses clientassignedworkouts, weeklysummaries
- `MyProgramPage.tsx` - Uses clientprograms, clientassignedworkouts
- `WorkoutHistoryPage.tsx` - Uses clientassignedworkouts
- `ProgressPage.tsx` - Uses progresscheckins (if protected)
- `ProfilePage.tsx` - Uses clientprofiles

#### Trainer Dashboard Pages
- `TrainerDashboardPage.tsx` - Uses trainerclientassignments, trainernotifications
- `TrainerClientsPage.tsx` - Uses trainerclientassignments
- `WorkoutAssignmentPage.tsx` - Uses trainerclientassignments, clientassignedworkouts
- `WeeklySummariesView.tsx` - Uses weeklysummaries
- `WeeklyCoachNotesPanel.tsx` - Uses weeklycoachesnotes, trainerclientassignments
- `TrainerProfilePage.tsx` - Uses trainerprofiles (if protected)
- `VideoLibraryManagementPage.tsx` - Uses privatevideolibrary (if protected)
- `CompletedWorkoutsFeedbackPage.tsx` - Uses clientassignedworkouts

### Step 3: Handle Errors

The gateway returns proper HTTP status codes:

```typescript
try {
  const items = await ProtectedDataService.getAll('clientassignedworkouts');
} catch (error) {
  if (error.message.includes('Authentication required')) {
    // 401 - User not authenticated
    // Redirect to login
  } else if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
    // 403 - User authenticated but not authorized
    // Show permission error
  } else {
    // 500 - Server error
    // Show generic error
  }
}
```

## Security Features

### 1. Ownership Validation

**Clients:**
- Can only access their own data (clientId === memberId)
- Cannot query other clients' data
- Cannot use `getForClient` or `getForTrainer`

**Trainers:**
- Can only access data for their assigned clients
- Must have active `trainerclientassignments` record
- Cannot query other trainers' data
- Cannot use `getForTrainer`

**Admins:**
- Can access all data
- Can use all operations including `getForTrainer`

### 2. Role-Based Filtering

All `getAll` requests are automatically filtered by role:

```typescript
// Client request
const items = await ProtectedDataService.getAll('clientassignedworkouts');
// Returns only items where clientId === currentUserId

// Trainer request
const items = await ProtectedDataService.getAll('clientassignedworkouts');
// Returns only items where trainerId === currentUserId

// Admin request
const items = await ProtectedDataService.getAll('clientassignedworkouts');
// Returns all items
```

### 3. Audit Logging

All access is logged server-side with:
- User ID
- Operation type
- Collection name
- Timestamp
- Success/failure status

## Testing

### Run Bypass Attempt Tests

```bash
npm test -- bypass-attempt-tests.test.ts
```

These tests verify:
- Direct BaseCrudService access is denied
- Gateway access requires authentication
- Role-based filtering works correctly
- Ownership validation is enforced

### Run Security Audit

```typescript
import { generatePhase3AuditReport, formatAuditReport } from '@/lib/phase3-audit-report';

const report = await generatePhase3AuditReport();
console.log(formatAuditReport(report));
```

## Deployment Checklist

- [ ] All protected collections have permissions set to SITE_MEMBER
- [ ] Backend gateway is deployed and accessible
- [ ] All affected pages are updated to use ProtectedDataService
- [ ] Bypass attempt tests pass
- [ ] Phase 3 audit report shows 100% security score
- [ ] Error handling is implemented on all pages
- [ ] Audit logging is verified in backend
- [ ] Rate limiting is configured (optional)
- [ ] Documentation is updated
- [ ] Team is trained on new security model

## Troubleshooting

### "Authentication required" Error

**Cause:** User is not logged in or session expired

**Solution:** Redirect to login page

```typescript
catch (error) {
  if (error.message.includes('Authentication required')) {
    window.location.href = '/login';
  }
}
```

### "Unauthorized" Error

**Cause:** User doesn't have permission to access this data

**Solution:** Show permission error or redirect to appropriate page

```typescript
catch (error) {
  if (error.message.includes('Unauthorized')) {
    showErrorMessage('You do not have permission to access this data');
  }
}
```

### "Trainer does not have access to client" Error

**Cause:** Trainer is trying to access a client they're not assigned to

**Solution:** Verify trainer-client assignment in database

```sql
SELECT * FROM trainerclientassignments 
WHERE trainerId = 'trainer-id' 
AND clientId = 'client-id' 
AND status = 'active'
```

## Performance Considerations

1. **Pagination:** Always use pagination for large datasets
   ```typescript
   const result = await ProtectedDataService.getAll('clientassignedworkouts', {
     limit: 50,
     skip: 0
   });
   ```

2. **Caching:** Implement client-side caching for frequently accessed data
   ```typescript
   const cache = new Map();
   
   async function getCachedItems(collection) {
     if (cache.has(collection)) {
       return cache.get(collection);
     }
     const items = await ProtectedDataService.getAll(collection);
     cache.set(collection, items);
     return items;
   }
   ```

3. **Lazy Loading:** Load data only when needed
   ```typescript
   useEffect(() => {
     if (isVisible) {
       loadData();
     }
   }, [isVisible]);
   ```

## Support

For issues or questions:
1. Check the bypass attempt tests for examples
2. Review the audit report for security status
3. Check server logs for access denials
4. Verify permissions in CMS dashboard

## References

- Backend Gateway: `/src/wix-verticals/backend/protected-data-gateway.ts`
- Client Service: `/src/lib/protected-data-service.ts`
- Tests: `/src/lib/__tests__/bypass-attempt-tests.test.ts`
- Audit: `/src/lib/phase3-audit-report.ts`
- Secure Access Wrapper: `/src/lib/secure-data-access.ts`
