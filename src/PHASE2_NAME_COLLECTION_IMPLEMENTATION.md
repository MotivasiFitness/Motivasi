# Phase 2: First & Last Name Collection Implementation

## Overview
This implementation adds a mandatory profile completion step for new clients to collect their first and last names before accessing the portal. Existing clients without names are also redirected to complete their profile.

## Implementation Summary

### 1. ProfileCompletionGuard Component
**Location:** `/src/components/ClientPortal/ProfileCompletionGuard.tsx`

**Purpose:** Wraps the client portal layout to check if the user has completed their profile (firstName and lastName). If not, redirects them to `/portal/profile`.

**Key Features:**
- Checks profile completion on mount and when member changes
- Redirects to profile page if firstName or lastName is missing
- Allows access to profile page itself to prevent redirect loop
- Shows loading spinner during check and redirect
- Handles errors gracefully (allows access on error to prevent blocking)

### 2. Enhanced ProfilePage
**Location:** `/src/components/pages/ClientPortal/ProfilePage.tsx`

**Changes:**
- Added `isFirstTimeSetup` state to detect if this is initial profile completion
- Added validation for firstName and lastName (required, no empty strings)
- Shows different UI for first-time setup vs. regular profile updates
- Hides optional fields (phone, emergency contact, fitness goals) during first-time setup
- Auto-redirects to dashboard after successful first-time profile completion
- Shows appropriate alerts and messages based on context
- Prevents saving with empty names (trim whitespace)

**Validation:**
- First name required (cannot be empty or whitespace-only)
- Last name required (cannot be empty or whitespace-only)
- Shows validation error if either field is empty
- Button disabled until both fields have values

### 3. ClientPortalLayout Integration
**Location:** `/src/components/pages/ClientPortal/ClientPortalLayout.tsx`

**Changes:**
- Wrapped entire layout with `<ProfileCompletionGuard>`
- Guard checks profile completion before rendering any portal content
- Maintains existing role-based access control
- Preserves all existing functionality (sidebar, navigation, MotivaChat)

### 4. Name Display Service (Existing)
**Location:** `/src/lib/client-name-service.ts`

**Existing Functions Used:**
- `getClientDisplayName()`: Shows firstName if available, falls back to email prefix
- `getClientFullName()`: Shows "firstName lastName" if both available
- `isProfileIncomplete()`: Checks if firstName or lastName is missing

## User Flow

### New User Signup Flow
1. User signs up and logs in for the first time
2. `ProfileCompletionGuard` checks their profile
3. No firstName/lastName found → redirected to `/portal/profile`
4. Profile page shows "Complete Your Profile" UI
5. User enters first and last name (required fields only)
6. Clicks "Complete Profile" button
7. Profile saved to `clientprofiles` collection
8. Success message: "Profile completed! Redirecting to your dashboard..."
9. Auto-redirect to `/portal` after 1.5 seconds
10. Dashboard greets user by first name: "Welcome back, [FirstName]!"

### Existing User Without Name
1. User logs in (has account but no firstName/lastName in profile)
2. `ProfileCompletionGuard` checks their profile
3. Missing names detected → redirected to `/portal/profile`
4. Same flow as new user above
5. Cannot access any other portal pages until profile is completed

### Existing User With Name
1. User logs in (has firstName and lastName in profile)
2. `ProfileCompletionGuard` checks their profile
3. Profile complete → allowed to access portal normally
4. Can still update profile via `/portal/profile` (shows all fields)

## Technical Details

### Profile Completion Check
```typescript
// In ProfileCompletionGuard
const hasCompletedProfile = profile?.firstName && profile?.lastName;

if (!hasCompletedProfile && location.pathname !== '/portal/profile') {
  navigate('/portal/profile', { replace: true });
}
```

### Validation Logic
```typescript
// In ProfilePage handleSave
if (!firstName.trim()) {
  setValidationError('First name is required');
  return;
}

if (!lastName.trim()) {
  setValidationError('Last name is required');
  return;
}
```

### Data Storage
- Collection: `clientprofiles`
- Fields: `firstName`, `lastName` (both required)
- Linked by: `memberId` (matches `member.loginEmail`)
- Creates new profile if none exists
- Updates existing profile if found

## No "Skip for Now" Option
As per requirements, there is **no skip option**. Users must complete their profile before accessing the portal. The only way to exit is:
- Complete the profile (enter valid first and last name)
- Sign out (via logout button in sidebar)

## Existing Functionality Preserved
- All existing profile fields remain (phone, emergency contact, fitness goals)
- These are optional and shown only after initial name collection
- Name display service continues to work with fallback logic
- Dashboard and all other pages continue to use `getClientDisplayName()`
- Trainer dashboard and admin features unaffected

## Testing Checklist

### New User Flow
- [ ] Sign up with new account
- [ ] Verify redirect to profile page
- [ ] Try to navigate to other portal pages (should redirect back to profile)
- [ ] Enter first name only → button disabled
- [ ] Enter last name only → button disabled
- [ ] Enter both names → button enabled
- [ ] Submit profile → success message shown
- [ ] Verify auto-redirect to dashboard after 1.5s
- [ ] Verify dashboard greets by first name

### Existing User Without Name
- [ ] Log in with account that has no firstName/lastName
- [ ] Verify redirect to profile page
- [ ] Complete profile as above
- [ ] Verify can access portal after completion

### Existing User With Name
- [ ] Log in with account that has firstName and lastName
- [ ] Verify direct access to dashboard (no redirect)
- [ ] Navigate to profile page manually
- [ ] Verify all fields shown (including optional ones)
- [ ] Update profile → success message (no redirect)

### Validation
- [ ] Try to save with empty first name → error shown
- [ ] Try to save with empty last name → error shown
- [ ] Try to save with whitespace-only names → error shown
- [ ] Save with valid names → success

### Edge Cases
- [ ] Profile fetch error → user allowed access (fail-open)
- [ ] Profile save error → error message shown
- [ ] Multiple rapid saves → handled correctly
- [ ] Browser back button during first-time setup → redirects back to profile

## Files Modified
1. `/src/components/ClientPortal/ProfileCompletionGuard.tsx` (NEW)
2. `/src/components/pages/ClientPortal/ProfilePage.tsx` (ENHANCED)
3. `/src/components/pages/ClientPortal/ClientPortalLayout.tsx` (WRAPPED)

## Files Referenced (No Changes)
- `/src/lib/client-name-service.ts` (existing utility functions)
- `/src/entities/index.ts` (ClientProfiles interface)
- `/src/components/pages/ClientPortal/DashboardPage.tsx` (uses name service)

## Database Schema
No schema changes required. Uses existing `clientprofiles` collection:
- `memberId` (TEXT) - links to member account
- `firstName` (TEXT) - now required for portal access
- `lastName` (TEXT) - now required for portal access
- Other fields remain optional

## Future Enhancements (Not in Scope)
- Email verification before profile completion
- Profile completion progress indicator
- Welcome email after profile completion
- Analytics tracking for profile completion rate
- Admin dashboard to view incomplete profiles
