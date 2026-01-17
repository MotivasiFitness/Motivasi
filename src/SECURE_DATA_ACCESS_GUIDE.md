# Secure Data Access Guide

## Overview

The **Secure Data Access** wrapper is a lightweight security layer that prevents unauthorized access to sensitive collections. It enforces server-side scoping by default and makes it impossible to accidentally fetch unscoped data from protected collections.

## Why Use Secure Data Access?

### Security Benefits

1. **Prevents Data Leaks**: Clients can only access their own data
2. **Enforces Role-Based Access**: Trainers can only access their assigned clients' data
3. **Defense in Depth**: Multiple layers of validation prevent security regressions
4. **Impossible to Bypass**: Unscoped `getAll()` calls are not allowed for protected collections

### Common Vulnerabilities Prevented

❌ **Without Secure Data Access:**
```typescript
// DANGEROUS: Fetches ALL workouts for ALL clients
const workouts = await BaseCrudService.getAll('clientassignedworkouts');
// Client A can see Client B's workouts!
```

✅ **With Secure Data Access:**
```typescript
// SAFE: Only fetches workouts for the authenticated user
const workouts = await SecureDataAccess.getScoped(
  'clientassignedworkouts',
  { memberId: member._id, role: 'client' }
);
// Client A can ONLY see their own workouts
```

## Protected Collections

The following collections require secure access:

- `clientassignedworkouts` - Client workout assignments
- `programassignments` - Program assignments to clients
- `clientprofiles` - Client profile information
- `trainerclientassignments` - Trainer-client relationships
- `trainerclientnotes` - Trainer notes about clients
- `weeklycheckins` - Client weekly check-ins
- `weeklysummaries` - Weekly workout summaries
- `weeklycoachesnotes` - Coach notes for clients
- `trainernotifications` - Trainer notifications

## Usage Examples

### 1. Client Accessing Their Own Data

```typescript
import { SecureDataAccess, getAuthContext } from '@/lib/secure-data-access';
import { useMember } from '@/integrations';

function MyWorkoutsPage() {
  const { member } = useMember();
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    async function loadWorkouts() {
      // Get auth context from member
      const authContext = await getAuthContext(member);
      if (!authContext) return;

      // Fetch scoped workouts
      const result = await SecureDataAccess.getScoped(
        'clientassignedworkouts',
        authContext,
        { limit: 50 }
      );

      setWorkouts(result.items);
    }

    loadWorkouts();
  }, [member]);

  return <div>{/* Render workouts */}</div>;
}
```

### 2. Trainer Accessing Assigned Clients' Data

```typescript
import { SecureDataAccess, getAuthContext } from '@/lib/secure-data-access';

async function loadClientWorkouts(member, clientId) {
  const authContext = await getAuthContext(member);
  if (!authContext || authContext.role !== 'trainer') {
    throw new Error('Unauthorized: Must be a trainer');
  }

  // Fetch workouts for a specific client
  // Automatically verifies trainer has access to this client
  const result = await SecureDataAccess.getForClient(
    'clientassignedworkouts',
    clientId,
    authContext
  );

  return result.items;
}
```

### 3. Getting a Single Item with Validation

```typescript
import { SecureDataAccess, getAuthContext } from '@/lib/secure-data-access';

async function loadWorkoutDetails(member, workoutId) {
  const authContext = await getAuthContext(member);
  if (!authContext) {
    throw new Error('Not authenticated');
  }

  // Fetch single workout with access validation
  // Throws error if user doesn't have access
  const workout = await SecureDataAccess.getByIdScoped(
    'clientassignedworkouts',
    workoutId,
    authContext,
    { singleRef: ['clientId'], multiRef: [] }
  );

  return workout;
}
```

### 4. Admin Access (Use with Caution)

```typescript
// Admin routes can access all data, but should still scope when possible
async function loadAllClientData(member) {
  const authContext = await getAuthContext(member);
  
  if (authContext?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  // SECURITY: Admin access - fetching all client profiles for dashboard
  const result = await SecureDataAccess.getScoped(
    'clientprofiles',
    authContext
  );

  return result.items;
}
```

