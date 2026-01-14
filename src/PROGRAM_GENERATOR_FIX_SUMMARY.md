# Program Generator API Fixes & Database Persistence

## Summary
Updated the AI program generator system to properly handle API wrapper responses, fix JSON parsing errors, persist full programs to the database, and standardize status strings and exercise mapping.

## Changes Implemented

### 1. API Response Wrapper Handling

**Problem**: Frontend was not extracting `data` from API wrapper responses `{ success, data, statusCode }`.

**Solution**: Updated frontend calls to extract `response.data`:

**File**: `/src/lib/ai-program-generator.ts`

```typescript
// BEFORE
const generatedProgram = await safeFetch<GeneratedProgram>('/api/generate-program', ...);

// AFTER
const response = await safeFetch<{ success: boolean; data: GeneratedProgram; statusCode: number }>('/api/generate-program', ...);
const generatedProgram = response.data;
```

Applied to both:
- `generateProgramWithAI()` - Line 143
- `regenerateProgramSection()` - Line 617

### 2. Fixed safeJsonParse 'Body Already Read' Error

**Problem**: `safeJsonParse()` was calling `response.text()` twice, causing "body already read" errors.

**Solution**: Read response text once and reuse it.

**File**: `/src/lib/api-response-handler.ts`

```typescript
// BEFORE
try {
  const json = await response.json();
  return json as T;
} catch (parseError) {
  const text = await response.text(); // ERROR: Body already consumed!
  // ...
}

// AFTER
try {
  // Read response text ONCE to avoid 'body already read' errors
  const text = await response.text();
  
  // Parse the text as JSON
  const json = JSON.parse(text);
  return json as T;
} catch (parseError) {
  // Text is already read above, so we can't read it again
  console.error(`[${context}] JSON parse error:`, {
    error: parseError,
    status: response.status,
  });
  // ...
}
```

### 3. Database Persistence with New Collection

**Problem**: Generated programs were only stored in `sessionStorage`, which is temporary and lost on page refresh.

**Solution**: Created new `programdrafts` collection to persist full program JSON.

**New Collection**: `programdrafts`

Fields:
- `_id` (text, system) - Unique record ID
- `programId` (text) - Program identifier
- `trainerId` (text) - Trainer who created it
- `clientId` (text, optional) - Client if assigned
- `programJson` (text) - Full program JSON stringified
- `status` (text) - "draft", "assigned", or "template"
- `createdAt` (datetime) - Creation timestamp
- `updatedAt` (datetime) - Last update timestamp

**Updated Functions** in `/src/lib/ai-program-generator.ts`:

#### `saveProgramDraft()`
```typescript
// Now saves to programdrafts collection
const programDraft = {
  _id: crypto.randomUUID(),
  programId,
  trainerId,
  clientId: clientId || undefined,
  programJson: JSON.stringify(program), // Full program stored as JSON
  status: clientId ? 'assigned' : 'draft',
  createdAt: now,
  updatedAt: now,
};

await BaseCrudService.create('programdrafts', programDraft);
```

#### `loadProgramDraft()`
```typescript
// Now loads from programdrafts collection
const results = await BaseCrudService.getAll<any>('programdrafts');
const draft = results.items.find((d: any) => d.programId === programId);

if (!draft) {
  throw new Error('Program draft not found');
}

// Parse the stored JSON
const program = JSON.parse(draft.programJson);
```

#### `updateProgramDraft()`
```typescript
// Now updates in database instead of sessionStorage
await BaseCrudService.update('programdrafts', {
  _id: draft._id,
  programJson: JSON.stringify(updatedProgram),
  updatedAt: new Date().toISOString(),
});
```

#### `saveProgramAsTemplate()`
```typescript
// Now creates template in programdrafts with status='template'
const template = {
  _id: crypto.randomUUID(),
  programId: templateId,
  trainerId: draft.trainerId,
  clientId: undefined,
  programJson: JSON.stringify({ ...program, programName: templateName }),
  status: 'template',
  createdAt: now,
  updatedAt: now,
};

await BaseCrudService.create('programdrafts', template);
```

#### `assignProgramToClient()`
```typescript
// Now creates client copy in programdrafts with status='assigned'
const clientDraft = {
  _id: crypto.randomUUID(),
  programId: clientProgramId,
  trainerId: draft.trainerId,
  clientId,
  programJson: draft.programJson,
  status: 'assigned',
  createdAt: now,
  updatedAt: now,
};

await BaseCrudService.create('programdrafts', clientDraft);
```

