# Client Portal Access Debug Guide

## Changes Implemented

### 1. **Enhanced Role Utilities** (`/src/lib/role-utils.ts`)

#### `getMemberRole(memberId)` - Improved with Logging
- Now explicitly filters by `memberId` field in the `memberroles` collection
- Added detailed console logging at each step
- Verifies that the `role` field contains values: `'client' | 'trainer' | 'admin'` (lowercase)
- Returns `MemberRole | null`

**Key Query:**
```typescript
const memberRole = items.find(
  (mr) => mr.memberId === memberId && mr.status === 'active'
);
```

#### `getMemberRoleDebugInfo(memberId)` - NEW
- Returns structured debug information about role lookup
- Includes: `memberId`, `roleRecordFound`, `roleValue`, `error`, `timestamp`
- Used by the debug panel to display real-time status

#### `setDefaultRole(memberId, maxRetries = 3)` - Atomic Upsert with Retry
- **Atomic Upsert Logic:**
  - Query `memberroles` collection for existing record with matching `memberId`
  - If found: return existing role
  - If not found: create new record with `{ memberId, role: 'client', assignmentDate, status: 'active' }`
  
- **Retry Logic (3 attempts):**
  - Exponential backoff: 100ms, 200ms, 400ms
  - Verifies creation by refetching after each attempt
  - Throws error only after all retries exhausted
  - Detailed logging at each step

---

### 2. **Enhanced useRole Hook** (`/src/hooks/useRole.ts`)

#### New State Variables:
- `setupError`: Captures and displays setup failures
- `debugInfo`: Contains role lookup debug information
- `isLoading`: Now starts as `true` (was `false`)

#### New Behavior:
- **No Redirect on Missing Role:** Instead of redirecting, shows "Setting up your account…"
- **Automatic Role Creation:** Calls `setDefaultRole()` with retry logic
- **Error Handling:** Shows error UI with retry button instead of silent redirect
- **Debug Info Tracking:** Captures debug info before and after role creation

#### Flow:
1. Check if role exists via `getMemberRole()`
2. If no role found:
   - Attempt to create with `setDefaultRole()` (3 retries)
   - If successful: continue to role checks
   - If failed: show error UI with retry button
3. Perform role checks (`isTrainer`, `isClient`, `isAdmin`)
4. Update debug info with final state

---

### 3. **Debug Panel Component** (`/src/components/DebugPanel.tsx`)

#### Features:
- **Collapsible Panel:** Bottom-right corner, always visible
- **Real-time Display:**
  - Member ID
  - Member Email
  - Role Record Found (boolean)
  - Role Value (client/trainer/admin/null)
  - Is Loading (boolean)
  - Setup Error (if any)
  - Redirect Reason (if redirecting)
  - Debug Timestamp

- **Copy to Clipboard:** Click any field to copy its value
- **Status Indicator:** Color-coded status (green=ready, red=error, yellow=loading, orange=no role)
- **Raw Debug Info:** Full JSON dump of debug object

#### How to Use:
1. Open browser DevTools Console
2. Look for debug panel in bottom-right corner
3. Click to expand and see all debug values
4. Copy values to share with support

---

### 4. **Updated ClientPortalLayout** (`/src/components/pages/ClientPortal/ClientPortalLayout.tsx`)

#### New Behavior:
- **Setup Error State:** Shows error UI with retry button
  - Displays error message
  - Allows user to retry setup
  - Shows attempt counter
  - Provides support contact info
  
- **Loading State:** Shows "Setting up your account…" instead of silent loading
  - Displays spinner
  - Shows helpful message
  - Debug panel visible during loading

- **Debug Panel:** Always rendered on portal pages
  - Shows current state at all times
  - Helps diagnose issues before redirect

---

## What to Verify on Published Site

### Step 1: Test New User Login
1. Log in as `brad.thomas@siemens.com` (or create test account)
2. Navigate to `/portal`
3. **Expected Behavior:**
   - Should see "Setting up your account…" briefly
   - Debug panel should show:
     - `Member ID`: Should be populated
     - `Member Email`: Should be populated
     - `Role Record Found`: Should change from `false` to `true`
     - `Role Value`: Should change from `null` to `'client'`
     - `Is Loading`: Should change from `true` to `false`
   - Should then load portal dashboard

### Step 2: Check memberroles Collection
1. Go to Wix Admin → Collections → memberroles
2. **Verify:**
   - New record exists for the test user's ID
   - `memberId` field matches the user's ID
   - `role` field = `'client'` (lowercase)
   - `status` field = `'active'`
   - `assignmentDate` is recent

### Step 3: Check Collection Permissions
1. Go to Wix Admin → Collections → memberroles → Settings
2. **Verify Permissions:**
   - **Read:** "Anyone" or "Site members" (must allow reading own records)
   - **Create:** "Anyone" or "Site members" (must allow creation)
   - **Update:** "Anyone" or "Site members"
   - **Delete:** "Admin only" (recommended)

