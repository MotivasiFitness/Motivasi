# Profile Photo Upload - Implementation Summary

## Overview
Enhanced the profile photo upload system with comprehensive debugging, error handling, and diagnostic tools to capture and fix upload failures.

## Changes Made

### 1. Enhanced Frontend Logging (`TrainerProfilePage.tsx`)
**Location**: `/src/components/pages/TrainerDashboard/TrainerProfilePage.tsx`

**Changes**:
- Added comprehensive console logging with grouped output
- Captures all request/response details before consuming response body
- Provides specific error messages based on response type
- Validates response is JSON before parsing
- Logs environment detection and endpoint resolution

**Key Features**:
```typescript
// Enhanced debug logging
console.group('[Upload Debug] Profile Photo Upload');
console.log('📤 Starting upload to:', uploadUrl);
console.log('📁 File name:', fileName);
console.log('📊 Blob size:', blob.size, 'bytes');
console.log('🎨 Blob type:', blob.type);
console.log('🌐 Current hostname:', window.location.hostname);
console.log('🔧 Environment:', isPreviewEnvironment() ? 'Preview/Dev' : 'Production');
console.groupEnd();

// Response details captured BEFORE consuming body
const responseHeaders = Object.fromEntries(response.headers.entries());
const contentType = response.headers.get('content-type') || 'unknown';
const responseText = await response.clone().text();

// Specific error messages
if (response.status === 404) {
  throw new Error('Upload endpoint not found. The backend function may not be deployed correctly.');
} else if (response.status === 401 || response.status === 403) {
  throw new Error('Authentication failed. Please sign in again.');
} else if (contentType.includes('text/html')) {
  throw new Error('Received HTML instead of JSON. The backend function may have an error or routing issue.');
}
```

### 2. Enhanced Backend Logging (`uploadProfilePhoto.ts`)
**Location**: `/src/wix-verticals/backend/uploadProfilePhoto.ts`

**Changes**:
- Added detailed logging for all request details
- Logs file validation steps
- Captures Wix Media Manager upload results
- Enhanced error logging with full error details

**Key Features**:
```typescript
console.log('=== Upload Profile Photo Backend ===');
console.log('Request method:', request.method);
console.log('Request headers:', JSON.stringify(request.headers, null, 2));
console.log('Content-Type:', contentType);
console.log('File present:', !!file);
console.log('File details:', { name: file.name, size: file.size, type: file.type });

// Enhanced error messages
if (file.size > maxSize) {
  return jsonResponse(400, {
    success: false,
    statusCode: 400,
    error: `File size must be less than 5MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
  });
}

