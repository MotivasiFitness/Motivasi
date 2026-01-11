# Role-Based System Implementation

## Overview

The Motivasi platform now includes a comprehensive role-based access control system that distinguishes between **Trainers** and **Clients**. This system enables:

- Role assignment during user registration
- Trainer-to-client assignment management
- Program assignment to specific clients
- Role-based access control for protected routes
- Secure data access based on user roles

---

## Architecture

### 1. **Role Types**

Three roles are supported:
- **trainer**: Can create programs, manage clients, send messages
- **client**: Can view assigned programs, track progress, receive nutrition guidance
- **admin**: Full system access (future implementation)

### 2. **Data Storage**

#### Member Roles (Client-Side)
- Stored in `localStorage` under the key `memberRoles`
- Format: `{ [memberId]: 'trainer' | 'client' | 'admin' }`
- **Note**: In production, this should be moved to a database collection

#### Trainer-Client Assignments
- Stored in the `trainerclientassignments` CMS collection
- Fields:
  - `trainerId`: ID of the assigned trainer
  - `clientId`: ID of the assigned client
  - `assignmentDate`: Date of assignment
  - `status`: 'Active', 'Inactive', or 'Paused'
  - `notes`: Optional notes about the assignment

---

## Components & Utilities

### Role Setup Component (`RoleSetup.tsx`)

Displays a role selection screen for new users.

**Usage:**
```tsx
import RoleSetup from '@/components/RoleSetup';

// In your router
{
  path: "role-setup",
  element: <RoleSetup />,
}
```

**Features:**
- Two-button interface for Trainer/Client selection
- Automatic redirect after role selection
- Error handling and success feedback

### Role Utilities (`lib/role-utils.ts`)

Provides helper functions for role management:

```typescript
// Get member role
const role = getMemberRole(memberId);

// Check role
if (isTrainer(memberId)) { /* ... */ }
if (isClient(memberId)) { /* ... */ }

// Assign client to trainer
await assignClientToTrainer(trainerId, clientId, notes);

// Get trainer's clients
const clients = await getTrainerClients(trainerId);

// Get client's trainers
const trainers = await getClientTrainers(clientId);

// Check assignment
const isAssigned = await isTrainerAssignedToClient(trainerId, clientId);

// Update assignment status
await updateAssignmentStatus(assignmentId, 'Active');

// Check access permissions
const canAccess = await canTrainerAccessClient(trainerId, clientId);
```

### useRole Hook (`hooks/useRole.ts`)

React hook for accessing role information in components:

```typescript
import { useRole } from '@/hooks/useRole';

function MyComponent() {
  const { memberId, role, isTrainer, isClient, isAdmin } = useRole();
  
  if (isTrainer) {
    return <TrainerView />;
  }
  
  if (isClient) {
    return <ClientView />;
  }
}
```

---

## User Flows

### 1. **New User Registration**

```
User Signs Up
    ↓
Redirected to /role-setup
    ↓
Selects Role (Trainer or Client)
    ↓
Role stored in localStorage
    ↓
Redirected to appropriate dashboard
    ├─ Trainer → /trainer
    └─ Client → /portal
```

### 2. **Trainer Assigning a Client**

```
Trainer navigates to /trainer/clients
    ↓
Clicks "Assign Client" button
    ↓
Enters client's member ID
    ↓
System creates TrainerClientAssignment record
    ↓
Client appears in trainer's client list
```

### 3. **Trainer Creating a Program for a Client**

```
Trainer navigates to /trainer/programs
    ↓
Selects from dropdown of assigned clients
    ↓
Fills in program details
    ↓
Program created with trainerId and clientId
    ↓
Client can now see program in /portal/program
```

### 4. **Client Viewing Assigned Programs**

```
Client logs in
    ↓
Navigates to /portal
    ↓
System fetches programs where clientId matches
    ↓
Displays all assigned programs
```

---

## Database Collections

### TrainerClientAssignments

```typescript
interface TrainerClientAssignments {
  _id: string;
  trainerId: string;      // Trainer's member ID
  clientId: string;       // Client's member ID
  assignmentDate: Date;   // When assignment was created
  status: string;         // 'Active', 'Inactive', 'Paused'
  notes?: string;         // Optional trainer notes
  _createdDate: Date;
  _updatedDate: Date;
}
```

### Programs (Updated)

```typescript
interface Programs {
  _id: string;
  programName: string;
  description: string;
  trainerId: string;      // Trainer who created it
  clientId: string;       // Client it's assigned to
  duration: string;
  focusArea: string;
  status: string;
  _createdDate: Date;
  _updatedDate: Date;
}
```

---

## Implementation Examples

### Example 1: Protecting Trainer Routes

