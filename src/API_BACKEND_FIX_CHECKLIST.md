# API Backend Fix Checklist

## Overview
This checklist ensures the AI Program Assistant endpoints are properly implemented with JSON-only responses and correct authentication handling.

## Critical Requirements

### ✅ Requirement 1: All Responses Must Be JSON
- [ ] GET `/api/generate-program` returns JSON `{ ok: true }`
- [ ] POST `/api/generate-program` returns JSON with program data
- [ ] POST `/api/regenerate-program-section` returns JSON with section data
- [ ] All error responses are JSON (never HTML)
- [ ] Content-Type header is `application/json` for ALL responses
- [ ] No HTML error pages or redirects

### ✅ Requirement 2: Authentication Returns JSON (Not Redirects)
- [ ] Missing auth token returns JSON 401 (not redirect)
- [ ] Invalid auth token returns JSON 401 (not redirect)
- [ ] Insufficient permissions returns JSON 403 (not redirect)
- [ ] Error message is descriptive and helpful
- [ ] Status code is correct (401 for auth, 403 for permission)

### ✅ Requirement 3: Input Validation
- [ ] Required fields are validated
- [ ] Invalid data returns JSON 400 with error message
- [ ] Numeric ranges are validated (e.g., daysPerWeek 1-7)
- [ ] Array fields are validated (e.g., equipment not empty)
- [ ] Error messages are specific and actionable

### ✅ Requirement 4: Error Handling
- [ ] OpenAI API errors are caught and returned as JSON
- [ ] Network errors are caught and returned as JSON
- [ ] Timeout errors are caught and returned as JSON
- [ ] All errors follow standard error format
- [ ] No unhandled exceptions leak to client

### ✅ Requirement 5: Response Format
All success responses follow this format:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "statusCode": 200
}
```

All error responses follow this format:
```json
{
  "success": false,
  "error": "Descriptive error message",
  "statusCode": 400
}
```

## Implementation Checklist

### Step 1: Verify Endpoints Exist

#### GET /api/generate-program (Diagnostic)
```bash
curl -X GET http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json"
```

Expected response:
```json
{ "ok": true }
```

- [ ] Endpoint exists
- [ ] Returns 200 status
- [ ] Returns JSON (not HTML)
- [ ] Content-Type is application/json

#### POST /api/generate-program
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "programGoal": "Build muscle",
    "programLength": "8 weeks",
    "daysPerWeek": 4,
    "experienceLevel": "intermediate",
    "equipment": ["dumbbells", "barbell"],
    "timePerWorkout": 60,
    "injuries": "",
    "trainingStyle": "Hypertrophy",
    "trainerId": "trainer-123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "programName": "...",
    "overview": "...",
    "duration": "...",
    "focusArea": "...",
    "weeklySplit": "...",
    "workoutDays": [...],
    "progressionGuidance": "...",
    "safetyNotes": "...",
    "aiGenerated": true,
    "aiGeneratedAt": "2024-01-13T12:00:00Z"
  },
  "statusCode": 200
}
```

- [ ] Endpoint exists
- [ ] Requires authentication
- [ ] Returns 200 status on success
- [ ] Returns JSON (not HTML)
- [ ] Content-Type is application/json
- [ ] Response includes all required fields
- [ ] aiGenerated and aiGeneratedAt are set

#### POST /api/regenerate-program-section
```bash
curl -X POST http://localhost:3000/api/regenerate-program-section \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "section": "workout-day",
    "context": "Current workout context",
    "prompt": "Regenerate with more compound exercises",
    "trainerPreferences": {},
    "currentProgram": {}
  }'
```

Expected response:
```json
{
  "success": true,
  "data": { /* section-specific data */ },
  "statusCode": 200
}
```

- [ ] Endpoint exists
- [ ] Requires authentication
- [ ] Returns 200 status on success
- [ ] Returns JSON (not HTML)
- [ ] Content-Type is application/json

### Step 2: Test Authentication Behavior

#### Test 1: Missing Authentication Token
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -d '{"programGoal": "Build muscle", "trainerId": "trainer-123"}'
```

Expected response (JSON 401):
```json
{
  "success": false,
  "error": "Authentication required. Please provide a valid token.",
  "statusCode": 401
}
```

- [ ] Returns JSON (not HTML)
- [ ] Status code is 401 (not 302 redirect)
- [ ] Content-Type is application/json
- [ ] Error message is descriptive

#### Test 2: Invalid Authentication Token
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"programGoal": "Build muscle", "trainerId": "trainer-123"}'
```

Expected response (JSON 401):
```json
{
  "success": false,
  "error": "Invalid authentication token",
  "statusCode": 401
}
```

- [ ] Returns JSON (not HTML)
- [ ] Status code is 401 (not 302 redirect)
- [ ] Content-Type is application/json

#### Test 3: Insufficient Permissions
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer client-token" \
  -d '{"programGoal": "Build muscle", "trainerId": "trainer-123"}'
