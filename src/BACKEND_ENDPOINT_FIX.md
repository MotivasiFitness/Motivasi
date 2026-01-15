# Backend Endpoint Fix - AI Program Generator

## Problem
The AI program generator endpoint `/_functions/generateProgram` is returning HTML (404 error page) instead of JSON, causing the error:
```
Failed to generate program: Program generation returned non-JSON response (200). 
Expected JSON but got text/html. This usually means the API endpoint is missing or returning an error page.
```

## Root Cause
The backend functions are implemented in `/src/wix-verticals/backend/` but are not being deployed to Wix's HTTP Functions system. This is a **deployment configuration issue**, not a code issue.

## Solution

### Step 1: Verify Backend Files Exist
The following files should exist (they do):
- `/src/wix-verticals/backend/generateProgram.ts` ✓
- `/src/wix-verticals/backend/generateProgramDescription.ts` ✓
- `/src/wix-verticals/backend/regenerateProgramSection.ts` ✓
- `/src/wix-verticals/backend/health.ts` ✓

### Step 2: Deploy Backend Functions to Wix

**CRITICAL:** These backend functions need to be deployed to your Wix site's backend. There are two ways to do this:

#### Option A: Using Wix Velo (Recommended for Wix Sites)

1. **Open Wix Editor**
   - Go to your Wix site dashboard
   - Click "Edit Site" to open the Wix Editor

2. **Enable Velo (if not already enabled)**
   - Click "Dev Mode" in the top menu
   - Enable Velo if prompted

3. **Create Backend HTTP Functions**
   - In the Velo sidebar, expand "Backend" section
   - Create a new folder called `http-functions`
   - Inside `http-functions`, create these files:

**File: `backend/http-functions/generateProgram.js`**
```javascript
import { ok, badRequest, serverError } from 'wix-http-functions';
import { getSecret } from 'wix-secrets-backend';

export async function post_generateProgram(request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.body.json();
    } catch (error) {
      return badRequest({ 
        success: false, 
        statusCode: 400, 
        error: 'Invalid JSON in request body' 
      });
    }

    // Validate input
    if (!body.programGoal || !body.trainerId) {
      return badRequest({ 
        success: false, 
        statusCode: 400, 
        error: 'programGoal and trainerId are required' 
      });
    }

    // Get OpenAI API key from secrets
    const apiKey = await getSecret('openai-api-key');
    if (!apiKey) {
      return serverError({ 
        success: false, 
        statusCode: 500, 
        error: 'OpenAI API key not configured' 
      });
    }

    // Build prompt
    const equipmentList = body.equipment && body.equipment.length > 0 
      ? body.equipment.join(', ')
      : 'bodyweight and basic equipment';

    const prompt = `You are a professional fitness coach creating a personalized training program.

Generate a complete training program with these parameters:

Goal: ${body.programGoal}
Duration: ${body.programLength || '8 weeks'}
Days per week: ${body.daysPerWeek || 3}
Experience level: ${body.experienceLevel || 'intermediate'}
Equipment: ${equipmentList}
Time per workout: ${body.timePerWorkout || 60} minutes
Injuries/Limitations: ${body.injuries || 'None'}
Training style: ${body.trainingStyle || 'balanced'}
${body.additionalNotes ? `Additional notes: ${body.additionalNotes}` : ''}

CRITICAL: You MUST return ONLY a valid JSON object. Do NOT include any markdown formatting, code blocks, or explanatory text.

Return this exact structure:

{
  "programName": "Descriptive program name",
  "overview": "2-3 paragraph overview of the program",
  "duration": "${body.programLength || '8 weeks'}",
  "focusArea": "${body.programGoal}",
  "weeklySplit": "Description of weekly training split",
  "workoutDays": [
    {
      "day": "Day 1 - Upper Body Push",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 3,
          "reps": "8-12",
          "weight": "Moderate to Heavy",
          "restSeconds": 90,
          "notes": "Focus on controlled eccentric",
          "substitutions": ["Dumbbell Press", "Push-ups"]
        }
      ],
      "warmUp": "5-10 minutes of light cardio",
      "coolDown": "5-10 minutes of static stretching",
      "notes": "Focus on form over weight"
    }
  ],
  "progressionGuidance": "Week 1-2: Focus on form...",
  "safetyNotes": "Always warm up properly...",
  "aiGenerated": true,
  "aiGeneratedAt": "${new Date().toISOString()}"
}

