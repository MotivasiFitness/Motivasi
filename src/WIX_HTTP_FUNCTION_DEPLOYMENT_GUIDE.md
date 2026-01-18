# Wix HTTP Function Deployment Guide - CRITICAL FIX

## Problem Statement

The `/_functions-dev/uploadProfilePhoto` endpoint is returning HTML (homepage) instead of JSON because **the HTTP function is not deployed in the Wix backend**.

Currently, the TypeScript file exists at `/src/wix-verticals/backend/uploadProfilePhoto.ts`, but this is NOT where Wix looks for HTTP functions.

## Solution: Deploy to Wix Backend

### Step 1: Open Wix Editor

1. Go to your Wix site dashboard
2. Click "Edit Site" to open the Wix Editor
3. Enable Dev Mode (if not already enabled)

### Step 2: Create HTTP Functions File

In the Wix Editor:

1. Open the **Code Files** panel (left sidebar)
2. Navigate to **Backend** section
3. Create a new file called `http-functions.js` (or `http-functions.ts`)
   - Path should be: `backend/http-functions.js`
   - This is the ONLY location Wix recognizes for HTTP functions

### Step 3: Copy the HTTP Function Code

Copy the following code into `backend/http-functions.js`:

```javascript
/**
 * Wix HTTP Functions
 * 
 * CRITICAL: This file MUST be at backend/http-functions.js for Wix to recognize it.
 * Functions are automatically exposed at:
 * - Development: /_functions-dev/<functionName>
 * - Production: /_functions/<functionName>
 */

import { ok, badRequest, serverError, unauthorized } from 'wix-http-functions';
import wixMediaBackend from 'wix-media-backend';

// Helper to create JSON response
function jsonResponse(statusCode, body) {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Upload Profile Photo Endpoint
 * POST /_functions/uploadProfilePhoto
 * POST /_functions-dev/uploadProfilePhoto (development)
 */
export async function post_uploadProfilePhoto(request) {
  try {
    console.log('=== Upload Profile Photo Backend ===');
    console.log('Request method:', request.method);
    console.log('Request headers:', JSON.stringify(request.headers, null, 2));
    
    // Parse the request body
    const contentType = request.headers['content-type'] || request.headers['Content-Type'] || '';
    console.log('Content-Type:', contentType);
    
    if (!contentType.includes('multipart/form-data')) {
      console.error('Invalid Content-Type:', contentType);
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'Content-Type must be multipart/form-data'
      });
    }

    // Get the file from the request
    const file = request.body?.file;
    console.log('File present:', !!file);
    
    if (!file) {
      console.error('No file in request body');
      console.error('Available body keys:', request.body ? Object.keys(request.body) : 'none');
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'No file provided in request'
      });
    }

    console.log('File details:', {
      name: file.name || 'unknown',
      size: file.size || 0,
      type: file.type || 'unknown'
    });

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const fileSize = file.size || 0;
    if (fileSize > maxSize) {
      console.error('File too large:', fileSize, 'bytes');
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: `File size must be less than 5MB (current: ${(fileSize / 1024 / 1024).toFixed(2)}MB)`
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileType = (file.type || '').toLowerCase();
    if (!allowedTypes.includes(fileType)) {
      console.error('Invalid file type:', fileType);
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: `File type must be JPG, PNG, or WebP (current: ${fileType || 'unknown'})`
      });
    }

    console.log('Starting upload to Wix Media Manager...');
    
    // Upload to Wix Media Manager
    const uploadResult = await wixMediaBackend.upload(
      '/trainer-profiles',
      file,
      file.name || 'profile-photo.jpg',
      {
        mediaType: 'image',
        mimeType: fileType
      }
    );

    console.log('Upload successful!');
    console.log('Upload result:', JSON.stringify(uploadResult, null, 2));
    
    // Extract the file URL from the upload result
    const uploadedUrl = uploadResult.fileUrl || uploadResult.url;
    console.log('Extracted URL:', uploadedUrl);

    if (!uploadedUrl) {
      console.error('No URL in upload result:', uploadResult);
      return jsonResponse(500, {
        success: false,
        statusCode: 500,
        error: 'Upload succeeded but no URL was returned from Wix Media Manager'
      });
    }

    // Return the uploaded file URL
    return jsonResponse(200, {
      success: true,
      statusCode: 200,
      url: uploadedUrl
    });

  } catch (error) {
    console.error('=== Upload Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific errors
    if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
      return jsonResponse(401, {
        success: false,
        statusCode: 401,
        error: 'Unauthorized: You do not have permission to upload files'
      });
    }

    if (error.message?.includes('size') || error.message?.includes('too large')) {
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'File size exceeds maximum allowed size'
      });
    }

    return jsonResponse(500, {
      success: false,
      statusCode: 500,
      error: error.message || 'Failed to upload file to Wix Media Manager'
    });
  }
}

/**
 * CORS Preflight Handler for uploadProfilePhoto
 * OPTIONS /_functions/uploadProfilePhoto
 */
export async function options_uploadProfilePhoto(request) {
  return {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
}

/**
 * Health Check Endpoint
 * GET /_functions/health
 * GET /_functions-dev/health (development)
 */
export async function get_health(request) {
  return jsonResponse(200, {
    success: true,
    statusCode: 200,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Wix HTTP Functions are operational'
  });
}
```

