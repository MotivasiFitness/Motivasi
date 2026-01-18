# Upload Profile Photo - HTML Response Issue Fix

## Problem Summary
The `uploadProfilePhoto` backend function is returning HTML instead of JSON, causing the upload to fail. This document provides diagnostic steps and fixes.

---

## Root Causes & Solutions

### 1. **Environment Path Mismatch** (Most Common)
**Symptom:** Request goes to wrong endpoint path
- Preview/Dev: Should use `/_functions-dev/uploadProfilePhoto`
- Production: Should use `/_functions/uploadProfilePhoto`

**Check:**
```javascript
// In browser DevTools Console:
console.log('Hostname:', window.location.hostname);
console.log('Is Preview:', window.location.hostname.includes('preview') || 
                          window.location.hostname.includes('localhost') ||
                          window.location.hostname.includes('editorx.io'));
```

**Fix:** Already implemented in `/src/lib/backend-config.ts`
- The `getBackendEndpoint()` function automatically detects environment
- TrainerProfilePage.tsx uses this correctly (line 224)

**Verify in DevTools Network Tab:**
1. Open DevTools → Network tab
2. Trigger photo upload
3. Find the `uploadProfilePhoto` request
4. Check Request URL - should match environment:
   - Preview: `https://[site].wixsite.com/_functions-dev/uploadProfilePhoto`
   - Production: `https://[site].com/_functions/uploadProfilePhoto`

---

### 2. **Backend Function Not Deployed**
**Symptom:** 404 error or HTML "not found" page

**Check:**
1. Verify file exists: `/src/wix-verticals/backend/uploadProfilePhoto.ts` ✅ (exists)
2. Check function export name matches Wix requirements:
   - Must be: `post_uploadProfilePhoto` ✅ (correct)
   - Must be exported: `export async function post_uploadProfilePhoto` ✅ (correct)

**Fix if needed:**
- Ensure backend file is in correct location
- Redeploy site to ensure backend functions are published
- Check Wix Dashboard → Dev Mode → Backend Functions

---

### 3. **SPA Routing Interference**
**Symptom:** HTML response contains React app shell or router code

**Check Response Body:**
```javascript
// In DevTools Console after failed upload:
// The response text will be logged - check if it contains:
// - React app HTML
// - Router configuration
// - "root" div with React mount point
```

**Fix:** Backend functions should bypass SPA routing automatically
- Wix platform handles this - no code changes needed
- If issue persists, check `.wix/types/wix-code-types/dist/types/backend/http-functions.d.ts`

---

### 4. **Authentication/CORS Issues**
**Symptom:** 401/403 error or CORS preflight failure

**Check:**
- Backend function has OPTIONS handler ✅ (line 197-206 in uploadProfilePhoto.ts)
- CORS headers are set ✅ (lines 40-43)

**Verify in DevTools:**
1. Network tab → uploadProfilePhoto request
2. Check Response Headers for:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: POST, OPTIONS`
   - `Content-Type: application/json`

---

### 5. **Wix Media Manager Permissions**
**Symptom:** Upload succeeds but returns HTML error page

**Check:**
- Site has Media Manager enabled
- Member has upload permissions
- Media folder `/trainer-profiles` exists or can be created

**Fix:**
- Go to Wix Dashboard → Media Manager
- Verify upload permissions are enabled
- Test with a simple file upload in Media Manager UI

---

## Diagnostic Steps (Run in Browser Console)

### Step 1: Check Environment Detection
```javascript
// Copy-paste into browser console:
const hostname = window.location.hostname;
const isPreview = hostname.includes('preview') || 
                  hostname.includes('localhost') || 
                  hostname.includes('127.0.0.1') || 
                  hostname.includes('editorx.io') || 
                  hostname.includes('wixsite.com/studio');
const basePath = isPreview ? '/_functions-dev/' : '/_functions/';
const endpoint = basePath + 'uploadProfilePhoto';

