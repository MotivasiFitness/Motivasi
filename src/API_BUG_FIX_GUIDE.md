# AI Program Assistant - JSON Parse Error Bug Fix Guide

## Problem Summary

The AI Program Assistant fails with a JSON parse error when attempting to generate programs. The backend is returning HTML instead of JSON, causing the frontend to crash when trying to parse the response.

**Error Pattern:**
```
SyntaxError: Unexpected token < in JSON at position 0
```

This indicates the response starts with `<` (HTML tag) instead of `{` (JSON object).

## Root Causes

### 1. **Missing API Endpoints**
The backend doesn't have the required `/api/generate-program` and `/api/regenerate-program-section` endpoints implemented.

### 2. **Authentication Redirects**
When authentication fails, the server redirects to a login page (HTML) instead of returning a 401 JSON response.

### 3. **Error Pages as HTML**
Server errors return HTML error pages instead of JSON error responses.

### 4. **Missing Content-Type Headers**
Responses don't set `Content-Type: application/json`, causing the frontend to misinterpret the content.

## Solution Overview

This fix implements three layers of protection:

1. **Frontend JSON Validation** - Safely parse responses and detect non-JSON content
2. **Error Handling** - Provide clear error messages when APIs fail
3. **API Documentation** - Guide for implementing correct backend endpoints

## Files Changed

### 1. `/src/lib/api-response-handler.ts` (NEW)
Robust JSON parsing with validation and error handling.

**Key Functions:**
- `safeFetch()` - Make API requests with JSON validation
- `safeJsonParse()` - Parse JSON with error detection
- `handleApiError()` - Handle error responses gracefully
- `isJsonResponse()` - Check if response is JSON

**Usage:**
```typescript
import { safeFetch } from '@/lib/api-response-handler';

const program = await safeFetch<GeneratedProgram>(
  '/api/generate-program',
  {
    method: 'POST',
    body: JSON.stringify(input),
  },
  'Program generation'
);
```

### 2. `/src/lib/ai-program-generator.ts` (UPDATED)
Updated to use safe JSON parsing for all API calls.

**Changes:**
- Import `safeFetch` and error handlers
- Replace `fetch()` with `safeFetch()` in:
  - `generateProgramWithAI()` - Main program generation
  - `regenerateProgramSection()` - Section regeneration

### 3. `/src/lib/api-endpoints.ts` (NEW)
Documentation and examples for implementing backend endpoints.

**Includes:**
- Endpoint specifications
- Request/response formats
- Example Node.js/Express implementation
- Critical requirements checklist

## Implementation Steps

### Step 1: Verify Frontend Changes
The frontend changes are already implemented:
- ✅ `api-response-handler.ts` - Safe JSON parsing
- ✅ `ai-program-generator.ts` - Updated to use safe parsing
- ✅ `api-endpoints.ts` - Documentation

### Step 2: Implement Backend Endpoints

You MUST implement these endpoints in your backend:

#### Endpoint 1: POST /api/generate-program

```typescript
app.post('/api/generate-program', async (req, res) => {
  try {
    // CRITICAL: Set JSON content type
    res.setHeader('Content-Type', 'application/json');
    
    // Validate authentication (return JSON, not redirect)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401
      });
    }
    
    const { programGoal, daysPerWeek, experienceLevel, equipment, trainerId } = req.body;
    
    // Validate input
    if (!programGoal || !trainerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        statusCode: 400
      });
    }
    
    // Call OpenAI API
    const program = await generateWithOpenAI(req.body);
    
    // Return JSON success response
    return res.status(200).json({
      success: true,
      data: program,
      statusCode: 200
    });
  } catch (error) {
    // CRITICAL: Return JSON error, not HTML
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate program',
      statusCode: 500
    });
  }
});
```

#### Endpoint 2: POST /api/regenerate-program-section

```typescript
app.post('/api/regenerate-program-section', async (req, res) => {
  try {
    // CRITICAL: Set JSON content type
    res.setHeader('Content-Type', 'application/json');
    
    // Validate authentication (return JSON, not redirect)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401
      });
    }
    
    const { section, context, prompt, trainerPreferences } = req.body;
    
    // Validate input
    if (!section || !context) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        statusCode: 400
      });
    }
    
    // Call OpenAI API for section regeneration
    const regenerated = await regenerateWithOpenAI(req.body);
    
    // Return JSON success response
    return res.status(200).json({
      success: true,
      data: regenerated,
      statusCode: 200
    });
  } catch (error) {
    // CRITICAL: Return JSON error, not HTML
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to regenerate section',
      statusCode: 500
    });
  }
});
```

