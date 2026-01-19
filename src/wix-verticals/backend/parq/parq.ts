/**
 * Wix Velo HTTP Function: PAR-Q Submission
 * 
 * ENVIRONMENT-AWARE ROUTING:
 * - Preview/Dev: POST /_functions-dev/parq (Wix auto-routes in preview)
 * - Production: POST /_functions/parq (published site)
 * 
 * Frontend automatically routes to correct endpoint via getBackendEndpoint('parq')
 * 
 * Handles PAR-Q form submissions and saves to ParqSubmissions collection
 * 
 * CRITICAL REQUIREMENTS:
 * - ALWAYS returns JSON with Content-Type: application/json; charset=utf-8
 * - NEVER redirects (returns 400/500 as JSON)
 * - Unified response format: { ok: boolean, id?: string, code?: string, error?: string }
 * - Saves to ParqSubmissions CMS collection
 * - Sends email notification to hello@motivasi.co.uk
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
 * UNIFIED RESPONSE CONTRACT:
 * 
 * Success (200):
 * {
 *   "ok": true,
 *   "id": "<recordId>"
 * }
 * 
 * Validation Error (400):
 * {
 *   "ok": false,
 *   "code": "VALIDATION_ERROR",
 *   "error": "Missing required fields: firstName, email"
 * }
 * 
 * Server Error (500):
 * {
 *   "ok": false,
 *   "code": "PARQ_SUBMIT_FAILED",
 *   "error": "Unable to submit PAR-Q. Please try again."
 * }
 */

import { ok, badRequest, serverError } from 'wix-http-functions';
import wixData from 'wix-data';
import { fetch } from 'wix-fetch';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Helper to return JSON responses with unified format
 */
function jsonOk(body: any) {
  return ok(JSON.stringify(body), { headers: JSON_HEADERS });
}
function jsonBadRequest(body: any) {
  return badRequest(JSON.stringify(body), { headers: JSON_HEADERS });
}
function jsonServerError(body: any) {
  return serverError(JSON.stringify(body), { headers: JSON_HEADERS });
}

export function options_parq() {
  return jsonOk({ ok: true });
}

export function get_parq() {
  // Wix doesn't have a 405 helper; return JSON with unified format
  return jsonOk({
    ok: false,
    code: 'METHOD_NOT_ALLOWED',
    error: 'Method Not Allowed. Use POST to submit PAR-Q data.',
  });
}

export async function post_parq(request: any) {
  // CRITICAL: Wrap entire function in try/catch to ensure JSON response even on unexpected errors
  try {
    console.log('=== PAR-Q Submission Backend ===');

    // ✅ Validate request object exists
    if (!request) {
      console.error('❌ No request object received');
      return jsonBadRequest({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'No request object received',
      });
    }

    // ✅ Correct body parsing for Wix HTTP functions
    let raw = '';
    try {
      raw = request?.body ? await request.body.text() : '';
    } catch (bodyError) {
      console.error('❌ Failed to read request body:', bodyError);
      return jsonBadRequest({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'Failed to read request body',
      });
    }

    let requestData: any = {};

    try {
      requestData = raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('❌ Invalid JSON in request body:', e);
      return jsonBadRequest({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'Invalid JSON in request body',
      });
    }

    console.log('📥 Request data received:', {
      firstName: requestData.firstName,
      lastName: requestData.lastName,
      email: requestData.email,
      memberId: requestData.memberId,
    });

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email'];
    const missingFields = requiredFields.filter((f) => !requestData?.[f]);
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return jsonBadRequest({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      console.error('❌ Invalid email format:', requestData.email);
      return jsonBadRequest({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'Invalid email format',
      });
    }

    // Determine if any medical risk flags are present
    const flagsYes = Boolean(
      requestData.hasHeartCondition ||
      requestData.currentlyTakingMedication ||
      requestData.medicalConditions === 'yes' ||
      requestData.medications === 'yes' ||
      requestData.surgery === 'yes' ||
      requestData.familyHistory === 'yes' ||
      requestData.currentPain === 'yes' ||
      requestData.pastInjuries === 'yes' ||
      (requestData.redFlagSymptoms && requestData.redFlagSymptoms.length > 0 && !requestData.redFlagSymptoms.includes('none'))
    );

    console.log('🏥 Medical flags detected:', flagsYes);

    // Build item for CMS (collection ID appears to be case-sensitive)
    const submissionData: any = {
      firstName: requestData.firstName,
      lastName: requestData.lastName,
      email: requestData.email,
      clientName: `${requestData.firstName} ${requestData.lastName}`,

      dateOfBirth: requestData.dateOfBirth ? new Date(requestData.dateOfBirth) : undefined,

      hasHeartCondition: Boolean(requestData.hasHeartCondition),
      currentlyTakingMedication: Boolean(requestData.currentlyTakingMedication),

      // New fields for trainer portal
      memberId: requestData.memberId || undefined, // Will be set by frontend if user is logged in
      submissionDate: new Date(),
      answers: typeof requestData.formData === 'string'
        ? requestData.formData
        : JSON.stringify(requestData, null, 2),
      flagsYes: flagsYes,
      status: 'New',
      assignedTrainerId: requestData.assignedTrainerId || undefined,
      notes: '',
    };

    console.log('💾 Attempting to save to ParqSubmissions collection...');

    let insertResult;
    try {
      insertResult = await wixData.insert('ParqSubmissions', submissionData);
      console.log('✅ Successfully saved to database:', insertResult._id);
    } catch (dbError: any) {
      console.error('❌ Database insert failed:', dbError);
      return jsonServerError({
        ok: false,
        code: 'PARQ_SUBMIT_FAILED',
        error: 'Unable to submit PAR-Q. Please try again.',
      });
    }

    // Send email notification to hello@motivasi.co.uk
    try {
      const submittedDate = new Date().toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      await fetch('https://formspree.io/f/xyzpqrst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _subject: `New PAR-Q Submission${flagsYes ? ' - MEDICAL CLEARANCE REQUIRED' : ''} - ${requestData.firstName} ${requestData.lastName}`,
          _replyto: requestData.email,
          _to: 'hello@motivasi.co.uk',
          message: `
New PAR-Q & Health Questionnaire Submission
${flagsYes ? '\n⚠️ MEDICAL CLEARANCE REQUIRED - Client answered YES to medical risk questions\n' : ''}

Name: ${requestData.firstName} ${requestData.lastName}
Email: ${requestData.email}
Submitted: ${submittedDate}
Status: New

This submission is now available in the Trainer Portal under "PAR-Q Submissions".
View full details and add notes: [Login to Trainer Portal]

---
This is a notification only. Full questionnaire details are available in the Trainer Portal.
          `,
          first_name: requestData.firstName,
          last_name: requestData.lastName,
          email: requestData.email,
          submitted_date: submittedDate,
          has_medical_flags: flagsYes,
        })
      });
      
      console.log('✅ Email notification sent to hello@motivasi.co.uk');
    } catch (emailError) {
      console.error('⚠️ Failed to send email notification:', emailError);
      // Don't fail the submission if email fails - submission is already saved
    }

    console.log('✅ PAR-Q submission completed successfully');

    // CRITICAL: Return unified success response
    return jsonOk({
      ok: true,
      id: insertResult._id,
    });
  } catch (error: any) {
    // CRITICAL: Catch ANY unexpected error and return unified JSON format
    console.error('❌ Unexpected error in PAR-Q handler:', error);

    return jsonServerError({
      ok: false,
      code: 'PARQ_SUBMIT_FAILED',
      error: 'Unable to submit PAR-Q. Please try again.',
    });
  }
}