```

Expected response (JSON 403):
```json
{
  "success": false,
  "error": "You do not have permission to generate programs. Only trainers can use this endpoint.",
  "statusCode": 403
}
```

- [ ] Returns JSON (not HTML)
- [ ] Status code is 403 (not 302 redirect)
- [ ] Content-Type is application/json

### Step 3: Test Input Validation

#### Test 1: Missing Required Field
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "programLength": "8 weeks",
    "daysPerWeek": 4,
    "experienceLevel": "intermediate",
    "equipment": ["dumbbells"],
    "timePerWorkout": 60,
    "trainerId": "trainer-123"
  }'
```

Expected response (JSON 400):
```json
{
  "success": false,
  "error": "Missing required field: programGoal",
  "statusCode": 400
}
```

- [ ] Returns JSON (not HTML)
- [ ] Status code is 400
- [ ] Error message identifies missing field

#### Test 2: Invalid Equipment Array
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "programGoal": "Build muscle",
    "programLength": "8 weeks",
    "daysPerWeek": 4,
    "experienceLevel": "intermediate",
    "equipment": [],
    "timePerWorkout": 60,
    "trainerId": "trainer-123"
  }'
```

Expected response (JSON 400):
```json
{
  "success": false,
  "error": "Equipment array is required and must not be empty",
  "statusCode": 400
}
```

- [ ] Returns JSON (not HTML)
- [ ] Status code is 400
- [ ] Error message is specific

#### Test 3: Invalid Numeric Range
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "programGoal": "Build muscle",
    "programLength": "8 weeks",
    "daysPerWeek": 10,
    "experienceLevel": "intermediate",
    "equipment": ["dumbbells"],
    "timePerWorkout": 60,
    "trainerId": "trainer-123"
  }'
```

Expected response (JSON 400):
```json
{
  "success": false,
  "error": "daysPerWeek must be between 1 and 7",
  "statusCode": 400
}
```

- [ ] Returns JSON (not HTML)
- [ ] Status code is 400
- [ ] Error message is specific

### Step 4: Test Error Handling

#### Test 1: OpenAI API Error
When OpenAI API key is missing or invalid:

Expected response (JSON 500):
```json
{
  "success": false,
  "error": "Server configuration error: OpenAI API key not configured",
  "statusCode": 500
}
```

- [ ] Returns JSON (not HTML)
- [ ] Status code is 500
- [ ] Error message is helpful

#### Test 2: OpenAI Rate Limit
When rate limit is exceeded:

Expected response (JSON 429):
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "statusCode": 429
}
```

- [ ] Returns JSON (not HTML)
- [ ] Status code is 429
- [ ] Error message is helpful

#### Test 3: Timeout Error
When request times out:

Expected response (JSON 504):
```json
{
  "success": false,
  "error": "Request timeout. Please try again.",
  "statusCode": 504
}
```

- [ ] Returns JSON (not HTML)
- [ ] Status code is 504
- [ ] Error message is helpful

### Step 5: Test Response Format

#### Test 1: Success Response Structure
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{...}'
```

Response should have:
- [ ] `success: true`
- [ ] `data: { /* program data */ }`
- [ ] `statusCode: 200`
- [ ] No HTML content
- [ ] Content-Type is application/json

#### Test 2: Error Response Structure
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Response should have:
- [ ] `success: false`
- [ ] `error: "descriptive message"`
- [ ] `statusCode: 401` (or appropriate error code)
- [ ] No HTML content
- [ ] Content-Type is application/json

### Step 6: Integration Testing

#### Test 1: Frontend Integration
In the Trainer Hub, click "Generate Program with AI":

- [ ] Form submits successfully
- [ ] Loading state appears
- [ ] Program is generated without errors
- [ ] No HTML error pages appear
- [ ] No redirects occur
- [ ] Success message appears
- [ ] Program is saved to database

#### Test 2: Error Handling in Frontend
Trigger an error (e.g., invalid input):

- [ ] Error message appears in UI
- [ ] Error is readable and helpful
- [ ] No console errors
- [ ] User can retry

#### Test 3: Authentication Flow
Test with different authentication states:

- [ ] Logged-in trainer: Works correctly
- [ ] Logged-in client: Returns 403 error
- [ ] Not logged in: Returns 401 error
- [ ] Invalid token: Returns 401 error

## Debugging Guide

### Issue: Endpoint returns HTML instead of JSON

**Symptoms:**
- Response starts with `<!DOCTYPE html>`
- Content-Type is `text/html`
- Error message mentions "Cannot POST /api/generate-program"

**Solution:**
1. Verify endpoint is registered in your backend
2. Check that middleware sets `Content-Type: application/json`
3. Ensure error handlers return JSON, not HTML
4. Check for catch-all routes that might be intercepting requests

**Test:**
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -v
```

Look for:
- `< HTTP/1.1 200 OK` (or appropriate status)
- `< content-type: application/json`
- Response body is valid JSON

### Issue: Authentication redirects instead of returning JSON

**Symptoms:**
- Response status is 302 (redirect)
- Location header points to login page
- Response is HTML

**Solution:**
1. Verify authentication middleware returns JSON 401
2. Check that middleware doesn't redirect on auth failure
3. Ensure middleware runs before route handlers
4. Check for global redirect middleware

**Test:**
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -v
```

