# Trainer Profile Photo Upload - Debug & Fix Guide

## Overview
This guide helps diagnose and fix issues with the trainer profile photo upload functionality. The upload process involves client-side image processing, backend upload to Wix Media Manager, and database persistence.

---

## 🔍 Step 1: Capture Network Request Details

### Open Browser DevTools
1. Navigate to **Trainer Profile** page (`/trainer/profile`)
2. Open DevTools (F12 or Right-click → Inspect)
3. Go to **Network** tab
4. Clear existing logs (🚫 icon)
5. Check "Preserve log" to keep requests after navigation

### Upload a Photo
1. Click "Upload Photo" button
2. Select an image file (JPG/PNG/WebP, under 5MB)
3. Wait for upload to complete (or fail)

### Capture These Details

#### Request Details
Look for the request named `uploadProfilePhoto` in the Network tab:

**Request URL:**
```
Expected: /_functions-dev/uploadProfilePhoto (preview)
Expected: /_functions/uploadProfilePhoto (production)
Actual: _______________
```

**Request Method:**
```
Expected: POST
Actual: _______________
```

**Request Headers:**
```
Content-Type: multipart/form-data; boundary=...
(Check if present)
```

**Request Payload:**
```
Form Data:
  file: [File object]
  (Check if file is present in payload)
```

#### Response Details

**Status Code:**
```
Expected: 200 (success) or 400/401/500 (error)
Actual: _______________
```

**Response Headers:**
```
Content-Type: _______________
Expected: application/json
```

**Response Body:**
```
Success format:
{
  "success": true,
  "statusCode": 200,
  "url": "https://static.wixstatic.com/media/..."
}

Error format:
{
  "success": false,
  "statusCode": 400/401/500,
  "error": "Error message"
}

Actual: _______________
```

#### Console Logs
Check the browser console for these logs:

