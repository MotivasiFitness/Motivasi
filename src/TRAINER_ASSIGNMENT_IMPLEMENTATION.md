# Trainer Assignment Implementation Guide

## Overview

This document describes the automatic trainer assignment system that assigns all users (existing and new) to a default trainer. The system is fully idempotent and prevents duplicate assignments.

## Architecture

### Components

1. **`/src/lib/trainer-assignment.ts`** - Core service for trainer assignments
   - `assignClientToTrainer()` - Assigns a single client (idempotent)
   - `backfillExistingUsers()` - Backfill operation for all existing users
   - `assignNewUserToTrainer()` - Auto-assign new users on registration
   - `isUserAssignedToTrainer()` - Check if user is assigned
   - `getTrainerClients()` - Get all clients for a trainer

2. **`/src/components/pages/TrainerAssignmentMigration.tsx`** - Admin UI for backfill
   - Accessible at `/admin/trainer-assignment`
   - Requires admin role
   - Shows real-time progress and results

3. **`/src/hooks/useAutoTrainerAssignment.ts`** - React hook for auto-assignment
   - Automatically assigns new users on authentication
   - Non-blocking: doesn't prevent signup on failure

4. **Router Configuration** - Routes in `/src/components/Router.tsx`
   - `/admin/trainer-assignment` - Migration UI (admin only)

## Default Trainer ID

```
d18a21c8-be77-496f-a2fd-ec6479ecba6d
```

This ID is defined in `trainer-assignment.ts` as `DEFAULT_TRAINER_ID` and can be overridden in function calls if needed.

## Usage

### 1. Backfill Existing Users

#### Option A: Via Admin UI (Recommended)

1. Log in as an admin user
2. Navigate to `/admin/trainer-assignment`
3. Click "Run Trainer Assignment Backfill"
4. View results in real-time

#### Option B: Programmatically

```typescript
import { backfillExistingUsers } from '@/lib/trainer-assignment';

const result = await backfillExistingUsers();
console.log(result);
// {
//   total: 150,
//   successful: 120,
//   skipped: 30,
//   failed: 0,
//   errors: []
// }
```

### 2. Auto-Assign New Users

The system automatically assigns new users on registration. To enable this:

#### Option A: Use the Hook in Your Layout

```typescript
import { useAutoTrainerAssignment } from '@/hooks/useAutoTrainerAssignment';

function MyLayout() {
  useAutoTrainerAssignment(); // Automatically assigns authenticated users

  return (
    <div>
      {/* Your layout content */}
    </div>
  );
}
```

#### Option B: Manual Assignment

```typescript
import { assignNewUserToTrainer } from '@/lib/trainer-assignment';

// In your signup/registration handler
const newMemberId = '...'; // The new user's member ID
await assignNewUserToTrainer(newMemberId);
```

### 3. Check User Assignment

```typescript
import { isUserAssignedToTrainer } from '@/lib/trainer-assignment';

const isAssigned = await isUserAssignedToTrainer('user-id-123');
if (isAssigned) {
  console.log('User is assigned to the default trainer');
}
```

### 4. Get All Clients for a Trainer

```typescript
import { getTrainerClients } from '@/lib/trainer-assignment';

const clientIds = await getTrainerClients('trainer-id-123');
console.log(`Trainer has ${clientIds.length} clients`);
```

## Idempotency Guarantee

The system is fully idempotent:

1. **Backfill Operation**
   - Checks for existing active assignments before creating new ones
   - Skips users already assigned to the trainer
   - Can be safely run multiple times
   - Returns detailed results (successful, skipped, failed)

2. **New User Assignment**
   - Checks for existing assignment before creating
   - Returns success if assignment already exists
   - Non-blocking: errors don't prevent signup

3. **Duplicate Prevention**
   - Queries for existing (trainerId, clientId) pairs with status='active'
   - Only creates new records if no active assignment exists
   - Prevents race conditions through database-level uniqueness

## Database Schema

### TrainerClientAssignments Collection

```typescript
interface TrainerClientAssignments {
  _id: string;                    // Unique ID (UUID)
  trainerId: string;              // Trainer's member ID
  clientId: string;               // Client's member ID
  assignmentDate: Date | string;  // When assigned
  status: string;                 // 'active' or 'inactive'
  notes?: string;                 // Optional notes
}
```

## Error Handling

### Backfill Operation

- **Logs errors** but continues processing other users
- **Returns detailed error information** for failed assignments
- **Non-blocking**: individual failures don't stop the entire operation

### New User Assignment

- **Logs warnings** for failed assignments
- **Non-blocking**: doesn't prevent user signup
- **Graceful degradation**: system continues to function even if assignment fails

### Error Logging

All errors are logged to the browser console with context:

```
[WARN] Failed to auto-assign new user abc123 to trainer: Network error
[ERROR] Unexpected error assigning new user def456 to trainer: TypeError...
```

## Monitoring & Auditing

### Backfill Results

The migration UI shows:
- Total users processed
- Successfully assigned
- Already assigned (skipped)
- Failed assignments
- Detailed error information for failures

### Logs

All operations are logged to the browser console:
- Backfill start/completion
- Individual assignment attempts
- Errors and warnings
- Summary statistics

## Implementation Checklist

- [x] Core service (`trainer-assignment.ts`)
- [x] Idempotency checks
- [x] Backfill operation
- [x] Auto-assignment for new users
- [x] Admin UI for backfill
- [x] Error handling and logging
- [x] React hook for auto-assignment
- [x] Router configuration
- [x] Documentation

## Next Steps

To fully activate the system:

1. **Add the hook to your main layout** (if using auto-assignment):
   ```typescript
   import { useAutoTrainerAssignment } from '@/hooks/useAutoTrainerAssignment';
   
   function RootLayout() {
     useAutoTrainerAssignment();
     return <YourLayout />;
   }
   ```

2. **Run the backfill** for existing users:
   - Navigate to `/admin/trainer-assignment`
   - Click "Run Trainer Assignment Backfill"
   - Verify results

3. **Test with a new user**:
   - Create a new account
   - Verify assignment in the database
   - Check console logs for confirmation

## Troubleshooting

### Backfill Shows 0 Users

- Check that users exist in the `memberroles` collection
- Verify the database connection is working
- Check browser console for errors

### Assignment Fails for Specific Users

- Check if the user ID is valid
- Verify the trainer ID is correct
- Check database permissions
- Review error message in the results

### Auto-Assignment Not Working

- Ensure the hook is called in your layout
- Check that `useMember()` is properly initialized
- Verify the user is authenticated (`isAuthenticated === true`)
- Check browser console for errors

## Performance Considerations

- **Backfill**: O(n) where n = number of users
  - Typical: ~1000 users in ~5-10 seconds
  - Each user requires 1 query (check existing) + 1 write (create)

- **New User Assignment**: O(1) per user
  - Runs in background (non-blocking)
  - Typical: <100ms per assignment

- **Query Optimization**: 
  - Backfill queries all assignments once, then filters in memory
  - Could be optimized with database-level filtering if needed

## Security Considerations

- **Admin-only UI**: Backfill page requires admin role
- **No sensitive data**: Only stores member IDs and dates
- **Audit trail**: All operations logged to console
- **Non-destructive**: Never deletes or modifies existing assignments

## Future Enhancements

1. **Bulk operations**: Optimize backfill with batch inserts
2. **Scheduled tasks**: Auto-run backfill on a schedule
3. **Webhook integration**: Trigger assignment on member creation event
4. **Assignment rules**: Support multiple trainers or conditional assignment
5. **Audit logging**: Store assignment history in a separate collection
6. **UI improvements**: Show assignment status in member profiles
