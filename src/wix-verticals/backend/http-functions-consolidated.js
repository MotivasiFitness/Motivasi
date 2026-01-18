/**
 * ============================================================================
 * WIX HTTP FUNCTIONS - CONSOLIDATED FILE
 * ============================================================================
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Open your Wix site in the Wix Editor
 * 2. Click "Dev Mode" in the top menu
 * 3. In the left sidebar, navigate to "Backend" section
 * 4. Create a new file called "http-functions.js" in the "backend" folder
 *    - Path MUST be: backend/http-functions.js (not in any subfolder)
 * 5. Copy this ENTIRE file content into backend/http-functions.js
 * 6. Save the file
 * 7. Publish your site
 * 
 * VERIFICATION:
 * 
 * After deployment, test these URLs in your browser:
 * 
 * Preview/Dev Mode:
 * - https://yoursite.wixsite.com/yoursite/_functions-dev/health
 * - https://yoursite.wixsite.com/yoursite/_functions-dev/parq (should show 405 Method Not Allowed for GET)
 * 
 * Live Site:
 * - https://yoursite.com/_functions/health
 * - https://yoursite.com/_functions/parq (should show 405 Method Not Allowed for GET)
 * 
 * All endpoints MUST return JSON, not HTML. If you see HTML, the function is not deployed correctly.
 * 
 * ============================================================================
 */

import { ok, badRequest, serverError, notFound } from 'wix-http-functions';
import wixData from 'wix-data';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create standardized JSON response
 */
function jsonResponse(statusCode, body) {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Handle CORS preflight for all endpoints
 */
function handleCorsPrelight() {
  return {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * GET /_functions/health
 * GET /_functions-dev/health
 * 
 * Simple health check endpoint for diagnostics
 */
export async function get_health(request) {
  console.log('Health check endpoint called');
  
  return jsonResponse(200, {
    success: true,
    statusCode: 200,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: request.path.includes('-dev') ? 'preview' : 'production',
    endpoints: {
      health: '/_functions/health',
      parq: '/_functions/parq',
      generateProgram: '/_functions/generateProgram',
      regenerateProgramSection: '/_functions/regenerateProgramSection',
      generateProgramDescription: '/_functions/generateProgramDescription',
      uploadProfilePhoto: '/_functions/uploadProfilePhoto'
    }
  });
}

/**
 * OPTIONS /_functions/health
 */
export async function options_health(request) {
  return handleCorsPrelight();
}

// ============================================================================
// PAR-Q SUBMISSION ENDPOINT
// ============================================================================

/**
 * POST /_functions/parq
 * POST /_functions-dev/parq
 * 
 * Handles PAR-Q form submissions and saves to ParqSubmissions collection
 * 
 * Request Body:
 * {
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   dateOfBirth: string (ISO date),
 *   hasHeartCondition?: boolean,
 *   currentlyTakingMedication?: boolean,
 *   ...other form fields
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "itemId": "abc123",
 *   "message": "PAR-Q submission saved successfully"
 * }
 * 
 * Error Response (400/500):
 * {
 *   "success": false,
 *   "statusCode": number,
 *   "error": "Error message"
 * }
 */
export async function post_parq(request) {
  try {
    console.log('=== PAR-Q Submission Backend ===');
    console.log('Request method:', request.method);
    console.log('Request path:', request.path);
    
    // Parse request body
    let requestData;
    try {
      if (typeof request.body === 'string') {
        requestData = JSON.parse(request.body);
      } else if (request.body && typeof request.body === 'object') {
        requestData = request.body;
      } else {
        throw new Error('Invalid request body format');
      }
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'Invalid JSON in request body'
      });
    }

    console.log('Parsed request data keys:', Object.keys(requestData));

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      console.error('Invalid email format:', requestData.email);
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'Invalid email format'
      });
    }

    // Prepare data for ParqSubmissions collection
    const submissionData = {
      // Core fields that exist in the collection
      firstName: requestData.firstName,
      lastName: requestData.lastName,
      email: requestData.email,
      clientName: `${requestData.firstName} ${requestData.lastName}`,
      
      // Date of birth (convert to Date object if string)
      dateOfBirth: requestData.dateOfBirth ? new Date(requestData.dateOfBirth) : undefined,
      
      // Boolean health fields
      hasHeartCondition: requestData.hasHeartCondition || false,
      currentlyTakingMedication: requestData.currentlyTakingMedication || false
    };

    console.log('Prepared submission data:', {
      firstName: submissionData.firstName,
      lastName: submissionData.lastName,
      email: submissionData.email,
      dateOfBirth: submissionData.dateOfBirth,
      hasHeartCondition: submissionData.hasHeartCondition,
      currentlyTakingMedication: submissionData.currentlyTakingMedication
    });

    // Insert into ParqSubmissions collection
    console.log('Inserting into ParqSubmissions collection...');
    const insertResult = await wixData.insert('ParqSubmissions', submissionData);
    
    console.log('Insert successful!');
    console.log('Submission ID:', insertResult._id);

    // Return success response
    return jsonResponse(200, {
      success: true,
      statusCode: 200,
      itemId: insertResult._id,
      submissionId: insertResult._id,
      message: 'PAR-Q submission saved successfully'
    });

  } catch (error) {
    console.error('=== PAR-Q Submission Error ===');
    console.error('Error type:', error.constructor?.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Handle specific errors
    if (error.message?.includes('Collection') || error.message?.includes('not found')) {
      return jsonResponse(500, {
        success: false,
        statusCode: 500,
        error: 'ParqSubmissions collection not found or not accessible'
      });
    }

    if (error.message?.includes('field') || error.message?.includes('schema')) {
      return jsonResponse(500, {
        success: false,
        statusCode: 500,
        error: 'Collection schema mismatch - please check ParqSubmissions collection fields'
      });
    }

    return jsonResponse(500, {
      success: false,
      statusCode: 500,
      error: error.message || 'Failed to save PAR-Q submission'
    });
  }
}

