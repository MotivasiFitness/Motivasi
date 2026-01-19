import { ok, badRequest, serverError } from 'wix-http-functions';
import wixData from 'wix-data';
import { mediaManager } from 'wix-media-backend';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonOk(body) {
  return ok(JSON.stringify(body), { headers: JSON_HEADERS });
}
function jsonBadRequest(body) {
  return badRequest(JSON.stringify(body), { headers: JSON_HEADERS });
}
function jsonServerError(body) {
  return serverError(JSON.stringify(body), { headers: JSON_HEADERS });
}

function corsPreflight() {
  return ok(JSON.stringify({ success: true, statusCode: 200 }), { headers: JSON_HEADERS });
}

// -----------------------------------------------------------------------------
// HEALTH
// -----------------------------------------------------------------------------
export function options_health() {
  return corsPreflight();
}

export function get_health(request) {
  const path = request?.path || '';
  const isDev = typeof path === 'string' && path.includes('-dev');

  return jsonOk({
    success: true,
    statusCode: 200,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: isDev ? 'preview' : 'production',
    endpoints: {
      health: '/_functions/health',
      parq: '/_functions/parq',
      uploadProfilePhoto: '/_functions/uploadProfilePhoto',
    },
  });
}

// -----------------------------------------------------------------------------
// PARQ
// -----------------------------------------------------------------------------
export function options_parq() {
  return corsPreflight();
}

export function get_parq() {
  // Wix doesn't provide a 405 helper, so we still return JSON via ok()
  return ok(
    JSON.stringify({
      success: false,
      statusCode: 405,
      error: 'Method Not Allowed. Use POST to submit PAR-Q data.',
      allowedMethods: ['POST', 'OPTIONS'],
    }),
    { headers: JSON_HEADERS }
  );
}

export async function post_parq(request) {
  try {
    const raw = request?.body ? await request.body.text() : '';
    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      return jsonBadRequest({ ok: false, code: 'INVALID_JSON', error: 'Invalid JSON in request body' });
    }

    const missing = ['firstName', 'lastName', 'email'].filter((k) => !data[k]);
    if (missing.length) {
      return jsonBadRequest({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(data.email))) {
      return jsonBadRequest({ ok: false, code: 'VALIDATION_ERROR', error: 'Invalid email format' });
    }

    // Determine if any medical risk flags are present
    const flagsYes = Boolean(
      data.hasHeartCondition ||
      data.currentlyTakingMedication ||
      data.medicalConditions === 'yes' ||
      data.medications === 'yes' ||
      data.surgery === 'yes' ||
      data.familyHistory === 'yes' ||
      data.currentPain === 'yes' ||
      data.pastInjuries === 'yes' ||
      (data.redFlagSymptoms && data.redFlagSymptoms.length > 0 && !data.redFlagSymptoms.includes('none'))
    );

    const item = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      clientName: `${data.firstName} ${data.lastName}`,

      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,

      hasHeartCondition: Boolean(data.hasHeartCondition),
      currentlyTakingMedication: Boolean(data.currentlyTakingMedication),

      // New fields for trainer portal
      memberId: data.memberId || undefined,
      submissionDate: new Date(),
      answers: typeof data.formData === 'string' ? data.formData : JSON.stringify(data, null, 2),
      flagsYes: flagsYes,
      status: 'New',
      assignedTrainerId: data.assignedTrainerId || undefined,
      notes: '',
    };

    const inserted = await wixData.insert('ParqSubmissions', item);

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
          _subject: `New PAR-Q Submission${flagsYes ? ' - MEDICAL CLEARANCE REQUIRED' : ''} - ${data.firstName} ${data.lastName}`,
          _replyto: data.email,
          _to: 'hello@motivasi.co.uk',
          message: `
New PAR-Q & Health Questionnaire Submission
${flagsYes ? '\n⚠️ MEDICAL CLEARANCE REQUIRED - Client answered YES to medical risk questions\n' : ''}

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Submitted: ${submittedDate}
Status: New

This submission is now available in the Trainer Portal under "PAR-Q Submissions".
View full details and add notes: [Login to Trainer Portal]

---
This is a notification only. Full questionnaire details are available in the Trainer Portal.
          `,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
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
      ok: true,
      id: inserted._id,
    });
  } catch (err) {
    return jsonServerError({
      ok: false,
      code: 'PARQ_SUBMIT_FAILED',
      error: 'Unable to submit PAR-Q. Please try again.',
    });
  }
}

// -----------------------------------------------------------------------------
// UPLOAD PROFILE PHOTO (BASE64 JSON - RELIABLE ON WIX)
// -----------------------------------------------------------------------------
export function options_uploadProfilePhoto() {
  return corsPreflight();
}

/**
 * POST expects JSON:
 * {
 *   "fileName": "photo.jpg",
 *   "mimeType": "image/jpeg",
 *   "base64": "<base64 OR data URL>"
 * }
 */
export async function post_uploadProfilePhoto(request) {
  try {
    const raw = request?.body ? await request.body.text() : '';
    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      return jsonBadRequest({ success: false, statusCode: 400, error: 'Invalid JSON in request body' });
    }

    const fileName = data.fileName || 'profile-photo.jpg';
    const mimeTypeRaw = (data.mimeType || '').toLowerCase();
    const mimeType = mimeTypeRaw === 'image/jpg' ? 'image/jpeg' : mimeTypeRaw;

    let base64 = data.base64 || '';
    if (!base64) {
      return jsonBadRequest({ success: false, statusCode: 400, error: 'Missing base64 image data' });
    }

    // Allow full data URL like "data:image/jpeg;base64,..."
    const match = typeof base64 === 'string' ? base64.match(/^data:(.+);base64,(.*)$/) : null;
    if (match) base64 = match[2];

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(mimeType)) {
      return jsonBadRequest({
        success: false,
        statusCode: 400,
        error: `File type must be JPG, PNG, or WebP (current: ${mimeTypeRaw || 'unknown'})`,
      });
    }

    const buffer = Buffer.from(base64, 'base64');
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return jsonBadRequest({
        success: false,
        statusCode: 400,
        error: `File size must be less than 5MB (current: ${(buffer.length / 1024 / 1024).toFixed(2)}MB)`,
      });
    }

    const uploadResult = await mediaManager.upload('/trainer-profiles', buffer, fileName, {
      mediaOptions: { mimeType, mediaType: 'image' },
    });

    const url = uploadResult?.fileUrl || uploadResult?.url;
    if (!url) {
      return jsonServerError({
        success: false,
        statusCode: 500,
        error: 'Upload succeeded but no URL was returned',
      });
    }

    return jsonOk({ success: true, statusCode: 200, url });
  } catch (err) {
    return jsonServerError({
      success: false,
      statusCode: 500,
      error: (err && err.message) || 'Failed to upload profile photo',
    });
  }
}