```typescript
import { useRole } from '@/hooks/useRole';
import { Navigate } from 'react-router-dom';

function TrainerOnlyPage() {
  const { isTrainer } = useRole();
  
  if (!isTrainer) {
    return <Navigate to="/" replace />;
  }
  
  return <TrainerContent />;
}
```

### Example 2: Checking Client Access

```typescript
import { canTrainerAccessClient } from '@/lib/role-utils';

async function viewClientData(trainerId, clientId) {
  const hasAccess = await canTrainerAccessClient(trainerId, clientId);
  
  if (!hasAccess) {
    throw new Error('You do not have access to this client');
  }
  
  // Fetch and display client data
}
```

### Example 3: Assigning Multiple Clients

```typescript
import { assignClientToTrainer } from '@/lib/role-utils';

async function bulkAssignClients(trainerId, clientIds) {
  const results = await Promise.all(
    clientIds.map(clientId =>
      assignClientToTrainer(trainerId, clientId)
    )
  );
  
  return results;
}
```

---

## Security Considerations

### Current Implementation (Development)

- Roles stored in `localStorage` (client-side only)
- Suitable for development and testing
- **NOT SECURE for production**

### Production Implementation

For production, implement the following:

1. **Database Storage**
   - Create a `MemberRoles` collection in CMS
   - Store role assignments server-side
   - Validate role on every API call

2. **Backend Validation**
   - Verify role on server before allowing operations
   - Check trainer-client assignment before allowing program creation
   - Implement proper access control middleware

3. **JWT/Token Enhancement**
   - Include role in JWT token
   - Validate token role matches database
   - Implement role-based token expiration

4. **Audit Logging**
   - Log all role changes
   - Track who assigned/removed clients
   - Monitor unauthorized access attempts

---

## Migration Guide

### From Current System to Production

1. **Create MemberRoles Collection**
   ```typescript
   interface MemberRoles {
     _id: string;
     memberId: string;
     role: 'trainer' | 'client' | 'admin';
     _createdDate: Date;
     _updatedDate: Date;
   }
   ```

2. **Update Role Utilities**
   ```typescript
   // Replace localStorage with database calls
   export async function getMemberRole(memberId: string): Promise<MemberRole | null> {
     const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
     const memberRole = items.find(r => r.memberId === memberId);
     return memberRole?.role || null;
   }
   ```

3. **Add Backend Validation**
   - Implement middleware to check roles
   - Validate assignments before operations
   - Return 403 Forbidden for unauthorized access

4. **Update Components**
   - Make role utilities async
   - Add loading states
   - Handle permission errors gracefully

---

## Testing

### Test Role Assignment

```typescript
import { setMemberRole, getMemberRole } from '@/lib/role-utils';

test('should assign and retrieve role', () => {
  const memberId = 'test-member-123';
  setMemberRole(memberId, 'trainer');
  
  expect(getMemberRole(memberId)).toBe('trainer');
});
```

### Test Trainer-Client Assignment

```typescript
import { assignClientToTrainer, isTrainerAssignedToClient } from '@/lib/role-utils';

test('should assign client to trainer', async () => {
  const trainerId = 'trainer-123';
  const clientId = 'client-456';
  
  await assignClientToTrainer(trainerId, clientId);
  const isAssigned = await isTrainerAssignedToClient(trainerId, clientId);
  
  expect(isAssigned).toBe(true);
});
```

---

## Future Enhancements

1. **Role Hierarchy**
   - Implement role inheritance
   - Support custom roles
   - Add permission granularity

2. **Multi-Trainer Support**
   - Allow clients to have multiple trainers
   - Implement trainer collaboration
   - Add trainer specialization

3. **Advanced Permissions**
   - Fine-grained access control (RBAC)
   - Resource-level permissions
   - Time-based access restrictions

4. **Audit & Compliance**
   - Complete audit trail
   - GDPR compliance
   - Data retention policies

---

## Troubleshooting

### Issue: Role not persisting after refresh

**Solution**: Roles are stored in localStorage. Check browser storage settings.

```typescript
// Debug role storage
console.log(localStorage.getItem('memberRoles'));
```

### Issue: Client not appearing in trainer's list

**Solution**: Verify the assignment exists and status is 'Active'.

```typescript
// Check assignments
const assignments = await getTrainerClients(trainerId);
console.log(assignments);
```

### Issue: Program creation failing

**Solution**: Ensure client is assigned to trainer before creating program.

```typescript
// Verify assignment before creating program
const isAssigned = await isTrainerAssignedToClient(trainerId, clientId);
if (!isAssigned) {
  throw new Error('Client must be assigned to trainer first');
}
```

---

## Support

For questions or issues with the role-based system, please contact the development team or refer to the inline code documentation.
