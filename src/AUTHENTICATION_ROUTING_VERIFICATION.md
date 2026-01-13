# Authentication & Routing Verification Guide

## Executive Summary

This guide provides a complete verification checklist for the authentication and routing system. It covers:
1. ✅ Current implementation status
2. ✅ What's working correctly
3. ⚠️ What needs verification in Live
4. 🔧 Configuration requirements in Wix
5. 📋 Testing checklist

---

## Current Implementation Status

### ✅ What's Already Implemented Correctly

#### 1. **MemberProvider & useMember Hook**
- ✅ MemberProvider wraps entire app in Router.tsx
- ✅ useMember() hook provides: `member`, `isAuthenticated`, `isLoading`, `actions`
- ✅ actions.login() triggers Wix Members login (NOT manual redirect)
- ✅ actions.logout() triggers Wix Members logout
- ✅ Authentication state is managed globally

**Location:** `/src/components/Router.tsx` (lines 332-334)
```tsx
<LanguageProvider>
  <MemberProvider>
    <RouterProvider router={router} />
  </MemberProvider>
</LanguageProvider>
```

#### 2. **MemberProtectedRoute Component**
- ✅ Wraps all protected routes
- ✅ Shows loading spinner while checking authentication
- ✅ Shows SignIn component if user is not authenticated
- ✅ Renders children if user is authenticated
- ✅ Properly handles isLoading and isAuthenticated states

**Location:** `/src/components/ui/member-protected-route.tsx`

**Usage in Router:**
```tsx
{
  path: "portal",
  element: (
    <MemberProtectedRoute>
      <ClientPortalLayout />
    </MemberProtectedRoute>
  ),
  children: [/* portal routes */]
}
```

#### 3. **SignIn Component**
- ✅ Uses `actions.login()` from useMember hook
- ✅ Displays user-friendly sign-in prompt
- ✅ Customizable title and message
- ✅ Proper styling with brand colors

**Location:** `/src/components/ui/sign-in.tsx`

#### 4. **Header Navigation**
- ✅ Shows "Client Portal" button for unauthenticated users
- ✅ Button calls `actions.login()` (NOT Link to /portal)
- ✅ Shows "My Portal" or "Trainer Hub" for authenticated users
- ✅ Shows "Sign Out" button for authenticated users
- ✅ Conditional rendering based on `isAuthenticated`
- ✅ Role-based routing (clients vs trainers)

**Location:** `/src/components/layout/Header.tsx` (lines 84-89, 171-177)

#### 5. **useRole Hook**
- ✅ Loads member role from database
- ✅ Implements retry logic for role creation
- ✅ Returns: `role`, `isTrainer`, `isClient`, `isAdmin`, `isLoading`
- ✅ Waits for role to load before rendering role-dependent content

**Location:** `/src/hooks/useRole.ts`

#### 6. **Protected Routes**
- ✅ `/portal/*` - Wrapped with MemberProtectedRoute
- ✅ `/trainer/*` - Wrapped with MemberProtectedRoute
- ✅ `/admin` - Wrapped with MemberProtectedRoute
- ✅ `/exercise-video-review` - Wrapped with MemberProtectedRoute

**Location:** `/src/components/Router.tsx` (lines 204-318)

---

## What Needs Verification in Live

### 🔍 Page Permissions in Wix

