# Client Names Display Implementation Guide

## Overview

This implementation adds a new `ClientProfiles` collection to store and display client names (firstName, lastName, displayName) instead of member IDs or email addresses across the Trainer Dashboard and client views.

## What Was Implemented

### 1. New Entity Type: ClientProfiles

**File:** `/src/entities/index.ts`

Added a new `ClientProfiles` interface with the following fields:
- `_id`: Unique identifier
- `memberId`: Reference to the client's member ID
- `firstName`: Client's first name
- `lastName`: Client's last name
- `displayName`: Full display name (computed or custom)
- `email`: Client's email address
- `profilePhoto`: Client's profile photo URL

### 2. Client Profile Service

**File:** `/src/lib/client-profile-service.ts`

Core service for managing client profile data with the following functions:

#### `getClientProfile(memberId: string)`
- Fetches a single client profile by member ID
- Implements in-memory caching for performance
- Returns `ClientProfiles | null`

#### `getClientProfiles(memberIds: string[])`
- Fetches multiple client profiles at once
- Returns a Map of memberId → ClientProfiles
- Optimized to avoid duplicate database queries

#### `getClientDisplayName(memberId: string, fallbackEmail?: string)`
- Gets the display name for a client
- Fallback chain: displayName → firstName + lastName → firstName → email → memberId
- Ensures a name is always returned

#### `getClientDisplayNames(memberIds: string[], fallbackEmails?: Map<string, string>)`
- Gets display names for multiple clients
- Returns a Map of memberId → display name
- Supports email fallback for each client

#### `upsertClientProfile(memberId: string, data: Partial<ClientProfiles>)`
- Creates or updates a client profile
- Automatically updates the cache
- Useful for updating profile information

#### Cache Management
- `clearClientProfileCache()`: Clear the in-memory cache
- `getClientProfileCacheSize()`: Get cache statistics

### 3. Client Profile Backfill Service

**File:** `/src/lib/client-profile-backfill.ts`

One-time migration utilities to populate the ClientProfiles collection:

#### `backfillClientProfiles()`
- Scans all trainer-client assignments
- Creates profile entries for each unique client
- Uses fallback values (Client + ID) for missing data
- Returns detailed results with created/updated counts

#### `updateClientProfilesWithMemberData(memberDataMap)`
- Updates existing profiles with actual member information
- Merges firstName, lastName, email, and photo data
- Computes displayName from available data

#### `verifyBackfillCompletion()`
- Checks if all clients have profiles
- Returns completion status and missing profiles
- Useful for validation

### 4. Client Data Merger Utility

**File:** `/src/lib/client-data-merger.ts`

Helpers to enrich data with client profile information:

#### `enrichWithClientProfiles(items, clientIdField)`
- Enriches an array of items with client profile data
- Returns items with profile and displayName attached
- Useful for complex data structures

#### `addClientNamesToItems(items, clientIdField)`
- Simpler version that just adds clientName field
- Returns items with clientName added
- Good for simple use cases

#### `groupItemsByClientWithProfiles(items, clientIdField)`
- Groups items by client with profile information
- Returns Map of clientId → {profile, displayName, items}
- Useful for client-centric views

#### `createClientNameLookup(clientIds)`
- Creates a quick lookup map for client names
- Returns Map of clientId → display name
- Efficient for rendering lists

## Updated Components

### 1. ClientAdherencePanel

**File:** `/src/components/pages/TrainerDashboard/ClientAdherencePanel.tsx`

**Changes:**
- Imported `getClientDisplayName` from client-profile-service
- Added client name fetching in the enrichment loop
- Updated display to show `client.clientName` instead of `Client {clientId.slice(0, 8)}`
- Client names now appear in the adherence panel header

**Before:**
```
Client a1b2c3d4
```

**After:**
```
Sarah Johnson
```

### 2. ClientsToReviewSection

**File:** `/src/components/pages/TrainerDashboard/ClientsToReviewSection.tsx`