// Full error logging
console.error('=== Upload Error ===');
console.error('Error type:', error.constructor?.name);
console.error('Error message:', error.message);
console.error('Error stack:', error.stack);
console.error('Full error:', JSON.stringify(error, null, 2));
```

### 3. Debug Guide (`UPLOAD_PHOTO_DEBUG_GUIDE.md`)
**Location**: `/src/UPLOAD_PHOTO_DEBUG_GUIDE.md`

**Purpose**: Comprehensive troubleshooting guide for upload issues

**Contents**:
- Step-by-step instructions to capture network request details
- 6 common failure scenarios with specific fixes:
  - Scenario A: 404 Not Found (deployment/routing issues)
  - Scenario B: 401/403 Unauthorized (authentication issues)
  - Scenario C: HTML Response Instead of JSON (backend errors)
  - Scenario D: CORS Issues (missing headers)
  - Scenario E: File Size/Type Issues (validation failures)
  - Scenario F: Wix Media Manager Upload Failure (API issues)
- Test checklist for full flow verification
- Quick fixes summary
- Enhanced debugging instructions
- Support contact information template

### 4. Test Utility (`test-upload-photo.ts`)
**Location**: `/src/lib/test-upload-photo.ts`

**Purpose**: Browser console utility for testing upload flow

**Features**:
- `testUploadFlow()`: Complete end-to-end test
  - Tests database access
  - Tests upload endpoint
  - Creates test image
  - Validates response
  - Checks image URL accessibility
- `quickDiagnostic()`: Quick environment check
  - Environment detection
  - Endpoint resolution
  - Browser API availability
- Automatically loads into window for console access

**Usage**:
```javascript
// In browser console on /trainer/profile page
await testUploadFlow();  // Full test
quickDiagnostic();       // Quick check
```

## How to Use

### For Developers

1. **Reproduce the Issue**:
   - Navigate to `/trainer/profile`
   - Open browser DevTools (F12)
   - Go to Network tab
   - Attempt to upload a small JPG image

2. **Capture Details**:
   - Look for `uploadProfilePhoto` request in Network tab
   - Check browser console for enhanced debug logs
   - Note the status code, content-type, and response body

3. **Diagnose**:
   - Refer to `UPLOAD_PHOTO_DEBUG_GUIDE.md`
   - Match the symptoms to one of the 6 scenarios
   - Follow the specific fix instructions

4. **Test**:
   - Run `await testUploadFlow()` in browser console
   - Verify all steps pass
   - Test with real image upload

### For Testing

**Test Checklist**:
- [ ] Upload small JPG (< 500KB, 512x512px)
- [ ] Verify preview appears immediately
- [ ] Click "Save Changes"
- [ ] Verify success toast
- [ ] Refresh page (F5)
- [ ] Verify avatar persists
- [ ] Check database has Wix Media URL (not blob URL)

**Test Scenarios**:
1. **Happy Path**: Small JPG upload → Success
2. **Large File**: 6MB image → Error message
3. **Wrong Type**: PDF file → Error message
4. **No File**: Click upload without selecting → No action
5. **Network Error**: Disconnect internet → Error message
6. **Session Expired**: Wait 24h → Re-auth prompt

## Expected Behavior

### Successful Upload
```
[Upload Debug] Profile Photo Upload
  📤 Starting upload to: /_functions-dev/uploadProfilePhoto
  📁 File name: profile.jpg
  📊 Blob size: 45678 bytes (44.61 KB)
  🎨 Blob type: image/jpeg
  🌐 Current hostname: localhost
  🔧 Environment: Preview/Dev
  📍 Full URL: http://localhost:3000/_functions-dev/uploadProfilePhoto

[Upload Debug] Response Details
  📡 Status: 200 OK
  🔗 Response URL: http://localhost:3000/_functions-dev/uploadProfilePhoto
  📋 Content-Type: application/json
  📨 All Headers: { content-type: 'application/json', ... }

[Upload Debug] Response Body
  📄 Raw response: {"success":true,"statusCode":200,"url":"https://static.wixstatic.com/media/..."}

✅ [Upload] Parsed JSON data: { success: true, statusCode: 200, url: "..." }
✅ [Upload] Upload successful! URL: https://static.wixstatic.com/media/...
```

### Failed Upload (Example: 404)
```
[Upload Debug] Profile Photo Upload
  📤 Starting upload to: /_functions-dev/uploadProfilePhoto
  ...

[Upload Debug] Response Details
  📡 Status: 404 Not Found
  🔗 Response URL: http://localhost:3000/_functions-dev/uploadProfilePhoto
  📋 Content-Type: text/html
  📨 All Headers: { content-type: 'text/html', ... }

[Upload Debug] Response Body
  📄 Raw response: <!DOCTYPE html><html>...

❌ [Upload] ERROR: Expected JSON but got: text/html
📄 [Upload] Response body: <!DOCTYPE html>...

❌ [Upload Debug] Error Details
  Error type: Error
  Error message: Upload endpoint not found. The backend function may not be deployed correctly.
  ...