## API Reference

### `SecureDataAccess.getScoped<T>(collectionId, authContext, options?)`

Get items scoped to the authenticated user's context.

**Parameters:**
- `collectionId`: Protected collection ID
- `authContext`: `{ memberId: string, role: 'client' | 'trainer' | 'admin' }`
- `options`: Query options (refs, pagination)

**Returns:** `SecureQueryResult<T>`

**Throws:** Error if collection is not protected or auth context is invalid

---

### `SecureDataAccess.getByIdScoped<T>(collectionId, itemId, authContext, options?)`

Get a single item by ID with scope validation.

**Parameters:**
- `collectionId`: Protected collection ID
- `itemId`: Item ID to retrieve
- `authContext`: Authentication context
- `options`: Query options (refs only)

**Returns:** `T | null`

**Throws:** Error if user is not authorized to access the item

---

### `SecureDataAccess.getForClient<T>(collectionId, clientId, authContext, options?)`

Get items for a specific client (trainer or admin only).

**Parameters:**
- `collectionId`: Protected collection ID
- `clientId`: Client ID to query for
- `authContext`: Authentication context (must be trainer or admin)
- `options`: Query options

**Returns:** `SecureQueryResult<T>`

**Throws:** Error if user is not authorized or doesn't have access to the client

---

### `SecureDataAccess.getForTrainer<T>(collectionId, trainerId, authContext, options?)`

Get items for a specific trainer (admin only).

**Parameters:**
- `collectionId`: Protected collection ID
- `trainerId`: Trainer ID to query for
- `authContext`: Authentication context (must be admin)
- `options`: Query options

**Returns:** `SecureQueryResult<T>`

**Throws:** Error if user is not admin

---

### `getAuthContext(member): Promise<AuthContext | null>`

Helper function to get auth context from member data.

**Parameters:**
- `member`: Member object from `useMember()` hook

**Returns:** `AuthContext | null`

---

### `isValidAuthContext(context): boolean`

Type guard for auth context validation.

**Parameters:**
- `context`: Any value to check

**Returns:** `true` if valid AuthContext

## ESLint Rule

The `enforce-secure-data-access` ESLint rule automatically detects direct `BaseCrudService` calls on protected collections and suggests using `SecureDataAccess` instead.

### Rule Configuration

Add to your ESLint config:

```javascript
{
  rules: {
    'enforce-secure-data-access': 'error'
  }
}
```

### Auto-Fix

The rule includes auto-fix capability:

```bash
# Fix automatically
npm run lint -- --fix
```

### Admin Route Exception

In admin routes, direct `BaseCrudService` access is allowed with proper documentation:

```typescript
// SECURITY: Admin access - loading all client data for admin dashboard
const clients = await BaseCrudService.getAll('clientprofiles');
```

## Migration Guide

### Step 1: Identify Protected Collection Usage

Search your codebase for direct `BaseCrudService` calls on protected collections:

```bash
grep -r "BaseCrudService.getAll('clientassignedworkouts'" src/
grep -r "BaseCrudService.getAll('programassignments'" src/
```

### Step 2: Update Imports

```typescript
// Before
import { BaseCrudService } from '@/integrations';

// After
import { SecureDataAccess, getAuthContext } from '@/lib/secure-data-access';
import { useMember } from '@/integrations';
```

### Step 3: Get Auth Context

```typescript
// Add at the top of your component/function
const { member } = useMember();
const authContext = await getAuthContext(member);

if (!authContext) {
  // Handle unauthenticated state
  return;
}
```

### Step 4: Replace BaseCrudService Calls

```typescript
// Before
const workouts = await BaseCrudService.getAll('clientassignedworkouts');

// After
const result = await SecureDataAccess.getScoped(
  'clientassignedworkouts',
  authContext,
  { limit: 50 }
);
const workouts = result.items;
```

### Step 5: Update getById Calls

```typescript
// Before
const workout = await BaseCrudService.getById('clientassignedworkouts', id);

// After
const workout = await SecureDataAccess.getByIdScoped(
  'clientassignedworkouts',
  id,
  authContext
);
```

