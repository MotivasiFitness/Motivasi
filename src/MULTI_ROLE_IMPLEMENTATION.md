# Multi-Role Implementation Guide

## Overview

This document describes the implementation of multi-role support for the Motivasi platform, enabling users like `brad_leonardthomas@icloud.com` to have both **Admin** and **Trainer** privileges simultaneously.

## Changes Made

### 1. **Entity Schema Update** (`/src/entities/index.ts`)

Added support for multiple roles in the `MemberRoles` interface:

```typescript
export interface MemberRoles {
  _id: string;
  memberId?: string;
  /** Single role (legacy format) */
  role?: string;
  /** Multiple roles (new format: comma-separated) */
  roles?: string;
  status?: string;
  // ... other fields
}
```

### 2. **Role Utilities Enhancement** (`/src/lib/role-utils.ts`)

#### New Function: `getMemberRoles(memberId: string)`
- Returns an array of all roles for a user
- Supports both legacy (single role) and new (multiple roles) formats
- Automatically parses comma-separated roles from the `roles` field

#### New Function: `setMemberRoles(memberId: string, roles: MemberRole[])`
- Assigns multiple roles to a user
- Stores roles as comma-separated string in the `roles` field
- Maintains backward compatibility by setting the first role in the `role` field
- Admin-only operation

#### Updated Functions:
- `isTrainer()` - Now checks if user has trainer role (among possibly other roles)
- `isClient()` - Now checks if user has client role (among possibly other roles)
- `isAdmin()` - Now checks if user has admin role (among possibly other roles)

### 3. **Portal Access Control Updates**

#### Trainer Dashboard (`/src/components/pages/TrainerDashboard/TrainerDashboardLayout.tsx`)
```typescript
// Now allows both trainers AND admins
if (!isLoading && !isTrainer && !isAdmin) {
  return <Navigate to="/" replace />;
}
```

#### Client Portal (`/src/components/pages/ClientPortal/ClientPortalLayout.tsx`)
```typescript
// Now allows both clients AND admins
if (!isLoading && !isClient && !isAdmin) {
  return <Navigate to="/" replace />;
}
```

**Rationale**: Admins need full access to both portals for management, testing, and troubleshooting purposes.

### 4. **Admin Dashboard Enhancement** (`/src/components/pages/AdminDashboard.tsx`)

- Updated UI to display multiple roles for each user
- Added support for assigning multiple roles to users
- Displays roles as individual badges (e.g., "Admin", "Trainer")
- Maintains backward compatibility with single-role users

## How to Assign Roles to brad_leonardthomas@icloud.com

### Option 1: Using the Admin Dashboard (Recommended)

1. **Log in as an admin user** to access `/admin`
2. **Search for the user**: `brad_leonardthomas@icloud.com` (or their member ID)
3. **Click Edit** on their row
4. **Select roles**: Check both "Admin" and "Trainer" checkboxes
5. **Click Save** to apply the changes

### Option 2: Direct Database Entry (Advanced)

If you need to manually create or update the role entry:

**Create a new MemberRoles entry:**
```json
{
  "_id": "unique-uuid-here",
  "memberId": "brad_leonardthomas@icloud.com",
  "role": "admin",
  "roles": "admin,trainer",
  "assignmentDate": "2026-01-12T00:00:00Z",
  "status": "active"
}
```

**Or update existing entry:**
- Set `role` to "admin" (primary role for backward compatibility)
- Set `roles` to "admin,trainer" (comma-separated list)
- Ensure `status` is "active"

## Access Behavior After Role Assignment

Once `brad_leonardthomas@icloud.com` has both **Admin** and **Trainer** roles:

### ✅ Allowed Access
- **Direct access to `/trainer`** - No redirect, full trainer portal access
- **Direct access to `/trainer/dashboard`** - Dashboard loads immediately
- **Direct access to `/portal`** - Client portal access (for testing)
- **Direct access to `/admin`** - Admin dashboard access
- **All trainer features**: Clients, Programs, Messages, Video Reviews, Client Progress
- **All admin features**: User role management, system administration

