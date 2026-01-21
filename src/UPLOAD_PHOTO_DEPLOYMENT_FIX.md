# Upload Profile Photo - HTML Response Fix

## Problem
You're getting the error: **"Received HTML instead of JSON. The Wix HTTP function is not deployed/routing correctly."**

This means the backend function `uploadProfilePhoto` is not properly deployed in your Wix site.

---

## Root Cause
The backend code exists in your codebase at `/src/wix-verticals/backend/uploadProfilePhoto.ts`, but **Wix doesn't automatically deploy these files**. You need to manually create the HTTP function in the Wix Editor.

---

## Solution: Deploy Backend Function in Wix Editor

### Step 1: Open Wix Editor
1. Go to your Wix Dashboard
2. Click **"Edit Site"** to open the Wix Editor
3. Enable **Dev Mode** if not already enabled (top bar)

### Step 2: Create Backend HTTP Functions File

In the Wix Editor:

1. Open the **Code Files** panel (left sidebar, looks like `</>`)
2. Click **"Backend"** section
3. Look for a file called `http-functions.js`
   - If it exists, open it
   - If it doesn't exist, create it: Click **"+ New File"** → **"Backend"** → Name it `http-functions.js`

**CRITICAL:** The file MUST be named exactly `http-functions.js` and be in the `backend/` folder (not in any subfolder).

### Step 3: Add the Upload Function Code

Copy and paste this code into `backend/http-functions.js`:

```javascript
import { ok, badRequest, serverError } from 'wix-http-functions';
import { mediaManager } from 'wix-media-backend';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS handler for CORS preflight
export function options_uploadProfilePhoto() {
  return ok({ success: true, statusCode: 200 }, { headers: JSON_HEADERS });
}

// POST handler for image upload
export async function post_uploadProfilePhoto(request) {
  try {
    console.log('=== Upload Profile Photo ===');
    
    // Parse JSON body
    const raw = await request.body.text();
    const data = raw ? JSON.parse(raw) : {};
    
    const fileName = String(data.fileName || 'profile-photo.jpg');
    const fallbackMime = String(data.mimeType || '');
    let base64Input = data.base64;
    
    if (!base64Input) {
      return badRequest(
        { success: false, statusCode: 400, error: 'Missing base64 image data' },
        { headers: JSON_HEADERS }
      );
    }
    
    // Extract base64 and mime type from data URL if present
    let mimeType = fallbackMime;
    let base64 = base64Input;
    
    if (typeof base64Input === 'string') {
      const match = base64Input.match(/^data:(.+);base64,(.*)$/);
      if (match) {
        mimeType = match[1];
        base64 = match[2];
      }
    }
    
    // Normalize mime type
    mimeType = mimeType.toLowerCase();
    if (mimeType === 'image/jpg') {
      mimeType = 'image/jpeg';
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      return badRequest(
        {
          success: false,
          statusCode: 400,
          error: `File type must be JPG, PNG, or WebP (current: ${mimeType || 'unknown'})`,
        },
        { headers: JSON_HEADERS }
      );
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64, 'base64');
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return badRequest(
        {
          success: false,
          statusCode: 400,
          error: `File size must be less than 5MB (current: ${(buffer.length / 1024 / 1024).toFixed(2)}MB)`,
        },
        { headers: JSON_HEADERS }
      );
    }
    
    console.log('Uploading to Media Manager...', { fileName, mimeType, bytes: buffer.length });
    
    // Upload to Wix Media Manager
    const result = await mediaManager.upload('/trainer-profiles', buffer, fileName, {
      mediaOptions: {
        mimeType,
        mediaType: 'image',
      },
    });
    
    const url = result?.fileUrl || result?.url;
    if (!url) {
      return serverError(
        { success: false, statusCode: 500, error: 'Upload succeeded but no URL was returned' },
        { headers: JSON_HEADERS }
      );
    }
    
    console.log('Upload success URL:', url);
    
    return ok({ success: true, statusCode: 200, url }, { headers: JSON_HEADERS });
  } catch (err) {
    console.error('Upload failed:', err);
    return serverError(
      { success: false, statusCode: 500, error: err?.message || 'Failed to upload profile photo' },
      { headers: JSON_HEADERS }
    );
  }
}
```

