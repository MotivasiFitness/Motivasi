# Security Code Review Checklist
## Access Control & Data Isolation

Use this checklist when reviewing code changes that involve data access, especially for client-scoped collections.

---

## 1. Data Access Patterns

### ✅ Client-Scoped Collections

When working with these collections, **ALWAYS** use access-controlled methods:

- `clientassignedworkouts` → Use `getClientWorkouts()` or `getAuthorizedClientWorkouts()`
- `clientprofiles` → Filter by `memberId` after fetch
- `weeklycheckins` → Filter by `clientId` after fetch
- `weeklysummaries` → Filter by `clientId` after fetch
- `programassignments` → Filter by `clientId` or `trainerId` after fetch

### ❌ Prohibited Patterns

```typescript
// ❌ NEVER DO THIS - Exposes all client data
const { items } = await BaseCrudService.getAll('clientassignedworkouts');
return items; // SECURITY VIOLATION

// ❌ NEVER DO THIS - Client-side filtering is not secure
const { items } = await BaseCrudService.getAll('clientassignedworkouts');
return items.filter(w => w.clientId === someClientId); // INSECURE
```

### ✅ Secure Patterns

```typescript
// ✅ CORRECT - Uses access-controlled method
import { getClientWorkouts } from '@/lib/client-workout-access-control';

const workouts = await getClientWorkouts(
  clientId,
  requestingMemberId,
  requestingRole
);

// ✅ CORRECT - Server-side filtering enforced
const { items } = await BaseCrudService.getAll('clientassignedworkouts');
const filtered = items.filter(w => w.clientId === authenticatedMemberId);
// Only if authenticatedMemberId is from auth context, not user input
```

---

## 2. Authentication & Authorization

### Member Context

- [ ] `memberId` is extracted from authenticated member context (`useMember` hook)
- [ ] `memberId` is NOT extracted from URL parameters or query strings
- [ ] `memberId` is NOT user-provided input
- [ ] Role is determined from authenticated member context

### Access Control

- [ ] Client role can ONLY access their own data (`clientId === memberId`)
- [ ] Trainer role can ONLY access managed clients' data (verified via `trainerclientassignments`)
- [ ] Admin role is properly gated (not exposed in client/trainer contexts)
- [ ] Unauthorized access attempts throw errors (not return empty arrays silently)

### Example Check

```typescript
// ✅ SECURE - memberId from auth context
const { member } = useMember();
const workouts = await getClientWorkouts(member._id, member._id, 'client');

// ❌ INSECURE - clientId from URL parameter
const { clientId } = useParams();
const workouts = await getClientWorkouts(clientId, member._id, 'client');
```

---

## 3. Query Parameters & User Input

### URL Parameters

- [ ] No `clientId` extracted from URL parameters in client portal
- [ ] No `trainerId` extracted from URL parameters in client portal
- [ ] Route parameters are validated against authenticated member context
- [ ] Dynamic routes use IDs that are validated server-side

### Search Parameters

- [ ] No `useSearchParams` or `URLSearchParams` used to extract sensitive IDs
- [ ] Filter parameters (status, weekNumber) are applied AFTER access control
- [ ] Pagination occurs AFTER access control filtering

### Example Check

```typescript
// ❌ INSECURE - clientId from URL can be manipulated
const searchParams = new URLSearchParams(window.location.search);
const clientId = searchParams.get('clientId');

// ✅ SECURE - clientId from auth context
const { member } = useMember();
const clientId = member._id;
```

---

## 4. Server-Side Filtering

### Filtering Order

- [ ] Access control filtering happens FIRST (clientId/trainerId match)
- [ ] Business logic filtering happens SECOND (status, weekNumber, etc.)
- [ ] Pagination happens LAST (after all filtering)

### Verification

```typescript
// ✅ CORRECT ORDER
const allWorkouts = await BaseCrudService.getAll('clientassignedworkouts');
const clientWorkouts = allWorkouts.items.filter(w => w.clientId === memberId); // 1. Access control
const activeWorkouts = clientWorkouts.filter(w => w.status === 'active');      // 2. Business logic
const paginatedWorkouts = activeWorkouts.slice(0, 10);                         // 3. Pagination

// ❌ WRONG ORDER - Pagination before access control
const allWorkouts = await BaseCrudService.getAll('clientassignedworkouts');
const paginatedWorkouts = allWorkouts.items.slice(0, 10);                      // WRONG
const clientWorkouts = paginatedWorkouts.filter(w => w.clientId === memberId); // TOO LATE
```

---

## 5. Error Handling

### Unauthorized Access

- [ ] Unauthorized access attempts throw explicit errors
- [ ] Error messages do not leak sensitive information
- [ ] Errors are caught and handled appropriately in UI
- [ ] No silent failures (returning empty arrays without logging)

