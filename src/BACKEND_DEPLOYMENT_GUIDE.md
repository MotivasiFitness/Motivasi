# Backend Deployment Guide - AI Program Assistant API

## Overview

This guide provides step-by-step instructions to implement and verify the three required API endpoints in your deployed environment.

## Prerequisites

- Backend server running (Node.js/Express, Python/Flask, etc.)
- OpenAI API key configured
- Access to your deployed domain
- curl or Postman for testing
- Authentication system in place

---

## Part 1: Implementation

### Endpoint 1: GET /api/generate-program (Diagnostic)

**Purpose:** Verify the API is working

**Implementation (Express.js):**

```javascript
app.get('/api/generate-program', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true });
});
```

**Implementation (Python/Flask):**

```python
@app.route('/api/generate-program', methods=['GET'])
def diagnostic_endpoint():
    response = {'ok': True}
    return jsonify(response), 200
```

**Implementation (Other frameworks):**
- Set Content-Type header to `application/json`
- Return JSON object `{ "ok": true }`
- Return HTTP 200 status

---

### Endpoint 2: POST /api/generate-program (Main)

**Purpose:** Generate complete training programs using AI

**Key Requirements:**
1. Always return JSON (never HTML)
2. Require authentication (return JSON 401 if missing)
3. Validate input (return JSON 400 if invalid)
4. Call OpenAI API to generate program
5. Return structured JSON response

**Implementation (Express.js):**

```javascript
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());

// Middleware: Set JSON content-type for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Middleware: Authentication (returns JSON 401, not redirect)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid token.',
      statusCode: 401
    });
  }
  
  // Verify token (implement your auth logic here)
  // Example: verify JWT token
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

// POST /api/generate-program
app.post('/api/generate-program', authMiddleware, async (req, res) => {
  try {
    const {
      programGoal,
      programLength,
      daysPerWeek,
      experienceLevel,
      equipment,
      timePerWorkout,
      injuries,
      trainingStyle,
      additionalNotes,
      trainerId
    } = req.body;
    
    // Validate required fields
    if (!programGoal || !trainerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: programGoal, trainerId',
        statusCode: 400
      });
    }
    
    if (!Array.isArray(equipment) || equipment.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Equipment array is required and must not be empty',
        statusCode: 400
      });
    }
    
    if (daysPerWeek < 1 || daysPerWeek > 7) {
      return res.status(400).json({
        success: false,
        error: 'daysPerWeek must be between 1 and 7',
        statusCode: 400
      });
    }
    
    if (timePerWorkout < 15 || timePerWorkout > 180) {
      return res.status(400).json({
        success: false,
        error: 'timePerWorkout must be between 15 and 180 minutes',
        statusCode: 400
      });
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Build the prompt
    const prompt = `
      Create a detailed ${daysPerWeek}-day ${programGoal} training program for a ${experienceLevel} client.
      
      Program Details:
      - Duration: ${programLength}
      - Training Style: ${trainingStyle}
      - Available Equipment: ${equipment.join(', ')}
      - Time per Workout: ${timePerWorkout} minutes
      - Injuries/Limitations: ${injuries || 'None'}
      - Additional Notes: ${additionalNotes || 'None'}
      
      Return the program as a valid JSON object with this exact structure:
      {
        "programName": "string",
        "overview": "string",
        "duration": "string",
        "focusArea": "string",
        "weeklySplit": "string",
        "workoutDays": [
          {
            "day": "string",
            "exercises": [
              {
                "name": "string",
                "sets": number,
                "reps": "string",
                "weight": "string",
                "restSeconds": number,
                "notes": "string",
                "substitutions": ["string"]
              }
            ],
            "warmUp": "string",
            "coolDown": "string",
            "notes": "string"
          }
        ],
        "progressionGuidance": "string",
        "safetyNotes": "string"
      }
      
      IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks.
    `;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert fitness coach creating personalized training programs. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });
    
    // Extract and parse the response
    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }
    
    // Parse JSON (handle potential markdown wrapping)
    let program;
    try {
      program = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from OpenAI response');
      }
      program = JSON.parse(jsonMatch[0]);
    }
    
    // Add metadata
    program.aiGenerated = true;
    program.aiGeneratedAt = new Date().toISOString();
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: program,
      statusCode: 200
    });
    
  } catch (error) {
    console.error('Program generation error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Failed to generate program';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('API key')) {
        statusCode = 500;
        errorMessage = 'Server configuration error: OpenAI API key not configured';
      } else if (error.message.includes('rate limit')) {
        statusCode = 429;
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('timeout')) {
        statusCode = 504;
        errorMessage = 'Request timeout. Please try again.';
      }
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      statusCode
    });
  }
});
```

