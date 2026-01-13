/**
 * API Backend Implementation Guide
 * 
 * This file provides the COMPLETE backend implementation for the AI Program Assistant endpoints.
 * These endpoints MUST be implemented in your backend server (Node.js/Express, Python/Flask, etc.)
 * 
 * CRITICAL REQUIREMENTS:
 * 1. ALL responses MUST be JSON (never HTML)
 * 2. ALL error responses MUST be JSON with proper status codes (401, 403, 500, etc.)
 * 3. Authentication failures MUST return JSON 401/403 (never redirect to login page)
 * 4. Content-Type header MUST be 'application/json' for ALL responses
 * 5. No redirects should occur during API calls
 * 6. All error responses must follow the standard error format
 */

/**
 * ============================================================================
 * ENDPOINT 1: GET /api/generate-program (Diagnostic)
 * ============================================================================
 * 
 * Purpose: Diagnostic endpoint to verify the API is working
 * Returns: { ok: true } JSON response
 * 
 * Implementation (Express.js):
 * 
 * app.get('/api/generate-program', (req, res) => {
 *   res.setHeader('Content-Type', 'application/json');
 *   res.status(200).json({ ok: true });
 * });
 */

/**
 * ============================================================================
 * ENDPOINT 2: POST /api/generate-program
 * ============================================================================
 * 
 * Purpose: Generate a complete training program using AI
 * 
 * Request Body:
 * {
 *   "programGoal": string,           // e.g., "Build muscle", "Lose weight"
 *   "programLength": string,         // e.g., "8 weeks", "12 weeks"
 *   "daysPerWeek": number,           // 1-7
 *   "experienceLevel": string,       // "beginner" | "intermediate" | "advanced"
 *   "equipment": string[],           // e.g., ["dumbbells", "barbell"]
 *   "timePerWorkout": number,        // minutes (15-180)
 *   "injuries": string,              // comma-separated or description
 *   "trainingStyle": string,         // e.g., "strength", "hypertrophy"
 *   "additionalNotes": string,       // optional
 *   "trainerId": string              // ID of trainer creating program
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "programName": string,
 *     "overview": string,
 *     "duration": string,
 *     "focusArea": string,
 *     "weeklySplit": string,
 *     "workoutDays": [
 *       {
 *         "day": string,
 *         "exercises": [
 *           {
 *             "name": string,
 *             "sets": number,
 *             "reps": string,
 *             "weight": string,
 *             "restSeconds": number,
 *             "notes": string,
 *             "substitutions": string[]
 *           }
 *         ],
 *         "warmUp": string,
 *         "coolDown": string,
 *         "notes": string
 *       }
 *     ],
 *     "progressionGuidance": string,
 *     "safetyNotes": string,
 *     "aiGenerated": true,
 *     "aiGeneratedAt": string (ISO timestamp)
 *   },
 *   "statusCode": 200
 * }
 * 
 * Error Response (400/401/403/500):
 * {
 *   "success": false,
 *   "error": "Descriptive error message",
 *   "statusCode": number
 * }
 * 
 * Implementation (Express.js with OpenAI):
 * 
 * ```typescript
 * import express from 'express';
 * import { OpenAI } from 'openai';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * // Middleware: Set JSON content-type for all responses
 * app.use((req, res, next) => {
 *   res.setHeader('Content-Type', 'application/json');
 *   next();
 * });
 * 
 * // Middleware: Authentication (returns JSON 401, not redirect)
 * const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
 *   const token = req.headers.authorization?.split(' ')[1];
 *   
 *   if (!token) {
 *     return res.status(401).json({
 *       success: false,
 *       error: 'Authentication required. Please provide a valid token.',
 *       statusCode: 401
 *     });
 *   }
 *   
 *   // Verify token (implement your auth logic here)
 *   // If invalid:
 *   // return res.status(401).json({...});
 *   
 *   next();
 * };
 * 
 * // POST /api/generate-program
 * app.post('/api/generate-program', authMiddleware, async (req: express.Request, res: express.Response) => {
 *   try {
 *     const {
 *       programGoal,
 *       programLength,
 *       daysPerWeek,
 *       experienceLevel,
 *       equipment,
 *       timePerWorkout,
 *       injuries,
 *       trainingStyle,
 *       additionalNotes,
 *       trainerId
 *     } = req.body;
 *     
 *     // Validate required fields
 *     if (!programGoal || !trainerId) {
 *       return res.status(400).json({
 *         success: false,
 *         error: 'Missing required fields: programGoal, trainerId',
 *         statusCode: 400
 *       });
 *     }
 *     
 *     if (!Array.isArray(equipment) || equipment.length === 0) {
 *       return res.status(400).json({
 *         success: false,
 *         error: 'Equipment array is required and must not be empty',
 *         statusCode: 400
 *       });
 *     }
 *     
 *     // Validate numeric fields
 *     if (daysPerWeek < 1 || daysPerWeek > 7) {
 *       return res.status(400).json({
 *         success: false,
 *         error: 'daysPerWeek must be between 1 and 7',
 *         statusCode: 400
 *       });
 *     }
 *     
 *     if (timePerWorkout < 15 || timePerWorkout > 180) {
 *       return res.status(400).json({
 *         success: false,
 *         error: 'timePerWorkout must be between 15 and 180 minutes',
 *         statusCode: 400
 *       });
 *     }
 *     
 *     // Initialize OpenAI client
 *     const openai = new OpenAI({
 *       apiKey: process.env.OPENAI_API_KEY
 *     });
 *     
 *     // Build the prompt
 *     const prompt = `
 *       Create a detailed ${daysPerWeek}-day ${programGoal} training program for a ${experienceLevel} client.
 *       
 *       Program Details:
 *       - Duration: ${programLength}
 *       - Training Style: ${trainingStyle}
 *       - Available Equipment: ${equipment.join(', ')}
 *       - Time per Workout: ${timePerWorkout} minutes
 *       - Injuries/Limitations: ${injuries || 'None'}
 *       - Additional Notes: ${additionalNotes || 'None'}
 *       
 *       Return the program as a valid JSON object with this exact structure:
 *       {
 *         "programName": "string",
 *         "overview": "string",
 *         "duration": "string",
 *         "focusArea": "string",
 *         "weeklySplit": "string",
 *         "workoutDays": [
 *           {
 *             "day": "string",
 *             "exercises": [
 *               {
 *                 "name": "string",
 *                 "sets": number,
 *                 "reps": "string",
 *                 "weight": "string",
 *                 "restSeconds": number,
 *                 "notes": "string",
 *                 "substitutions": ["string"]
 *               }
 *             ],
 *             "warmUp": "string",
 *             "coolDown": "string",
 *             "notes": "string"
 *           }
 *         ],
 *         "progressionGuidance": "string",
 *         "safetyNotes": "string"
 *       }
 *       
 *       IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks.
 *     `;
 *     
 *     // Call OpenAI API
 *     const completion = await openai.chat.completions.create({
 *       model: 'gpt-4',
 *       messages: [
 *         {
 *           role: 'system',
 *           content: 'You are an expert fitness coach creating personalized training programs. Always respond with valid JSON only.'
 *         },
 *         {
 *           role: 'user',
 *           content: prompt
 *         }
 *       ],
 *       temperature: 0.7,
 *       max_tokens: 4000
 *     });
 *     
 *     // Extract and parse the response
 *     const responseText = completion.choices[0].message.content;
 *     if (!responseText) {
 *       throw new Error('Empty response from OpenAI');
 *     }
 *     
 *     // Parse JSON (handle potential markdown wrapping)
 *     let program;
 *     try {
 *       // Try direct parse first
 *       program = JSON.parse(responseText);
 *     } catch {
 *       // Try removing markdown code blocks if present
 *       const jsonMatch = responseText.match(/\{[\s\S]*\}/);
 *       if (!jsonMatch) {
 *         throw new Error('Could not extract JSON from OpenAI response');
 *       }
 *       program = JSON.parse(jsonMatch[0]);
 *     }
 *     
 *     // Add metadata
 *     program.aiGenerated = true;
 *     program.aiGeneratedAt = new Date().toISOString();
 *     
 *     // Return success response
 *     return res.status(200).json({
 *       success: true,
 *       data: program,
 *       statusCode: 200
 *     });
 *     
 *   } catch (error) {
 *     console.error('Program generation error:', error);
 *     
 *     // Determine appropriate status code
 *     let statusCode = 500;
 *     let errorMessage = 'Failed to generate program';
 *     
 *     if (error instanceof Error) {
 *       errorMessage = error.message;
 *       
 *       // Handle specific error types
 *       if (error.message.includes('API key')) {
 *         statusCode = 500;
 *         errorMessage = 'Server configuration error: OpenAI API key not configured';
 *       } else if (error.message.includes('rate limit')) {
 *         statusCode = 429;
 *         errorMessage = 'Rate limit exceeded. Please try again later.';
 *       } else if (error.message.includes('timeout')) {
 *         statusCode = 504;
 *         errorMessage = 'Request timeout. Please try again.';
 *       }
 *     }
 *     
 *     // IMPORTANT: Always return JSON, never HTML
 *     return res.status(statusCode).json({
 *       success: false,
 *       error: errorMessage,
 *       statusCode
 *     });
 *   }
 * });
 * ```
 */

