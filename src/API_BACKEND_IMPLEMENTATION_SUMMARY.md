# API Backend Implementation Summary

## Executive Summary

The AI Program Assistant requires three backend API endpoints to function properly. This document provides a complete implementation guide to ensure all endpoints return JSON responses (never HTML), handle authentication correctly (returning JSON 401/403 instead of redirects), and follow proper error handling patterns.

## Quick Start

### For Backend Developers

1. **Read:** `/src/lib/api-backend-implementation.ts` - Complete implementation examples
2. **Reference:** `/src/lib/api-endpoints.ts` - API specification
3. **Test:** Use the curl commands in `/src/API_BACKEND_FIX_CHECKLIST.md`
4. **Verify:** Run through the verification checklist

### For Frontend Developers

The frontend is already configured to:
- Call `/api/generate-program` (POST) to generate programs
- Call `/api/regenerate-program-section` (POST) to regenerate sections
- Handle JSON responses properly
- Display errors from API responses

No frontend changes are needed. Just ensure the backend endpoints exist and return JSON.

## The Three Required Endpoints

### 1. GET /api/generate-program (Diagnostic)

**Purpose:** Verify the API is working

**Request:**
```bash
curl -X GET http://localhost:3000/api/generate-program
```

**Response:**
```json
{ "ok": true }
```

**Implementation (Express.js):**
```javascript
app.get('/api/generate-program', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true });
});
```

---

### 2. POST /api/generate-program (Main Endpoint)

**Purpose:** Generate a complete training program using AI

**Request:**
```json
{
  "programGoal": "Build muscle",
  "programLength": "8 weeks",
  "daysPerWeek": 4,
  "experienceLevel": "intermediate",
  "equipment": ["dumbbells", "barbell"],
  "timePerWorkout": 60,
  "injuries": "None",
  "trainingStyle": "Hypertrophy",
  "additionalNotes": "Optional notes",
  "trainerId": "trainer-123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "programName": "8-Week Hypertrophy Program",
    "overview": "A comprehensive program...",
    "duration": "8 weeks",
    "focusArea": "Muscle Building",
    "weeklySplit": "Upper/Lower",
    "workoutDays": [
      {
        "day": "Monday - Upper A",
        "exercises": [
          {
            "name": "Barbell Bench Press",
            "sets": 4,
            "reps": "6-8",
            "weight": "185 lbs",
            "restSeconds": 180,
            "notes": "Focus on form",
            "substitutions": ["Dumbbell Bench Press", "Machine Chest Press"]
          }
        ],
        "warmUp": "5 min cardio + dynamic stretching",
        "coolDown": "5 min walking + static stretching",
        "notes": "Focus on compound movements"
      }
    ],
    "progressionGuidance": "Increase weight by 5 lbs...",
    "safetyNotes": "Always warm up properly...",
    "aiGenerated": true,
    "aiGeneratedAt": "2024-01-13T12:00:00Z"
  },
  "statusCode": 200
}
```

**Error Response (400/401/403/500):**
```json
{
  "success": false,
  "error": "Descriptive error message",
  "statusCode": 400
}
```

**Authentication:**
- Required: Yes
- Method: Bearer token in Authorization header
- Failure: Returns JSON 401 (not redirect)

**Validation:**
- programGoal: Required, non-empty string
- trainerId: Required, non-empty string
- equipment: Required, non-empty array
- daysPerWeek: Required, 1-7
- timePerWorkout: Required, 15-180 minutes

---

### 3. POST /api/regenerate-program-section (Section Regeneration)

**Purpose:** Regenerate a specific section of an existing program

**Request:**
```json
{
  "section": "workout-day",
  "context": "Current workout context",
  "prompt": "Regenerate with more compound exercises",
  "trainerPreferences": {},
  "currentProgram": {}
}
```

**Success Response (200):**
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

**Error Response:**
```json
{
  "success": false,
  "error": "Descriptive error message",
  "statusCode": 400
}
```

**Authentication:**
- Required: Yes
- Method: Bearer token in Authorization header
- Failure: Returns JSON 401 (not redirect)

**Validation:**
- section: Required, one of: "workout-day", "exercise-substitutions", "progression-guidance", "warm-up-cool-down"
- prompt: Required, non-empty string

---

## Critical Implementation Requirements

### ✅ Requirement 1: Always Return JSON

**WRONG:**
```javascript
app.post('/api/generate-program', (req, res) => {
  try {
    // ...
  } catch (error) {
    res.send('<h1>Error</h1>'); // ❌ Returns HTML
  }
});
```

**CORRECT:**
```javascript
app.post('/api/generate-program', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    // ...
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500
    });
  }
});
```

### ✅ Requirement 2: Return JSON 401/403 (Not Redirects)

**WRONG:**
```javascript
app.post('/api/generate-program', (req, res, next) => {
  if (!req.user) {
    res.redirect('/login'); // ❌ Redirects instead of returning JSON
  }
  next();
});
```