### Step 4: Publish to Preview

1. In the Wix Editor, click **Preview** (top right)
2. Wait for the site to build and deploy
3. The HTTP functions will now be available at:
   - `/_functions-dev/uploadProfilePhoto` (development)
   - `/_functions-dev/health` (development)

### Step 5: Verify the Endpoint

Open your browser's Developer Tools (F12) and test the endpoint:

#### Test 1: Health Check (Simple GET request)

```javascript
fetch('/_functions-dev/health')
  .then(r => r.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Error:', err));
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "status": "healthy",
  "timestamp": "2026-01-18T...",
  "message": "Wix HTTP Functions are operational"
}
```

**CRITICAL CHECK:** The response must have `Content-Type: application/json` header, NOT `text/html`.

#### Test 2: Upload Endpoint (Direct URL)

Open this URL in your browser:
```
https://your-site.wixsite.com/your-site/_functions-dev/uploadProfilePhoto
```

**Expected Response:**
- Should return JSON (even if it's an error about missing file)
- Should NOT return HTML homepage
- Content-Type header should be `application/json`

**If you see HTML:** The function is not deployed correctly. Go back to Step 2.

### Step 6: Test with File Upload

Once the endpoint returns JSON (not HTML), test the actual upload:

```javascript
// Create a test file
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
  
  const result = await response.json();
  console.log('Upload result:', result);
};
input.click();
```

### Step 7: Publish to Live

Once verified in Preview:

1. Click **Publish** in the Wix Editor
2. The functions will be available at:
   - `/_functions/uploadProfilePhoto` (production)
   - `/_functions/health` (production)

## Verification Checklist

- [ ] File created at `backend/http-functions.js` in Wix Editor
- [ ] Code copied from this guide
- [ ] Site published to Preview
- [ ] `/_functions-dev/health` returns JSON (not HTML)
- [ ] `/_functions-dev/uploadProfilePhoto` returns JSON (not HTML)
- [ ] Network tab shows `Content-Type: application/json`
- [ ] File upload test succeeds
- [ ] Site published to Live

## Common Issues

### Issue 1: Still Getting HTML

**Cause:** The file is not in the correct location or not published.

**Solution:**
1. Verify file is at `backend/http-functions.js` (not in any subfolder)
2. Re-publish to Preview
3. Hard refresh the browser (Ctrl+Shift+R)
4. Check Wix Editor console for errors

### Issue 2: Function Not Found

**Cause:** Function name doesn't match the URL.

**Solution:**
- URL `/_functions/uploadProfilePhoto` requires function `post_uploadProfilePhoto`
- URL `/_functions/health` requires function `get_health`
- Function names must be: `<method>_<functionName>`

### Issue 3: CORS Errors

**Cause:** Missing OPTIONS handler or CORS headers.

**Solution:**
- Ensure `options_uploadProfilePhoto` function exists
- Verify CORS headers in all responses
- Check browser console for specific CORS error

## Alternative: Non-Wix Backend

If Wix HTTP Functions continue to fail, you can deploy to an external backend:

1. Deploy to Vercel/Netlify/AWS Lambda
2. Update `src/lib/backend-config.ts`:
   ```typescript
   export const BACKEND_CONFIG = {
     uploadPhotoEndpoint: 'https://your-api.vercel.app/api/uploadProfilePhoto'
   };
   ```

## Resources

- [Wix HTTP Functions Documentation](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/http-functions)
- [Wix Media Backend API](https://www.wix.com/velo/reference/wix-media-backend)
- [Wix Velo Reference](https://www.wix.com/velo/reference)

## Next Steps

After completing this deployment:

1. Take a screenshot of the Network tab showing `Content-Type: application/json` for `/_functions-dev/uploadProfilePhoto`
2. Test the profile photo upload feature in the Trainer Profile page
3. Verify the uploaded image appears in Wix Media Manager
4. Confirm the image URL is saved to the trainer profile

---

**CRITICAL:** Until `/_functions-dev/uploadProfilePhoto` returns JSON (not HTML), the upload feature CANNOT work. This is the root cause of the issue.