/**
 * ============================================================================
 * ENDPOINT 3: POST /api/regenerate-program-section
 * ============================================================================
 * 
 * Purpose: Regenerate a specific section of an existing program
 * 
 * Request Body:
 * {
 *   "section": "workout-day" | "exercise-substitutions" | "progression-guidance" | "warm-up-cool-down",
 *   "context": string,               // Current section context
 *   "prompt": string,                // Specific regeneration request
 *   "trainerPreferences": object,    // Trainer's style preferences
 *   "currentProgram": object         // Full current program data
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     // Response structure depends on section type
 *     // For workout-day: full WorkoutDay object
 *     // For exercise-substitutions: { substitutions: string[] }
 *     // For progression-guidance: { progressionGuidance: string }
 *     // For warm-up-cool-down: { warmUp: string, coolDown: string }
 *   },
 *   "statusCode": 200
 * }
 * 
 * Error Response (400/401/403/500):
 * {
 *   "success": false,
 *   "error": "Descriptive error message",
 *   "statusCode": number
 * }
 * 
 * Implementation (Express.js):
 * 
 * ```typescript
 * app.post('/api/regenerate-program-section', authMiddleware, async (req: express.Request, res: express.Response) => {
 *   try {
 *     const { section, context, prompt, trainerPreferences, currentProgram } = req.body;
 *     
 *     // Validate required fields
 *     if (!section || !['workout-day', 'exercise-substitutions', 'progression-guidance', 'warm-up-cool-down'].includes(section)) {
 *       return res.status(400).json({
 *         success: false,
 *         error: 'Invalid section type',
 *         statusCode: 400
 *       });
 *     }
 *     
 *     if (!prompt) {
 *       return res.status(400).json({
 *         success: false,
 *         error: 'Prompt is required',
 *         statusCode: 400
 *       });
 *     }
 *     
 *     // Initialize OpenAI client
 *     const openai = new OpenAI({
 *       apiKey: process.env.OPENAI_API_KEY
 *     });
 *     
 *     // Build section-specific prompt
 *     let sectionPrompt = '';
 *     
 *     switch (section) {
 *       case 'workout-day':
 *         sectionPrompt = `Regenerate a workout day for this program. ${prompt}`;
 *         break;
 *       case 'exercise-substitutions':
 *         sectionPrompt = `Provide alternative exercises for: ${prompt}`;
 *         break;
 *       case 'progression-guidance':
 *         sectionPrompt = `Create progression guidance for: ${prompt}`;
 *         break;
 *       case 'warm-up-cool-down':
 *         sectionPrompt = `Create warm-up and cool-down routines for: ${prompt}`;
 *         break;
 *     }
 *     
 *     // Call OpenAI API
 *     const completion = await openai.chat.completions.create({
 *       model: 'gpt-4',
 *       messages: [
 *         {
 *           role: 'system',
 *           content: 'You are an expert fitness coach. Respond with valid JSON only.'
 *         },
 *         {
 *           role: 'user',
 *           content: sectionPrompt
 *         }
 *       ],
 *       temperature: 0.7,
 *       max_tokens: 2000
 *     });
 *     
 *     // Parse response
 *     const responseText = completion.choices[0].message.content;
 *     if (!responseText) {
 *       throw new Error('Empty response from OpenAI');
 *     }
 *     
 *     let data;
 *     try {
 *       data = JSON.parse(responseText);
 *     } catch {
 *       const jsonMatch = responseText.match(/\{[\s\S]*\}/);
 *       if (!jsonMatch) {
 *         throw new Error('Could not extract JSON from OpenAI response');
 *       }
 *       data = JSON.parse(jsonMatch[0]);
 *     }
 *     
 *     // Return success response
 *     return res.status(200).json({
 *       success: true,
 *       data,
 *       statusCode: 200
 *     });
 *     
 *   } catch (error) {
 *     console.error('Section regeneration error:', error);
 *     
 *     const statusCode = 500;
 *     const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate section';
 *     
 *     return res.status(statusCode).json({
 *       success: false,
 *       error: errorMessage,
 *       statusCode
 *     });
 *   }
 * });
 * ```
 */

