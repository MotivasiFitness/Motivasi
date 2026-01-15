/**
 * Wix Velo HTTP Function: Generate Training Program
 * Endpoint: POST /_functions/generateProgram
 * 
 * Generates complete training programs using OpenAI API
 * 
 * CRITICAL REQUIREMENTS:
 * - ALWAYS returns JSON with Content-Type: application/json
 * - NEVER redirects (returns 401/403/404/500 as JSON)
 * - Standardized response format with { success, statusCode }
 * 
 * Request Body:
 * {
 *   "programGoal": string,
 *   "programLength": string,
 *   "daysPerWeek": number,
 *   "experienceLevel": string,
 *   "equipment": string[],
 *   "timePerWorkout": number,
 *   "injuries": string,
 *   "trainingStyle": string,
 *   "additionalNotes": string,
 *   "trainerId": string
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "data": { ... program data ... }
 * }
 * 
 * Error Response (400/401/403/500):
 * {
 *   "success": false,
 *   "statusCode": number,
 *   "error": "Error message"
 * }
 */

import { ok, badRequest, serverError, unauthorized, forbidden, notFound } from 'wix-http-functions';
import { getSecret } from 'wix-secrets-backend';

interface GenerateProgramRequest {
  programGoal?: string;
  programLength?: string;
  daysPerWeek?: number;
  experienceLevel?: string;
  equipment?: string[];
  timePerWorkout?: number;
  injuries?: string;
  trainingStyle?: string;
  additionalNotes?: string;
  trainerId?: string;
}

interface ApiResponse {
  success: boolean;
  statusCode: number;
  data?: any;
  error?: string;
}

/**
 * Helper to create standardized JSON response
 */
function createResponse(status: number, success: boolean, data?: any, error?: string): any {
  const responseBody: ApiResponse = {
    success,
    statusCode: status,
  };

  if (data) {
    responseBody.data = data;
  }

  if (error) {
    responseBody.error = error;
  }

  const response = status === 200 ? ok(responseBody) :
                   status === 400 ? badRequest(responseBody) :
                   status === 401 ? unauthorized(responseBody) :
                   status === 403 ? forbidden(responseBody) :
                   status === 404 ? notFound(responseBody) :
                   serverError(responseBody);

  // Ensure Content-Type is application/json
  response.headers = {
    ...response.headers,
    'Content-Type': 'application/json',
  };

  return response;
}

/**
 * Validates the request input
 */
function validateInput(body: GenerateProgramRequest): { valid: boolean; error?: string } {
  if (!body.programGoal || typeof body.programGoal !== 'string' || body.programGoal.trim().length === 0) {
    return { valid: false, error: 'programGoal is required and must be a non-empty string' };
  }

  if (!body.trainerId || typeof body.trainerId !== 'string' || body.trainerId.trim().length === 0) {
    return { valid: false, error: 'trainerId is required and must be a non-empty string' };
  }

  if (body.daysPerWeek && (typeof body.daysPerWeek !== 'number' || body.daysPerWeek < 1 || body.daysPerWeek > 7)) {
    return { valid: false, error: 'daysPerWeek must be a number between 1 and 7' };
  }

  if (body.timePerWorkout && (typeof body.timePerWorkout !== 'number' || body.timePerWorkout < 15 || body.timePerWorkout > 180)) {
    return { valid: false, error: 'timePerWorkout must be a number between 15 and 180' };
  }

  if (body.experienceLevel && !['beginner', 'intermediate', 'advanced'].includes(body.experienceLevel)) {
    return { valid: false, error: 'experienceLevel must be one of: beginner, intermediate, advanced' };
  }

  if (body.equipment && !Array.isArray(body.equipment)) {
    return { valid: false, error: 'equipment must be an array' };
  }

  return { valid: true };
}

/**
 * Builds the prompt for OpenAI
 */
