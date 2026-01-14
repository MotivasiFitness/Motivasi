# API Standardization Implementation

## Overview
This document describes the standardization of API endpoints to ensure consistent JSON responses with proper status codes, no redirects, and standardized response formats.

## Changes Implemented

### 1. New Backend Functions Created

#### `/src/wix-verticals/backend/generateProgram.ts`
- **Endpoint**: `POST /_functions/generateProgram`
- **Purpose**: Generate complete training programs using OpenAI
- **Features**:
  - Always returns JSON with `Content-Type: application/json`
  - Never redirects (returns 401/403/404/500 as JSON)
  - Standardized response format: `{ success, statusCode, data/error }`
  - Comprehensive input validation
  - Proper error handling

#### `/src/wix-verticals/backend/regenerateProgramSection.ts`
- **Endpoint**: `POST /_functions/regenerateProgramSection`
- **Purpose**: Regenerate specific sections of training programs
- **Features**:
  - Always returns JSON with `Content-Type: application/json`
  - Never redirects (returns 401/403/404/500 as JSON)
  - Standardized response format: `{ success, statusCode, data/error }`
  - Section-specific validation and prompts
  - Proper error handling

#### `/src/wix-verticals/backend/health.ts`
- **Endpoint**: `GET /_functions/health`
- **Purpose**: Health check for diagnostics
- **Response**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "status": "healthy",
    "timestamp": "2026-01-14T...",
    "endpoints": {
      "generateProgram": "/_functions/generateProgram",
      "regenerateProgramSection": "/_functions/regenerateProgramSection",
      "generateProgramDescription": "/_functions/generateProgramDescription"
    }
  }
  ```

### 2. Updated Existing Backend Function

#### `/src/wix-verticals/backend/generateProgramDescription.ts`
- **Changes**:
  - Added `statusCode` to all responses
  - Standardized response format: `{ success, statusCode, description/error }`
  - Ensured `Content-Type: application/json` header
  - Created helper function `createResponse()` for consistent responses

### 3. Updated Documentation Files

#### `/src/lib/api-endpoints.ts`
- Added `HEALTH: '/api/health'` endpoint
- Updated `API_REQUIREMENTS` to include:
  - `ERROR_FORMAT`: Errors must include `{ success: false, statusCode, error }`
  - `SUCCESS_FORMAT`: Success must include `{ success: true, statusCode, data }`
- Added health check endpoint documentation
- Standardized all response format examples to show `statusCode` first

#### `/src/lib/api-backend-implementation.ts`
- Updated header to reference Wix Velo backend functions
- Added health check endpoint documentation
- Updated all response format examples to show consistent ordering: `{ success, statusCode, data/error }`
- Clarified that responses must include both `success` and `statusCode`

### 4. Updated Test Utilities

#### `/src/lib/api-test-utils.ts`
- Updated `runApiDiagnostics()` to:
  - Test `/api/health` endpoint first
  - Call `testProgramGeneration()` with sample body instead of empty POST
  - Removed empty POST requests that would fail validation

## Standardized Response Format

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400|401|403|404|500,
  "error": "Descriptive error message"
}
```

## Key Features

### 1. Always JSON
- All endpoints return JSON with `Content-Type: application/json`
- No HTML responses, even on errors
- No redirects to login pages

### 2. Standardized Status Codes
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### 3. Consistent Response Structure
- All responses include `success` boolean
- All responses include `statusCode` number
- Success responses include `data` object
- Error responses include `error` string

### 4. No Redirects
- Authentication failures return JSON 401/403
- Never redirect to login pages
- Never return HTML error pages

## Testing

### Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "statusCode": 200,
  "status": "healthy",
  "timestamp": "2026-01-14T...",
  "endpoints": { ... }
}
```

### Program Generation
```bash
curl -X POST http://localhost:3000/api/generate-program \
  -H "Content-Type: application/json" \
  -d '{
    "programGoal": "Build strength",
    "programLength": "8 weeks",
    "daysPerWeek": 3,
    "experienceLevel": "intermediate",
    "equipment": ["dumbbells", "barbell"],
    "timePerWorkout": 60,
    "trainerId": "trainer-123"
  }'
```

Expected success response:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "programName": "...",
    "overview": "...",
    "workoutDays": [...]
  }
}
```

Expected error response (validation):
```json
{
  "success": false,
  "statusCode": 400,
  "error": "programGoal is required and must be a non-empty string"
}
```

## Diagnostics

The updated `runApiDiagnostics()` function now:
1. Tests the health endpoint first
2. Tests program generation with valid sample data
3. Returns detailed results for each test

Use in your code:
```typescript
import { runApiDiagnostics, logApiTestResults } from '@/lib/api-test-utils';

const results = await runApiDiagnostics();
logApiTestResults(results);
```

## Migration Notes

### For Frontend Code
- Update response handling to check `response.success` and `response.statusCode`
- Access data via `response.data` (not directly on response)
- Access errors via `response.error` (not `response.message`)

### For Backend Code
- Ensure all responses include `success` and `statusCode`
- Use the helper functions in the backend files as templates
- Never redirect on authentication failure
- Always set `Content-Type: application/json` header

## Files Modified

### Created
- `/src/wix-verticals/backend/generateProgram.ts`
- `/src/wix-verticals/backend/regenerateProgramSection.ts`
- `/src/wix-verticals/backend/health.ts`
- `/src/API_STANDARDIZATION_IMPLEMENTATION.md`

### Updated
- `/src/wix-verticals/backend/generateProgramDescription.ts`
- `/src/lib/api-endpoints.ts`
- `/src/lib/api-backend-implementation.ts`
- `/src/lib/api-test-utils.ts`

## Next Steps

1. Deploy the new backend functions to Wix
2. Update frontend code to use standardized response format
3. Test all endpoints with the updated diagnostics
4. Monitor for any remaining HTML responses or redirects