### ✅ Persistent Access
- Access persists after logout/login
- Access persists across browser sessions
- Access works on live site (not just development)

### ✅ Role Checks Bypass
- No role-based redirects will occur
- Can access both `/portal/*` and `/trainer/*` routes
- Can bypass role-based gating for testing and management

## Technical Details

### Role Storage Format

**Legacy (Single Role):**
```
memberId: "user-id"
role: "trainer"
roles: null
```

**New (Multiple Roles):**
```
memberId: "user-id"
role: "admin"
roles: "admin,trainer"
```

### Role Checking Logic

When checking if a user has a specific role:

1. Fetch the user's MemberRoles record
2. If `roles` field exists, parse comma-separated values
3. If `roles` field is empty, fall back to `role` field
4. Return array of roles
5. Check if desired role is in the array

### Backward Compatibility

- Existing single-role users continue to work unchanged
- The `role` field is always maintained for backward compatibility
- New multi-role users have both `role` (primary) and `roles` (all roles) fields

## Testing the Implementation

### Test Case 1: Assign Admin + Trainer Roles
1. Go to `/admin`
2. Find `brad_leonardthomas@icloud.com`
3. Assign both "Admin" and "Trainer" roles
4. Verify both roles are saved

### Test Case 2: Direct Trainer Portal Access
1. Log in as `brad_leonardthomas@icloud.com`
2. Navigate directly to `/trainer`
3. Verify no redirect occurs
4. Verify trainer dashboard loads

### Test Case 3: Direct Client Portal Access
1. While logged in as `brad_leonardthomas@icloud.com`
2. Navigate directly to `/portal`
3. Verify no redirect occurs
4. Verify client portal loads

### Test Case 4: Admin Dashboard Access
1. While logged in as `brad_leonardthomas@icloud.com`
2. Navigate directly to `/admin`
3. Verify admin dashboard loads
4. Verify can manage user roles

### Test Case 5: Persistence
1. Assign roles to the user
2. Log out
3. Log back in
4. Verify roles are still assigned
5. Verify access to both portals still works

## Troubleshooting

### User Can't Access Trainer Portal
1. Check that the user has "trainer" role in their MemberRoles record
2. Verify the `status` field is "active"
3. Clear browser cache and try again
4. Check browser console for error messages

### User Can't Access Admin Dashboard
1. Check that the user has "admin" role in their MemberRoles record
2. Verify the `status` field is "active"
3. Ensure the user is logged in
4. Check browser console for error messages

### Roles Not Updating
1. Verify you're logged in as an admin
2. Check that the user's MemberRoles record exists
3. Verify the update was successful (check the success message)
4. Refresh the page to see updated roles

## Security Considerations

- Only admins can assign or modify user roles
- The `setMemberRoles()` function is admin-only
- Role changes are logged in the database with timestamps
- Admins can access both portals for legitimate management purposes
- Regular audits should be performed to ensure role assignments are appropriate

## Future Enhancements

Potential improvements to this implementation:

1. **Role-Based Permissions**: Implement granular permissions within each role
2. **Audit Logging**: Track all role changes with admin user and timestamp
3. **Role Expiration**: Add optional expiration dates for temporary role assignments
4. **Role Hierarchies**: Define role inheritance (e.g., admin inherits trainer permissions)
5. **UI Improvements**: Add bulk role assignment for multiple users
6. **API Endpoints**: Create REST endpoints for role management

## Questions or Issues?

If you encounter any issues with the multi-role implementation:

1. Check the browser console for error messages
2. Review the role record in the MemberRoles collection
3. Verify the user is logged in and authenticated
4. Check that the user's member ID is correct
5. Contact support at hello@motivasi.co.uk if problems persist