```
[Backend Config] { functionName, environment, basePath, endpoint, hostname }
[Upload] Starting upload to: ...
[Upload] File name: ...
[Upload] Blob size: ... bytes
[Upload] Blob type: ...
[Upload] Response status: ...
[Upload] Response status text: ...
[Upload] Response URL: ...
[Upload] Response headers: ...
[Upload] Response data: ...
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Response is HTML instead of JSON

**Symptoms:**
- Content-Type: `text/html` instead of `application/json`
- Response body contains HTML error page
- Console error: "Unable to process request"

**Causes:**
- Backend function not deployed
- Wrong endpoint path (missing `-dev` in preview)
- Function routing error

**Solutions:**

1. **Verify Backend Function Deployment:**
   - Check Wix Dashboard → Dev Mode → Backend
   - Ensure `uploadProfilePhoto.ts` is in `src/wix-verticals/backend/`
   - Redeploy if necessary

2. **Check Environment Detection:**
   ```typescript
   // In browser console:
   console.log('Hostname:', window.location.hostname);
   console.log('Is Preview:', window.location.hostname.includes('preview'));
   ```

3. **Verify Endpoint Path:**
   ```typescript
   // Should log correct path based on environment
   import { getBackendEndpoint, BACKEND_FUNCTIONS } from '@/lib/backend-config';
   console.log(getBackendEndpoint(BACKEND_FUNCTIONS.UPLOAD_PROFILE_PHOTO));
   ```

---

### Issue 2: 401 Unauthorized

**Symptoms:**
- Status code: 401
- Response: `{ "success": false, "statusCode": 401, "error": "Unauthorized..." }`

**Causes:**
- User not logged in
- Session expired
- Missing authentication token

**Solutions:**

1. **Verify User Authentication:**
   ```typescript
   // In browser console:
   import { useMember } from '@/integrations';
   const { member, isAuthenticated } = useMember();
   console.log('Member:', member);
   console.log('Is Authenticated:', isAuthenticated);
   ```

2. **Re-login:**
   - Log out and log back in
   - Clear browser cookies and cache
   - Try in incognito mode

3. **Check Backend Function Permissions:**
   - Ensure function doesn't require specific roles
   - Verify Wix Members SDK is properly initialized

---

### Issue 3: 400 Bad Request

**Symptoms:**
- Status code: 400
- Response: `{ "success": false, "statusCode": 400, "error": "..." }`

**Causes:**
- File too large (>5MB)
- Invalid file type
- Missing file in request
- Corrupted file data

**Solutions:**

1. **Validate File Before Upload:**
   ```typescript
   // Check file size
   const maxSize = 5 * 1024 * 1024; // 5MB
   if (file.size > maxSize) {
     console.error('File too large:', file.size, 'bytes');
   }

   // Check file type
   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
   if (!allowedTypes.includes(file.type)) {
     console.error('Invalid file type:', file.type);
   }
   ```

2. **Check FormData:**
   ```typescript
   // In browser console during upload:
   const formData = new FormData();
   formData.append('file', blob, fileName);
   console.log('FormData entries:', Array.from(formData.entries()));
   ```

3. **Test with Different Image:**
   - Try a smaller image (<1MB)
   - Try a different format (JPG instead of PNG)
   - Use a simple test image

---

### Issue 4: 500 Internal Server Error

**Symptoms:**
- Status code: 500
- Response: `{ "success": false, "statusCode": 500, "error": "..." }`

**Causes:**
- Backend function error
- Wix Media Manager API error
- Missing dependencies

**Solutions:**

1. **Check Backend Function Logs:**
   - Go to Wix Dashboard → Dev Mode → Logs
   - Look for errors in `uploadProfilePhoto` function
   - Check for stack traces

2. **Verify Wix Media Backend Import:**
   ```typescript
   // In uploadProfilePhoto.ts
   import wixMediaBackend from 'wix-media-backend';
   ```

3. **Test Media Manager Permissions:**
   - Ensure site has Media Manager enabled
   - Check Wix Media Manager quota/limits

4. **Simplify Backend Function:**
   - Remove optional parameters
   - Test with minimal upload configuration

---

### Issue 5: Upload Succeeds but Photo Doesn't Persist

**Symptoms:**
- Upload returns success (200)
- Photo shows in preview
- After page refresh, photo is gone
- Sidebar avatar doesn't update

**Causes:**
- Profile not saved to database
- URL not stored in `trainerprofiles.profilePhoto`
- Event listener not triggered

**Solutions:**

1. **Verify Save Profile is Called:**
   ```typescript
   // After upload, check if Save Profile button is clicked
   // Upload only updates formData, not database
   ```

2. **Check Database Update:**
   ```typescript
   // In browser console after saving:
   import { BaseCrudService } from '@/integrations';
   const { items } = await BaseCrudService.getAll('trainerprofiles');
   const profile = items.find(p => p.memberId === 'YOUR_MEMBER_ID');
   console.log('Profile Photo URL:', profile?.profilePhoto);
   ```

3. **Verify Event Dispatch:**
   ```typescript
   // In TrainerProfilePage.tsx handleSave():
   window.dispatchEvent(new CustomEvent('trainerProfileUpdated'));
   ```

4. **Check Event Listener:**
   ```typescript
   // In TrainerDashboardLayout.tsx:
   window.addEventListener('trainerProfileUpdated', handleProfileUpdate);
   ```

---

### Issue 6: CORS Errors

**Symptoms:**
- Console error: "CORS policy blocked"
- Network tab shows request as "CORS error"

**Causes:**
- Missing CORS headers in backend
- OPTIONS preflight request failing

**Solutions:**

1. **Verify CORS Headers in Backend:**
   ```typescript
   // In uploadProfilePhoto.ts
   headers: {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type, Authorization'
   }
   ```

2. **Check OPTIONS Handler:**
   ```typescript
   // Ensure this exists in uploadProfilePhoto.ts
   export async function options_uploadProfilePhoto(request: any): Promise<any> {
     return {
       status: 200,
       headers: { /* CORS headers */ }
     };
   }
   ```

---

## ✅ Success Criteria Checklist

After fixing, verify these work:

- [ ] Upload returns `Content-Type: application/json`
- [ ] Upload returns status 200 with `{ success: true, url: "..." }`
- [ ] Photo preview updates immediately after upload
- [ ] Clicking "Save Profile" persists photo to database
- [ ] After page refresh, photo still shows in profile
- [ ] Sidebar avatar updates to show new photo
- [ ] Photo URL is saved in `trainerprofiles.profilePhoto` field

---

## 🔧 Testing Workflow

### 1. Test Upload Endpoint
```bash
# Test if endpoint is accessible
curl -X OPTIONS http://your-site.com/_functions-dev/uploadProfilePhoto

