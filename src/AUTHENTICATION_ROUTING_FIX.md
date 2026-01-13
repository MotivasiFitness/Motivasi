# Authentication & Routing Fix - Client Portal Login Flow

## Overview
This document outlines the fixes applied to the authentication and routing system to ensure proper Wix Members integration and correct login flow for the Client Portal.

## Issues Identified & Fixed

### 1. **Header Navigation - Login Button Behavior** ✅ FIXED
**Problem:** The "Client Portal" button in the header was using `<Link to="/portal">` which would navigate to the protected route without triggering the Wix login flow.

**Solution:** Changed the button to call `actions.login()` instead of navigating to `/portal`:
```tsx
// BEFORE (WRONG)
<Link to="/portal" className="...">
  Client Portal
</Link>

// AFTER (CORRECT)
<button onClick={actions.login} className="...">
  Client Portal
</button>
```

**Location:** `/src/components/layout/Header.tsx` (lines 84-89 and 171-177)

**Impact:** 
- Unauthenticated users clicking "Client Portal" now trigger the Wix login flow
- After login, users are redirected back to the portal automatically
- No more direct navigation to protected routes without authentication

---

## Authentication Flow Architecture

### Current Implementation

```
User (Unauthenticated)
    ↓
Click "Client Portal" button
    ↓
actions.login() triggered
    ↓
Wix Members login page opens
    ↓
User authenticates
    ↓
Wix redirects back to /portal
    ↓
MemberProtectedRoute checks isAuthenticated
    ↓
Portal content renders
```

### Key Components

#### 1. **MemberProvider** (from @/integrations)
- Wraps the entire app in Router.tsx
- Manages authentication state globally
- Provides `useMember()` hook to all components

#### 2. **useMember() Hook**
Returns:
```typescript
{
  member: Member | null,           // Current authenticated user
  isAuthenticated: boolean,         // Is user logged in?
  isLoading: boolean,              // Is auth check in progress?
  actions: {
    login: () => void,             // Trigger Wix login
    logout: () => void,            // Trigger Wix logout
    loadCurrentMember: () => void   // Reload member data
  }
}
```

#### 3. **MemberProtectedRoute Component**
- Wraps protected pages (e.g., `/portal`, `/trainer`)
- Shows loading spinner while checking authentication
- Shows sign-in prompt if user is not authenticated
- Renders children if user is authenticated

---

## Page Permissions & Access Control

### Public Pages (Accessible to Everyone)
- `/` (Home)
- `/about` (About)
- `/blog` (Blog)
- `/online-training` (Online Training)
- `/privacy` (Privacy Policy)
- `/terms` (Terms & Conditions)
- `/disclaimer` (Disclaimer)
- `/accessibility` (Accessibility)
- `/store` (Store/Packages)
- `/products/:slug` (Product Details)
- `/cart` (Shopping Cart)
- `/checkout` (Checkout)
- `/payment-success` (Payment Success)

### Protected Pages (Members Only)
- `/portal/*` (Client Portal & all sub-pages)
  - `/portal` (Dashboard)
  - `/portal/program` (My Program)
  - `/portal/nutrition` (Nutrition)
  - `/portal/progress` (Progress)
  - `/portal/bookings` (Bookings)
  - `/portal/messages` (Messages)
  - `/portal/video-library` (Video Library)
  - `/portal/my-submissions` (Video Submissions)

- `/trainer/*` (Trainer Dashboard & all sub-pages)
  - `/trainer` (Dashboard)
  - `/trainer/clients` (Clients)
  - `/trainer/programs` (Programs)
  - `/trainer/ai-assistant` (AI Assistant)
  - `/trainer/program-editor` (Program Editor)
  - `/trainer/preferences` (Preferences)
  - `/trainer/messages` (Messages)
  - `/trainer/video-reviews` (Video Reviews)
  - `/trainer/progress` (Progress)

- `/admin` (Admin Dashboard)
- `/exercise-video-review` (Video Review)

---

## Router Configuration

### Router.tsx Structure
```tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,  // Wraps with WixServicesProvider
    children: [
      // Public routes
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      // ... more public routes
      
      // Protected routes
      {
        path: "portal",
        element: (
          <MemberProtectedRoute>
            <ClientPortalLayout />
          </MemberProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "program", element: <MyProgramPage /> },
          // ... more portal routes
        ]
      },
      {
        path: "trainer",
        element: (
          <MemberProtectedRoute>
            <TrainerDashboardLayout />
          </MemberProtectedRoute>
        ),
        children: [
          // ... trainer routes
        ]
      }
    ]
  }
]);
```

---

## Role-Based Routing

### How Role-Based Access Works

1. **User logs in** → Wix Members SDK authenticates
2. **MemberProvider loads** → Fetches member data
3. **useRole() hook checks** → Queries member roles from database
4. **Conditional rendering** → Shows appropriate portal based on role

### useRole() Hook
```typescript
const { isClient, isTrainer, isAdmin, isLoading } = useRole();

// Usage in Header
{isAuthenticated ? (
  <>
    {isTrainer ? (
      <Link to="/trainer">Trainer Hub</Link>
    ) : (
      <Link to="/portal">My Portal</Link>
    )}
  </>
) : (
  <button onClick={actions.login}>Client Portal</button>
)}
```