/**
 * GET /_functions/parq
 * 
 * Returns method not allowed for GET requests
 */
export async function get_parq(request) {
  return jsonResponse(405, {
    success: false,
    statusCode: 405,
    error: 'Method Not Allowed. Use POST to submit PAR-Q data.',
    allowedMethods: ['POST', 'OPTIONS']
  });
}

/**
 * OPTIONS /_functions/parq
 */
export async function options_parq(request) {
  return handleCorsPrelight();
}

// ============================================================================
// PROGRAM GENERATION ENDPOINTS
// ============================================================================

/**
 * POST /_functions/generateProgram
 * 
 * Generates a fitness program using AI
 */
export async function post_generateProgram(request) {
  try {
    console.log('Generate Program endpoint called');
    
    // Parse request body
    let requestData;
    try {
      if (typeof request.body === 'string') {
        requestData = JSON.parse(request.body);
      } else {
        requestData = request.body;
      }
    } catch (parseError) {
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'Invalid JSON in request body'
      });
    }

    // TODO: Implement actual program generation logic
    // For now, return a placeholder response
    return jsonResponse(200, {
      success: true,
      statusCode: 200,
      message: 'Program generation endpoint is active',
      note: 'Actual AI generation logic needs to be implemented'
    });

  } catch (error) {
    console.error('Generate Program Error:', error);
    return jsonResponse(500, {
      success: false,
      statusCode: 500,
      error: error.message || 'Failed to generate program'
    });
  }
}

export async function options_generateProgram(request) {
  return handleCorsPrelight();
}

/**
 * POST /_functions/generateProgramDescription
 * 
 * Generates a program description using AI
 */
export async function post_generateProgramDescription(request) {
  try {
    console.log('Generate Program Description endpoint called');
    
    // Parse request body
    let requestData;
    try {
      if (typeof request.body === 'string') {
        requestData = JSON.parse(request.body);
      } else {
        requestData = request.body;
      }
    } catch (parseError) {
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'Invalid JSON in request body'
      });
    }

    // TODO: Implement actual description generation logic
    return jsonResponse(200, {
      success: true,
      statusCode: 200,
      message: 'Program description generation endpoint is active',
      note: 'Actual AI generation logic needs to be implemented'
    });

  } catch (error) {
    console.error('Generate Program Description Error:', error);
    return jsonResponse(500, {
      success: false,
      statusCode: 500,
      error: error.message || 'Failed to generate program description'
    });
  }
}

export async function options_generateProgramDescription(request) {
  return handleCorsPrelight();
}

/**
 * POST /_functions/regenerateProgramSection
 * 
 * Regenerates a specific section of a program using AI
 */
export async function post_regenerateProgramSection(request) {
  try {
    console.log('Regenerate Program Section endpoint called');
    
    // Parse request body
    let requestData;
    try {
      if (typeof request.body === 'string') {
        requestData = JSON.parse(request.body);
      } else {
        requestData = request.body;
      }
    } catch (parseError) {
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'Invalid JSON in request body'
      });
    }

    // TODO: Implement actual section regeneration logic
    return jsonResponse(200, {
      success: true,
      statusCode: 200,
      message: 'Program section regeneration endpoint is active',
      note: 'Actual AI regeneration logic needs to be implemented'
    });

  } catch (error) {
    console.error('Regenerate Program Section Error:', error);
    return jsonResponse(500, {
      success: false,
      statusCode: 500,
      error: error.message || 'Failed to regenerate program section'
    });
  }
}

export async function options_regenerateProgramSection(request) {
  return handleCorsPrelight();
}

/**
 * POST /_functions/uploadProfilePhoto
 * 
 * Handles profile photo uploads
 */
export async function post_uploadProfilePhoto(request) {
  try {
    console.log('Upload Profile Photo endpoint called');
    
    // TODO: Implement actual photo upload logic
    return jsonResponse(200, {
      success: true,
      statusCode: 200,
      message: 'Profile photo upload endpoint is active',
      note: 'Actual upload logic needs to be implemented'
    });

  } catch (error) {
    console.error('Upload Profile Photo Error:', error);
    return jsonResponse(500, {
      success: false,
      statusCode: 500,
      error: error.message || 'Failed to upload profile photo'
    });
  }
}

export async function options_uploadProfilePhoto(request) {
  return handleCorsPrelight();
}
