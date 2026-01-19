/**
 * Wix HTTP Function: PAR-Q Submission
 * Endpoint: POST /_functions/parq-submit
 * 
 * Handles PAR-Q form submissions with proper JSON responses
 * 
 * CRITICAL REQUIREMENTS:
 * - ALWAYS returns JSON with Content-Type: application/json
 * - Inserts data into ParqSubmissions collection
 * - Returns { ok: true, id } on success
 * - Returns { ok: false, code, error } on all errors
 * 
 * Success Response (200):
 * {
 *   "ok": true,
 *   "id": "submission-id-here"
 * }
 * 
 * Error Response (400/500):
 * {
 *   "ok": false,
 *   "code": "ERROR_CODE",
 *   "error": "Human-readable error message"
 * }
 */

import { ok, badRequest, serverError } from 'wix-http-functions';
import wixData from 'wix-data';
import { fetch } from 'wix-fetch';

type AnyRequest = {
  body?: {
    text?: () => Promise<string>;
  };
};

interface ParqPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  hasHeartCondition?: boolean;
  currentlyTakingMedication?: boolean;
  memberId?: string;
  medicalConditions?: string;
  medications?: string;
  surgery?: string;
  familyHistory?: string;
  currentPain?: string;
  pastInjuries?: string;
  redFlagSymptoms?: string[];
  formData?: string;
  assignedTrainerId?: string;
}

