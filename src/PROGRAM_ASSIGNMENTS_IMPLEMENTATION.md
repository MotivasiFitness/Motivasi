# Program Assignments Implementation Guide

## Overview
This document describes the implementation of the `programassignments` entity with server-side access control to ensure clients can only read their own assignments and trainers can only read assignments for their managed clients.

## Data Model

### Collection: `programassignments`
**Collection ID:** `programassignments`

**Fields:**
- `_id` (string) - Unique identifier (system field)
- `programId` (text) - References the fitness program being assigned
- `clientId` (text) - References the client receiving the program (memberId)
- `trainerId` (text) - References the trainer who assigned the program (memberId)
- `assignedAt` (datetime) - Timestamp when the program was assigned
- `status` (text) - Status of the assignment (e.g., "active", "completed", "paused")
- `_createdDate` (datetime) - System field
- `_updatedDate` (datetime) - System field

**Permissions:**
- Read: ANYONE (filtered by access control service)
- Insert: ANYONE (validated by access control service)
- Update: ANYONE (validated by access control service)
- Remove: ANYONE (validated by access control service)

## Access Control Implementation

### Service Layer: `/src/lib/program-assignment-access-control.ts`

This service implements all access control logic for program assignments:

#### Key Functions:

1. **`getAuthorizedProgramAssignments(filters)`**
   - Fetches program assignments based on user role
   - **Client access:** Only returns assignments where `clientId === memberId`
   - **Trainer access:** Returns assignments where:
     - `trainerId === memberId` (assignments they created), OR
     - `clientId` is in their list of managed clients (from `trainerclientassignments`)

2. **`getAuthorizedProgramAssignment(assignmentId, filters)`**
   - Fetches a single assignment with access control
   - Returns `null` if user doesn't have access

3. **`createProgramAssignment(assignment, trainerId)`**
   - Creates a new program assignment (trainers only)
   - Validates that the trainer is assigned to the client via `trainerclientassignments`
   - Throws error if unauthorized

4. **`updateProgramAssignment(assignmentId, updates, trainerId)`**
   - Updates an existing assignment (trainers only)
   - Validates trainer authorization
   - Throws error if unauthorized

5. **`getClientProgramAssignments(clientId, requestingMemberId, requestingRole)`**
   - Gets all assignments for a specific client
   - **Client access:** Can only request their own assignments
   - **Trainer access:** Can only request assignments for managed clients

### React Hook: `/src/hooks/useProgramAssignments.ts`

Provides easy-to-use React hooks with automatic access control:

#### Hooks:

1. **`useProgramAssignments()`**
   - Automatically fetches assignments for the current authenticated user
   - Uses their role (client/trainer) to apply appropriate filters
   - Returns: `{ assignments, isLoading, error, refetch }`

2. **`useClientProgramAssignments(clientId)`**
   - Fetches assignments for a specific client
   - Validates access based on requesting user's role
   - Returns: `{ assignments, isLoading, error, refetch }`

## Usage Examples

### Client Portal - View My Assigned Programs

```typescript
import { useProgramAssignments } from '@/hooks/useProgramAssignments';

function MyProgramsPage() {
  const { assignments, isLoading, error } = useProgramAssignments();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Programs</h1>
      {assignments.map(assignment => (
        <div key={assignment._id}>
          <h2>Program: {assignment.programId}</h2>
          <p>Status: {assignment.status}</p>
          <p>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### Trainer Portal - View Client's Programs

```typescript
import { useClientProgramAssignments } from '@/hooks/useProgramAssignments';