Look for:
- `< HTTP/1.1 401 Unauthorized` (not 302)
- `< content-type: application/json`
- Response body is JSON with error message

### Issue: Response is not valid JSON

**Symptoms:**
- Frontend error: "Unexpected token < in JSON at position 0"
- Response starts with `<` (HTML)
- Response contains HTML mixed with JSON

**Solution:**
1. Check OpenAI response parsing
2. Verify JSON.parse() error handling
3. Ensure no HTML is mixed in response
4. Check for middleware that modifies response

**Test:**
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{...}' | jq .
```

Should output valid JSON without errors.

### Issue: Missing fields in response

**Symptoms:**
- Frontend error: "Cannot read property 'workoutDays' of undefined"
- Response data is incomplete
- Some fields are missing

**Solution:**
1. Verify OpenAI prompt returns all required fields
2. Check JSON parsing doesn't lose fields
3. Ensure response includes aiGenerated and aiGeneratedAt
4. Validate response structure before returning

**Test:**
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{...}' | jq '.data | keys'
```

Should include:
- programName
- overview
- duration
- focusArea
- weeklySplit
- workoutDays
- progressionGuidance
- safetyNotes
- aiGenerated
- aiGeneratedAt

## Verification Checklist

Before considering the implementation complete:

- [ ] GET `/api/generate-program` returns `{ ok: true }`
- [ ] POST `/api/generate-program` generates programs successfully
- [ ] POST `/api/regenerate-program-section` regenerates sections
- [ ] Missing auth returns JSON 401 (not redirect)
- [ ] Invalid auth returns JSON 401 (not redirect)
- [ ] Insufficient permissions returns JSON 403 (not redirect)
- [ ] Invalid input returns JSON 400 with specific error
- [ ] All responses have Content-Type: application/json
- [ ] All responses follow standard format (success/error)
- [ ] No HTML responses
- [ ] No redirects during API calls
- [ ] Frontend integration works end-to-end
- [ ] Error messages are helpful and specific
- [ ] Response times are acceptable (< 30 seconds)

## Common Implementation Mistakes

### ❌ Mistake 1: Returning HTML on Error
```javascript
// WRONG
app.post('/api/generate-program', (req, res) => {
  try {
    // ...
  } catch (error) {
    res.send('<h1>Error</h1>'); // Returns HTML!
  }
});
```

### ✅ Correct Implementation
```javascript
// CORRECT
app.post('/api/generate-program', (req, res) => {
  try {
    // ...
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500
    });
  }
});
```

### ❌ Mistake 2: Redirecting on Auth Failure
```javascript
// WRONG
app.post('/api/generate-program', (req, res, next) => {
  if (!req.user) {
    res.redirect('/login'); // Redirects instead of returning JSON!
  }
  next();
});
```

### ✅ Correct Implementation
```javascript
// CORRECT
app.post('/api/generate-program', (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      statusCode: 401
    });
  }
  next();
});
```

### ❌ Mistake 3: Not Setting Content-Type
```javascript
// WRONG
app.post('/api/generate-program', (req, res) => {
  res.json({ success: true, data: program }); // Content-Type might not be set!
});
```

### ✅ Correct Implementation
```javascript
// CORRECT
app.post('/api/generate-program', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    data: program,
    statusCode: 200
  });
});
```

### ❌ Mistake 4: Not Handling OpenAI Errors
```javascript
// WRONG
const completion = await openai.chat.completions.create({...});
const program = JSON.parse(completion.choices[0].message.content);
res.json({ success: true, data: program }); // No error handling!
```

### ✅ Correct Implementation
```javascript
// CORRECT
try {
  const completion = await openai.chat.completions.create({...});
  const responseText = completion.choices[0].message.content;
  
  if (!responseText) {
    throw new Error('Empty response from OpenAI');
  }
  
  let program;
  try {
    program = JSON.parse(responseText);
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }
    program = JSON.parse(jsonMatch[0]);
  }
  
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    data: program,
    statusCode: 200
  });
} catch (error) {
  res.setHeader('Content-Type', 'application/json');
  res.status(500).json({
    success: false,
    error: error.message,
    statusCode: 500
  });
}
```

## Support Resources

- **API Endpoints Documentation:** `/src/lib/api-endpoints.ts`
- **Backend Implementation Guide:** `/src/lib/api-backend-implementation.ts`
- **Frontend Integration:** `/src/lib/ai-program-generator.ts`
- **Response Handler:** `/src/lib/api-response-handler.ts`

## Sign-Off

Once all items in this checklist are complete, the API backend fix is ready for production:

- [ ] All endpoints implemented and tested
- [ ] All authentication tests pass
- [ ] All validation tests pass
- [ ] All error handling tests pass
- [ ] Frontend integration works end-to-end
- [ ] No HTML responses
- [ ] No redirects
- [ ] All responses are JSON
- [ ] Content-Type headers are correct
- [ ] Error messages are helpful
- [ ] Documentation is complete

**Date Completed:** _______________
**Verified By:** _______________
