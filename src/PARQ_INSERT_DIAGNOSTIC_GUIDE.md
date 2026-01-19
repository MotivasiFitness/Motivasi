# PAR-Q Insert Diagnostic Guide

## Problem Summary
PAR-Q submissions return 200 OK responses but no records appear in the CMS database. This indicates a **silent insert failure** where the operation appears successful but data is not persisted.

## Diagnostic Steps Implemented

### 1. Enhanced Logging in `parq-submit.ts`

**What was added:**
- Full payload logging before insert: `JSON.stringify(submissionData, null, 2)`
- Hard verification that `_id` is returned after insert
- Immediate read-back verification to confirm record persistence
- Detailed error logging with full error object serialization

**What to check in logs:**
```
📦 EXACT PAYLOAD BEING INSERTED: { ... }
✅ Successfully saved to database with _id: [id]
✅ Full insert result: { ... }
✅ VERIFICATION PASSED: Record can be read back immediately
```

**If you see:**
```
❌ CRITICAL: Insert returned but NO _id present!
```
This means `wixData.insert()` completed without throwing an error but returned no `_id`.

**If you see:**
```
⚠️ WARNING: Record inserted but cannot be read back immediately
```
This means the insert returned an `_id` but the record cannot be queried immediately after.

---

### 2. Backend-Only Test Function: `test-parq-insert.ts`

**Purpose:** Isolate database insert functionality from form submission logic.

**Endpoint:** `POST /_functions/test-parq-insert`

**How to test:**
```bash
# Using curl
curl -X POST https://[your-site].wixsite.com/_functions/test-parq-insert \
  -H "Content-Type: application/json" \
  -d '{}'

# Using Postman/Insomnia
POST https://[your-site].wixsite.com/_functions/test-parq-insert
Headers: Content-Type: application/json
Body: {}
```

**Expected success response:**
```json
{
  "ok": true,
  "id": "abc123...",
  "verification": {
    "_id": "abc123...",
    "firstName": "Test",
    "lastName": "User",
    "email": "test-1234567890@example.com",
    ...
  }
}
```

**Possible failure responses:**

1. **Insert failed:**
```json
{
  "ok": false,
  "error": "Insert failed",
  "details": {
    "message": "...",
    "code": "..."
  }
}
```

2. **Insert succeeded but no _id:**
```json
{
  "ok": false,
  "error": "Insert returned no _id",
  "details": { ... }
}
```

3. **Insert succeeded but read-back failed:**
```json
{
  "ok": true,
  "id": "abc123...",
  "error": "Insert succeeded but read-back failed",
  "details": { ... }
}
```

---

## Manual CMS Verification Steps

### Step 1: Check the `answers` Field Type

**Location:** Wix Dashboard → CMS → ParqSubmissions collection

**What to verify:**
1. Go to https://manage.wix.com/dashboard/[your-site-id]/database
2. Click on "ParqSubmissions" collection
3. Click "Settings" or "Manage Fields"
4. Find the `answers` field
5. Check its type:
   - ✅ **Should be:** `Text` (long text)
   - ❌ **Problem if:** `Object`, `JSON`, or any other type

**Why this matters:**
The code is inserting `answers` as a string:
```typescript
answers: payload.formData || JSON.stringify(payload, null, 2)
```

If the CMS field expects an Object but receives a string, Wix may silently reject the insert.

**How to fix if wrong type:**
1. Change field type to "Text" (long text)
2. OR update the code to insert as an object:
   ```typescript
   answers: payload.formData ? JSON.parse(payload.formData) : payload
   ```

---

### Step 2: Check Collection Permissions

**Location:** Wix Dashboard → CMS → ParqSubmissions → Permissions

**What to verify:**
- **Insert permission:** Should be "Anyone" or "Site Member"
- **Read permission:** Should be "Site Member Author" or more permissive

**Current settings (from context):**
```
insert: "SITE_MEMBER"
read: "SITE_MEMBER_AUTHOR"
```

**Potential issue:**
If the submission is happening from a non-authenticated context (public form), and insert requires "SITE_MEMBER", the insert will fail silently.

**How to test:**
1. Temporarily change insert permission to "Anyone"
2. Try a submission
3. Check if record appears

---

### Step 3: Check for Field Validation Rules

**Location:** Wix Dashboard → CMS → ParqSubmissions → Field Settings