### Step 3: Fix Authentication Middleware

**WRONG (returns HTML redirect):**
```typescript
app.use((req, res, next) => {
  if (!req.user) {
    res.redirect('/login'); // ❌ Returns HTML, breaks API
  }
  next();
});
```

**CORRECT (returns JSON):**
```typescript
app.use((req, res, next) => {
  // Set JSON content type for all responses
  res.setHeader('Content-Type', 'application/json');
  
  // For API routes, return JSON error instead of redirect
  if (req.path.startsWith('/api/')) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401
      });
    }
  }
  next();
});
```

### Step 4: Fix Error Handling Middleware

**WRONG (returns HTML error page):**
```typescript
app.use((err, req, res, next) => {
  res.status(500).send('<html><body>Error</body></html>');
});
```

**CORRECT (returns JSON):**
```typescript
app.use((err, req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    statusCode: 500
  });
});
```

### Step 5: Fix 404 Handler

**WRONG (returns HTML):**
```typescript
app.use((req, res) => {
  res.status(404).send('<html><body>Not Found</body></html>');
});
```

**CORRECT (returns JSON):**
```typescript
app.use((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.path}`,
    statusCode: 404
  });
});
```

## Testing the Fix

### Test 1: Verify Frontend Error Handling

```typescript
import { safeFetch } from '@/lib/api-response-handler';

// This should now provide clear error messages
try {
  const program = await safeFetch('/api/generate-program', {
    method: 'POST',
    body: JSON.stringify({ /* ... */ }),
  }, 'Program generation');
} catch (error) {
  console.log(error.message); // Clear error message
}
```

### Test 2: Verify Backend Returns JSON

```bash
# Test endpoint with curl
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "programGoal": "Build muscle",
    "daysPerWeek": 4,
    "experienceLevel": "intermediate",
    "equipment": ["dumbbells", "barbell"],
    "trainerId": "trainer-123"
  }'

# Should return JSON, not HTML
# Should have Content-Type: application/json header
```

### Test 3: Verify Authentication Returns JSON

```bash
# Test without authentication
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -d '{...}'

# Should return 401 JSON response, not redirect
# Response should be:
# {
#   "success": false,
#   "error": "Authentication required",
#   "statusCode": 401
# }
```

## Verification Checklist

- [ ] Backend `/api/generate-program` endpoint exists
- [ ] Backend `/api/regenerate-program-section` endpoint exists
- [ ] All API responses have `Content-Type: application/json` header
- [ ] Authentication failures return 401 JSON (not redirect)
- [ ] Authorization failures return 403 JSON (not redirect)
- [ ] Server errors return 500 JSON (not HTML error page)
- [ ] 404 errors return JSON (not HTML error page)
- [ ] All error responses have `error` and `statusCode` fields
- [ ] Frontend can successfully generate programs
- [ ] Frontend shows clear error messages on API failures

## Debugging Tips

### If you still get "Unexpected token < in JSON"

1. **Check Content-Type header:**
   ```typescript
   const response = await fetch('/api/generate-program', { /* ... */ });
   console.log(response.headers.get('content-type'));
   // Should be: application/json
   ```

2. **Check response body:**
   ```typescript
   const text = await response.text();
   console.log(text.substring(0, 100));
   // Should start with { not <
   ```

3. **Check if endpoint exists:**
   ```bash
   curl -X POST http://localhost:3000/api/generate-program
   # If you get 404 HTML, endpoint doesn't exist
   ```

4. **Check authentication:**
   ```bash
   curl -X POST http://localhost:3000/api/generate-program \
     -H "Authorization: Bearer YOUR_TOKEN"
   # If you get redirected, auth middleware is wrong
   ```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `Unexpected token <` | HTML response | Implement JSON endpoints |
| 404 HTML page | Endpoint missing | Create `/api/generate-program` |
| Redirect loop | Auth returns HTML | Return 401 JSON instead |
| `Content-Type: text/html` | Wrong header | Set `application/json` |
| Empty response | Endpoint crashes | Add error handling |

## Summary

The fix ensures:

1. ✅ **Frontend validates JSON** - Detects non-JSON responses early
2. ✅ **Clear error messages** - Users see what went wrong
3. ✅ **API documentation** - Backend developers know what to implement
4. ✅ **No HTML responses** - All API responses are JSON
5. ✅ **No redirects** - Authentication returns JSON 401/403
6. ✅ **Proper error handling** - All errors are structured JSON

Once the backend endpoints are implemented correctly, program generation will work seamlessly.