#### 1. **Login Page Permissions**
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Login page is published in Live (not just preview)
- [ ] Login page is accessible to "Everyone" (public)
- [ ] Login page URL is correct (should be Wix's built-in login or custom page)

**How to verify:**
1. Go to Wix Editor → Pages
2. Find the login page (usually "Sign In" or "Login")
3. Check page settings → Permissions
4. Should show: "Everyone" or "Public"
5. Verify it's published in Live

**Expected behavior:**
- Unauthenticated users can access the login page
- Login page displays Wix Members login form
- After login, users are redirected back to the referring page

#### 2. **Client Portal Permissions**
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Client Portal page is published in Live
- [ ] Client Portal is restricted to "Members only"
- [ ] Unauthenticated users cannot access /portal

**How to verify:**
1. Go to Wix Editor → Pages
2. Find the Client Portal page
3. Check page settings → Permissions
4. Should show: "Members only" or "Logged in members"
5. Verify it's published in Live

**Expected behavior:**
- Unauthenticated users trying to access /portal see SignIn component
- After login, users are redirected to /portal
- Authenticated users can access all portal sub-pages

#### 3. **Trainer Dashboard Permissions**
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Trainer Dashboard is published in Live
- [ ] Trainer Dashboard is restricted to "Members only"
- [ ] Only trainers can access /trainer

**How to verify:**
1. Go to Wix Editor → Pages
2. Find the Trainer Dashboard page
3. Check page settings → Permissions
4. Should show: "Members only"
5. Verify it's published in Live

**Expected behavior:**
- Unauthenticated users see SignIn component
- Non-trainer members see error or redirect
- Trainers can access trainer dashboard

#### 4. **Admin Dashboard Permissions**
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Admin Dashboard is published in Live
- [ ] Admin Dashboard is restricted to "Members only"
- [ ] Only admins can access /admin

**How to verify:**
1. Go to Wix Editor → Pages
2. Find the Admin Dashboard page
3. Check page settings → Permissions
4. Should show: "Members only"
5. Verify it's published in Live

**Expected behavior:**
- Unauthenticated users see SignIn component
- Non-admin members are redirected to home
- Admins can access admin dashboard

---

## Wix Configuration Requirements

### 1. **Members App Setup**
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Wix Members app is installed and enabled
- [ ] Login/logout flows are configured
- [ ] Member roles are set up in Wix
- [ ] Member data is accessible via API

**How to verify:**
1. Go to Wix Dashboard → Apps
2. Search for "Members"
3. Verify it's installed and active
4. Check Members app settings:
   - Login settings
   - Logout settings
   - Member roles
   - Privacy settings

#### 2. **Login Settings**
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Login method is configured (email/password or social)
- [ ] Login redirect URL is set correctly
- [ ] Logout redirect URL is set correctly

**How to verify:**
1. Go to Wix Dashboard → Members → Settings
2. Check "Login & Sign Up" section
3. Verify:
   - Login method is enabled
   - Redirect after login is set to current page (or home)
   - Redirect after logout is set to home

#### 3. **Member Roles**
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Member roles are created in Wix (client, trainer, admin)
- [ ] Roles can be assigned to members
- [ ] Roles are accessible via API

**How to verify:**
1. Go to Wix Dashboard → Members → Roles
2. Verify these roles exist:
   - Client
   - Trainer
   - Admin
3. Check that roles can be assigned to members

#### 4. **Member Data Accessibility**
**Status:** ⚠️ NEEDS VERIFICATION

**What to check:**
- [ ] Member data is accessible via Wix API
- [ ] Member ID is available in useMember hook
- [ ] Member email is available
- [ ] Member profile data is available

**How to verify:**
1. In browser console, check useMember() output:
   ```javascript
   // Should show:
   {
     member: {
       _id: "member-id",
       loginEmail: "user@example.com",
       profile: { nickname: "John", ... },
       ...
     },
     isAuthenticated: true,
     isLoading: false,
     actions: { login, logout, loadCurrentMember }
   }
   ```

---

## Authentication Flow Verification

### 1. **Login Flow**
**Status:** ⚠️ NEEDS TESTING IN LIVE

**Expected flow:**
```
User (Unauthenticated)
  ↓
Click "Client Portal" button in header
  ↓
actions.login() called
  ↓
Wix login page opens (modal or redirect)
  ↓
User enters credentials
  ↓
Wix authenticates user
  ↓
User is redirected back to /portal
  ↓
MemberProtectedRoute checks isAuthenticated
  ↓
Portal content renders
```

**Test steps:**
1. [ ] Open website in incognito/private window
2. [ ] Click "Client Portal" button
3. [ ] Verify Wix login page appears (NOT redirect to home)
4. [ ] Enter test credentials
5. [ ] Verify redirect back to /portal (NOT home)
6. [ ] Verify portal content loads
7. [ ] Verify user is logged in (header shows "Sign Out")

### 2. **Logout Flow**
**Status:** ⚠️ NEEDS TESTING IN LIVE

**Expected flow:**
```
User (Authenticated)
  ↓
Click "Sign Out" button
  ↓
actions.logout() called
  ↓
Wix logs out user
  ↓
User is redirected to home page
  ↓
Header shows "Client Portal" button again
  ↓
Trying to access /portal shows SignIn component
```

**Test steps:**
1. [ ] Login to portal
2. [ ] Click "Sign Out" button
3. [ ] Verify redirect to home page
4. [ ] Verify "Client Portal" button appears
5. [ ] Try to access /portal directly
6. [ ] Verify SignIn component appears (NOT portal content)

### 3. **Protected Route Access**
**Status:** ⚠️ NEEDS TESTING IN LIVE

**Test steps:**
1. [ ] Open incognito window
2. [ ] Try to access /portal directly
3. [ ] Verify SignIn component appears
4. [ ] Try to access /trainer directly
5. [ ] Verify SignIn component appears
6. [ ] Try to access /admin directly
7. [ ] Verify SignIn component appears

### 4. **Role-Based Routing**
**Status:** ⚠️ NEEDS TESTING IN LIVE

**Test steps:**
1. [ ] Login as client
2. [ ] Verify header shows "My Portal"
3. [ ] Verify /portal is accessible
4. [ ] Verify /trainer shows error or redirects
5. [ ] Logout and login as trainer
6. [ ] Verify header shows "Trainer Hub"
7. [ ] Verify /trainer is accessible
8. [ ] Verify /portal shows error or redirects

---

## Live Site Verification Checklist

### 📋 Pre-Launch Checklist

#### Pages Published
- [ ] Home page is published in Live
- [ ] About page is published in Live
- [ ] Blog page is published in Live
- [ ] Online Training page is published in Live
- [ ] Store/Packages page is published in Live
- [ ] **Login page is published in Live**
- [ ] **Client Portal is published in Live**
- [ ] **Trainer Dashboard is published in Live**
- [ ] Admin Dashboard is published in Live
- [ ] Privacy page is published in Live
- [ ] Terms page is published in Live
- [ ] Disclaimer page is published in Live
- [ ] Accessibility page is published in Live

#### Page Permissions
- [ ] Public pages are set to "Everyone"
- [ ] Login page is set to "Everyone"
- [ ] Client Portal is set to "Members only"
- [ ] Trainer Dashboard is set to "Members only"
- [ ] Admin Dashboard is set to "Members only"

#### Wix Configuration
- [ ] Members app is enabled in Live
- [ ] Login settings are configured
- [ ] Member roles are set up
- [ ] Redirect URLs are correct
- [ ] SSL certificate is valid
- [ ] Domain is configured correctly

#### Testing in Live
- [ ] Test login flow in Live (NOT preview)
- [ ] Test logout flow in Live
- [ ] Test protected route access in Live
- [ ] Test role-based routing in Live
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Check Wix logs for authentication issues

---

## Common Issues & Solutions

### Issue 1: "Login button navigates to /portal instead of opening login"
**Cause:** Button is using `<Link to="/portal">` instead of `onClick={actions.login}`

**Solution:** 
- Check Header.tsx lines 84-89 and 171-177
- Verify button uses `onClick={actions.login}`
- NOT `<Link to="/portal">`

**Status:** ✅ FIXED in Header.tsx

### Issue 2: "User is logged in but can't access portal"
**Cause:** User doesn't have a role assigned in memberroles collection

**Solution:**
1. Check memberroles collection in Wix
2. Verify user has a role entry
3. If missing, use Admin Dashboard to assign role
4. Or use RoleSetup page (/role-setup) to auto-assign

**Status:** ⚠️ NEEDS VERIFICATION

### Issue 3: "Login page shows but login doesn't work"
**Cause:** Wix Members app not configured or login page not published

**Solution:**
1. Verify Members app is enabled in Wix
2. Verify login page is published in Live
3. Check Wix logs for authentication errors
4. Verify login credentials are correct

**Status:** ⚠️ NEEDS VERIFICATION

### Issue 4: "User is redirected to home after login instead of portal"
**Cause:** Wix login redirect is set to home instead of current page

**Solution:**
1. Go to Wix Dashboard → Members → Settings
2. Check "Redirect after login" setting
3. Should be set to "Current page" or "/portal"
4. NOT "Home page"

**Status:** ⚠️ NEEDS VERIFICATION

### Issue 5: "Protected routes are accessible without login"
**Cause:** Routes not wrapped with MemberProtectedRoute

**Solution:**
1. Check Router.tsx
2. Verify all protected routes are wrapped with MemberProtectedRoute
3. Verify MemberProtectedRoute is checking isAuthenticated correctly

**Status:** ✅ IMPLEMENTED in Router.tsx

### Issue 6: "Role-based routing not working"
**Cause:** useRole hook not loading role correctly

**Solution:**
1. Check browser console for role loading errors
2. Verify memberroles collection has user's role
3. Check useRole hook is being called
4. Verify role checks are working (isTrainer, isClient, isAdmin)

**Status:** ⚠️ NEEDS VERIFICATION

---

## Testing Checklist

### 🧪 Unit Tests
- [ ] useMember hook returns correct data
- [ ] useRole hook loads role correctly
- [ ] MemberProtectedRoute shows loading state
- [ ] MemberProtectedRoute shows SignIn when not authenticated
- [ ] MemberProtectedRoute renders children when authenticated
- [ ] Header shows correct navigation based on authentication
- [ ] Header shows correct navigation based on role

### 🧪 Integration Tests
- [ ] Login flow works end-to-end
- [ ] Logout flow works end-to-end
- [ ] Protected routes redirect to SignIn when not authenticated
- [ ] Protected routes render when authenticated
- [ ] Role-based routing works correctly
- [ ] User data persists across page refreshes

### 🧪 Manual Tests in Live
- [ ] Test login in incognito window
- [ ] Test logout
- [ ] Test protected route access
- [ ] Test role-based routing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS, Android)
- [ ] Test with slow internet
- [ ] Test with JavaScript disabled (should show error)

