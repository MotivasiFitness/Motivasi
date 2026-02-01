# Program Publishing & Assignment Debug Guide

## Overview
This guide explains the complete flow of program publishing and client assignment, with detailed logging to help diagnose issues.

## Complete Flow

### 1. **Program Creation** (CreateProgramPage.tsx)
When a trainer creates a program:

```
1. Form submission → handleSubmit()
2. Determine status:
   - If "Save as Draft" → DRAFT
   - If "Publish" + client selected → ASSIGNED
   - If "Publish" + no client → TEMPLATE
3. Create program in 'programs' collection (via ProtectedDataService)
4. Create draft entry in 'programdrafts' collection (via ProtectedDataService)
5. If ASSIGNED: Create placeholder in 'clientprograms' (via BaseCrudService)
6. Navigate to /trainer/programs-created
```

**Console logs to watch:**
```
🚀 [CreateProgramPage] Starting program creation
📝 [CreateProgramPage] Creating program with status: DRAFT|ASSIGNED|TEMPLATE
✅ [CreateProgramPage] Program created
✅ [CreateProgramPage] Program draft created
📝 [CreateProgramPage] Creating placeholder exercise in clientprograms...
✅ [CreateProgramPage] Placeholder exercise created
✅ [CreateProgramPage] Program creation completed successfully
```

### 2. **Program Publishing** (ProgramsCreatedPage.tsx → ProgramAssignmentModal.tsx)
When a trainer publishes a draft program:

```
1. Click "Publish" button on draft program
2. ProgramAssignmentModal opens
3. Load trainer's assigned clients (via ProtectedDataService.getAll)
4. Trainer selects a client
5. Click "Publish & Assign"
6. handleAssign() executes:
   a. Create ProgramAssignment (via ProtectedDataService)
   b. Update program status to ASSIGNED (via ProtectedDataService)
   c. Create placeholder in clientprograms (via BaseCrudService)
7. Modal closes, programs list refreshes
```

**Console logs to watch:**
```
🚀 [ProgramAssignmentModal] Starting program assignment
📋 [ProgramAssignmentModal] Loaded assignments
✅ [ProgramAssignmentModal] Loaded clients
📝 [ProgramAssignmentModal] Creating program assignment...
✅ [ProgramAssignmentModal] Program assignment created
📝 [ProgramAssignmentModal] Updating program status to ASSIGNED...
✅ [ProgramAssignmentModal] Program status updated
📝 [ProgramAssignmentModal] Creating placeholder exercise in clientprograms...
✅ [ProgramAssignmentModal] Placeholder exercise created
✅ [ProgramAssignmentModal] Program assignment completed successfully
```

## Backend Security Layer

All protected collections route through `/protected-data-gateway`:

### Collections Protected:
- `programs`
- `programassignments`
- `programdrafts`
- `clientprofiles`
- `clientprograms`
- `trainerclientassignments`
- And others...

### Authorization Rules:

**For TRAINERS:**
- Can CREATE: Only if `trainerId` matches their member ID
- Can UPDATE: Only if `trainerId` matches their member ID
- Can READ: Only items where `trainerId` matches their member ID

**For CLIENTS:**
- Can CREATE: Only if `clientId` matches their member ID
- Can UPDATE: Only if `clientId` matches their member ID
- Can READ: Only items where `clientId` matches their member ID

**For ADMINS:**
- Full access to all data

### Backend Logs to Watch:
```
🔍 [protected-data-gateway] Create validation
✅ [protected-data-gateway] Create authorized, proceeding with insert
🔍 [protected-data-gateway] Update validation
✅ [protected-data-gateway] Update authorized, proceeding with update
```

## Troubleshooting

### Issue: "Failed to assign program"

**Step 1: Check Frontend Logs**
Open browser DevTools → Console tab and look for:
- `❌ [ProgramAssignmentModal] Error assigning program:`
- Check the exact error message

**Step 2: Check Backend Logs**
If you see authorization errors like:
- `Unauthorized: Trainers can only create data for themselves`
- `Unauthorized: Trainers can only update their own data`

This means the `trainerId` in the data doesn't match the authenticated trainer's ID.