/**
 * ============================================================================
 * CRITICAL ERROR HANDLING MIDDLEWARE
 * ============================================================================
 * 
 * These middleware functions MUST be implemented to ensure all responses are JSON.
 * 
 * ```typescript
 * // Global error handler (must return JSON)
 * app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
 *   console.error('Unhandled error:', err);
 *   
 *   res.setHeader('Content-Type', 'application/json');
 *   res.status(500).json({
 *     success: false,
 *     error: err.message || 'Internal server error',
 *     statusCode: 500
 *   });
 * });
 * 
 * // 404 handler (must return JSON)
 * app.use((req: express.Request, res: express.Response) => {
 *   res.setHeader('Content-Type', 'application/json');
 *   res.status(404).json({
 *     success: false,
 *     error: `Endpoint not found: ${req.method} ${req.path}`,
 *     statusCode: 404
 *   });
 * });
 * ```
 */

/**
 * ============================================================================
 * TESTING THE ENDPOINTS
 * ============================================================================
 * 
 * Test 1: Diagnostic endpoint
 * ```bash
 * curl -X GET http://localhost:3000/api/generate-program \
 *   -H "Content-Type: application/json"
 * 
 * Expected response:
 * { "ok": true }
 * ```
 * 
 * Test 2: Generate program (with authentication)
 * ```bash
 * curl -X POST http://localhost:3000/api/generate-program \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -d '{
 *     "programGoal": "Build muscle",
 *     "programLength": "8 weeks",
 *     "daysPerWeek": 4,
 *     "experienceLevel": "intermediate",
 *     "equipment": ["dumbbells", "barbell"],
 *     "timePerWorkout": 60,
 *     "injuries": "None",
 *     "trainingStyle": "Hypertrophy",
 *     "trainerId": "trainer-123"
 *   }'
 * 
 * Expected response:
 * {
 *   "success": true,
 *   "data": { ... program data ... },
 *   "statusCode": 200
 * }
 * ```
 * 
 * Test 3: Test authentication failure (should return JSON 401, not redirect)
 * ```bash
 * curl -X POST http://localhost:3000/api/generate-program \
 *   -H "Content-Type: application/json" \
 *   -d '{"programGoal": "Build muscle", "trainerId": "trainer-123"}'
 * 
 * Expected response (JSON 401):
 * {
 *   "success": false,
 *   "error": "Authentication required. Please provide a valid token.",
 *   "statusCode": 401
 * }
 * ```
 */

export const BACKEND_IMPLEMENTATION_GUIDE = {
  endpoints: [
    {
      method: 'GET',
      path: '/api/generate-program',
      purpose: 'Diagnostic endpoint',
      requiresAuth: false,
      returns: { ok: true }
    },
    {
      method: 'POST',
      path: '/api/generate-program',
      purpose: 'Generate complete training program',
      requiresAuth: true,
      returns: 'GeneratedProgram with metadata'
    },
    {
      method: 'POST',
      path: '/api/regenerate-program-section',
      purpose: 'Regenerate specific program section',
      requiresAuth: true,
      returns: 'Section-specific data'
    }
  ],
  criticalRequirements: [
    'ALL responses MUST be JSON',
    'ALL error responses MUST be JSON with proper status codes',
    'Authentication failures MUST return JSON 401/403 (never redirect)',
    'Content-Type header MUST be application/json',
    'No redirects during API calls',
    'Proper error handling middleware'
  ]
};

export default BACKEND_IMPLEMENTATION_GUIDE;