### Example Check

```typescript
// ✅ SECURE - Explicit error on unauthorized access
if (requestingRole === 'client' && clientId !== requestingMemberId) {
  throw new Error('Unauthorized: Clients can only access their own workouts');
}

// ❌ INSECURE - Silent failure
if (requestingRole === 'client' && clientId !== requestingMemberId) {
  return []; // No indication of security violation
}
```

---

## 6. Test Coverage

### Security Tests

- [ ] Test that clients can access ONLY their own data
- [ ] Test that clients are REJECTED when accessing other clients' data
- [ ] Test that trainers can access ONLY managed clients' data
- [ ] Test that trainers are REJECTED when accessing unmanaged clients' data
- [ ] Test that filtering happens AFTER access control
- [ ] Test edge cases (empty data, missing fields, inactive assignments)

### Negative Tests

- [ ] Test Client A attempting to access Client B data (should fail)
- [ ] Test Trainer X attempting to access unmanaged client data (should fail)
- [ ] Test query parameter manipulation (should be ignored)
- [ ] Test role escalation attempts (should fail)

---

## 7. Code Review Questions

### For Data Fetching Code

1. **Where does the `clientId` come from?**
   - ✅ Authenticated member context
   - ❌ URL parameter, query string, or user input

2. **Is access control enforced?**
   - ✅ Uses access-controlled method
   - ✅ Filters by authenticated member ID
   - ❌ Returns all data without filtering

3. **Can the user manipulate the request?**
   - ✅ No - all IDs from auth context
   - ❌ Yes - IDs from URL or user input

4. **What happens on unauthorized access?**
   - ✅ Explicit error thrown
   - ❌ Silent failure or empty array

5. **Is there test coverage?**
   - ✅ Security tests exist
   - ❌ No security tests

### For Access Control Changes

1. **Does this change affect data isolation?**
   - If yes, require security review

2. **Are there new data access patterns?**
   - If yes, verify access control is enforced

3. **Are there new query parameters?**
   - If yes, verify they cannot override access control

4. **Are there new roles or permissions?**
   - If yes, verify proper gating and authorization

---

## 8. Common Vulnerabilities to Check

### IDOR (Insecure Direct Object Reference)

- [ ] No direct object access via URL parameters
- [ ] All object access validated against authenticated member
- [ ] No predictable ID patterns exposed

### Broken Access Control

- [ ] No horizontal privilege escalation (Client A → Client B)
- [ ] No vertical privilege escalation (Client → Trainer → Admin)
- [ ] No role bypass mechanisms

### Information Disclosure

- [ ] Error messages do not leak sensitive data
- [ ] Network responses do not include unauthorized data
- [ ] Logs do not expose sensitive information

---

## 9. Pre-Commit Checklist

Before committing code that touches data access:

- [ ] Run security tests: `npm test workout-access-control.security.test.ts`
- [ ] Search for insecure patterns: `rg "BaseCrudService\.getAll\('client" src/`
- [ ] Verify no `clientId` from URL parameters: `rg "useParams.*clientId|searchParams.*clientId" src/`
- [ ] Review access control logic for new collections
- [ ] Update security tests if new access patterns added

---

## 10. Approval Requirements

### Changes Requiring Security Review

- Any changes to `client-workout-access-control.ts`
- New data access patterns for client-scoped collections
- Changes to authentication or authorization logic
- New API endpoints that return client data
- Changes to role-based access control

### Approval Criteria

- [ ] Security checklist completed
- [ ] Security tests pass
- [ ] No insecure patterns detected
- [ ] Code review by security-aware developer
- [ ] Documentation updated if patterns change

---

## Quick Reference

### Secure Data Access Functions

```typescript
// Client Workouts
import { 
  getClientWorkouts,
  getAuthorizedClientWorkouts,
  getAuthorizedWorkout,
  updateAuthorizedWorkout 
} from '@/lib/client-workout-access-control';

// Usage
const workouts = await getClientWorkouts(
  clientId,           // Target client
  requestingMemberId, // Authenticated member
  requestingRole      // 'client' or 'trainer'
);
```

### Security Test Template

```typescript
it('should reject unauthorized access', async () => {
  await expect(
    getClientWorkouts(
      'other-client-id',
      'requesting-client-id',
      'client'
    )
  ).rejects.toThrow('Unauthorized');
});
```

### ESLint Security Rules

Add to `.eslintrc.json`:
```json
{
  "extends": ["./.eslintrc.security.json"]
}
```

---

**Last Updated:** 2026-01-17  
**Version:** 1.0  
**Maintainer:** Security Team