### Role Assignment
Roles are stored in the `memberroles` collection:
```typescript
interface MemberRoles {
  _id: string;
  memberId: string;        // Wix member ID
  role: 'client' | 'trainer' | 'admin';
  assignmentDate: Date;
  status: 'active' | 'inactive';
}
```

---

## Wix Members Integration

### Login Flow (Correct Implementation)
```typescript
// CORRECT: Use actions.login() from useMember()
const { actions } = useMember();

<button onClick={actions.login}>
  Sign In
</button>
```

### Logout Flow (Correct Implementation)
```typescript
// CORRECT: Use actions.logout() from useMember()
const { actions } = useMember();

<button onClick={actions.logout}>
  Sign Out
</button>
```

### What NOT to Do
```typescript
// ❌ WRONG: Don't manually redirect to Wix login
window.location.href = 'https://www.wix.com/auth/login';

// ❌ WRONG: Don't redirect to home on login
navigate('/');

// ❌ WRONG: Don't use Link to navigate to protected routes
<Link to="/portal">Portal</Link>  // Without checking auth first

// ❌ WRONG: Don't manually check Wix authentication
const user = await wixUsers.currentUser.getRoles();
```

---

## Testing Checklist

### Authentication Flow
- [ ] Unauthenticated user clicks "Client Portal" button
- [ ] Wix login page opens (not a redirect to home)
- [ ] User enters credentials
- [ ] After login, user is redirected to `/portal`
- [ ] Portal content loads successfully
- [ ] User can navigate between portal pages

### Logout Flow
- [ ] Authenticated user clicks "Sign Out"
- [ ] User is logged out from Wix
- [ ] User is redirected to home page
- [ ] "Client Portal" button appears again
- [ ] Protected routes are no longer accessible

### Role-Based Access
- [ ] Client users see "My Portal" in header
- [ ] Trainer users see "Trainer Hub" in header
- [ ] Admin users see admin dashboard
- [ ] Users cannot access portals they don't have access to

### Protected Routes
- [ ] Unauthenticated users cannot access `/portal`
- [ ] Unauthenticated users cannot access `/trainer`
- [ ] Unauthenticated users cannot access `/admin`
- [ ] Authenticated users can access their assigned portal
- [ ] Loading spinner shows while checking authentication

### Live Site Verification
- [ ] Login page is published in Live
- [ ] Client Portal is published in Live
- [ ] Trainer Dashboard is published in Live
- [ ] Users are logging into the Live site (not preview)
- [ ] All protected routes work in Live environment

---

## Deployment Checklist

### Before Going Live
1. **Publish Pages**
   - [ ] Publish home page
   - [ ] Publish all public pages
   - [ ] Publish login page (if separate)
   - [ ] Publish Client Portal
   - [ ] Publish Trainer Dashboard
   - [ ] Publish Admin Dashboard

2. **Verify Wix Settings**
   - [ ] Members app is enabled
   - [ ] Login/logout flows are configured
   - [ ] Member roles are set up
   - [ ] Redirect URLs are correct

3. **Test in Live**
   - [ ] Create test member account
   - [ ] Test login flow in Live
   - [ ] Test logout flow in Live
   - [ ] Test role-based access in Live
   - [ ] Test all protected routes in Live

4. **Monitor**
   - [ ] Check browser console for errors
   - [ ] Check Wix logs for authentication issues
   - [ ] Monitor member feedback
   - [ ] Track login success rates

---

## Common Issues & Solutions

### Issue: "Login button navigates to /portal instead of opening login"
**Solution:** Ensure button uses `onClick={actions.login}` not `<Link to="/portal">`

### Issue: "User is logged in but can't access portal"
**Solution:** Check that:
1. User has a role assigned in `memberroles` collection
2. `useRole()` hook is correctly checking roles
3. `MemberProtectedRoute` is wrapping the portal route

### Issue: "Login page shows but login doesn't work"
**Solution:** Verify:
1. Wix Members app is enabled
2. Login credentials are correct
3. Member account exists in Wix
4. No browser console errors

### Issue: "User is redirected to home after login instead of portal"
**Solution:** Check that:
1. `actions.login()` is being called (not manual redirect)
2. Wix is configured to redirect back to `/portal`
3. No middleware is interfering with redirect

### Issue: "Protected routes are accessible without login"
**Solution:** Ensure:
1. Routes are wrapped with `<MemberProtectedRoute>`
2. `isAuthenticated` is being checked correctly
3. `isLoading` state is handled properly

---

## Files Modified

1. **`/src/components/layout/Header.tsx`**
   - Changed "Client Portal" button from Link to button
   - Now calls `actions.login()` instead of navigating to `/portal`
   - Applied to both desktop and mobile navigation

---

## Next Steps

1. **Test the authentication flow** in preview and live
2. **Verify all protected routes** are properly wrapped
3. **Check role-based access** for different user types
4. **Monitor login success rates** after deployment
5. **Gather user feedback** on authentication experience

---

## References

- Wix Members SDK: https://www.wix.com/velo/reference/wix-members
- React Router: https://reactrouter.com/
- MemberProvider Implementation: `/integrations/members/providers/MemberProvider.tsx`
- Router Configuration: `/src/components/Router.tsx`

---

**Last Updated:** January 2026
**Status:** ✅ Authentication flow fixed and ready for testing
