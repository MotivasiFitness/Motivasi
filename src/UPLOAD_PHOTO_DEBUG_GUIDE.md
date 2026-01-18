# Upload Profile Photo - Debug & Fix Guide

## Overview
This guide helps capture actual failing Network request details for `uploadProfilePhoto` and provides step-by-step troubleshooting based on the captured data.

## Step 1: Capture Network Request Details

### How to Capture
1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Network** tab
3. Clear existing requests (trash icon)
4. Navigate to Trainer Profile page (`/trainer/profile`)
5. Attempt to upload a small JPG image (< 1MB recommended for testing)
6. Look for the `uploadProfilePhoto` request in the Network tab
7. Click on it to see details

### What to Capture
Record the following information:

#### Request Details
- **Request URL**: `_______________________________________`
- **Request Method**: `_______________________________________`
- **Status Code**: `_______________________________________`
- **Request Headers**:
  ```
  Content-Type: _______________________________________
  Authorization: _______________________________________
  ```

#### Response Details
- **Response Status**: `_______________________________________`
- **Response Content-Type**: `_______________________________________`
- **Response Body** (first 500 characters):
  ```
  _______________________________________
  _______________________________________
  _______________________________________
  ```

#### Browser Console Output
Check the browser console for the enhanced debug logs:
```
[Upload Debug] Profile Photo Upload
  📤 Starting upload to: _______________________________________
  📁 File name: _______________________________________
  📊 Blob size: _______________________________________
  🎨 Blob type: _______________________________________
  🌐 Current hostname: _______________________________________
  🔧 Environment: _______________________________________
  📍 Full URL: _______________________________________

[Upload Debug] Response Details
  📡 Status: _______________________________________
  🔗 Response URL: _______________________________________
  📋 Content-Type: _______________________________________
  📨 All Headers: _______________________________________

[Upload Debug] Response Body
  📄 Raw response: _______________________________________
```

---

## Step 2: Diagnose the Issue

### Scenario A: 404 Not Found
**Symptoms:**
- Status Code: 404
- Response: "Page not found" or similar

**Root Cause:** Backend function not deployed or incorrect routing

**Fix:**
1. Verify the backend function exists at `/src/wix-verticals/backend/uploadProfilePhoto.ts`
2. Check that the function is properly exported:
   ```typescript
   export async function post_uploadProfilePhoto(request: any): Promise<any>
   ```
3. Ensure the function is deployed to Wix:
   - In Wix Editor: Go to Code Files → Backend → Verify `uploadProfilePhoto.ts` is present
   - Publish the site to deploy backend changes
4. Verify the endpoint path matches:
   - Preview: `/_functions-dev/uploadProfilePhoto`
   - Production: `/_functions/uploadProfilePhoto`

---

### Scenario B: 401/403 Unauthorized
**Symptoms:**
- Status Code: 401 or 403
- Response: "Unauthorized" or "Permission denied"

**Root Cause:** Authentication/session issues

**Fix:**
1. **Sign out and sign back in** to refresh the session
2. Check if the user has the correct role (trainer)
3. Verify Wix Members authentication is working:
   ```typescript
   // In TrainerProfilePage.tsx
   console.log('Current member:', member);
   console.log('Member ID:', member?._id);
   ```
4. Check Wix site permissions:
   - In Wix Editor: Settings → Permissions → Ensure "Upload to Media Manager" is enabled for members

---

### Scenario C: HTML Response Instead of JSON
**Symptoms:**
- Status Code: 200 or 500
- Content-Type: `text/html` instead of `application/json`
- Response Body: HTML page content

**Root Cause:** Backend function error or routing to wrong page

**Fix:**
1. **Check backend function logs** in Wix Editor:
   - Go to Code Files → Backend → Logs
   - Look for errors in `uploadProfilePhoto` function
2. **Verify function syntax**:
   ```typescript
   // Must be named exactly: post_uploadProfilePhoto
   export async function post_uploadProfilePhoto(request: any): Promise<any> {
     // Function must return JSON response
     return {
       status: 200,
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ success: true, url: '...' })
     };
   }
   ```
3. **Check for runtime errors** in the backend function:
   - Add try-catch blocks
   - Log errors to console
   - Return proper JSON error responses

---

### Scenario D: CORS Issues
**Symptoms:**
- Status Code: (failed) or 0
- Console Error: "CORS policy" or "No 'Access-Control-Allow-Origin' header"

**Root Cause:** Missing CORS headers in backend response

**Fix:**
1. Verify CORS headers in backend function:
   ```typescript
   return {
     status: 200,
     headers: {
       'Content-Type': 'application/json',
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Methods': 'POST, OPTIONS',
       'Access-Control-Allow-Headers': 'Content-Type, Authorization'
     },
     body: JSON.stringify({ ... })
   };
   ```
2. Ensure OPTIONS handler exists:
   ```typescript
   export async function options_uploadProfilePhoto(request: any): Promise<any> {
     return {
       status: 200,
       headers: {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Methods': 'POST, OPTIONS',
         'Access-Control-Allow-Headers': 'Content-Type, Authorization'
       }
     };
   }
   ```

---

### Scenario E: File Size/Type Issues
**Symptoms:**
- Status Code: 400
- Response: "File size must be less than 5MB" or "File type must be JPG, PNG, or WebP"

**Root Cause:** File validation failing

**Fix:**
1. **Test with a small JPG** (< 500KB, 512x512px recommended)
2. **Verify file type** is one of: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
3. **Check file size** is under 5MB (5,242,880 bytes)
4. **Test file preparation**:
   ```typescript
   console.log('File size:', file.size, 'bytes');
   console.log('File type:', file.type);
   console.log('File name:', file.name);
   ```