```

## Common Issues & Fixes

### Issue 1: 404 Not Found
**Symptom**: Status 404, HTML response
**Fix**: 
1. Verify backend function exists at `/src/wix-verticals/backend/uploadProfilePhoto.ts`
2. Publish site to deploy backend changes
3. Check function name is exactly `post_uploadProfilePhoto`

### Issue 2: Authentication Failed
**Symptom**: Status 401/403
**Fix**:
1. Sign out and sign back in
2. Check user has trainer role
3. Verify Wix Members authentication is working

### Issue 3: HTML Instead of JSON
**Symptom**: Status 200/500, Content-Type: text/html
**Fix**:
1. Check backend function logs in Wix Editor
2. Verify function returns JSON response
3. Add try-catch blocks in backend function

### Issue 4: File Too Large
**Symptom**: Status 400, "File size must be less than 5MB"
**Fix**: Use smaller image (< 5MB, recommended 512x512px)

### Issue 5: Wrong File Type
**Symptom**: Status 400, "File type must be JPG, PNG, or WebP"
**Fix**: Use supported image format

## Files Modified

1. `/src/components/pages/TrainerDashboard/TrainerProfilePage.tsx`
   - Enhanced `uploadImageToWix()` function with comprehensive logging
   - Added `isPreviewEnvironment` import

2. `/src/wix-verticals/backend/uploadProfilePhoto.ts`
   - Enhanced `post_uploadProfilePhoto()` function with detailed logging
   - Improved error messages with actual values

## Files Created

1. `/src/UPLOAD_PHOTO_DEBUG_GUIDE.md`
   - Comprehensive troubleshooting guide
   - 6 common scenarios with fixes
   - Test checklist and verification steps

2. `/src/lib/test-upload-photo.ts`
   - Browser console test utility
   - `testUploadFlow()` function
   - `quickDiagnostic()` function

3. `/src/UPLOAD_PHOTO_IMPLEMENTATION_SUMMARY.md` (this file)
   - Implementation overview
   - Usage instructions
   - Expected behavior examples

## Next Steps

1. **Reproduce the Issue**:
   - Follow the steps in "How to Use" section
   - Capture the actual network request details
   - Note the specific error scenario

2. **Apply the Fix**:
   - Refer to `UPLOAD_PHOTO_DEBUG_GUIDE.md`
   - Follow the fix instructions for your scenario
   - Test with the test utility

3. **Verify the Fix**:
   - Run `await testUploadFlow()` in console
   - Test with real image upload
   - Verify persistence after page refresh

4. **Document the Solution**:
   - Note which scenario matched your issue
   - Document the specific fix applied
   - Update this file with any new scenarios discovered

## Success Criteria

Upload is working correctly when:
- ✅ Status Code: 200
- ✅ Content-Type: `application/json`
- ✅ Response: `{ success: true, url: "https://static.wixstatic.com/media/..." }`
- ✅ Image preview appears immediately
- ✅ Image persists after page refresh
- ✅ Database contains Wix Media URL (not blob URL)
- ✅ Avatar displays correctly on all pages
- ✅ No console errors
- ✅ Test utility passes all checks

## Support

If issues persist after following the debug guide:
1. Run `await testUploadFlow()` and capture output
2. Capture Network tab details
3. Capture browser console logs
4. Capture backend function logs from Wix Editor
5. Refer to "Contact Support" section in `UPLOAD_PHOTO_DEBUG_GUIDE.md`

## Additional Resources

- **Debug Guide**: `/src/UPLOAD_PHOTO_DEBUG_GUIDE.md`
- **Test Utility**: `/src/lib/test-upload-photo.ts`
- **Backend Config**: `/src/lib/backend-config.ts`
- **Upload Function**: `/src/wix-verticals/backend/uploadProfilePhoto.ts`
- **Profile Page**: `/src/components/pages/TrainerDashboard/TrainerProfilePage.tsx`
- **Wix Media Manager Docs**: https://dev.wix.com/docs/velo/api-reference/wix-media-backend
- **Wix HTTP Functions Docs**: https://dev.wix.com/docs/velo/api-reference/wix-http-functions
