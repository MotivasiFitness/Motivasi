# Quick Reference - API Backend Implementation

## TL;DR - What You Need to Do

### 1. Implement Three Endpoints

```javascript
// GET /api/generate-program (Diagnostic)
app.get('/api/generate-program', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true });
});

// POST /api/generate-program (Main)
app.post('/api/generate-program', authMiddleware, async (req, res) => {
  // Validate input
  // Call OpenAI API
  // Return JSON response
});

// POST /api/regenerate-program-section (Section)
app.post('/api/regenerate-program-section', authMiddleware, async (req, res) => {
  // Validate input
  // Call OpenAI API
  // Return JSON response
});
```

### 2. Critical Rules

✅ **ALWAYS DO:**
- Return JSON (never HTML)
- Set `Content-Type: application/json`
- Return JSON 401 for missing auth
- Return JSON 403 for insufficient permissions
- Return JSON 400 for validation errors
- Return JSON 500 for server errors
- Include `success` and `error` fields in responses

❌ **NEVER DO:**
- Redirect on auth failure
- Return HTML error pages
- Forget Content-Type header
- Return HTML 404 pages
- Forget to validate input
- Forget error handling

### 3. Test Your Endpoints

```bash
# Test 1: Diagnostic
curl -X GET https://your-domain.com/api/generate-program

# Test 2: Missing Auth (should return JSON 401)
curl -X POST https://your-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -d '{"programGoal":"Build muscle","trainerId":"trainer-123"}'

# Test 3: Invalid Input (should return JSON 400)
curl -X POST https://your-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"programGoal":"Build muscle","equipment":[],"trainerId":"trainer-123"}'

# Test 4: Valid Request (should return JSON 200)
curl -X POST https://your-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "programGoal":"Build muscle",
    "programLength":"8 weeks",
    "daysPerWeek":4,
    "experienceLevel":"intermediate",
    "equipment":["dumbbells","barbell"],
    "timePerWorkout":60,
    "trainerId":"trainer-123"
  }'
```

---

## Response Formats

### Success Response (200)
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

### Error Response (400/401/403/500)
```json
{
  "success": false,
  "error": "Descriptive error message",
  "statusCode": 400
}
```

---

## Status Codes

| Code | Meaning | When to Use |
|------|---------|------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input (missing field, wrong type, etc.) |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Endpoint doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |
| 504 | Gateway Timeout | Request timeout |

---

## Validation Rules

### programGoal
- Required: Yes
- Type: String
- Min length: 1
- Example: "Build muscle", "Lose weight"

### trainerId
- Required: Yes
- Type: String
- Min length: 1
- Example: "trainer-123"

### equipment
- Required: Yes
- Type: Array of strings
- Min length: 1 (cannot be empty)
- Example: ["dumbbells", "barbell"]

### daysPerWeek
- Required: Yes
- Type: Number
- Min: 1
- Max: 7
- Example: 4

### timePerWorkout
- Required: Yes
- Type: Number
- Min: 15 (minutes)
- Max: 180 (minutes)
- Example: 60

### experienceLevel
- Required: Yes
- Type: String
- Valid values: "beginner", "intermediate", "advanced"
- Example: "intermediate"

### programLength
- Required: Yes
- Type: String
- Example: "8 weeks", "12 weeks"

### trainingStyle
- Required: Yes
- Type: String
- Example: "Strength Building", "Hypertrophy", "Endurance"

### injuries
- Required: No
- Type: String
- Example: "None", "Lower back pain"

### additionalNotes
- Required: No
- Type: String
- Example: "Client prefers morning workouts"

---

## Common Errors & Solutions

### Error: "Endpoint not found" (404 HTML)
**Problem:** Endpoint is not registered
**Solution:** Check endpoint path is exactly `/api/generate-program`

### Error: "Unexpected token < in JSON"
**Problem:** Response is HTML instead of JSON
**Solution:** 
1. Set `Content-Type: application/json` header
2. Return JSON, not HTML
3. Check error handlers return JSON

### Error: "Authentication required" but I provided a token
**Problem:** Token is invalid or auth middleware is broken
**Solution:**
1. Verify token format is `Bearer TOKEN`
2. Check token is valid
3. Verify auth middleware is running

### Error: "Cannot read property 'workoutDays' of undefined"
**Problem:** Response is missing required fields
**Solution:**
1. Check OpenAI response includes all fields
2. Verify JSON parsing is correct
3. Add validation before returning response

---

## Middleware Template

```javascript
// Set JSON content-type for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid token.',
      statusCode: 401
    });
  }
  
  // Verify token (implement your auth logic)
  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token',
      statusCode: 401
    });
  }
};

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    statusCode: 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.path}`,
    statusCode: 404
  });
});
```

---

## Testing Checklist

- [ ] GET `/api/generate-program` returns `{ "ok": true }`
- [ ] POST `/api/generate-program` with valid input returns 200
- [ ] POST `/api/generate-program` without auth returns JSON 401
- [ ] POST `/api/generate-program` with invalid input returns JSON 400
- [ ] POST `/api/regenerate-program-section` returns 200
- [ ] All responses have `Content-Type: application/json`
- [ ] All responses are valid JSON
- [ ] No HTML responses
- [ ] No redirects (status 302)
- [ ] Error messages are descriptive

---

## Files to Reference

1. **Implementation Guide:** `/src/lib/api-backend-implementation.ts`
2. **API Specification:** `/src/lib/api-endpoints.ts`
3. **Response Handler:** `/src/lib/api-response-handler.ts`
4. **Deployment Guide:** `/src/BACKEND_DEPLOYMENT_GUIDE.md`
5. **Verification Checklist:** `/src/API_BACKEND_FIX_CHECKLIST.md`
6. **Verification Script:** `/src/ENDPOINT_VERIFICATION_SCRIPT.sh`

---

## Quick Start (5 minutes)

1. **Copy the endpoint code** from `/src/lib/api-backend-implementation.ts`
2. **Paste into your backend** (Express.js example provided)
3. **Configure OpenAI API key** in environment variables
4. **Test with curl:**
   ```bash
   curl -X GET http://localhost:3000/api/generate-program
   ```
4. **Deploy to production**
5. **Run verification script:**
   ```bash
   chmod +x ENDPOINT_VERIFICATION_SCRIPT.sh
   ./ENDPOINT_VERIFICATION_SCRIPT.sh https://your-domain.com YOUR_TOKEN
   ```

---

## Support

- **Questions?** Check `/src/BACKEND_DEPLOYMENT_GUIDE.md`
- **Implementation help?** Check `/src/lib/api-backend-implementation.ts`
- **Testing issues?** Check `/src/API_BACKEND_FIX_CHECKLIST.md`
- **Verification?** Run `/src/ENDPOINT_VERIFICATION_SCRIPT.sh`

---

## Key Takeaway

**All API responses must be JSON. Never return HTML. Always set Content-Type header. Always validate input. Always handle errors gracefully.**