IMPORTANT: Include ${body.daysPerWeek || 3} workout days with 4-6 exercises each.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional fitness coach. You MUST respond with ONLY valid JSON - no markdown formatting, no code blocks, no explanatory text. Just pure JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return serverError({ 
        success: false, 
        statusCode: 500, 
        error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` 
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return serverError({ 
        success: false, 
        statusCode: 500, 
        error: 'Invalid response from OpenAI API' 
      });
    }

    const content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    // Parse and return JSON
    const program = JSON.parse(jsonString);

    // Return success response with proper headers
    const successResponse = ok({ 
      success: true, 
      statusCode: 200, 
      data: program 
    });
    
    successResponse.headers = {
      ...successResponse.headers,
      'Content-Type': 'application/json',
    };
    
    return successResponse;

  } catch (error) {
    console.error('Error in generateProgram:', error);
    
    const errorResponse = serverError({ 
      success: false, 
      statusCode: 500, 
      error: error.message || 'Unknown error' 
    });
    
    errorResponse.headers = {
      ...errorResponse.headers,
      'Content-Type': 'application/json',
    };
    
    return errorResponse;
  }
}
```

**File: `backend/http-functions/health.js`**
```javascript
import { ok } from 'wix-http-functions';

export async function get_health(request) {
  const responseBody = {
    success: true,
    statusCode: 200,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      generateProgram: '/_functions/generateProgram',
      regenerateProgramSection: '/_functions/regenerateProgramSection',
      generateProgramDescription: '/_functions/generateProgramDescription',
    },
  };

  const response = ok(responseBody);
  
  response.headers = {
    ...response.headers,
    'Content-Type': 'application/json',
  };

  return response;
}
```

4. **Configure OpenAI API Key in Secrets Manager**
   - In Velo sidebar, go to "Secrets Manager"
   - Add a new secret with key: `openai-api-key`
   - Paste your OpenAI API key as the value
   - Save

5. **Publish Your Site**
   - Click "Publish" in the top right
   - Wait for deployment to complete

#### Option B: Using External Backend (Alternative)

If you're not using Wix Velo, you need to:

1. Deploy the backend functions to your own server (Node.js, Python, etc.)
2. Update the API endpoint URLs in the frontend code
3. Configure CORS to allow requests from your Wix site

### Step 3: Test the Endpoint

After deployment, test the endpoint:

```bash
# Test health endpoint
curl https://your-site.wixsite.com/_functions/health

# Expected response:
{
  "success": true,
  "statusCode": 200,
  "status": "healthy",
  "timestamp": "2026-01-15T...",
  "endpoints": {
    "generateProgram": "/_functions/generateProgram",
    ...
  }
}
```

```bash
# Test generateProgram endpoint
curl -X POST https://your-site.wixsite.com/_functions/generateProgram \
  -H "Content-Type: application/json" \
  -d '{
    "programGoal": "Build strength",
    "programLength": "8 weeks",
    "daysPerWeek": 3,
    "experienceLevel": "intermediate",
    "equipment": ["dumbbells", "barbell"],
    "timePerWorkout": 60,
    "injuries": "None",
    "trainingStyle": "strength",
    "trainerId": "test-trainer-id"
  }'
```

### Step 4: Verify in Trainer Portal

1. Log in to the trainer portal
2. Navigate to "Create Program" or "AI Assistant"
3. Try generating a program
4. The endpoint should now return JSON instead of HTML

## Common Issues

### Issue: "OpenAI API key not configured"
**Solution:** Add your OpenAI API key to Wix Secrets Manager with key `openai-api-key`

### Issue: Still getting HTML response
**Solution:** 
- Verify the backend files are in the correct location: `backend/http-functions/`
- Check that the function names match: `post_generateProgram`, `get_health`
- Republish your site after making changes

### Issue: CORS errors
**Solution:** Wix Velo automatically handles CORS for same-site requests. If using external backend, configure CORS headers.

## Additional Resources

- [Wix Velo HTTP Functions Documentation](https://www.wix.com/velo/reference/wix-http-functions)
- [Wix Secrets Manager Documentation](https://www.wix.com/velo/reference/wix-secrets-backend)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

## Summary

The backend code is correct and complete. The issue is that the HTTP functions need to be deployed to Wix's backend infrastructure. Follow the steps above to deploy the functions and configure the OpenAI API key.