### Step 4: Save and Publish

1. **Save** the file (Ctrl+S or Cmd+S)
2. **Publish** your site (top right corner in Wix Editor)
   - This deploys the backend function to both preview and production environments

---

## Step 5: Test the Function

### Test in Preview Mode

1. After publishing, click **"Preview"** in the Wix Editor
2. Navigate to the Trainer Profile page
3. Try uploading a profile photo
4. Open browser DevTools (F12) → Console tab
5. Look for upload logs - should see JSON response, not HTML

### Test Endpoint Directly

Open browser console and run:

```javascript
// Test if endpoint is accessible
fetch('/_functions-dev/uploadProfilePhoto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: 'test.jpg',
    mimeType: 'image/jpeg',
    base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...' // truncated for example
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "url": "https://static.wixstatic.com/media/..."
}
```

**If you still get HTML:**
- The function is not deployed correctly
- Check the file name is exactly `http-functions.js`
- Check it's in the `backend/` folder (not `backend/http-functions/`)
- Try publishing again

---

## Common Issues & Solutions

### Issue 1: "Function not found" or 404 Error
**Solution:** 
- Verify file is named `http-functions.js` (not `http-functions.ts` or any other name)
- Verify it's in the `backend/` folder
- Publish the site again

### Issue 2: Still Getting HTML Response
**Solution:**
- Clear browser cache
- Try in incognito/private window
- Wait 1-2 minutes after publishing for changes to propagate
- Check Wix Editor → Dev Mode → Backend Logs for errors

### Issue 3: CORS Errors
**Solution:**
- The `options_uploadProfilePhoto` function handles CORS
- Make sure both `options_` and `post_` functions are exported
- Verify CORS headers are set correctly

### Issue 4: "mediaManager is not defined"
**Solution:**
- In Wix Editor, go to **Code Files** → **Package Manager**
- Verify `wix-media-backend` is installed
- If not, add it: Click **"+ Add Package"** → Search for `wix-media-backend` → Install

---

## Verification Checklist

- [ ] File created at `backend/http-functions.js` in Wix Editor
- [ ] Both `options_uploadProfilePhoto` and `post_uploadProfilePhoto` functions are exported
- [ ] Site published after adding the function
- [ ] Test upload returns JSON (not HTML)
- [ ] Image appears in Wix Media Manager after upload
- [ ] Profile photo displays correctly after upload

---

## Alternative: Use Consolidated HTTP Functions

If you already have other backend functions, you can add the upload function to your existing `http-functions.js` file. Just make sure to:

1. Keep the existing functions
2. Add the `options_uploadProfilePhoto` and `post_uploadProfilePhoto` exports
3. Ensure no duplicate function names

---

## Need More Help?

If the issue persists after following these steps:

1. **Check Backend Logs:**
   - Wix Editor → Dev Mode → Backend Logs
   - Look for errors when the upload is triggered

2. **Check Network Tab:**
   - Browser DevTools → Network tab
   - Find the `uploadProfilePhoto` request
   - Check the Response tab - what HTML is being returned?
   - Check the Request URL - is it correct?

3. **Verify Environment Detection:**
   - Console log: `console.log(window.location.hostname)`
   - Should use `/_functions-dev/` for preview
   - Should use `/_functions/` for production

4. **Contact Wix Support:**
   - If backend functions aren't working at all
   - Provide them with the function name and error details

---

## Summary

The key issue is that **backend functions must be manually created in the Wix Editor** - they don't automatically deploy from your codebase. Once you create `backend/http-functions.js` with the upload function and publish your site, the image upload should work correctly and return JSON responses.