**CORRECT:**
```javascript
app.post('/api/generate-program', (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid token.',
      statusCode: 401
    });
  }
  next();
});
```

### ✅ Requirement 3: Set Content-Type Header

**WRONG:**
```javascript
res.json({ success: true }); // Content-Type might not be set correctly
```

**CORRECT:**
```javascript
res.setHeader('Content-Type', 'application/json');
res.status(200).json({
  success: true,
  data: program,
  statusCode: 200
});
```

### ✅ Requirement 4: Handle All Errors as JSON

**WRONG:**
```javascript
const program = JSON.parse(openaiResponse); // No error handling
res.json({ success: true, data: program });
```

**CORRECT:**
```javascript
try {
  const program = JSON.parse(openaiResponse);
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

### ✅ Requirement 5: Validate Input

**WRONG:**
```javascript
const program = await generateWithAI(req.body); // No validation
```

**CORRECT:**
```javascript
const { programGoal, trainerId, equipment } = req.body;

if (!programGoal) {
  return res.status(400).json({
    success: false,
    error: 'Missing required field: programGoal',
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

const program = await generateWithAI(req.body);
```

---

## Complete Implementation Example

Here's a complete Express.js implementation:

```typescript
import express from 'express';
import { OpenAI } from 'openai';

const app = express();
app.use(express.json());

// Middleware: Set JSON content-type for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Middleware: Authentication (returns JSON 401, not redirect)
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid token.',
      statusCode: 401
    });
  }
  
  // Verify token (implement your auth logic here)
  // If invalid:
  // return res.status(401).json({...});
  
  next();
};

// GET /api/generate-program (Diagnostic)
app.get('/api/generate-program', (req, res) => {
  res.status(200).json({ ok: true });
});

// POST /api/generate-program
app.post('/api/generate-program', authMiddleware, async (req: express.Request, res: express.Response) => {
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

// POST /api/regenerate-program-section
app.post('/api/regenerate-program-section', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { section, context, prompt, trainerPreferences, currentProgram } = req.body;
    
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
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert fitness coach. Respond with valid JSON only.'
        },
        {
          role: 'user',
          content: `Regenerate the ${section} section: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    statusCode: 500
  });
});

// 404 handler (must return JSON)
app.use((req: express.Request, res: express.Response) => {
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

## Testing the Implementation

### Test 1: Diagnostic Endpoint
```bash
curl -X GET http://localhost:3000/api/generate-program
# Expected: { "ok": true }
```

### Test 2: Generate Program (with auth)
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

### Test 3: Missing Auth (should return JSON 401)
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -d '{"programGoal": "Build muscle", "trainerId": "trainer-123"}'
# Expected: { "success": false, "error": "Authentication required...", "statusCode": 401 }
```

### Test 4: Invalid Input (should return JSON 400)
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "programGoal": "Build muscle",
    "equipment": [],
    "trainerId": "trainer-123"
  }'
# Expected: { "success": false, "error": "Equipment array is required...", "statusCode": 400 }
```

---

## Troubleshooting

### Problem: "Endpoint not found" (404 HTML page)
**Solution:** Verify the endpoint is registered in your backend. Check that the route path is exactly `/api/generate-program` (not `/api/generateProgram` or other variations).

### Problem: "Cannot read property 'workoutDays' of undefined"
**Solution:** Verify the response includes all required fields. Check that the OpenAI response is being parsed correctly and includes the full program structure.

### Problem: "Authentication required" but I provided a token
**Solution:** Verify the token is valid and the authentication middleware is checking it correctly. Make sure the Authorization header format is `Bearer YOUR_TOKEN`.

### Problem: Response is HTML instead of JSON
**Solution:** Verify that:
1. The endpoint exists (not returning 404)
2. The Content-Type header is set to `application/json`
3. Error handlers return JSON, not HTML
4. No middleware is converting JSON to HTML

---

## Frontend Integration

The frontend is already configured to:
1. Call `/api/generate-program` with the form data
2. Handle JSON responses
3. Display errors from the API
4. Show loading states during generation

No frontend changes are needed. Just ensure the backend endpoints exist and return JSON.

---

## Documentation Files

- **API Endpoints:** `/src/lib/api-endpoints.ts`
- **Backend Implementation:** `/src/lib/api-backend-implementation.ts`
- **Implementation Checklist:** `/src/API_BACKEND_FIX_CHECKLIST.md`
- **Frontend Integration:** `/src/lib/ai-program-generator.ts`
- **Response Handler:** `/src/lib/api-response-handler.ts`

---

## Next Steps

1. **Implement the endpoints** using the code examples above
2. **Test each endpoint** using the curl commands
3. **Verify authentication** returns JSON 401 (not redirects)
4. **Run the checklist** to ensure everything works
5. **Test end-to-end** in the Trainer Hub UI

Once all endpoints are working and returning JSON, the AI Program Assistant will function properly.
