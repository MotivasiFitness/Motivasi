/**
 * PRODUCTION-READY WIX VELO HTTP FUNCTION FOR PAR-Q SUBMISSIONS
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open Wix Studio
 * 2. Navigate to Backend → http-functions.js
 * 3. Copy the entire code below (starting from the imports)
 * 4. Paste into http-functions.js
 * 5. Save and publish
 * 
 * ENDPOINTS:
 * - GET  /_functions/parq  → Health check (returns JSON status)
 * - POST /_functions/parq  → Submit PAR-Q form data
 */

// ============================================================================
// IMPORTS - Wix Backend Modules Only
// ============================================================================
import { ok, badRequest, serverError } from 'wix-http-functions';
import wixData from 'wix-data';

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
/**
 * GET /_functions/parq
 * Returns JSON health check to verify endpoint is accessible
 */
export function get_parq(request) {
  console.log('[PAR-Q Health Check] GET request received');
  
  return ok({
    body: JSON.stringify({
      status: 'ok',
      message: 'PAR-Q endpoint is operational',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: 'GET /_functions/parq',
        submit: 'POST /_functions/parq'
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// ============================================================================
// PAR-Q SUBMISSION ENDPOINT
// ============================================================================
/**
 * POST /_functions/parq
 * Handles PAR-Q form submissions and inserts into CMS
 * 
 * Expected POST body (JSON):
 * {
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   dateOfBirth: string (ISO date),
 *   hasHeartCondition: boolean,
 *   currentlyTakingMedication: boolean,
 *   answers: string (JSON stringified array),
 *   flagsYes: boolean,
 *   notes?: string,
 *   memberId?: string
 * }
 */
export async function post_parq(request) {
  console.log('[PAR-Q Submit] POST request received');
  
  try {
    // ========================================================================
    // STEP 1: Parse and validate request body
    // ========================================================================
    let body;
    try {
      body = await request.body.text();
      console.log('[PAR-Q Submit] Raw body received:', body);
      
      if (!body || body.trim() === '') {
        console.error('[PAR-Q Submit] Empty request body');
        return badRequest({
          body: JSON.stringify({
            error: 'Empty request body',
            message: 'Request body cannot be empty'
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      body = JSON.parse(body);
      console.log('[PAR-Q Submit] Parsed body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('[PAR-Q Submit] JSON parse error:', parseError);
      return badRequest({
        body: JSON.stringify({
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
          details: parseError.message
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ========================================================================
    // STEP 2: Validate required fields
    // ========================================================================
    const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth', 'answers'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error('[PAR-Q Submit] Missing required fields:', missingFields);
      return badRequest({
        body: JSON.stringify({
          error: 'Missing required fields',
          missingFields: missingFields,
          message: `The following fields are required: ${missingFields.join(', ')}`
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ========================================================================
    // STEP 3: Generate unique ID and prepare CMS item
    // ========================================================================
    const itemId = `parq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('[PAR-Q Submit] Generated item ID:', itemId);

    const itemToInsert = {
      _id: itemId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      dateOfBirth: body.dateOfBirth,
      hasHeartCondition: body.hasHeartCondition || false,
      currentlyTakingMedication: body.currentlyTakingMedication || false,
      answers: body.answers,
      flagsYes: body.flagsYes || false,
      notes: body.notes || '',
      memberId: body.memberId || '',
      clientName: `${body.firstName} ${body.lastName}`,
      status: 'pending',
      submissionDate: new Date().toISOString(),
      assignedTrainerId: ''
    };

    console.log('[PAR-Q Submit] Item to insert:', JSON.stringify(itemToInsert, null, 2));

    // ========================================================================
    // STEP 4: Insert into CMS collection
    // ========================================================================
    let insertedItem;
    try {
      insertedItem = await wixData.insert('ParqSubmissions', itemToInsert);
      console.log('[PAR-Q Submit] Insert successful!');
      console.log('[PAR-Q Submit] Inserted item ID:', insertedItem._id);
      console.log('[PAR-Q Submit] Full inserted item:', JSON.stringify(insertedItem, null, 2));
    } catch (insertError) {
      console.error('[PAR-Q Submit] CMS insert error:', insertError);
      console.error('[PAR-Q Submit] Error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details
      });
      
      return serverError({
        body: JSON.stringify({
          error: 'Database insert failed',
          message: 'Failed to save PAR-Q submission to database',
          details: insertError.message,
          itemId: itemId
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ========================================================================
    // STEP 5: Verify insert and return success response
    // ========================================================================
    if (!insertedItem || !insertedItem._id) {
      console.error('[PAR-Q Submit] Insert verification failed - no _id returned');
      return serverError({
        body: JSON.stringify({
          error: 'Insert verification failed',
          message: 'Item was inserted but _id was not returned',
          attemptedId: itemId
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[PAR-Q Submit] ✓ Submission completed successfully');
    
    return ok({
      body: JSON.stringify({
        success: true,
        message: 'PAR-Q submission received successfully',
        submissionId: insertedItem._id,
        timestamp: new Date().toISOString(),
        data: {
          id: insertedItem._id,
          clientName: insertedItem.clientName,
          email: insertedItem.email,
          status: insertedItem.status,
          submissionDate: insertedItem.submissionDate
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    // ========================================================================
    // GLOBAL ERROR HANDLER
    // ========================================================================
    console.error('[PAR-Q Submit] Unexpected error:', error);
    console.error('[PAR-Q Submit] Error stack:', error.stack);
    
    return serverError({
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your submission',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// ============================================================================
// DEPLOYMENT VERIFICATION CHECKLIST
// ============================================================================
/*
 * After pasting this code into Wix Studio Backend → http-functions.js:
 * 
 * 1. ✓ Save the file
 * 2. ✓ Publish your site
 * 3. ✓ Test GET endpoint: https://yoursite.com/_functions/parq
 *    - Should return JSON health check
 * 4. ✓ Test POST endpoint with sample data:
 *    - Use Postman or curl
 *    - Send JSON body with required fields
 *    - Verify response is JSON (not HTML)
 * 5. ✓ Check Wix CMS:
 *    - Navigate to CMS → ParqSubmissions
 *    - Verify new submission appears
 *    - Check all fields are populated
 * 6. ✓ Check logs:
 *    - Wix Studio → Monitoring → Logs
 *    - Look for [PAR-Q Submit] entries
 *    - Verify no errors
 * 
 * TROUBLESHOOTING:
 * - If you get HTML responses: Check endpoint URL (must be /_functions/parq)
 * - If insert fails: Verify ParqSubmissions collection exists (case-sensitive)
 * - If fields missing: Check CMS collection has all required fields
 * - If CORS errors: Add CORS headers if calling from external domain
 */
