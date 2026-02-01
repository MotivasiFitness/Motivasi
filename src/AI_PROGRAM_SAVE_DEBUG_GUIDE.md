# AI Program Save Debug Guide

## Problem Statement
AI-created workout programs were not saving to the "My Programs" section, despite the save process appearing to complete successfully.

## Root Cause Analysis

### Issue 1: Insufficient Logging
The original `saveProgramDraft` function had minimal logging, making it impossible to track where the save process was failing.

**Solution:** Added comprehensive logging at every step:
- Program validation
- JSON serialization
- Database operations (programdrafts, programs, clientprograms)
- Error handling with full error details

### Issue 2: Silent Failures in Database Operations
The function was catching errors but not throwing them, which meant failures in creating clientprograms entries were silently ignored.

**Solution:** Added error logging and re-throwing for critical operations to ensure failures are visible.

### Issue 3: Insufficient Debugging in ProgramsCreatedPage
The page wasn't logging enough information about what programs were being loaded.

**Solution:** Enhanced logging to show:
- Trainer ID being used for filtering
- Total programs and drafts loaded
- Detailed program information (ID, name, status, trainer ID)
- Warnings when no programs are found

## How to Debug

### Step 1: Check Browser Console
When creating an AI program, open the browser console (F12) and look for logs with these prefixes:
- `🔄 [saveProgramDraft]` - Save process starting
- `✅ [saveProgramDraft]` - Successful operations
- `❌ [saveProgramDraft]` - Errors
- `📝 [saveProgramDraft]` - Database operations

### Step 2: Verify Each Save Stage

The save process has these stages:

```
1. Input Validation
   - Program name exists
   - Trainer ID exists
   - Program has workout days

2. JSON Serialization
   - Program data can be converted to JSON
   - JSON can be parsed back

3. Save to programdrafts collection
   - Full program JSON stored
   - Status set (draft/assigned)

4. Save to programs collection
   - Metadata stored (name, duration, focus area)
   - Status stored (must be lowercase)

5. Create clientprograms entries
   - One entry per exercise
   - Includes exercise details

6. Cache in sessionStorage
   - Program cached for quick access
```

### Step 3: Check Database Collections

If the program doesn't appear in "My Programs", check:

1. **programs collection**
   - Filter by `trainerId` = your trainer ID
   - Look for your program name
   - Check that `status` is lowercase ("draft", "assigned", etc.)

2. **programdrafts collection**
   - Filter by `trainerId` = your trainer ID
   - Look for `programId` matching the program in the programs collection
   - Verify `programJson` contains the full program data

3. **clientprograms collection**
   - Filter by `programTitle` = your program name
   - Should have one entry per exercise
   - Verify exercise details are populated

### Step 4: Verify Trainer ID Filtering

The most common issue is trainer ID mismatch. Check:

```javascript
// In browser console:
// 1. Get your trainer ID
const member = /* from useMember hook */;
console.log('Your trainer ID:', member._id);

// 2. Check what's in the database
// Go to CMS dashboard and filter programs by trainerId
```

## Common Issues and Solutions

### Issue: Program saves but doesn't appear in "My Programs"

**Cause 1: Trainer ID mismatch**
- Program saved with different trainer ID than current user
- Solution: Check console logs for trainer ID used during save

**Cause 2: Status not lowercase**
- Program status is "Draft" instead of "draft"
- Solution: Check program status in database, should be lowercase

**Cause 3: Page not refreshing**
- Program saved but page cache not cleared
- Solution: Hard refresh (Ctrl+F5) or check URL for `newProgramId` parameter

### Issue: "Failed to save program draft" error

**Check console for:**
1. Which stage failed (programdrafts, programs, or clientprograms)
2. The specific error message
3. Database error details

**Common database errors:**
- "Collection not found" - Check collection ID spelling
- "Invalid field" - Check field names match entity schema
- "Permission denied" - Check collection permissions

### Issue: Program saves but exercises don't appear

**Cause:** clientprograms entries not created
- Check console for "Failed to create client program exercises" warning
- Verify program has workout days with exercises
- Check clientprograms collection for entries with matching programTitle

## Testing the Fix

### Manual Test Steps

1. **Create a program via AI Assistant**
   - Open browser console (F12)
   - Fill in all required fields
   - Click "Generate Program"
   - Review and click "Save as Draft"

2. **Monitor console logs**
   - Watch for `[saveProgramDraft]` logs
   - Note the programId returned
   - Verify all stages complete successfully

3. **Verify in "My Programs"**
   - Navigate to Programs Created page
   - Program should appear in the list
   - Status should be "Draft"
   - Should show "AI Generated" badge

4. **Check database directly**
   - Go to CMS dashboard
   - Check programs collection for your program
   - Verify trainer ID matches your ID
   - Verify status is lowercase

## Logging Output Examples

### Successful Save
```
🔄 [saveProgramDraft] Starting save process: {
  programId: "abc-123",
  programName: "Strength Builder",
  trainerId: "trainer-456",
  status: "draft"
}
✅ [saveProgramDraft] Program JSON validated successfully
📝 [saveProgramDraft] Saving program draft to programdrafts collection
✅ [saveProgramDraft] Program draft saved successfully
📝 [saveProgramDraft] Saving program metadata to programs collection
✅ [saveProgramDraft] Program metadata saved successfully
📝 [saveProgramDraft] Creating clientprograms entries for exercises
✅ [saveProgramDraft] Exercise created: Barbell Bench Press
✅ [saveProgramDraft] All 12 exercises created successfully
✅ [saveProgramDraft] Program cached in sessionStorage
🎉 [saveProgramDraft] Program save process completed successfully
```

### Failed Save
```
❌ [saveProgramDraft] CRITICAL ERROR - Program save failed
❌ [saveProgramDraft] Error details: {
  message: "Failed to save program draft to database: ...",
  stack: "..."
}
```

## Next Steps if Still Not Working

1. **Check trainer ID**
   - Verify you're logged in as the correct trainer
   - Check member._id in console

2. **Check collection permissions**
   - Verify trainer can create items in programs collection
   - Verify trainer can create items in programdrafts collection

3. **Check for JavaScript errors**
   - Look for red errors in console
   - Check network tab for failed API calls

4. **Verify BaseCrudService**
   - Ensure BaseCrudService.create is working
   - Test with a simple create operation

5. **Check for race conditions**
   - Ensure page doesn't navigate before save completes
   - Check that redirect happens after save succeeds

## Files Modified

1. `/src/lib/ai-program-generator.ts`
   - Enhanced logging in `saveProgramDraft` function
   - Better error handling and reporting

2. `/src/components/pages/TrainerDashboard/ProgramsCreatedPage.tsx`
   - Enhanced logging in `loadPrograms` function
   - Better debugging information

## Related Files

- `/src/components/pages/TrainerDashboard/AIAssistantPage.tsx` - Program creation UI
- `/src/lib/ai-program-generator-mock.ts` - Mock generator (exports saveProgramDraft)
- `/src/lib/program-status.ts` - Status constants and utilities