---

### Scenario F: Wix Media Manager Upload Failure
**Symptoms:**
- Status Code: 500
- Response: "Failed to upload file" or error from Wix Media Manager

**Root Cause:** Issue with Wix Media Manager API

**Fix:**
1. **Check Wix Media Manager permissions**:
   - In Wix Editor: Settings → Permissions → Media Manager
   - Ensure uploads are enabled
2. **Verify media folder path**:
   ```typescript
   // In uploadProfilePhoto.ts
   const uploadResult = await wixMediaBackend.upload(
     '/trainer-profiles',  // Folder path
     file,
     file.name,
     { mediaType: 'image', mimeType: file.type }
   );
   ```
3. **Check Wix Media Manager quota**:
   - Ensure you haven't exceeded storage limits
4. **Test with Wix Media Manager directly**:
   - Try uploading manually through Wix Editor
   - If manual upload fails, it's a Wix account/permissions issue

---

## Step 3: Test the Full Flow

After applying fixes, test the complete upload flow:

### Test Checklist
- [ ] **Upload**: Select a small JPG image (512x512px, < 500KB)
- [ ] **Preview**: Verify image preview appears immediately
- [ ] **Save**: Click "Save Changes" button
- [ ] **Success**: Verify success toast appears
- [ ] **Refresh**: Reload the page (F5)
- [ ] **Persistence**: Verify avatar image persists after refresh
- [ ] **URL**: Check that `profilePhoto` field in database contains Wix Media URL

### Verification Steps
1. **Check Database**:
   ```typescript
   // In browser console on /trainer/profile page
   const profile = await BaseCrudService.getAll('trainerprofiles');
   console.log('Profile photo URL:', profile.items[0]?.profilePhoto);
   ```
2. **Verify URL Format**:
   - Should be: `https://static.wixstatic.com/media/...`
   - Should NOT be: `blob:http://...` (temporary preview URL)
3. **Test Image Loading**:
   - Open the URL directly in browser
   - Should display the uploaded image
   - Should NOT show 404 or access denied

---

## Step 4: Common Fixes Summary

### Quick Fixes (Try These First)
1. **Sign out and sign back in** (fixes 80% of auth issues)
2. **Use a small JPG** (< 500KB, 512x512px)
3. **Clear browser cache** and reload
4. **Publish the site** to deploy backend changes

### Environment-Specific Fixes
- **Preview/Dev**: Ensure using `/_functions-dev/uploadProfilePhoto`
- **Production**: Ensure using `/_functions/uploadProfilePhoto`
- **Check hostname detection**: Verify `isPreviewEnvironment()` returns correct value

### Backend Function Fixes
1. **Verify function name**: Must be `post_uploadProfilePhoto`
2. **Check return format**: Must return JSON with proper headers
3. **Add error handling**: Wrap in try-catch and return JSON errors
4. **Test locally**: Use Wix CLI to test backend function locally

---

## Step 5: Enhanced Debugging

If issues persist, enable additional debugging:

### Frontend Debugging
```typescript
// Add to TrainerProfilePage.tsx before upload
console.log('=== Upload Debug Info ===');
console.log('Member:', member);
console.log('Member ID:', member?._id);
console.log('File:', file);
console.log('File size:', file.size);
console.log('File type:', file.type);
console.log('Upload URL:', uploadUrl);
console.log('Environment:', isPreviewEnvironment() ? 'Preview' : 'Production');
console.log('Hostname:', window.location.hostname);
console.log('========================');
```

### Backend Debugging
```typescript
// Add to uploadProfilePhoto.ts
export async function post_uploadProfilePhoto(request: any): Promise<any> {
  console.log('=== Backend Upload Debug ===');
  console.log('Request headers:', request.headers);
  console.log('Content-Type:', request.headers['content-type']);
  console.log('Request body keys:', Object.keys(request.body || {}));
  console.log('File present:', !!request.body?.file);
  console.log('===========================');
  
  // ... rest of function
}
```

---

## Step 6: Contact Support

If all fixes fail, provide this information to support:

### Required Information
1. **Captured Network Request Details** (from Step 1)
2. **Browser Console Logs** (full output)
3. **Backend Function Logs** (from Wix Editor)
4. **Environment Details**:
   - Browser: _______________________
   - OS: _______________________
   - Wix Site URL: _______________________
   - Preview or Production: _______________________
5. **Steps to Reproduce**:
   - Detailed steps that lead to the error
   - File details (size, type, dimensions)
6. **Screenshots**:
   - Network tab showing failed request
   - Console showing error messages
   - Backend logs showing errors

---

## Success Criteria

Upload is working correctly when:
- ✅ Status Code: 200
- ✅ Content-Type: `application/json`
- ✅ Response contains: `{ success: true, url: "https://static.wixstatic.com/media/..." }`
- ✅ Image preview appears immediately
- ✅ Image persists after page refresh
- ✅ Database contains Wix Media URL (not blob URL)
- ✅ Avatar displays correctly on all pages

---

## Additional Resources

- **Wix Media Manager Docs**: https://dev.wix.com/docs/velo/api-reference/wix-media-backend
- **Wix HTTP Functions Docs**: https://dev.wix.com/docs/velo/api-reference/wix-http-functions
- **Backend Config**: `/src/lib/backend-config.ts`
- **Upload Function**: `/src/wix-verticals/backend/uploadProfilePhoto.ts`
- **Profile Page**: `/src/components/pages/TrainerDashboard/TrainerProfilePage.tsx`
