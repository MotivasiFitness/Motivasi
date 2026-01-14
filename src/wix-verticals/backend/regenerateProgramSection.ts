/**
 * Wix Velo HTTP Function: Regenerate Program Section
 * Endpoint: POST /_functions/regenerateProgramSection
 * 
 * Regenerates specific sections of a training program using OpenAI API
 * 
 * CRITICAL REQUIREMENTS:
 * - ALWAYS returns JSON with Content-Type: application/json
 * - NEVER redirects (returns 401/403/404/500 as JSON)
 * - Standardized response format with { success, statusCode }
 * 
 * Request Body:
 * {
 *   "section": "workout-day" | "exercise-substitutions" | "progression-guidance" | "warm-up-cool-down",
 *   "context": string,
 *   "prompt": string,
 *   "trainerPreferences": object,
 *   "currentProgram": object
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "data": { ... section-specific data ... }
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

interface RegenerateSectionRequest {
  section?: string;
  context?: string;
  prompt?: string;
  trainerPreferences?: any;
  currentProgram?: any;
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
function validateInput(body: RegenerateSectionRequest): { valid: boolean; error?: string } {
  const validSections = ['workout-day', 'exercise-substitutions', 'progression-guidance', 'warm-up-cool-down'];
  
  if (!body.section || !validSections.includes(body.section)) {
    return { valid: false, error: `section must be one of: ${validSections.join(', ')}` };
  }

  if (!body.context || typeof body.context !== 'string' || body.context.trim().length === 0) {
    return { valid: false, error: 'context is required and must be a non-empty string' };
  }

  if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
    return { valid: false, error: 'prompt is required and must be a non-empty string' };
  }

  return { valid: true };
}

/**
 * Builds the prompt for OpenAI based on section type
 */
function buildPrompt(input: RegenerateSectionRequest): string {
  const baseContext = `You are a professional fitness coach regenerating a specific section of a training program.

Current context: ${input.context}

Trainer's request: ${input.prompt}

${input.trainerPreferences ? `Trainer preferences: ${JSON.stringify(input.trainerPreferences)}` : ''}
`;

  switch (input.section) {
    case 'workout-day':
      return `${baseContext}

Generate a complete workout day with this structure (return ONLY valid JSON, no markdown):

{
  "day": "Day name/description",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": 3,
      "reps": "8-12",
      "weight": "Moderate",
      "restSeconds": 90,
      "notes": "Form cues",
      "substitutions": ["Alternative 1", "Alternative 2"]
    }
  ],
  "warmUp": "Warm-up description",
  "coolDown": "Cool-down description",
  "notes": "Day-specific notes"
}`;

    case 'exercise-substitutions':
      return `${baseContext}

Generate 3-5 alternative exercises. Return ONLY valid JSON:

{
  "substitutions": ["Exercise 1", "Exercise 2", "Exercise 3"]
}`;

    case 'progression-guidance':
      return `${baseContext}

Generate progression guidance (2-3 paragraphs). Return ONLY valid JSON:

{
  "progressionGuidance": "Detailed progression guidance text"
}`;

    case 'warm-up-cool-down':
      return `${baseContext}

Generate warm-up and cool-down routines. Return ONLY valid JSON:

{
  "warmUp": "Warm-up routine description",
  "coolDown": "Cool-down routine description"
}`;

    default:
      throw new Error('Invalid section type');
  }
}

/**
 * Calls OpenAI API to regenerate section
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
            content: 'You are a professional fitness coach. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    throw new Error(`Failed to regenerate section: ${errorMessage}`);
  }
}

/**
 * Main HTTP function handler
 */
export async function post_regenerateProgramSection(request: any): Promise<any> {
  try {
    // Parse request body
    let body: RegenerateSectionRequest;
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
    const sectionData = await callOpenAI(prompt);

    // Return success response
    return createResponse(200, true, sectionData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in regenerateProgramSection:', errorMessage);
    
    return createResponse(500, false, null, errorMessage);
  }
}
