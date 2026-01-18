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

type AnyRequest = { path?: string };

type HealthResponse = {
  success: boolean;
  statusCode: number;
  status: 'healthy';
  timestamp: string;
  environment?: 'preview' | 'production';
  endpoints: {
    health: string;
    parq: string;
    generateProgram: string;
    regenerateProgramSection: string;
    generateProgramDescription: string;
  };
};

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function options_health() {
  return ok({ success: true, statusCode: 200 }, { headers: JSON_HEADERS });
}

export function get_health(request: AnyRequest) {
  const isDev = typeof request?.path === 'string' && request.path.includes('-dev');

  const body: HealthResponse = {
    success: true,
    statusCode: 200,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: isDev ? 'preview' : 'production',
    endpoints: {
      health: '/_functions/health',
      parq: '/_functions/parq',
      generateProgram: '/_functions/generateProgram',
      regenerateProgramSection: '/_functions/regenerateProgramSection',
      generateProgramDescription: '/_functions/generateProgramDescription',
    },
  };

  return ok(body, { headers: JSON_HEADERS });
}
