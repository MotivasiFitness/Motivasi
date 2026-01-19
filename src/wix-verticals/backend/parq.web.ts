/**
 * Wix Velo Web Module: PAR-Q Submission
 * 
 * This module provides a direct function call interface for PAR-Q submissions,
 * eliminating HTTP routing issues in Wix Studio React architecture.
 * 
 * USAGE:
 * import { submitParq } from 'backend/parq.web';
 * const result = await submitParq(payload);
 * 
 * RESPONSE FORMAT:
 * Success: { ok: true, id: string }
 * Error: { ok: false, code: string, error: string }
 */

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';

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

/**
 * Submit PAR-Q form data to the ParqSubmissions collection
 * 
 * @param payload - PAR-Q form data
 * @returns Promise<ParqResponse> - Success or error response
 */
export async function submitParq(payload: ParqPayload): Promise<ParqResponse> {
  try {
    console.log('=== PAR-Q Web Module Submission ===');
    console.log('📥 Payload received:', {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      memberId: payload.memberId,
    });

    // Validate required fields
    if (!payload.firstName || !payload.lastName || !payload.email) {
      console.error('❌ Missing required fields');
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'Missing required fields: firstName, lastName, or email',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      console.error('❌ Invalid email format:', payload.email);
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'Invalid email format',
      };
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
      assignedTrainerId: payload.assignedTrainerId || undefined,
      notes: '',
    };

    console.log('💾 Attempting to save to ParqSubmissions collection...');

    // Insert into database
    let insertResult;
    try {
      insertResult = await wixData.insert('ParqSubmissions', submissionData);
      console.log('✅ Successfully saved to database:', insertResult._id);
    } catch (dbError: any) {
      console.error('❌ Database insert failed:', dbError);
      return {
        ok: false,
        code: 'PARQ_SUBMIT_FAILED',
        error: 'Unable to submit PAR-Q. Please try again.',
      };
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
    return {
      ok: true,
      id: insertResult._id,
    };
  } catch (error: any) {
    console.error('❌ Unexpected error in PAR-Q web module:', error);
    return {
      ok: false,
      code: 'PARQ_SUBMIT_FAILED',
      error: 'Unable to submit PAR-Q. Please try again.',
    };
  }
}