---

### Endpoint 3: POST /api/regenerate-program-section

**Purpose:** Regenerate a specific section of an existing program

**Implementation (Express.js):**

```javascript
app.post('/api/regenerate-program-section', authMiddleware, async (req, res) => {
  try {
    const { section, context, prompt, trainerPreferences, currentProgram } = req.body;
    
    // Validate required fields
    if (!section || !['workout-day', 'exercise-substitutions', 'progression-guidance', 'warm-up-cool-down'].includes(section)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section type',
        statusCode: 400
      });
    }
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
        statusCode: 400
      });
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Build section-specific prompt
    let sectionPrompt = '';
    
    switch (section) {
      case 'workout-day':
        sectionPrompt = `Regenerate a workout day for this program. ${prompt}`;
        break;
      case 'exercise-substitutions':
        sectionPrompt = `Provide alternative exercises for: ${prompt}`;
        break;
      case 'progression-guidance':
        sectionPrompt = `Create progression guidance for: ${prompt}`;
        break;
      case 'warm-up-cool-down':
        sectionPrompt = `Create warm-up and cool-down routines for: ${prompt}`;
        break;
    }
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert fitness coach. Respond with valid JSON only.'
        },
        {
          role: 'user',
          content: sectionPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Parse response
    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from OpenAI response');
      }
      data = JSON.parse(jsonMatch[0]);
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      data,
      statusCode: 200
    });
    
  } catch (error) {
    console.error('Section regeneration error:', error);
    
    const statusCode = 500;
    const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate section';
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      statusCode
    });
  }
});

// Global error handler (must return JSON)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    statusCode: 500
  });
});

// 404 handler (must return JSON)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.path}`,
    statusCode: 404
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Part 2: Verification

### Test Environment Setup

Before testing, ensure:
1. Backend server is running
2. OpenAI API key is configured
3. Authentication system is working
4. You have a valid authentication token for testing

### Test 1: Diagnostic Endpoint

**Command:**
```bash
curl -X GET https://your-deployed-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -v
```

**Expected Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{"ok":true}
```

**Verification Checklist:**
- [ ] Status code is 200
- [ ] Content-Type is `application/json`
- [ ] Response is valid JSON
- [ ] Response contains `{"ok": true}`

---

### Test 2: Generate Program (with authentication)

**Command:**
```bash
curl -X POST https://your-deployed-domain.com/api/generate-program \
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
  }' \
  -v
```

**Expected Response:**
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

**Verification Checklist:**
- [ ] Status code is 200
- [ ] Content-Type is `application/json`
- [ ] Response is valid JSON
- [ ] `success` is `true`
- [ ] `data` contains all required fields
- [ ] `aiGenerated` is `true`
- [ ] `aiGeneratedAt` is set

---

### Test 3: Missing Authentication (should return JSON 401)

**Command:**
```bash
curl -X POST https://your-deployed-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -d '{
    "programGoal": "Build muscle",
    "trainerId": "trainer-123"
  }' \
  -v
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Authentication required. Please provide a valid token.",
  "statusCode": 401
}
```

**Verification Checklist:**
- [ ] Status code is 401 (NOT 302 redirect)
- [ ] Content-Type is `application/json`
- [ ] Response is valid JSON (NOT HTML)
- [ ] `success` is `false`
- [ ] Error message is descriptive

---

### Test 4: Invalid Authentication (should return JSON 401)

**Command:**
```bash
curl -X POST https://your-deployed-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{
    "programGoal": "Build muscle",
    "trainerId": "trainer-123"
  }' \
  -v
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid authentication token",
  "statusCode": 401
}
```

**Verification Checklist:**
- [ ] Status code is 401
- [ ] Content-Type is `application/json`
- [ ] Response is valid JSON

---

### Test 5: Missing Required Field (should return JSON 400)

**Command:**
```bash
curl -X POST https://your-deployed-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "programLength": "8 weeks",
    "daysPerWeek": 4,
    "experienceLevel": "intermediate",
    "equipment": ["dumbbells"],
    "timePerWorkout": 60,
    "trainerId": "trainer-123"
  }' \
  -v
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing required fields: programGoal, trainerId",
  "statusCode": 400
}
```

**Verification Checklist:**
- [ ] Status code is 400
- [ ] Content-Type is `application/json`
- [ ] Response is valid JSON
- [ ] Error message identifies missing field

---

### Test 6: Invalid Equipment Array (should return JSON 400)

**Command:**
```bash
curl -X POST https://your-deployed-domain.com/api/generate-program \
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
  }' \
  -v
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Equipment array is required and must not be empty",
  "statusCode": 400
}
```

**Verification Checklist:**
- [ ] Status code is 400
- [ ] Content-Type is `application/json`
- [ ] Error message is specific

---

### Test 7: Invalid Numeric Range (should return JSON 400)

**Command:**
```bash
curl -X POST https://your-deployed-domain.com/api/generate-program \
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
  }' \
  -v
