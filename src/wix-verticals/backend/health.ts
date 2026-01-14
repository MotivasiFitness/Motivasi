/**
 * Wix Velo HTTP Function: Health Check
 * Endpoint: GET /_functions/health
 * 
 * Simple health check endpoint for diagnostics
 * 
 * CRITICAL REQUIREMENTS:
 * - ALWAYS returns JSON with Content-Type: application/json
 * - Standardized response format with { success, statusCode }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "status": "healthy",
 *   "timestamp": "2026-01-14T...",
 *   "endpoints": {
 *     "generateProgram": "/_functions/generateProgram",
 *     "regenerateProgramSection": "/_functions/regenerateProgramSection",
 *     "generateProgramDescription": "/_functions/generateProgramDescription"
 *   }
 * }
 */

import { ok } from 'wix-http-functions';

interface HealthResponse {
  success: boolean;
  statusCode: number;
  status: string;
  timestamp: string;
  endpoints: {
    generateProgram: string;
    regenerateProgramSection: string;
    generateProgramDescription: string;
  };
}

/**
 * Main HTTP function handler
 */
export async function get_health(request: any): Promise<any> {
  const responseBody: HealthResponse = {
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

  // Ensure Content-Type is application/json
  response.headers = {
    ...response.headers,
    'Content-Type': 'application/json',
  };

  return response;
}
