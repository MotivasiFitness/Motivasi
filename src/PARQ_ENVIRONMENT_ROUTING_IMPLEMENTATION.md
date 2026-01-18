# PAR-Q Environment-Aware Routing Implementation

## ✅ Implementation Complete

### Changes Made

#### 1. **Backend Configuration (`/src/lib/backend-config.ts`)**
- ✅ Added `PARQ: 'parq'` to `BACKEND_FUNCTIONS` constant
- ✅ Environment detection already implemented:
  - **Preview/Dev**: `/_functions-dev/parq`
  - **Production**: `/_functions/parq`

#### 2. **Frontend Form (`/src/components/pages/ParQPage.tsx`)**
- ✅ Replaced hardcoded `'/_functions/parq'` with `getBackendEndpoint(BACKEND_FUNCTIONS.PARQ)`
- ✅ Added import: `import { getBackendEndpoint, BACKEND_FUNCTIONS } from '@/lib/backend-config'`
- ✅ Now automatically routes to correct endpoint based on environment

#### 3. **Backend Function (`/src/wix-verticals/backend/parq.ts`)**
- ✅ Updated documentation to clarify environment-aware routing
- ✅ Confirmed JSON-only responses (no HTML redirects)
- ✅ Proper Content-Type headers set

---

## 🔍 Environment Detection Logic

### How It Works
The `isPreviewEnvironment()` function in `backend-config.ts` detects the environment based on hostname:

```typescript
function isPreviewEnvironment(): boolean {
  const hostname = window.location.hostname;
  
  return (
    hostname.includes('preview') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('editorx.io') ||
    hostname.includes('wixsite.com/studio')
  );
}
```

### Routing Behavior
- **Preview/Dev Environments** → `/_functions-dev/parq`
  - Wix Preview mode
  - Localhost development
  - EditorX preview
  - Studio preview

- **Production Environment** → `/_functions/parq`
  - Published live site
  - Custom domain

---

## ✅ Verification Checklist

### 1. **Preview Environment Testing**
- [ ] Open site in Wix Preview mode
- [ ] Fill out PAR-Q form
- [ ] Submit form
- [ ] Check browser DevTools Network tab:
  - Request URL should be: `/_functions-dev/parq`
  - Response should be JSON (not HTML)
  - Response should have `Content-Type: application/json`
- [ ] Verify submission saved to ParqSubmissions collection

### 2. **Production Environment Testing**
- [ ] Publish site to live domain
- [ ] Fill out PAR-Q form
- [ ] Submit form
- [ ] Check browser DevTools Network tab:
  - Request URL should be: `/_functions/parq`
  - Response should be JSON (not HTML)
  - Response should have `Content-Type: application/json`
- [ ] Verify submission saved to ParqSubmissions collection

### 3. **Direct Endpoint Testing**

#### Preview/Dev:
```bash
# Test direct endpoint access (replace with your preview URL)
curl -X POST https://your-site.wixsite.com/studio/_functions-dev/parq \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "dateOfBirth": "1990-01-01",
    "hasHeartCondition": false,
    "currentlyTakingMedication": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "submissionId": "abc123...",
  "message": "PAR-Q submission saved successfully"
}
```

#### Production:
```bash
# Test direct endpoint access (replace with your live URL)
curl -X POST https://your-domain.com/_functions/parq \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "dateOfBirth": "1990-01-01",
    "hasHeartCondition": false,
    "currentlyTakingMedication": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "submissionId": "abc123...",
  "message": "PAR-Q submission saved successfully"
}
```

---

## 🚨 Common Issues & Solutions

### Issue: Endpoint Returns HTML Instead of JSON
**Symptom:** Response is HTML (homepage or error page) instead of JSON

**Causes:**
1. Backend function not deployed
2. Function name mismatch (must be `post_parq` in backend file)
3. Wix routing not configured

**Solution:**
1. Verify backend function exists: `/src/wix-verticals/backend/parq.ts`
2. Verify function export: `export async function post_parq(request: any)`
3. Republish site to deploy backend changes
4. Check Wix backend logs for errors

### Issue: 404 Not Found
**Symptom:** Request returns 404 error

**Causes:**
1. Backend function not deployed
2. Wrong environment path

**Solution:**
1. Republish site
2. Check console logs for environment detection:
   ```javascript
   console.log('Environment:', isPreviewEnvironment() ? 'preview/dev' : 'production');
   console.log('Endpoint:', getBackendEndpoint('parq'));
   ```

### Issue: CORS Errors
**Symptom:** Browser blocks request due to CORS

**Solution:**
Backend already includes CORS headers:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

If still seeing CORS errors, verify:
1. Backend function is deployed
2. OPTIONS handler is exported: `export async function options_parq(request: any)`

---

## 📊 Monitoring & Debugging

### Frontend Debugging
Add this to ParQPage.tsx to see routing in action:

```typescript
// Before fetch call
console.log('[PAR-Q] Environment:', isPreviewEnvironment() ? 'preview/dev' : 'production');
console.log('[PAR-Q] Endpoint:', getBackendEndpoint(BACKEND_FUNCTIONS.PARQ));
```

### Backend Debugging
Backend function already includes comprehensive logging:
- Request method and headers
- Parsed request data
- Validation results
- Insert results
- Error details

Check Wix backend logs in:
- Wix Dashboard → Developer Tools → Logs
- Or use `console.log()` statements (already included)

---

## 🎯 Success Criteria

✅ **Environment-Aware Routing Working When:**
1. Preview mode uses `/_functions-dev/parq`
2. Production uses `/_functions/parq`
3. Direct endpoint access returns JSON (not HTML)
4. Form submissions save to ParqSubmissions collection
5. No CORS errors
6. Proper error handling (400/500 responses as JSON)

---

## 📝 Additional Notes

### Why Environment-Aware Routing?
- **Preview/Dev**: Uses `/_functions-dev/` to avoid affecting production data
- **Production**: Uses `/_functions/` for live site
- **Automatic**: No manual configuration needed - detects environment automatically

### Backend Function Naming
- File: `parq.ts`
- Export: `post_parq` (POST method)
- Export: `options_parq` (OPTIONS for CORS)
- Endpoint: `/parq` (no `.ts` extension)

### Related Files
- **Frontend**: `/src/components/pages/ParQPage.tsx`
- **Backend**: `/src/wix-verticals/backend/parq.ts`
- **Config**: `/src/lib/backend-config.ts`
- **Entity**: `/src/entities/index.ts` (ParqSubmissions interface)

---

## 🔗 Related Documentation
- [Backend Config Documentation](/src/lib/backend-config.ts)
- [Wix HTTP Functions Guide](/src/WIX_HTTP_FUNCTION_DEPLOYMENT_GUIDE.md)
- [Wix Velo Backend Setup](/src/WIX_VELO_BACKEND_SETUP.md)