console.log('=== Environment Check ===');
console.log('Hostname:', hostname);
console.log('Is Preview:', isPreview);
console.log('Base Path:', basePath);
console.log('Full Endpoint:', endpoint);
console.log('Full URL:', window.location.origin + endpoint);
```

### Step 2: Test Direct Function Access
```javascript
// Test if function is accessible and returns JSON:
fetch('/_functions-dev/uploadProfilePhoto', {
  method: 'OPTIONS'
})
.then(r => {
  console.log('OPTIONS Status:', r.status);
  console.log('OPTIONS Headers:', Object.fromEntries(r.headers.entries()));
  return r.text();
})
.then(text => console.log('OPTIONS Body:', text))
.catch(err => console.error('OPTIONS Error:', err));
```

### Step 3: Inspect Failed Upload Response
```javascript
// After a failed upload, check what was returned:
// (This is already logged by TrainerProfilePage.tsx lines 259-263)
// Look for:
// - "<!DOCTYPE html>" = HTML page
// - "{"success":false}" = JSON error (good format, but failed)
// - Empty response = Network/CORS issue
```

---

## Implementation Verification

### ✅ Current Implementation Status

**Frontend (TrainerProfilePage.tsx):**
- ✅ Uses centralized `getBackendEndpoint()` (line 224)
- ✅ Comprehensive error logging (lines 227-315)
- ✅ Validates response Content-Type (line 266)
- ✅ Provides specific error messages (lines 271-279)

**Backend (uploadProfilePhoto.ts):**
- ✅ Always returns JSON with Content-Type header (lines 36-46)
- ✅ Handles OPTIONS for CORS (lines 197-206)
- ✅ Validates file size and type (lines 96-117)
- ✅ Comprehensive error handling (lines 164-193)
- ✅ Detailed logging for debugging (lines 52-141)

**Configuration (backend-config.ts):**
- ✅ Environment detection (lines 36-50)
- ✅ Automatic path selection (lines 57-59)
- ✅ Centralized endpoint generation (lines 74-94)

---

## Testing Procedure

### 1. Enable Detailed Logging
Already enabled in code. Check browser console for:
```
[Upload Debug] Profile Photo Upload
📤 Starting upload to: /_functions-dev/uploadProfilePhoto
📁 File name: profile-photo.jpg
📊 Blob size: 45678 bytes (44.61 KB)
🎨 Blob type: image/jpeg
🌐 Current hostname: [your-site].wixsite.com
🔧 Environment: Preview/Dev
📍 Full URL: https://[your-site].wixsite.com/_functions-dev/uploadProfilePhoto
```

### 2. Check Network Request
1. Open DevTools → Network tab
2. Filter by "uploadProfilePhoto"
3. Trigger upload
4. Click on request
5. Verify:
   - **Request URL:** Matches expected environment path
   - **Request Method:** POST
   - **Request Headers:** Content-Type: multipart/form-data
   - **Response Status:** 200 (success) or 400/500 (error)
   - **Response Headers:** Content-Type: application/json
   - **Response Body:** Valid JSON with `{success, statusCode, url}` or `{success, statusCode, error}`

### 3. Check Backend Logs
If you have access to Wix backend logs:
1. Go to Wix Dashboard → Dev Mode → Logs
2. Look for "=== Upload Profile Photo Backend ===" entries
3. Check for errors or unexpected behavior

---

## Quick Fixes

### If Response is HTML (404 Not Found):
**Cause:** Function not deployed or wrong path
**Fix:**
1. Redeploy site from Wix Editor
2. Verify function appears in Wix Dashboard → Backend Functions
3. Check file location: `/src/wix-verticals/backend/uploadProfilePhoto.ts`

### If Response is HTML (Login/Auth Page):
**Cause:** User not authenticated
**Fix:**
1. Ensure user is logged in
2. Check MemberProtectedRoute is wrapping TrainerProfilePage
3. Verify member token is being sent with request

### If Response is HTML (SPA Shell):
**Cause:** Request being handled by React Router instead of backend
**Fix:**
1. Verify path starts with `/_functions` or `/_functions-dev`
2. Check that no React Router route matches `/_functions/*`
3. Ensure Wix platform routing is configured correctly

### If Response is JSON but No URL:
**Cause:** Wix Media Manager upload succeeded but didn't return URL
**Fix:**
1. Check backend logs for upload result structure
2. Verify `uploadResult.fileUrl` or `uploadResult.url` exists
3. May need to adjust URL extraction logic (line 145 in uploadProfilePhoto.ts)

---

## Expected Successful Flow

1. **User selects photo** → File validated (size, type)
2. **Frontend creates FormData** → Blob + filename
3. **Frontend calls endpoint** → `/_functions-dev/uploadProfilePhoto` (preview) or `/_functions/uploadProfilePhoto` (prod)
4. **Backend receives request** → Logs "=== Upload Profile Photo Backend ==="
5. **Backend validates file** → Size < 5MB, type is image/jpeg|png|webp
6. **Backend uploads to Wix Media** → `wixMediaBackend.upload('/trainer-profiles', ...)`
7. **Backend returns JSON:**
   ```json
   {
     "success": true,
     "statusCode": 200,
     "url": "https://static.wixstatic.com/media/abc123_xyz789.jpg"
   }
   ```
8. **Frontend receives JSON** → Validates Content-Type
9. **Frontend extracts URL** → Updates profile photo
10. **Success!** → Photo displayed in UI

---

## Additional Resources

- **Backend Config:** `/src/lib/backend-config.ts`
- **Upload Function:** `/src/wix-verticals/backend/uploadProfilePhoto.ts`
- **Frontend Component:** `/src/components/pages/TrainerDashboard/TrainerProfilePage.tsx`
- **Test Utility:** `/src/lib/test-upload-photo.ts`

---

## Contact Points for Further Investigation

If issue persists after following this guide:

1. **Check Wix Platform Status:** https://status.wix.com
2. **Review Wix Backend Functions Docs:** https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/http-functions
3. **Verify Wix Media Manager API:** https://dev.wix.com/docs/velo/api-reference/wix-media-backend
4. **Check Site Configuration:** Wix Dashboard → Settings → Developer Tools

---

## Summary

The code is correctly implemented with:
- ✅ Environment-aware endpoint detection
- ✅ Comprehensive error handling
- ✅ Detailed logging for debugging
- ✅ Proper JSON response format
- ✅ CORS headers configured

**Most likely causes of HTML response:**
1. Backend function not deployed (404)
2. Wrong environment path (should auto-detect, but verify in Network tab)
3. Wix platform routing issue (rare, contact Wix support)

**Next steps:**
1. Run diagnostic steps in browser console
2. Check Network tab for actual request URL and response
3. Verify backend function is deployed in Wix Dashboard
4. Check backend logs if available