```

**Expected Response:**
```json
{
  "success": false,
  "error": "daysPerWeek must be between 1 and 7",
  "statusCode": 400
}
```

**Verification Checklist:**
- [ ] Status code is 400
- [ ] Error message is specific

---

### Test 8: Regenerate Program Section

**Command:**
```bash
curl -X POST https://your-deployed-domain.com/api/regenerate-program-section \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "section": "workout-day",
    "context": "Current workout context",
    "prompt": "Regenerate with more compound exercises",
    "trainerPreferences": {},
    "currentProgram": {}
  }' \
  -v
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "day": "Monday - Upper A",
    "exercises": [...],
    "warmUp": "...",
    "coolDown": "...",
    "notes": "..."
  },
  "statusCode": 200
}
```

**Verification Checklist:**
- [ ] Status code is 200
- [ ] Content-Type is `application/json`
- [ ] Response is valid JSON
- [ ] `success` is `true`

---

## Part 3: Troubleshooting

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
curl -X POST https://your-deployed-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -v
```

Look for:
- `< HTTP/1.1 200 OK` (or appropriate status)
- `< content-type: application/json`
- Response body is valid JSON

---

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
curl -X POST https://your-deployed-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -v
```

Look for:
- `< HTTP/1.1 401 Unauthorized` (not 302)
- `< content-type: application/json`
- Response body is JSON with error message

---

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
curl -X POST https://your-deployed-domain.com/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{...}' | jq .
```

Should output valid JSON without errors.

---

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
curl -X POST https://your-deployed-domain.com/api/generate-program \
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

---

## Part 4: Deployment Checklist

Before deploying to production:

### Code Implementation
- [ ] GET `/api/generate-program` endpoint implemented
- [ ] POST `/api/generate-program` endpoint implemented
- [ ] POST `/api/regenerate-program-section` endpoint implemented
- [ ] All endpoints set Content-Type to `application/json`
- [ ] All endpoints return JSON (never HTML)
- [ ] Authentication middleware returns JSON 401/403 (not redirects)
- [ ] Input validation returns JSON 400 with specific error messages
- [ ] Error handling returns JSON 500 with descriptive messages
- [ ] Global error handler returns JSON
- [ ] 404 handler returns JSON

### Testing
- [ ] Diagnostic endpoint returns `{ "ok": true }`
- [ ] Generate program endpoint works with valid input
- [ ] Missing auth returns JSON 401
- [ ] Invalid auth returns JSON 401
- [ ] Missing required field returns JSON 400
- [ ] Invalid equipment array returns JSON 400
- [ ] Invalid numeric range returns JSON 400
- [ ] Regenerate section endpoint works
- [ ] All responses have correct Content-Type header
- [ ] No HTML responses
- [ ] No redirects during API calls

### Environment
- [ ] OpenAI API key is configured
- [ ] Authentication system is working
- [ ] Backend server is running
- [ ] CORS is configured (if needed)
- [ ] Rate limiting is configured (if needed)
- [ ] Logging is configured
- [ ] Error monitoring is configured

### Documentation
- [ ] API endpoints are documented
- [ ] Error responses are documented
- [ ] Authentication requirements are documented
- [ ] Rate limits are documented (if applicable)
- [ ] Support contact information is provided

---

## Part 5: Frontend Integration

Once the backend is verified, the frontend will automatically:

1. Call `/api/generate-program` when user clicks "Generate Program"
2. Handle JSON responses properly
3. Display errors from API responses
4. Show loading states during generation
5. Save generated programs to database

No frontend changes are needed. The frontend is already configured to work with these endpoints.

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the implementation examples
3. Verify all endpoints are returning JSON
4. Check Content-Type headers
5. Verify authentication is working
6. Check OpenAI API key is configured
7. Review server logs for errors

For additional help, refer to:
- `/src/lib/api-endpoints.ts` - API specification
- `/src/lib/api-backend-implementation.ts` - Complete implementation guide
- `/src/lib/api-response-handler.ts` - Response handling utilities
- `/src/lib/ai-program-generator.ts` - Frontend integration code
