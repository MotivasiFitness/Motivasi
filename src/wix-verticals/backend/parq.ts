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
import { fetch } from 'wix-fetch';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonOk(body: any) {
  return ok(body, { headers: JSON_HEADERS });
}
function jsonBadRequest(body: any) {
  return badRequest(body, { headers: JSON_HEADERS });
}
function jsonServerError(body: any) {
  return serverError(body, { headers: JSON_HEADERS });
}

export function options_parq() {
  return ok({ success: true, statusCode: 200 }, { headers: JSON_HEADERS });
}

export function get_parq() {
  // Wix doesn't have a 405 helper; still return JSON with ok()
  return ok(
    {
      success: false,
      statusCode: 405,
      error: 'Method Not Allowed. Use POST to submit PAR-Q data.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    { headers: JSON_HEADERS }
  );
}

export async function post_parq(request: any) {
  try {
    console.log('=== PAR-Q Submission Backend ===');

    // ✅ Correct body parsing for Wix HTTP functions
    const raw = request?.body ? await request.body.text() : '';
    let requestData: any = {};

    try {
      requestData = raw ? JSON.parse(raw) : {};
    } catch (e) {
      return jsonBadRequest({
        success: false,
        statusCode: 400,
        error: 'Invalid JSON in request body',
      });
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email'];
    const missingFields = requiredFields.filter((f) => !requestData?.[f]);
    if (missingFields.length > 0) {
      return jsonBadRequest({
        success: false,
        statusCode: 400,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      return jsonBadRequest({
        success: false,
        statusCode: 400,
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

    // Build item for CMS (collection ID appears to be case-sensitive)
    const submissionData: any = {
      firstName: requestData.firstName,
      lastName: requestData.lastName,
      email: requestData.email,
      clientName: `${requestData.firstName} ${requestData.lastName}`,
      clientEmail: requestData.email,

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

      // Legacy field for backwards compatibility
      submittedAt: new Date(),
    };

    const insertResult = await wixData.insert('ParqSubmissions', submissionData);

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
      // Don't fail the submission if email fails
    }

    return jsonOk({
      success: true,
      statusCode: 200,
      itemId: insertResult._id,
      submissionId: insertResult._id,
      message: 'PAR-Q submission saved successfully',
    });
  } catch (error: any) {
    console.error('PAR-Q error:', error);

    return jsonServerError({
      success: false,
      statusCode: 500,
      error: error?.message || 'Failed to save PAR-Q submission',
    });
  }
}
