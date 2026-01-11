# Security Role System - Backend Implementation

## Overview
This document describes the migration from localStorage-based role storage to a secure, backend-sourced role system using the `MemberRoles` CMS collection.

## What Changed

### 1. **New CMS Collection: `memberroles`**
- **Collection ID**: `memberroles`
- **Purpose**: Stores member roles server-side for security and persistence
- **Fields**:
  - `memberId` (TEXT): Unique identifier for the member
  - `role` (TEXT): The role assigned ('client', 'trainer', or 'admin')
  - `assignmentDate` (DATETIME): When the role was assigned
  - `status` (TEXT): Current status ('active', 'inactive', or 'pending')
  - `_id`, `_createdDate`, `_updatedDate`, `_owner` (system fields)

### 2. **Updated Entity Types** (`/src/entities/index.ts`)
Added new interfaces:
```typescript
export interface MemberRoles {
  _id: string;
  memberId?: string;
  role?: 'client' | 'trainer' | 'admin';
  assignmentDate?: Date | string;
  status?: 'active' | 'inactive' | 'pending';
}

export type MemberRole = 'client' | 'trainer' | 'admin';
```

### 3. **Updated Role Utilities** (`/src/lib/role-utils.ts`)
**Key Changes**:
- `getMemberRole()`: Now async, queries `memberroles` collection instead of localStorage
- `setMemberRole()`: Now async, creates/updates entries in `memberroles` collection
- `setDefaultRole()`: Now async, creates default 'client' role in collection
- `changeUserRole()`: Now async, includes admin verification
- `isTrainer()`, `isClient()`, `isAdmin()`: Now async functions

**Before (localStorage)**:
```typescript
export function getMemberRole(memberId: string): MemberRole | null {
  const roles = JSON.parse(localStorage.getItem('memberRoles') || '{}');
  return roles[memberId] || null;
}
```

**After (Backend)**:
```typescript
export async function getMemberRole(memberId: string): Promise<MemberRole | null> {
  const { items } = await BaseCrudService.getAll<MemberRoles>('memberroles');
  const memberRole = items.find(
    (mr) => mr.memberId === memberId && mr.status === 'active'
  );
  return memberRole?.role || null;
}
```

### 4. **Updated useRole Hook** (`/src/hooks/useRole.ts`)
**Key Changes**:
- Now async, loads roles from backend on component mount
- Added `isLoading` state to track async operations
- Caches role data in component state
- Automatically refetches when `memberId` changes

**Before**:
```typescript
export function useRole() {
  const { member } = useMember();
  const memberId = member?._id;
  const role = memberId ? getMemberRole(memberId) : null;
  // ...
}
```

**After**:
```typescript
export function useRole() {
  const { member } = useMember();
  const [role, setRole] = useState<MemberRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!memberId) return;
    const loadRole = async () => {
      const memberRole = await getMemberRole(memberId);
      setRole(memberRole);
    };
    loadRole();
  }, [memberId]);
  // ...
}
```

### 5. **Updated RoleSetup Component** (`/src/components/RoleSetup.tsx`)
**Key Changes**:
- Added `useEffect` to load admin status asynchronously
- Added `isLoadingAdmin` state to show loading state
- `handleRoleSelection()` now awaits `setMemberRole()` call
- Proper error handling for async operations

## Security Improvements

### ✅ **Before (Insecure)**
- Roles stored in browser localStorage
- Client-side only, easily manipulated
- No server-side validation
- Roles not persistent across devices
- No audit trail

### ✅ **After (Secure)**
- Roles stored in backend CMS collection
- Server-side source of truth
- Can implement backend validation
- Persistent across all devices
- Audit trail via `_createdDate`, `_updatedDate`
- Status field allows role deactivation
- Admin-only role changes (enforced in code)

## Usage Examples

### Loading a Member's Role
```typescript
import { useRole } from '@/hooks/useRole';

function MyComponent() {
  const { role, isLoading, isTrainer, isClient } = useRole();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (isTrainer) {
    return <div>Trainer Dashboard</div>;
  }
  
  return <div>Client Portal</div>;
}
```

### Setting a Member's Role
```typescript
import { setMemberRole } from '@/lib/role-utils';

// Set a member as a client
await setMemberRole('member-123', 'client');

// Set a member as a trainer (admin-only)
await setMemberRole('member-456', 'trainer');
```

### Checking Admin Status
```typescript
import { isAdmin } from '@/lib/role-utils';

const adminStatus = await isAdmin('member-789');
if (adminStatus) {
  // User is admin
}
```

## Migration Notes

### For Existing Users
- Existing localStorage roles will NOT be automatically migrated
- Users will need to re-select their role on next login
- This is intentional for security (forces re-verification)

### For New Users
- New users will get a default 'client' role via `setDefaultRole()`
- Can be changed to 'trainer' by admins only

### For Developers
- All role functions are now async - always use `await`
- The `useRole` hook handles async loading automatically
- Check `isLoading` state before rendering role-dependent content
- Use try/catch for error handling in custom role operations

## Future Enhancements

### Phase 2: Backend Validation (Requires Velo)
- Create Velo web modules for role validation
- Implement gatekeeper functions for data access
- Add role-based data filtering at query level
- Implement audit logging

### Phase 3: Admin Dashboard
- Create admin panel to manage member roles
- Implement role change approval workflow
- Add role history/audit trail view
- Implement role expiration

### Phase 4: Advanced Permissions
- Implement granular permissions beyond roles
- Add permission inheritance
- Implement role-based API access control
- Add permission caching

## Testing Checklist

- [ ] New users can set their role to 'client'
- [ ] Admins can set users to 'trainer' role
- [ ] Non-admins cannot set themselves to 'trainer'
- [ ] Role persists across page refreshes
- [ ] Role persists across device/browser changes
- [ ] `useRole` hook properly loads and caches roles
- [ ] Loading state shows while role is being fetched
- [ ] Error handling works for failed role operations
- [ ] RoleSetup component shows loading state
- [ ] Trainer and client portals respect role permissions

## Troubleshooting

### Role Not Loading
1. Check browser console for errors
2. Verify member ID is correct
3. Check `memberroles` collection has entries
4. Verify `status` is set to 'active'

### Role Change Not Working
1. Check if user is admin (for trainer role)
2. Verify member ID exists
3. Check for network errors
4. Verify CMS collection permissions

### Async/Await Issues
1. Ensure all role function calls use `await`
2. Check that components using roles handle loading state
3. Verify error handling is in place