function buildPrompt(input: GenerateProgramRequest): string {
  const equipmentList = input.equipment && input.equipment.length > 0 
    ? input.equipment.join(', ')
    : 'bodyweight and basic equipment';

  return `You are a professional fitness coach creating a personalized training program.

Generate a complete training program with these parameters:

Goal: ${input.programGoal}
Duration: ${input.programLength || '8 weeks'}
Days per week: ${input.daysPerWeek || 3}
Experience level: ${input.experienceLevel || 'intermediate'}
Equipment: ${equipmentList}
Time per workout: ${input.timePerWorkout || 60} minutes
Injuries/Limitations: ${input.injuries || 'None'}
Training style: ${input.trainingStyle || 'balanced'}
${input.additionalNotes ? `Additional notes: ${input.additionalNotes}` : ''}

CRITICAL: You MUST return ONLY a valid JSON object. Do NOT include any markdown formatting, code blocks, or explanatory text.

Return this exact structure:

{
  "programName": "Descriptive program name",
  "overview": "2-3 paragraph overview of the program explaining the approach, benefits, and what the client can expect",
  "duration": "${input.programLength || '8 weeks'}",
  "focusArea": "${input.programGoal}",
  "weeklySplit": "Description of weekly training split (e.g., 'Upper/Lower split with 4 training days')",
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
          "notes": "Focus on controlled eccentric, explosive concentric. Keep shoulder blades retracted.",
          "substitutions": ["Dumbbell Press", "Push-ups"]
        },
        {
          "name": "Overhead Press",
          "sets": 3,
          "reps": "8-10",
          "weight": "Moderate",
          "restSeconds": 90,
          "notes": "Maintain core stability. Avoid excessive back arch.",
          "substitutions": ["Dumbbell Shoulder Press", "Arnold Press"]
        }
      ],
      "warmUp": "5-10 minutes of light cardio followed by dynamic stretches for shoulders and chest. Include arm circles, band pull-aparts, and light sets of the main exercises.",
      "coolDown": "5-10 minutes of static stretching focusing on chest, shoulders, and triceps. Include doorway chest stretch and overhead tricep stretch.",
      "notes": "Focus on form over weight. Rest 2-3 minutes between compound movements if needed."
    }
  ],
  "progressionGuidance": "Week 1-2: Focus on form and technique. Week 3-4: Increase weight by 5-10% when able to complete all reps with good form. Week 5-6: Add an extra set to main lifts. Week 7-8: Increase weight again or reduce rest periods.",
  "safetyNotes": "Always warm up properly. Stop immediately if you experience sharp pain. Maintain proper form throughout all exercises. Stay hydrated and listen to your body.",
  "aiGenerated": true,
  "aiGeneratedAt": "${new Date().toISOString()}"
}

IMPORTANT REQUIREMENTS:
1. Return ONLY the JSON object - no markdown, no code blocks, no extra text
2. Include ${input.daysPerWeek || 3} workout days in the workoutDays array
3. Each workout should have 4-6 exercises appropriate for the ${input.timePerWorkout || 60} minute duration
4. All exercises must include substitutions array with at least 2 alternatives
5. Consider the injuries/limitations: ${input.injuries || 'None'}
6. Match the training style: ${input.trainingStyle || 'balanced'}
7. Use equipment available: ${equipmentList}`;
}

/**
 * Calls OpenAI API to generate program
 */
async function callOpenAI(prompt: string): Promise<any> {
  try {
    const apiKey = await getSecret('openai-api-key');
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

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
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    // Parse and return JSON
    return JSON.parse(jsonString);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate program: ${errorMessage}`);
  }
}

/**
 * Main HTTP function handler
 */
export async function post_generateProgram(request: any): Promise<any> {
  try {
    // Parse request body
    let body: GenerateProgramRequest;
    try {
      body = request.body ? JSON.parse(request.body) : {};
    } catch (error) {
      return createResponse(400, false, null, 'Invalid JSON in request body');
    }

    // Validate input
    const validation = validateInput(body);
    if (!validation.valid) {
      return createResponse(400, false, null, validation.error);
    }

    // Build prompt
    const prompt = buildPrompt(body);

    // Call OpenAI
    const program = await callOpenAI(prompt);

    // Return success response
    return createResponse(200, true, program);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in generateProgram:', errorMessage);
    
    return createResponse(500, false, null, errorMessage);
  }
}
