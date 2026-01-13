/**
 * Wix Velo HTTP Function: Generate Program Description
 * Endpoint: POST /_functions/generateProgramDescription
 * 
 * Generates client-friendly program descriptions using OpenAI API
 * 
 * Request Body:
 * {
 *   "title": "12-Week Strength Building" (required),
 *   "duration": "12 weeks" (optional),
 *   "focusArea": "Strength" (optional),
 *   "style": "personalized and progressive" (optional),
 *   "equipment": ["dumbbells", "barbell"] (optional),
 *   "level": "intermediate" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "description": "This 12-week program..."
 * }
 * 
 * Error Response:
 * {
 *   "success": false,
 *   "error": "Error message"
 * }
 */

import { ok, badRequest, serverError } from 'wix-http-functions';
import { getSecret } from 'wix-secrets-backend';

interface GenerateDescriptionRequest {
  title?: string;
  duration?: string;
  focusArea?: string;
  style?: string;
  equipment?: string[];
  level?: string;
}

interface GenerateDescriptionResponse {
  success: boolean;
  description?: string;
  error?: string;
}

/**
 * Validates the request input
 */
function validateInput(body: GenerateDescriptionRequest): { valid: boolean; error?: string } {
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    return { valid: false, error: 'Title is required and must be a non-empty string' };
  }

  if (body.title.length > 500) {
    return { valid: false, error: 'Title must be less than 500 characters' };
  }

  if (body.duration && (typeof body.duration !== 'string' || body.duration.length > 200)) {
    return { valid: false, error: 'Duration must be a string less than 200 characters' };
  }

  if (body.focusArea && (typeof body.focusArea !== 'string' || body.focusArea.length > 200)) {
    return { valid: false, error: 'Focus area must be a string less than 200 characters' };
  }

  if (body.style && (typeof body.style !== 'string' || body.style.length > 200)) {
    return { valid: false, error: 'Style must be a string less than 200 characters' };
  }

  if (body.equipment && (!Array.isArray(body.equipment) || body.equipment.length > 20)) {
    return { valid: false, error: 'Equipment must be an array with max 20 items' };
  }

  if (body.level && (typeof body.level !== 'string' || !['beginner', 'intermediate', 'advanced'].includes(body.level))) {
    return { valid: false, error: 'Level must be one of: beginner, intermediate, advanced' };
  }

  return { valid: true };
}

/**
 * Builds the prompt for OpenAI
 */
function buildPrompt(input: GenerateDescriptionRequest): string {
  const equipmentList = input.equipment && input.equipment.length > 0 
    ? input.equipment.join(', ')
    : 'various equipment';

  return `You are a professional fitness coach writing program descriptions for clients.

Generate a 2-3 paragraph, client-friendly description for a fitness program with these details:

Program Title: ${input.title}
${input.duration ? `Duration: ${input.duration}` : ''}
${input.focusArea ? `Focus Area: ${input.focusArea}` : ''}
${input.style ? `Training Style: ${input.style}` : 'Training Style: personalized and progressive'}
${input.level ? `Experience Level: ${input.level}` : ''}
Equipment: ${equipmentList}

Requirements:
- Write 2-3 paragraphs (separated by blank lines)
- Use client-friendly, motivational language
- Avoid technical jargon
- Focus on benefits and outcomes
- Be encouraging and supportive
- Mention the program duration and focus area if provided
- Explain what the client can expect
- Emphasize support and guidance
- Do NOT include pricing or sales language
- Do NOT use markdown formatting
- Do NOT include bullet points
- Do NOT include any HTML or special formatting

Write the description now:`;
}

/**
 * Calls OpenAI API to generate description
 */
async function callOpenAI(prompt: string): Promise<string> {
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
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
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

    return data.choices[0].message.content.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate description: ${errorMessage}`);
  }
}

/**
 * Validates the generated description
 */
function validateDescription(description: string): { valid: boolean; error?: string } {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Generated description is empty' };
  }

  if (description.length < 100) {
    return { valid: false, error: 'Generated description is too short' };
  }

  // Check for minimum paragraphs
  const paragraphs = description.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length < 2) {
    return { valid: false, error: 'Generated description must have at least 2 paragraphs' };
  }

  // Check for dangerous content
  const dangerousKeywords = ['extreme', 'dangerous', 'unsafe', 'risky', 'guaranteed'];
  const lowerDesc = description.toLowerCase();
  for (const keyword of dangerousKeywords) {
    if (lowerDesc.includes(keyword)) {
      return { valid: false, error: `Generated description contains potentially unsafe language: "${keyword}"` };
    }
  }

  return { valid: true };
}

/**
 * Main HTTP function handler
 */
export async function post_generateProgramDescription(request: any): Promise<any> {
  try {
    // Parse request body
    let body: GenerateDescriptionRequest;
    try {
      body = request.body ? JSON.parse(request.body) : {};
    } catch (error) {
      return badRequest({
        success: false,
        error: 'Invalid JSON in request body',
      } as GenerateDescriptionResponse);
    }

    // Validate input
    const validation = validateInput(body);
    if (!validation.valid) {
      return badRequest({
        success: false,
        error: validation.error,
      } as GenerateDescriptionResponse);
    }

    // Build prompt
    const prompt = buildPrompt(body);

    // Call OpenAI
    const description = await callOpenAI(prompt);

    // Validate generated description
    const descValidation = validateDescription(description);
    if (!descValidation.valid) {
      return badRequest({
        success: false,
        error: descValidation.error,
      } as GenerateDescriptionResponse);
    }

    // Return success response
    return ok({
      success: true,
      description,
    } as GenerateDescriptionResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in generateProgramDescription:', errorMessage);
    
    return serverError({
      success: false,
      error: errorMessage,
    } as GenerateDescriptionResponse);
  }
}