### Step 4: Monitor Console Logs
1. Open browser DevTools → Console
2. Look for logs starting with `[getMemberRole]`, `[setDefaultRole]`, `[useRole]`
3. **Expected Log Sequence:**
   ```
   [useRole] Starting role load for memberId: <ID>
   [getMemberRole] Fetching role for memberId: <ID>
   [getMemberRole] No role record found for memberId: <ID>
   [useRole] No role found for <ID>, attempting to create default role
   [setDefaultRole] Attempt 1/3 for memberId: <ID>
   [setDefaultRole] Creating new client role for <ID>
   [setDefaultRole] Successfully created role for <ID>
   [setDefaultRole] Verified role creation for <ID>
   [useRole] Successfully created default role: client
   [useRole] Role loaded: client
   [useRole] Role checks - trainer: false, client: true, admin: false
   ```

### Step 5: Test Error Scenarios
1. **Simulate Collection Permission Error:**
   - Temporarily restrict memberroles collection to "Admin only"
   - Try logging in
   - Should see error: "Failed to set up your account: ..."
   - Debug panel should show error
   - Click "Retry Setup" button
   - Restore permissions and retry

2. **Simulate Network Error:**
   - Open DevTools → Network → Throttle to "Offline"
   - Try logging in
   - Should see error after retries
   - Go back online and retry

---

## Debug Panel Information Reference

### Member ID
- **What it is:** Unique identifier for the logged-in user
- **Expected value:** UUID string (e.g., `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`)
- **If missing:** User is not authenticated

### Member Email
- **What it is:** Email address of logged-in user
- **Expected value:** Email string (e.g., `"brad.thomas@siemens.com"`)
- **If missing:** User profile data not loaded

### Role Record Found
- **What it is:** Whether a record exists in `memberroles` collection for this user
- **Expected value:** `true` (after setup completes)
- **If false:** Role creation failed or collection permissions issue

### Role Value
- **What it is:** The role assigned to this user
- **Expected value:** `'client'`, `'trainer'`, or `'admin'` (lowercase)
- **If null:** No role record found or role field is empty

### Is Loading
- **What it is:** Whether role setup is in progress
- **Expected value:** `false` (after setup completes)
- **If true:** Still loading or retrying

### Setup Error
- **What it is:** Error message if role setup failed
- **Expected value:** `"None"` (no error)
- **If error:** Shows what went wrong (e.g., permission denied, network error)

### Redirect Reason
- **What it is:** Why user is being redirected away from portal
- **Expected value:** `"None"` (no redirect)
- **If redirecting:** Shows reason (e.g., "User is not a client")

---

## Common Issues and Solutions

### Issue: "Role Record Found: false" after retry
**Possible Causes:**
1. Collection permissions don't allow creation
2. Network timeout during creation
3. Database write not committed

**Solutions:**
1. Check memberroles collection permissions (must allow "Create")
2. Check browser console for network errors
3. Increase retry delay in `setDefaultRole()` function
4. Check Wix server logs for database errors

### Issue: "Role Value: null" but "Role Record Found: true"
**Possible Causes:**
1. `role` field is empty in the database record
2. `role` field has incorrect value (e.g., uppercase `'Client'`)
3. `status` field is not `'active'`

**Solutions:**
1. Check the actual record in memberroles collection
2. Verify field values are lowercase
3. Verify status is exactly `'active'`

### Issue: Stuck on "Setting up your account…"
**Possible Causes:**
1. `isLoading` never becomes `false`
2. Role creation succeeds but role checks fail
3. Infinite retry loop

**Solutions:**
1. Check console logs for errors
2. Verify role checks are working (should see role check logs)
3. Check if `setDefaultRole()` is throwing uncaught error

### Issue: "Setup Error: Failed to set up your account"
**Possible Causes:**
1. Collection permissions issue
2. Network error
3. Database error

**Solutions:**
1. Check memberroles collection permissions
2. Check browser network tab for failed requests
3. Check Wix server logs
4. Try retry button

---

## Testing Checklist

- [ ] New user can log in and see portal
- [ ] Debug panel shows correct values
- [ ] memberroles collection has new record for user
- [ ] Console logs show expected sequence
- [ ] Retry button works when error occurs
- [ ] Existing users (with role record) still work
- [ ] Trainers and admins are not affected
- [ ] Mobile view shows debug panel correctly
- [ ] Debug panel doesn't interfere with portal functionality

---

## Next Steps After Verification

1. **If everything works:**
   - Remove or hide debug panel in production
   - Monitor console logs for any issues
   - Document the fix in release notes

2. **If issues persist:**
   - Collect debug panel values from failing user
   - Check console logs for error details
   - Review memberroles collection permissions
   - Check Wix server logs for database errors
   - Consider adjusting retry logic or delays

3. **For support:**
   - Ask users to share debug panel values
   - Ask users to share console logs
   - Ask users to share memberroles collection record (if visible)
   - Provide support contact: hello@motivasi.co.uk
