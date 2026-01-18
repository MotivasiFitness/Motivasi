/**
 * Wix Velo HTTP Function: PAR-Q Submission
 * 
 * ENVIRONMENT-AWARE ROUTING:
 * - Preview/Dev: POST /_functions-dev/parq
 * - Production: POST /_functions/parq
 * 
 * Frontend automatically routes to correct endpoint via getBackendEndpoint('parq')
 * 
 * Handles PAR-Q form submissions and saves to ParqSubmissions collection
 * 
 * CRITICAL REQUIREMENTS:
 * - ALWAYS returns JSON with Content-Type: application/json
 * - NEVER redirects (returns 400/500 as JSON)
 * - Standardized response format with { success, statusCode }
 * - Saves to ParqSubmissions CMS collection
 * - Triggers Wix Automation for email notifications
 * 
 * Request Body:
 * {
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   dateOfBirth: string (ISO date),
 *   phone?: string,
 *   hasHeartCondition?: boolean,
 *   currentlyTakingMedication?: boolean,
 *   formData: object (entire form submission),
 *   ...other fields
 * }
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "submissionId": "abc123",
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

import { ok, badRequest, serverError } from 'wix-http-functions';
import wixData from 'wix-data';

// Helper to create JSON response
function jsonResponse(statusCode: number, body: any) {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Main HTTP function handler for PAR-Q submission
 */
export async function post_parq(request: any): Promise<any> {
  try {
    console.log('=== PAR-Q Submission Backend ===');
    console.log('Request method:', request.method);
    console.log('Request headers:', JSON.stringify(request.headers, null, 2));
    
    // Parse request body
    let requestData;
    try {
      if (typeof request.body === 'string') {
        requestData = JSON.parse(request.body);
      } else {
        requestData = request.body;
      }
    } catch (parseError: any) {
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
    const submissionData: any = {
      // Core fields that exist in the collection
      firstName: requestData.firstName,
      lastName: requestData.lastName,
      email: requestData.email,
      clientName: `${requestData.firstName} ${requestData.lastName}`, // Legacy field
      
      // Date of birth (convert to Date object if string)
      dateOfBirth: requestData.dateOfBirth ? new Date(requestData.dateOfBirth) : undefined,
      
      // Boolean health fields
      hasHeartCondition: requestData.hasHeartCondition || false,
      currentlyTakingMedication: requestData.currentlyTakingMedication || false,
      
      // Store entire form submission as JSON string
      // NOTE: This field needs to be added to ParqSubmissions collection as "Long text" type
      formData: JSON.stringify(requestData, null, 2),
      
      // Submission timestamp
      // NOTE: This field needs to be added to ParqSubmissions collection as "Date & Time" type
      submittedAt: new Date()
    };

    console.log('Prepared submission data:', {
      firstName: submissionData.firstName,
      lastName: submissionData.lastName,
      email: submissionData.email,
      dateOfBirth: submissionData.dateOfBirth,
      hasHeartCondition: submissionData.hasHeartCondition,
      currentlyTakingMedication: submissionData.currentlyTakingMedication,
      hasFormData: !!submissionData.formData,
      submittedAt: submissionData.submittedAt
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
      submissionId: insertResult._id,
      message: 'PAR-Q submission saved successfully'
    });

  } catch (error: any) {
    console.error('=== PAR-Q Submission Error ===');
    console.error('Error type:', error.constructor?.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));

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
        error: 'Collection schema mismatch - please ensure formData (Long text) and submittedAt (Date & Time) fields exist'
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
 * Handle OPTIONS for CORS preflight
 */
export async function options_parq(request: any): Promise<any> {
  return {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
}