**What to check:**
- Are there any required fields not being provided?
- Are there any field format validations (email, date, etc.)?
- Are there any field length limits?

**Known fields being inserted:**
- firstName, lastName, email (required in code)
- clientName, dateOfBirth, hasHeartCondition, currentlyTakingMedication
- memberId, submissionDate, answers, flagsYes, status, assignedTrainerId, notes

---

## Testing Workflow

### Phase 1: Backend Test (Isolate Database)
1. Deploy the new `test-parq-insert.ts` function
2. Call `POST /_functions/test-parq-insert`
3. Check response and logs

**If test passes:** Database inserts are working. Problem is in form submission logic.
**If test fails:** Database configuration issue (permissions, field types, validation).

---

### Phase 2: Form Submission Test (Full Flow)
1. Submit a PAR-Q form from the frontend
2. Check browser console for response
3. Check Wix backend logs for detailed output
4. Look for the new diagnostic messages:
   - `📦 EXACT PAYLOAD BEING INSERTED:`
   - `✅ VERIFICATION PASSED:` or `⚠️ WARNING:`

---

### Phase 3: CMS Manual Verification
1. Check `answers` field type (Text vs Object)
2. Check collection permissions (insert: Anyone vs Site Member)
3. Check for field validation rules
4. Try manual insert via Wix Dashboard to confirm CMS is accepting data

---

## Common Silent Failure Causes

### 1. Type Mismatch
**Symptom:** Insert returns 200 but no record
**Cause:** Field type in CMS doesn't match data type being inserted
**Solution:** Verify `answers` field is "Text" type

### 2. Permission Denied
**Symptom:** Insert returns 200 but no record (in some Wix versions)
**Cause:** Collection permissions require authentication but request is unauthenticated
**Solution:** Change insert permission to "Anyone" or ensure request is authenticated

### 3. Validation Failure
**Symptom:** Insert returns 200 but no record
**Cause:** Field validation rules fail (email format, required fields, etc.)
**Solution:** Check field validation settings in CMS

### 4. Collection Hooks
**Symptom:** Insert appears to work but record doesn't persist
**Cause:** A collection hook (beforeInsert, afterInsert) is rejecting the data
**Solution:** Check for any custom code in Wix backend that hooks into ParqSubmissions

### 5. Quota/Limits
**Symptom:** Inserts stop working after some time
**Cause:** CMS storage quota exceeded or rate limits hit
**Solution:** Check site storage usage and rate limit logs

---

## Next Steps

1. **Deploy the updated code** (parq-submit.ts with enhanced logging)
2. **Deploy the test function** (test-parq-insert.ts)
3. **Run the backend test** to isolate database functionality
4. **Check CMS field types** manually in Wix Dashboard
5. **Review logs** from both test function and real submissions
6. **Report findings** with specific error messages or verification results

---

## Expected Log Output (Success Case)

```
=== PAR-Q HTTP Function Submission ===
📥 Payload received: { firstName: 'John', lastName: 'Doe', ... }
🏥 Medical flags detected: false
👤 Assigned to trainer: d18a21c8-be77-496f-a2fd-ec6479ecba6d
💾 Attempting to save to ParqSubmissions collection...
📦 EXACT PAYLOAD BEING INSERTED: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "clientName": "John Doe",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "hasHeartCondition": false,
  "currentlyTakingMedication": false,
  "submissionDate": "2026-01-19T...",
  "answers": "{...}",
  "flagsYes": false,
  "status": "New",
  "assignedTrainerId": "d18a21c8-be77-496f-a2fd-ec6479ecba6d",
  "notes": ""
}
✅ Successfully saved to database with _id: abc123...
✅ Full insert result: { _id: "abc123...", ... }
✅ VERIFICATION PASSED: Record can be read back immediately
✅ Verified record: { _id: "abc123...", ... }
✅ Email notification sent to hello@motivasi.co.uk
✅ PAR-Q submission completed successfully
```

---

## Contact Points for Further Investigation

If all diagnostic steps pass but records still don't appear:

1. **Check Wix Support:** There may be a platform-level issue
2. **Check Collection ID:** Verify "ParqSubmissions" is the exact collection name (case-sensitive)
3. **Check Multi-Site Setup:** Ensure you're looking at the correct site's database
4. **Check Wix Logs:** Full backend logs in Wix Dashboard → Monitoring → Logs