---

## Deployment Checklist

### Before Going Live
1. [ ] All pages are published in Live
2. [ ] Page permissions are set correctly
3. [ ] Wix Members app is configured
4. [ ] Login/logout flows are working
5. [ ] Member roles are set up
6. [ ] Test member accounts are created
7. [ ] All authentication tests pass
8. [ ] All routing tests pass
9. [ ] No console errors in Live
10. [ ] No Wix logs showing errors

### After Going Live
1. [ ] Monitor login success rates
2. [ ] Monitor for authentication errors
3. [ ] Check Wix logs regularly
4. [ ] Gather user feedback
5. [ ] Fix any reported issues
6. [ ] Update documentation as needed

---

## Files to Review

### Core Authentication Files
- `/src/components/Router.tsx` - Route configuration
- `/src/components/layout/Header.tsx` - Navigation and login button
- `/src/components/ui/member-protected-route.tsx` - Protected route wrapper
- `/src/components/ui/sign-in.tsx` - Sign-in component
- `/src/hooks/useRole.ts` - Role loading hook

### Integration Files
- `/integrations/members/providers/MemberProvider.tsx` - Member context provider
- `/integrations/members/service.ts` - Member service
- `/src/lib/role-utils.ts` - Role utility functions

### Configuration Files
- `/src/components/pages/RoleSetup.tsx` - Role assignment page
- `/src/components/pages/AdminDashboard.tsx` - Admin role management