#### `regenerateProgramSection()`
```typescript
// Now saves to database instead of sessionStorage
await updateProgramDraft(request.programId, updated);
```

### 4. Standardized Status Strings

**Problem**: Inconsistent status capitalization caused filtering issues.

**Solution**: Standardized to lowercase in `programdrafts` collection:
- `"draft"` - Program is being created/edited
- `"assigned"` - Program assigned to a client
- `"template"` - Reusable program template

**Note**: The `programs` collection still uses capitalized statuses ("Draft", "Assigned", "Template") for backward compatibility.

### 5. Normalized Exercise Mapping Keys

**Problem**: Exercise names with different casing/whitespace caused mapping failures.

**Solution**: Normalize exercise names to lowercase and trim whitespace.

**File**: `/src/lib/ai-program-generator.ts`

```typescript
// mapExerciseToLibrary()
export async function mapExerciseToLibrary(exerciseName: string): Promise<string | null> {
  try {
    // Normalize the exercise name: lowercase and trim
    const normalizedName = exerciseName.toLowerCase().trim();
    
    const stored = localStorage.getItem(`exercise_map_${normalizedName}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error mapping exercise:', error);
    return null;
  }
}

// storeExerciseMapping()
export async function storeExerciseMapping(exerciseName: string, exerciseId: string): Promise<void> {
  try {
    // Normalize the exercise name: lowercase and trim
    const normalizedName = exerciseName.toLowerCase().trim();
    
    localStorage.setItem(`exercise_map_${normalizedName}`, JSON.stringify(exerciseId));
  } catch (error) {
    console.error('Error storing exercise mapping:', error);
    throw new Error('Failed to store exercise mapping');
  }
}
```

## Backend API Endpoints (No Changes Needed)

The backend endpoints already return the correct wrapper format:

**`/_functions/generateProgram`** (POST)
```json
{
  "success": true,
  "statusCode": 200,
  "data": { /* GeneratedProgram */ }
}
```

**`/_functions/regenerateProgramSection`** (POST)
```json
{
  "success": true,
  "statusCode": 200,
  "data": { /* Section-specific data */ }
}
```

## Migration Notes

### Existing Programs in SessionStorage
Programs currently stored in `sessionStorage` will need to be migrated or will be lost. Consider:
1. Adding a migration utility to move sessionStorage programs to the database
2. Or accept that existing drafts will be lost (acceptable if no critical data)

### Backward Compatibility
- The `programs` collection is still updated for backward compatibility
- Status values in `programs` remain capitalized ("Draft", "Assigned", "Template")
- New `programdrafts` collection uses lowercase statuses ("draft", "assigned", "template")

## Testing Checklist

- [x] Generate new program - saves to `programdrafts` collection
- [x] Load program draft - reads from `programdrafts` collection
- [x] Update program draft - updates in database
- [x] Save as template - creates template in `programdrafts`
- [x] Assign to client - creates client copy in `programdrafts`
- [x] Regenerate section - updates program in database
- [x] Exercise mapping - normalizes names correctly
- [x] API responses - extracts `data` from wrapper
- [x] JSON parsing - no "body already read" errors

## Files Modified

1. `/src/lib/api-response-handler.ts` - Fixed safeJsonParse
2. `/src/lib/ai-program-generator.ts` - Updated all functions for database persistence
3. CMS Collection Created: `programdrafts` - New collection for full program storage

## Entity Type (Auto-Generated)

The entity type for `programdrafts` will be auto-generated in `/src/entities/index.ts`:

```typescript
export interface ProgramDrafts {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  programId?: string;
  trainerId?: string;
  clientId?: string;
  programJson?: string;
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
```

## Usage Example

```typescript
import { generateProgramWithAI, saveProgramDraft } from '@/lib/ai-program-generator';

// Generate program
const program = await generateProgramWithAI(formData, trainerId);

// Save to database (persists across sessions)
const programId = await saveProgramDraft(program, trainerId);

// Load later (even after page refresh)
const loadedProgram = await loadProgramDraft(programId);
```

## Benefits

1. **Persistence**: Programs survive page refreshes and browser restarts
2. **Reliability**: No more "body already read" errors
3. **Consistency**: Standardized status strings prevent filtering issues
4. **Accuracy**: Normalized exercise names prevent mapping failures
5. **Scalability**: Database storage allows for querying, filtering, and reporting
6. **Data Integrity**: Full program structure preserved in JSON format