# Expected: 200 OK with CORS headers
```

### 2. Test File Upload
```javascript
// In browser console:
const testUpload = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/_functions-dev/uploadProfilePhoto', {
      method: 'POST',
      body: formData
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    const data = await response.json();
    console.log('Data:', data);
  };
  input.click();
};

testUpload();
```

### 3. Test Database Persistence
```javascript
// In browser console after upload + save:
import { BaseCrudService } from '@/integrations';
import { useMember } from '@/integrations';

const { member } = useMember();
const { items } = await BaseCrudService.getAll('trainerprofiles');
const profile = items.find(p => p.memberId === member._id);

console.log('Profile Photo:', profile?.profilePhoto);
console.log('Expected: https://static.wixstatic.com/media/...');
```

---

## 📝 Implementation Details

### Client-Side Flow (TrainerProfilePage.tsx)

1. **File Selection** → `handleFileSelect()`
   - Validates file type and size
   - Compresses and crops to 512x512px
   - Creates preview URL

2. **Upload** → `uploadImageToWix()`
   - Creates FormData with compressed blob
   - Gets endpoint via `getBackendEndpoint()`
   - Sends POST request
   - Validates JSON response
   - Returns uploaded URL

3. **Update State**
   - Sets `formData.profilePhoto` to uploaded URL
   - Updates `photoPreview`
   - Shows success message

4. **Save Profile** → `handleSave()`
   - Calls `BaseCrudService.update()` or `create()`
   - Saves `profilePhoto` to database
   - Dispatches `trainerProfileUpdated` event
   - Reloads profile data

### Backend Flow (uploadProfilePhoto.ts)

1. **Validate Request**
   - Check Content-Type is multipart/form-data
   - Extract file from request.body

2. **Validate File**
   - Check file size (<5MB)
   - Check file type (JPG/PNG/WebP)

3. **Upload to Wix**
   - Call `wixMediaBackend.upload()`
   - Upload to `/trainer-profiles` folder
   - Get public URL

4. **Return Response**
   - Always return JSON
   - Include success flag and URL
   - Handle errors gracefully

### Sidebar Update Flow (TrainerDashboardLayout.tsx)

1. **Load Profile** → `loadTrainerProfile()`
   - Fetches trainer profile from database
   - Sets `trainerProfile` state

2. **Listen for Updates**
   - Event listener for `trainerProfileUpdated`
   - Reloads profile when event fires

3. **Display Avatar**
   - Shows `trainerProfile.profilePhoto`
   - Falls back to `member.profile.photo.url`
   - Shows initials if no photo

---

## 🚀 Quick Fix Checklist

If upload is completely broken:

1. **Check backend function exists:**
   - File: `/src/wix-verticals/backend/uploadProfilePhoto.ts`
   - Exports: `post_uploadProfilePhoto` and `options_uploadProfilePhoto`

2. **Verify environment detection:**
   - Preview: `/_functions-dev/uploadProfilePhoto`
   - Production: `/_functions/uploadProfilePhoto`

3. **Test with minimal code:**
   - Remove image compression temporarily
   - Upload original file directly
   - Check if basic upload works

4. **Check Wix configuration:**
   - Media Manager enabled
   - Backend functions enabled
   - Correct permissions set

5. **Clear cache and redeploy:**
   - Clear browser cache
   - Redeploy backend functions
   - Test in incognito mode

---

## 📞 Support Resources

- **Wix Velo Documentation:** https://www.wix.com/velo/reference
- **Wix Media Backend API:** https://www.wix.com/velo/reference/wix-media-backend
- **Wix HTTP Functions:** https://www.wix.com/velo/reference/wix-http-functions

---

## 📊 Expected Network Request Example

### Successful Upload

**Request:**
```
POST /_functions-dev/uploadProfilePhoto
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

------WebKitFormBoundary...
Content-Disposition: form-data; name="file"; filename="profile.jpg"
Content-Type: image/jpeg

[Binary data]
------WebKitFormBoundary...--
```

**Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "success": true,
  "statusCode": 200,
  "url": "https://static.wixstatic.com/media/abc123_def456~mv2.jpg"
}
```

---

## 🎯 Next Steps

1. **Capture network details** using the steps above
2. **Identify the issue** from the common issues section
3. **Apply the solution** for your specific issue
4. **Verify success** using the checklist
5. **Test thoroughly** with different images and scenarios

If issues persist after trying all solutions, provide:
- Network request/response details
- Console logs
- Backend function logs from Wix Dashboard
- Environment details (preview/production)