## Best Practices

### 1. Always Use Auth Context

```typescript
// ✅ GOOD: Always get auth context first
const authContext = await getAuthContext(member);
if (!authContext) return;

const data = await SecureDataAccess.getScoped('clientassignedworkouts', authContext);
```

```typescript
// ❌ BAD: Never skip auth context
const data = await BaseCrudService.getAll('clientassignedworkouts');
```

### 2. Handle Errors Gracefully

```typescript
try {
  const workout = await SecureDataAccess.getByIdScoped(
    'clientassignedworkouts',
    workoutId,
    authContext
  );
} catch (error) {
  if (error.message.includes('Unauthorized')) {
    // Show "Access Denied" message to user
    toast.error('You do not have access to this workout');
  } else {
    // Handle other errors
    console.error('Error loading workout:', error);
  }
}
```

### 3. Use Specific Methods for Different Scenarios

```typescript
// Client accessing their own data
const myData = await SecureDataAccess.getScoped(collection, authContext);

// Trainer accessing a specific client's data
const clientData = await SecureDataAccess.getForClient(collection, clientId, authContext);

// Admin accessing a specific trainer's data
const trainerData = await SecureDataAccess.getForTrainer(collection, trainerId, authContext);
```

### 4. Document Admin Access

```typescript
// ✅ GOOD: Document why admin access is needed
// SECURITY: Admin access - generating system-wide analytics report
const allData = await SecureDataAccess.getScoped(collection, adminAuthContext);
```

### 5. Validate Role Before Role-Specific Operations

```typescript
// ✅ GOOD: Check role before trainer-specific operations
if (authContext.role !== 'trainer') {
  throw new Error('Unauthorized: Trainer access required');
}

const clientData = await SecureDataAccess.getForClient(
  'clientassignedworkouts',
  clientId,
  authContext
);
```

## Testing

### Unit Tests

```typescript
import { SecureDataAccess, getAuthContext } from '@/lib/secure-data-access';

describe('SecureDataAccess', () => {
  it('should only return client-scoped data for clients', async () => {
    const authContext = { memberId: 'client-123', role: 'client' };
    
    const result = await SecureDataAccess.getScoped(
      'clientassignedworkouts',
      authContext
    );

    // All items should belong to this client
    expect(result.items.every(item => item.clientId === 'client-123')).toBe(true);
  });

  it('should throw error when client tries to access another client\'s data', async () => {
    const authContext = { memberId: 'client-123', role: 'client' };
    
    await expect(
      SecureDataAccess.getByIdScoped(
        'clientassignedworkouts',
        'workout-belonging-to-client-456',
        authContext
      )
    ).rejects.toThrow('Unauthorized');
  });
});
```

## Troubleshooting

### Error: "Invalid authentication context"

**Cause:** Missing or invalid auth context

**Solution:** Ensure you're getting auth context properly:

```typescript
const authContext = await getAuthContext(member);
if (!authContext) {
  // Handle unauthenticated state
  return;
}
```

### Error: "Unauthorized: User does not have access"

**Cause:** User trying to access data they don't own

**Solution:** This is expected behavior. Show appropriate error message to user.

### Error: "Collection X is not a protected collection"

**Cause:** Trying to use SecureDataAccess on a non-protected collection

**Solution:** Use regular `BaseCrudService` for non-protected collections:

```typescript
// Non-protected collections can use BaseCrudService directly
const blogPosts = await BaseCrudService.getAll('blogposts');
```

## Future Enhancements

- [ ] Add support for more protected collections
- [ ] Implement field-level access control
- [ ] Add audit logging for sensitive operations
- [ ] Create React hooks for common patterns
- [ ] Add GraphQL resolver integration
- [ ] Implement rate limiting per user

## Support

For questions or issues:
1. Check this guide first
2. Review the inline documentation in `secure-data-access.ts`
3. Run ESLint to catch common mistakes
4. Contact the security team for sensitive issues

---

**Remember:** Security is everyone's responsibility. Always use `SecureDataAccess` for protected collections!
