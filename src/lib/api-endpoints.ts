/**
 * API Endpoints Configuration and Documentation
 * 
 * This file documents the required API endpoints for the AI Program Assistant.
 * These endpoints MUST be implemented in your backend to handle program generation.
 * 
 * CRITICAL REQUIREMENTS:
 * 1. All endpoints MUST return JSON (never HTML)
 * 2. Authentication failures MUST return JSON 401/403 (never redirect)
 * 3. Errors MUST be returned as structured JSON objects
 * 4. Content-Type header MUST be 'application/json' for all responses
 * 5. No redirects should occur during program generation
 */

/**
 * POST /api/generate-program
 * 
 * Generates a training program using AI based on client parameters.
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
 *   "trainerId": string,             // ID of trainer creating program
 *   "clientId": string               // optional: for client-aware generation
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
 *   }
 * }
 * 
 * Error Response (400/401/403/500):
 * {
 *   "success": false,
 *   "error": "Descriptive error message",
 *   "statusCode": number
 * }
 * 
 * IMPORTANT:
 * - MUST return JSON, never HTML
 * - MUST set Content-Type: application/json
 * - MUST validate authentication and return 401 if not authenticated
 * - MUST validate authorization and return 403 if not authorized
 * - MUST NOT redirect on authentication failure
 * - MUST handle OpenAI API errors gracefully
 * - MUST validate all input parameters
 */

/**
 * POST /api/regenerate-program-section
 * 
 * Regenerates a specific section of an existing program.
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
 *   }
 * }
 * 
 * Error Response (400/401/403/500):
 * {
 *   "success": false,
 *   "error": "Descriptive error message",
 *   "statusCode": number
 * }
 * 
 * IMPORTANT:
 * - MUST return JSON, never HTML
 * - MUST set Content-Type: application/json
 * - MUST validate authentication and return 401 if not authenticated
 * - MUST NOT redirect on authentication failure
 * - MUST handle OpenAI API errors gracefully
 */

/**
 * Example Backend Implementation (Node.js/Express)
 * 
 * CRITICAL: This shows the CORRECT way to implement these endpoints
 * 
 * ```typescript
 * import express from 'express';
 * import { OpenAI } from 'openai';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * // Middleware: Ensure all responses are JSON
 * app.use((req, res, next) => {
 *   res.setHeader('Content-Type', 'application/json');
 *   next();
 * });
 * 
 * // Middleware: Authentication check (returns JSON, not redirect)
 * app.use((req, res, next) => {
 *   const token = req.headers.authorization?.split(' ')[1];
 *   if (!token) {
 *     return res.status(401).json({
 *       success: false,
 *       error: 'Authentication required',
 *       statusCode: 401
 *     });
 *   }
 *   // Verify token...
 *   next();
 * });
 * 
 * // POST /api/generate-program
 * app.post('/api/generate-program', async (req, res) => {
 *   try {
 *     const { programGoal, daysPerWeek, experienceLevel, equipment, trainerId } = req.body;
 *     
 *     // Validate input
 *     if (!programGoal || !trainerId) {
 *       return res.status(400).json({
 *         success: false,
 *         error: 'Missing required fields: programGoal, trainerId',
 *         statusCode: 400
 *       });
 *     }
 *     
 *     // Call OpenAI API
 *     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *     const completion = await openai.chat.completions.create({
 *       model: 'gpt-4',
 *       messages: [
 *         {
 *           role: 'system',
 *           content: 'You are a professional fitness coach creating personalized training programs.'
 *         },
 *         {
 *           role: 'user',
 *           content: `Create a ${daysPerWeek}-day ${programGoal} program for a ${experienceLevel} client with ${equipment.join(', ')} equipment.`
 *         }
 *       ]
 *     });
 *     
 *     // Parse response
 *     const programText = completion.choices[0].message.content;
 *     const program = JSON.parse(programText);
 *     
 *     // Return success response
 *     return res.status(200).json({
 *       success: true,
 *       data: program,
 *       statusCode: 200
 *     });
 *   } catch (error) {
 *     console.error('Program generation error:', error);
 *     
 *     // IMPORTANT: Always return JSON, never HTML
 *     return res.status(500).json({
 *       success: false,
 *       error: error instanceof Error ? error.message : 'Failed to generate program',
 *       statusCode: 500
 *     });
 *   }
 * });
 * 
 * // Error handling middleware (must return JSON)
 * app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
 *   console.error('Unhandled error:', err);
 *   res.status(500).json({
 *     success: false,
 *     error: 'Internal server error',
 *     statusCode: 500
 *   });
 * });
 * 
 * // 404 handler (must return JSON)
 * app.use((req: express.Request, res: express.Response) => {
 *   res.status(404).json({
 *     success: false,
 *     error: `Endpoint not found: ${req.method} ${req.path}`,
 *     statusCode: 404
 *   });
 * });
 * ```
 */

export const API_ENDPOINTS = {
  GENERATE_PROGRAM: '/api/generate-program',
  REGENERATE_SECTION: '/api/regenerate-program-section',
} as const;

export const API_REQUIREMENTS = {
  ALWAYS_JSON: 'All responses must be JSON, never HTML',
  NO_REDIRECTS: 'No redirects on authentication failure - return 401/403 JSON instead',
  CONTENT_TYPE: 'Content-Type header must be application/json',
  ERROR_FORMAT: 'Errors must be structured JSON with error message',
  VALIDATION: 'All input parameters must be validated',
} as const;

export default {
  API_ENDPOINTS,
  API_REQUIREMENTS,
};
