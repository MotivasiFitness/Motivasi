# Backend Functions Routing Fix

## Problem
The `/_functions/uploadProfilePhoto` and `/_functions-dev/uploadProfilePhoto` endpoints are serving the homepage HTML instead of executing the backend function and returning JSON.

## Root Cause
The Astro catch-all route `[...slug].astro` is intercepting ALL requests, including those meant for backend functions. This causes backend function URLs to serve the React app instead of executing the backend code.

## Architecture Overview

### Wix Backend Functions
Wix uses a specific convention for backend HTTP functions:
- **Development/Preview**: `/_functions-dev/{functionName}`
- **Production**: `/_functions/{functionName}`

These paths are handled by Wix's infrastructure and should NOT be processed by the frontend routing system.

### Current File Structure
```
/src/wix-verticals/backend/
  ├── uploadProfilePhoto.ts      ✅ Correct location
  ├── generateProgram.ts          ✅ Correct location
  ├── generateProgramDescription.ts ✅ Correct location
  ├── health.ts                   ✅ Correct location
  └── regenerateProgramSection.ts ✅ Correct location
```

## Solution

### 1. Wix Configuration (wix.config.json)
The Wix platform should automatically handle `/_functions/*` routing. Verify that your `wix.config.json` (in project root) includes backend function configuration.

**Expected configuration:**
```json
{
  "backend": {
    "enabled": true,
    "functions": {
      "directory": "src/wix-verticals/backend"
    }
  }
}
```

### 2. Astro Configuration
Astro's catch-all route should NOT intercept backend function paths. This is typically handled by the Wix platform layer, but we need to ensure our Astro config doesn't interfere.

**Check `astro.config.mjs` for:**
- No custom middleware that intercepts `/_functions/*`
- No rewrites that redirect these paths
- SSR mode should be properly configured

### 3. Deployment Verification

After deployment, verify the routing:

**Test in Browser DevTools:**
```javascript
// Open DevTools Console and run:
fetch('/_functions-dev/health', { method: 'GET' })
  .then(r => r.json())
  .then(data => console.log('✅ Backend working:', data))
  .catch(err => console.error('❌ Backend failed:', err));
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Backend functions are operational",
  "timestamp": "2026-01-18T..."
}
```

**If you get HTML instead:**
- The catch-all route is intercepting the request
- Backend functions are not deployed
- Wix configuration is incorrect

### 4. Network Tab Verification

1. Open DevTools → Network tab
2. Trigger a photo upload
3. Find the `uploadProfilePhoto` request
4. Verify:
   - **Request URL**: Should be `/_functions-dev/uploadProfilePhoto` (preview) or `/_functions/uploadProfilePhoto` (prod)
   - **Response Headers**: Should include `Content-Type: application/json`
   - **Response Body**: Should be JSON, not HTML

**If Response is HTML:**
```html
<!DOCTYPE html>
<html lang="en" class="w-full h-full">
  <head>...</head>
  <body>
    <div id="root" class="w-full h-full">
      <!-- React app -->
    </div>
  </body>
</html>
```
This means the Astro catch-all route is serving the React app instead of the backend function.

## Implementation Checklist

### ✅ Already Implemented
- [x] Backend function exists at correct location
- [x] Function exports match Wix naming convention (`post_uploadProfilePhoto`)
- [x] Function returns JSON with proper headers
- [x] Frontend uses environment-aware endpoint detection (`backend-config.ts`)
- [x] CORS headers are properly set
- [x] OPTIONS handler for preflight requests

### 🔧 Needs Verification
- [ ] `wix.config.json` includes backend configuration
- [ ] Astro config doesn't intercept `/_functions/*` paths
- [ ] Backend functions are deployed to Wix servers
- [ ] `/_functions-dev/health` endpoint returns JSON (not HTML)
- [ ] Network tab shows `application/json` content-type

### 📝 Deployment Steps
1. **Verify Wix Configuration**
   ```bash
   # Check if wix.config.json exists in project root
   cat wix.config.json
   ```

2. **Deploy Backend Functions**
   - Wix automatically deploys files in `src/wix-verticals/backend/`
   - Ensure you're using Wix CLI or Wix Editor for deployment
   - Backend functions are NOT deployed via standard Astro build

3. **Test Health Endpoint**
   ```bash
   # Preview environment
   curl https://[your-site].wixsite.com/_functions-dev/health
   
   # Production environment
   curl https://[your-domain].com/_functions/health
   ```