---

## Next Steps

1. **Verify Wix Configuration**
   - [ ] Check Members app is enabled
   - [ ] Check login/logout settings
   - [ ] Check member roles are set up
   - [ ] Check page permissions

2. **Test in Live**
   - [ ] Test login flow
   - [ ] Test logout flow
   - [ ] Test protected routes
   - [ ] Test role-based routing

3. **Monitor After Launch**
   - [ ] Check for authentication errors
   - [ ] Monitor login success rates
   - [ ] Gather user feedback
   - [ ] Fix any issues

4. **Update Documentation**
   - [ ] Document any custom configurations
   - [ ] Document troubleshooting steps
   - [ ] Document user support procedures

---

## Support & Troubleshooting

### Browser Console Errors
If you see errors in the browser console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors related to:
   - Authentication
   - Member loading
   - Role loading
4. Check Wix logs for corresponding errors

### Wix Logs
To check Wix logs:
1. Go to Wix Dashboard → Logs
2. Filter by "Members" or "Authentication"
3. Look for errors or warnings
4. Check timestamps against user reports

### Contact Support
If you encounter issues:
1. Check this guide for solutions
2. Review browser console errors
3. Check Wix logs
4. Contact Wix support if needed
5. Document the issue for future reference

---

**Last Updated:** January 2026
**Status:** ✅ Implementation complete, ⚠️ Verification needed in Live
**Next Review:** After Live launch