**Changes:**
- Imported `getClientDisplayName` from client-profile-service
- Added `clientName?: string` field to ClientReviewData interface
- Fetches client names during data enrichment
- Updated display to show client names instead of IDs

**Before:**
```
Client a1b2c3d4
```

**After:**
```
Sarah Johnson
```

### 3. CoachCheckInModal

**File:** `/src/components/pages/TrainerDashboard/CoachCheckInModal.tsx`

**Changes:**
- Imported `getClientDisplayName` and `useEffect`
- Added state to store client name
- Fetches client name on component mount
- Displays client name in modal header alongside reason

**Before:**
```
Send Check-In Message
Client is inactive
```

**After:**
```
Send Check-In Message
Sarah Johnson • Client is inactive
```

## How to Use

### For Displaying Client Names

```typescript
import { getClientDisplayName, getClientDisplayNames } from '@/lib/client-profile-service';

// Get single client name
const clientName = await getClientDisplayName(clientId);
console.log(clientName); // "Sarah Johnson"

// Get multiple client names
const clientIds = ['client-1', 'client-2', 'client-3'];
const names = await getClientDisplayNames(clientIds);
names.forEach((name, clientId) => {
  console.log(`${clientId}: ${name}`);
});
```

### For Enriching Data

```typescript
import { addClientNamesToItems } from '@/lib/client-data-merger';

// Add client names to a list of items
const items = [
  { clientId: 'client-1', workoutDate: '2024-01-15' },
  { clientId: 'client-2', workoutDate: '2024-01-16' },
];

const enriched = await addClientNamesToItems(items);
// enriched[0] = { clientId: 'client-1', workoutDate: '2024-01-15', clientName: 'Sarah Johnson' }
```

### For Grouping by Client

```typescript
import { groupItemsByClientWithProfiles } from '@/lib/client-data-merger';

const grouped = await groupItemsByClientWithProfiles(items);
grouped.forEach((group, clientId) => {
  console.log(`${group.displayName}: ${group.items.length} items`);
});
```

## Backfill Process

### Step 1: Initial Backfill

Run this once to create profiles for all existing clients:

```typescript
import { backfillClientProfiles, verifyBackfillCompletion } from '@/lib/client-profile-backfill';

// Create profiles for all clients
const result = await backfillClientProfiles();
console.log(result);
// {
//   success: true,
//   totalProcessed: 25,
//   created: 25,
//   updated: 0,
//   errors: [],
//   message: "Backfill completed: 25 created, 0 already existed, 0 errors"
// }

// Verify completion
const verification = await verifyBackfillCompletion();
console.log(verification);
// {
//   isComplete: true,
//   totalClients: 25,
//   profilesCreated: 25,
//   missingProfiles: []
// }
```

### Step 2: Update with Member Data (Optional)

If you have member data available, update profiles with actual names:

```typescript
import { updateClientProfilesWithMemberData } from '@/lib/client-profile-backfill';

// Create a map of member data
const memberDataMap = new Map([
  ['client-1', { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com' }],
  ['client-2', { firstName: 'John', lastName: 'Smith', email: 'john@example.com' }],
]);

const result = await updateClientProfilesWithMemberData(memberDataMap);
console.log(result);
// {
//   success: true,
//   totalProcessed: 25,
//   created: 0,
//   updated: 20,
//   errors: [],
//   message: "Update completed: 20 updated, 0 errors"
// }
```

## Database Schema

The ClientProfiles collection should have the following structure:

```
Collection ID: clientprofiles

Fields:
- _id (Text, System) - Unique identifier
- memberId (Text) - Reference to member ID
- firstName (Text) - Client's first name
- lastName (Text) - Client's last name
- displayName (Text) - Full display name
- email (Text) - Client's email
- profilePhoto (Image) - Client's profile photo
- _createdDate (DateTime, System)
- _updatedDate (DateTime, System)
```

## Performance Considerations

### Caching Strategy

The client-profile-service implements an in-memory cache to avoid repeated database queries:

- **First call:** Fetches from database and caches
- **Subsequent calls:** Returns from cache
- **Cache is per-session:** Cleared when the app reloads

### Batch Operations

For better performance with multiple clients:

```typescript
// Good: Batch fetch
const names = await getClientDisplayNames(['client-1', 'client-2', 'client-3']);

// Avoid: Multiple individual fetches
const name1 = await getClientDisplayName('client-1');
const name2 = await getClientDisplayName('client-2');
const name3 = await getClientDisplayName('client-3');
```

### Cache Management

Clear the cache if you update client profiles:

```typescript
import { clearClientProfileCache } from '@/lib/client-profile-service';

// After updating a profile
await upsertClientProfile(clientId, { firstName: 'New Name' });
clearClientProfileCache(); // Force refresh on next fetch
```

## Fallback Behavior

The display name resolution follows this priority:

1. **displayName** - If explicitly set
2. **firstName + lastName** - If both available
3. **firstName** - If only first name available
4. **email** - If name not available
5. **memberId** - Last resort fallback

This ensures a name is always displayed, even if profile data is incomplete.

## Future Enhancements

### Suggested Improvements

1. **Profile Photos**
   - Display client profile photos in lists
   - Add photo upload functionality

2. **Search and Filter**
   - Search clients by name
   - Filter by name patterns

3. **Bulk Operations**
   - Bulk update client names
   - Bulk import from CSV

4. **Sync with Member Data**
   - Automatically sync with member profile changes
   - Webhook integration for real-time updates

5. **Audit Trail**
   - Track name changes
   - Log who updated what and when

## Troubleshooting

### Names Not Displaying

1. **Check if backfill was run:**
   ```typescript
   const verification = await verifyBackfillCompletion();
   console.log(verification.missingProfiles);
   ```

2. **Check cache:**
   ```typescript
   import { clearClientProfileCache } from '@/lib/client-profile-service';
   clearClientProfileCache();
   // Reload the page
   ```

3. **Verify data in database:**
   - Check if clientprofiles collection exists
   - Verify memberId values match client IDs

### Performance Issues

1. **Too many database queries:**
   - Use batch operations instead of individual fetches
   - Check if cache is working: `getClientProfileCacheSize()`

2. **Slow rendering:**
   - Consider pagination for large client lists
   - Use `groupItemsByClientWithProfiles` for grouped views

## Testing

### Manual Testing Checklist

- [ ] Backfill completes successfully
- [ ] Client names display in ClientAdherencePanel
- [ ] Client names display in ClientsToReviewSection
- [ ] Client names display in CoachCheckInModal
- [ ] Fallback to email works when name not available
- [ ] Fallback to ID works when email not available
- [ ] Cache improves performance on repeated loads
- [ ] Clear cache forces fresh data fetch

### Example Test Code

```typescript
// Test backfill
const backfillResult = await backfillClientProfiles();
console.assert(backfillResult.success, 'Backfill should succeed');
console.assert(backfillResult.created > 0, 'Should create profiles');

// Test display names
const name = await getClientDisplayName('test-client-id');
console.assert(name && name.length > 0, 'Should return a name');

// Test cache
const size1 = getClientProfileCacheSize();
await getClientDisplayName('test-client-id');
const size2 = getClientProfileCacheSize();
console.assert(size2 > size1, 'Cache should grow');
```

## Summary

This implementation provides:

✅ **ClientProfiles Collection** - Centralized storage for client names
✅ **Client Profile Service** - Easy-to-use API for fetching names
✅ **Backfill Utilities** - One-time migration for existing data
✅ **Data Merger Tools** - Helpers for enriching other data
✅ **Updated Components** - ClientAdherencePanel, ClientsToReviewSection, CoachCheckInModal
✅ **Caching** - Performance optimization with in-memory cache
✅ **Fallbacks** - Graceful degradation if names unavailable

The system is designed to be:
- **Performant** - Caching and batch operations
- **Reliable** - Multiple fallback options
- **Maintainable** - Clear separation of concerns
- **Extensible** - Easy to add more components