4. **Test Upload Endpoint**
   ```bash
   # Use Postman or curl with multipart/form-data
   curl -X POST https://[your-site].wixsite.com/_functions-dev/uploadProfilePhoto \
     -F "file=@/path/to/image.jpg"
   ```

## Common Issues & Solutions

### Issue 1: HTML Response Instead of JSON
**Symptom:** Backend function URL returns HTML page
**Cause:** Astro catch-all route intercepting request
**Solution:** Verify Wix platform configuration handles `/_functions/*` routing

### Issue 2: 404 Not Found
**Symptom:** Backend function URL returns 404
**Cause:** Backend functions not deployed
**Solution:** Deploy via Wix CLI or Editor, not Astro build

### Issue 3: CORS Errors
**Symptom:** Browser blocks request with CORS error
**Cause:** Missing CORS headers or OPTIONS handler
**Solution:** Already implemented in `uploadProfilePhoto.ts` (lines 40-43, 197-206)

### Issue 4: Wrong Environment Path
**Symptom:** Request goes to wrong endpoint
**Cause:** Environment detection failing
**Solution:** Already handled by `backend-config.ts` - verify with:
```javascript
import { getBackendEndpoint, isPreviewEnvironment } from '@/lib/backend-config';
console.log('Environment:', isPreviewEnvironment() ? 'preview' : 'production');
console.log('Upload URL:', getBackendEndpoint('uploadProfilePhoto'));
```

## Wix Platform Requirements

### File Naming Convention
Backend HTTP functions MUST follow this pattern:
- File name: `{functionName}.ts` or `{functionName}.js`
- Export name: `{method}_{functionName}`
- Example: `uploadProfilePhoto.ts` exports `post_uploadProfilePhoto`

### Supported Methods
- `get_{functionName}` - GET requests
- `post_{functionName}` - POST requests
- `put_{functionName}` - PUT requests
- `delete_{functionName}` - DELETE requests
- `options_{functionName}` - OPTIONS requests (CORS preflight)

### Response Format
All backend functions MUST return:
```typescript
{
  status: number,           // HTTP status code
  headers: {                // Response headers
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    // ... other headers
  },
  body: string              // JSON.stringify(data)
}
```

## Testing Procedure

### 1. Test Health Endpoint (Simplest Test)
```javascript
// In browser console:
fetch('/_functions-dev/health')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Content-Type:', r.headers.get('content-type'));
    return r.text();
  })
  .then(text => {
    console.log('Response:', text);
    try {
      const json = JSON.parse(text);
      console.log('✅ JSON Response:', json);
    } catch (e) {
      console.error('❌ HTML Response (routing issue)');
    }
  });
```

### 2. Test Upload Endpoint
```javascript
// In browser console (requires file input):
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const formData = new FormData();
formData.append('file', file);

fetch('/_functions-dev/uploadProfilePhoto', {
  method: 'POST',
  body: formData
})
  .then(r => {
    console.log('Status:', r.status);
    console.log('Content-Type:', r.headers.get('content-type'));
    return r.json();
  })
  .then(data => console.log('✅ Upload Response:', data))
  .catch(err => console.error('❌ Upload Failed:', err));
```

## Next Steps

1. **Verify Wix Configuration**
   - Check `wix.config.json` in project root
   - Ensure backend functions directory is configured

2. **Test Health Endpoint**
   - Open site in browser
   - Open DevTools console
   - Run health endpoint test (see above)
   - Verify JSON response (not HTML)

3. **Deploy Backend Functions**
   - Use Wix CLI: `wix deploy`
   - Or use Wix Editor: Publish site
   - Backend functions deploy separately from frontend

4. **Test Upload Functionality**
   - Navigate to Trainer Profile page
   - Attempt to upload a photo
   - Check Network tab for JSON response
   - Verify photo URL is returned

## References

- **Wix HTTP Functions Docs**: https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/http-functions
- **Wix Media Manager**: https://dev.wix.com/docs/velo/api-reference/wix-media-backend
- **Backend Config Implementation**: `/src/lib/backend-config.ts`
- **Upload Function Implementation**: `/src/wix-verticals/backend/uploadProfilePhoto.ts`

---

**Status**: ⚠️ Awaiting verification of Wix platform configuration and deployment
**Priority**: 🔴 High - Blocking photo upload functionality
**Owner**: Development Team