interface ParqResponse {
  ok: boolean;
  id?: string;
  code?: string;
  error?: string;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function options_parqSubmit() {
  return ok({ ok: true }, { headers: JSON_HEADERS });
}

export async function post_parqSubmit(request: AnyRequest) {
  try {
    console.log('=== PAR-Q HTTP Function Submission ===');

    // Parse request body
    let payload: ParqPayload;
    try {
      const bodyText = await request.body?.text?.();
      if (!bodyText) {
        console.error('❌ No request body');
        return badRequest({
          ok: false,
          code: 'MISSING_BODY',
          error: 'Request body is required',
        } as ParqResponse, { headers: JSON_HEADERS });
      }

      payload = JSON.parse(bodyText);
      console.log('📥 Payload received:', {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        memberId: payload.memberId,
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return badRequest({
        ok: false,
        code: 'INVALID_JSON',
        error: 'Invalid JSON in request body',
      } as ParqResponse, { headers: JSON_HEADERS });
    }

    // Validate required fields
    if (!payload.firstName || !payload.lastName || !payload.email) {
      console.error('❌ Missing required fields');
      return badRequest({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'Missing required fields: firstName, lastName, or email',
      } as ParqResponse, { headers: JSON_HEADERS });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      console.error('❌ Invalid email format:', payload.email);
      return badRequest({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'Invalid email format',
      } as ParqResponse, { headers: JSON_HEADERS });
    }

    // Determine if any medical risk flags are present
    const flagsYes = Boolean(
      payload.hasHeartCondition ||
      payload.currentlyTakingMedication ||
      payload.medicalConditions === 'yes' ||
      payload.medications === 'yes' ||
      payload.surgery === 'yes' ||
      payload.familyHistory === 'yes' ||
      payload.currentPain === 'yes' ||
      payload.pastInjuries === 'yes' ||
      (payload.redFlagSymptoms && 
       payload.redFlagSymptoms.length > 0 && 
       !payload.redFlagSymptoms.includes('none'))
    );

    console.log('🏥 Medical flags detected:', flagsYes);

    // Build submission data for CMS
    // CRITICAL: All PAR-Q submissions are automatically assigned to trainer d18a21c8-be77-496f-a2fd-ec6479ecba6d
    const DEFAULT_TRAINER_ID = 'd18a21c8-be77-496f-a2fd-ec6479ecba6d';
    
    const submissionData: any = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      clientName: `${payload.firstName} ${payload.lastName}`,
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
      hasHeartCondition: Boolean(payload.hasHeartCondition),
      currentlyTakingMedication: Boolean(payload.currentlyTakingMedication),
      memberId: payload.memberId || undefined,
      submissionDate: new Date(),
      answers: payload.formData || JSON.stringify(payload, null, 2),
      flagsYes: flagsYes,
      status: 'New',
      assignedTrainerId: payload.assignedTrainerId || DEFAULT_TRAINER_ID,
      notes: '',
    };
    
    console.log('👤 Assigned to trainer:', submissionData.assignedTrainerId);

    console.log('💾 Attempting to save to ParqSubmissions collection...');
    console.log('📦 EXACT PAYLOAD BEING INSERTED:', JSON.stringify(submissionData, null, 2));

    // Insert into database
    let insertResult;
    try {
      insertResult = await wixData.insert('ParqSubmissions', submissionData);
      
      // HARD VERIFICATION: Confirm _id is returned
      if (!insertResult || !insertResult._id) {
        console.error('❌ CRITICAL: Insert returned but NO _id present!');
        console.error('❌ Insert result:', JSON.stringify(insertResult, null, 2));
        return serverError({
          ok: false,
          code: 'INSERT_VERIFICATION_FAILED',
          error: 'Database insert did not return a valid ID. Please contact support.',
        } as ParqResponse, { headers: JSON_HEADERS });
      }
      
      console.log('✅ Successfully saved to database with _id:', insertResult._id);
      console.log('✅ Full insert result:', JSON.stringify(insertResult, null, 2));
      
      // ADDITIONAL VERIFICATION: Try to immediately read back the record
      try {
        const verifyRead = await wixData.get('ParqSubmissions', insertResult._id);
        if (verifyRead) {
          console.log('✅ VERIFICATION PASSED: Record can be read back immediately');
          console.log('✅ Verified record:', JSON.stringify(verifyRead, null, 2));
        } else {
          console.error('⚠️ WARNING: Record inserted but cannot be read back immediately');
        }
      } catch (verifyError) {
        console.error('⚠️ WARNING: Failed to verify record read-back:', verifyError);
      }
      
    } catch (dbError: any) {
      console.error('❌ Database insert failed:', dbError);
      console.error('❌ Error details:', JSON.stringify(dbError, null, 2));
      return serverError({
        ok: false,
        code: 'DATABASE_ERROR',
        error: 'Unable to submit PAR-Q. Please try again.',
      } as ParqResponse, { headers: JSON_HEADERS });
    }

    // Send email notification to hello@motivasi.co.uk
    try {
      const submittedDate = new Date().toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      await fetch('https://formspree.io/f/xyzpqrst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _subject: `New PAR-Q Submission${flagsYes ? ' - MEDICAL CLEARANCE REQUIRED' : ''} - ${payload.firstName} ${payload.lastName}`,
          _replyto: payload.email,
          _to: 'hello@motivasi.co.uk',
          message: `
New PAR-Q & Health Questionnaire Submission
${flagsYes ? '\n⚠️ MEDICAL CLEARANCE REQUIRED - Client answered YES to medical risk questions\n' : ''}

Name: ${payload.firstName} ${payload.lastName}
Email: ${payload.email}
Submitted: ${submittedDate}
Status: New

This submission is now available in the Trainer Portal under "PAR-Q Submissions".
View full details and add notes: [Login to Trainer Portal]

---
This is a notification only. Full questionnaire details are available in the Trainer Portal.
          `,
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email,
          submitted_date: submittedDate,
          has_medical_flags: flagsYes,
        }),
      });

      console.log('✅ Email notification sent to hello@motivasi.co.uk');
    } catch (emailError) {
      console.error('⚠️ Failed to send email notification:', emailError);
      // Don't fail the submission if email fails - submission is already saved
    }

    console.log('✅ PAR-Q submission completed successfully');

    // Return success response
    return ok({
      ok: true,
      id: insertResult._id,
    } as ParqResponse, { headers: JSON_HEADERS });

  } catch (error: any) {
    console.error('❌ Unexpected error in PAR-Q HTTP function:', error);
    return serverError({
      ok: false,
      code: 'INTERNAL_ERROR',
      error: 'An unexpected error occurred. Please try again.',
    } as ParqResponse, { headers: JSON_HEADERS });
  }
}