function ClientProgramsView({ clientId }: { clientId: string }) {
  const { assignments, isLoading, error } = useClientProgramAssignments(clientId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Access Denied: {error}</div>;

  return (
    <div>
      <h2>Client's Programs</h2>
      {assignments.map(assignment => (
        <div key={assignment._id}>
          <p>Program: {assignment.programId}</p>
          <p>Status: {assignment.status}</p>
        </div>
      ))}
    </div>
  );
}
```

### Trainer Portal - Assign Program to Client

```typescript
import { createProgramAssignment } from '@/lib/program-assignment-access-control';
import { useMember } from '@/integrations';

function AssignProgramButton({ programId, clientId }: { programId: string; clientId: string }) {
  const { member } = useMember();

  const handleAssign = async () => {
    try {
      await createProgramAssignment(
        {
          programId,
          clientId,
          status: 'active'
        },
        member._id // trainerId
      );
      alert('Program assigned successfully!');
    } catch (error) {
      alert('Failed to assign program: ' + error.message);
    }
  };

  return <button onClick={handleAssign}>Assign Program</button>;
}
```

### Trainer Portal - Update Assignment Status

```typescript
import { updateProgramAssignment } from '@/lib/program-assignment-access-control';
import { useMember } from '@/integrations';

function UpdateAssignmentStatus({ assignmentId }: { assignmentId: string }) {
  const { member } = useMember();

  const handleComplete = async () => {
    try {
      await updateProgramAssignment(
        assignmentId,
        { status: 'completed' },
        member._id // trainerId
      );
      alert('Assignment marked as completed!');
    } catch (error) {
      alert('Failed to update: ' + error.message);
    }
  };

  return <button onClick={handleComplete}>Mark Complete</button>;
}
```

## Security Considerations

### Access Control Rules

1. **Clients:**
   - Can READ only their own assignments (where `clientId === memberId`)
   - Cannot CREATE assignments
   - Cannot UPDATE assignments
   - Cannot DELETE assignments

2. **Trainers:**
   - Can READ assignments they created OR for their managed clients
   - Can CREATE assignments for their managed clients only
   - Can UPDATE assignments they created OR for their managed clients
   - Can DELETE assignments they created OR for their managed clients

3. **Validation:**
   - All operations validate against `trainerclientassignments` collection
   - Only active trainer-client relationships are considered
   - Unauthorized operations throw errors with descriptive messages

### Data Filtering

The access control is implemented at the **service layer**, not at the database level:
- Database permissions are set to "ANYONE" for flexibility
- All filtering happens in the service functions
- This allows for complex business logic and validation

### Best Practices

1. **Always use the access control service** - Never query `programassignments` directly
2. **Use the React hooks** - They handle authentication and role detection automatically
3. **Handle errors gracefully** - Display user-friendly messages for unauthorized access
4. **Validate on both client and server** - Client-side for UX, service layer for security

## Integration Points

### Related Collections

1. **`trainerclientassignments`**
   - Used to validate trainer-client relationships
   - Only `status: 'active'` assignments are considered valid

2. **`programs`**
   - Referenced by `programId` field
   - Contains the actual program details

3. **`clientprofiles`**
   - Referenced by `clientId` field (via `memberId`)
   - Contains client information

4. **`trainerprofiles`**
   - Referenced by `trainerId` field (via `memberId`)
   - Contains trainer information

### Existing Pages to Update

Consider updating these pages to use the new `programassignments` collection:

1. **Client Portal:**
   - `/portal/program` - MyProgramPage.tsx
   - `/portal` - DashboardPage.tsx

2. **Trainer Portal:**
   - `/trainer/clients` - TrainerClientsPage.tsx
   - `/trainer/programs` - CreateProgramPage.tsx
   - `/trainer/client-profile/:clientId` - ClientProfilePage.tsx

## Migration Strategy

If you have existing program assignments in other collections (e.g., `programs` with `clientId`), you can migrate them:

```typescript
import { BaseCrudService } from '@/integrations';
import type { FitnessPrograms } from '@/entities/programs';
import type { ProgramAssignments } from '@/entities/programassignments';

async function migrateProgramAssignments() {
  // Get all programs with clientId
  const { items: programs } = await BaseCrudService.getAll<FitnessPrograms>(
    'programs',
    [],
    { limit: 1000 }
  );

  const assignedPrograms = programs.filter(p => p.clientId && p.trainerId);

  // Create program assignments
  for (const program of assignedPrograms) {
    const assignment: ProgramAssignments = {
      _id: crypto.randomUUID(),
      programId: program._id,
      clientId: program.clientId!,
      trainerId: program.trainerId!,
      assignedAt: program._createdDate || new Date().toISOString(),
      status: program.status || 'active'
    };

    await BaseCrudService.create('programassignments', assignment);
  }

  console.log(`Migrated ${assignedPrograms.length} program assignments`);
}
```

## Testing Checklist

- [ ] Client can view their own program assignments
- [ ] Client cannot view other clients' assignments
- [ ] Trainer can view assignments for their managed clients
- [ ] Trainer cannot view assignments for unmanaged clients
- [ ] Trainer can create assignments for managed clients
- [ ] Trainer cannot create assignments for unmanaged clients
- [ ] Trainer can update assignments they created
- [ ] Trainer can update assignments for managed clients
- [ ] Unauthorized access attempts throw appropriate errors
- [ ] React hooks properly handle loading and error states

## Future Enhancements

1. **Notification System:**
   - Notify clients when a new program is assigned
   - Notify trainers when a client completes a program

2. **Assignment History:**
   - Track assignment status changes
   - Add `completedAt` timestamp when status changes to "completed"

3. **Bulk Operations:**
   - Assign the same program to multiple clients
   - Update multiple assignments at once

4. **Advanced Filtering:**
   - Filter by program type
   - Filter by date range
   - Filter by status

5. **Analytics:**
   - Track assignment completion rates
   - Monitor program effectiveness
   - Generate reports on client progress