**Step 3: Verify Data Structure**

When creating a program assignment, ensure:
```javascript
{
  _id: crypto.randomUUID(),
  programId: "...",
  clientId: "...",        // Must be a valid client ID
  trainerId: "...",       // Must match authenticated trainer's ID
  assignedAt: "...",
  status: "active"
}
```

When updating a program, ensure:
```javascript
{
  status: "ASSIGNED"      // Only updating status
}
```

### Issue: Program doesn't show in client portal

**Check:**
1. Is `clientprograms` placeholder created? (Check browser logs)
2. Does the placeholder have correct `programTitle`?
3. Is the client actually assigned to the trainer?
   - Check `trainerclientassignments` collection
   - Verify `trainerId` and `clientId` match

### Issue: "No clients assigned to you yet"

**Check:**
1. Are there entries in `trainerclientassignments`?
2. Do they have `trainerId` matching the logged-in trainer?
3. Do they have `status: "active"`?
4. Are the referenced `clientId`s valid in `clientprofiles`?

## Key Data Fields

### FitnessPrograms
```typescript
{
  _id: string;
  programName: string;
  description: string;
  trainerId: string;        // ← CRITICAL: Must match trainer's member ID
  clientId?: string;        // Optional: If assigned to specific client
  duration: string;
  focusArea: string;
  status: "DRAFT" | "ASSIGNED" | "TEMPLATE" | "ACTIVE";
}
```

### ProgramAssignments
```typescript
{
  _id: string;
  programId: string;
  clientId: string;         // ← CRITICAL: Must be valid client
  trainerId: string;        // ← CRITICAL: Must match trainer's member ID
  assignedAt: string;
  status: "active";
}
```

### ClientPrograms
```typescript
{
  _id: string;
  programTitle: string;
  weekNumber: number;
  exerciseName: string;
  // ... other exercise fields
}
```

## Testing Checklist

- [ ] Create a new program as draft
- [ ] Verify it appears in "Programs Created" → "Drafts" tab
- [ ] Click "Publish" button
- [ ] Select a client from dropdown
- [ ] Click "Publish & Assign"
- [ ] Check browser console for all ✅ logs
- [ ] Verify program status changed to "ASSIGNED" in Programs Created page
- [ ] Log in as client
- [ ] Verify program appears in client portal
- [ ] Verify placeholder exercise shows with correct program name

## Common Mistakes

❌ **Using BaseCrudService for protected collections**
- Always use ProtectedDataService for: programs, programassignments, programdrafts, clientprofiles, clientprograms, trainerclientassignments

✅ **Correct approach:**
```javascript
import { ProtectedDataService } from '@/lib/protected-data-service';
await ProtectedDataService.create('programs', programData);
await ProtectedDataService.update('programs', programId, updateData);
```

❌ **Not including trainerId when creating programs**
```javascript
// WRONG
await ProtectedDataService.create('programs', {
  programName: 'My Program',
  // Missing trainerId!
});
```

✅ **Correct:**
```javascript
await ProtectedDataService.create('programs', {
  _id: crypto.randomUUID(),
  programName: 'My Program',
  trainerId: member._id,  // ← REQUIRED
  // ... other fields
});
```

## Performance Notes

- Program creation is fast (< 1 second)
- Publishing involves 3 operations (assignment + status update + placeholder)
- Each operation goes through backend security validation
- Total time: 2-3 seconds typically

If operations take > 5 seconds, check:
1. Network tab in DevTools
2. Backend logs for slow queries
3. Database performance

## Next Steps if Still Having Issues

1. **Enable detailed logging:**
   - Check all console logs match expected pattern
   - Look for any error messages

2. **Verify data integrity:**
   - Check trainerclientassignments has correct entries
   - Verify trainer-client relationship exists

3. **Check backend logs:**
   - Look for authorization failures
   - Check for database errors

4. **Test with admin account:**
   - If it works with admin, issue is likely authorization
   - If it fails with admin, issue is likely data structure

5. **Contact support with:**
   - Browser console logs (full error messages)
   - Trainer ID and Client ID being used
   - Steps to reproduce
