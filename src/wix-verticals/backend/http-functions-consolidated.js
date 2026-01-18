import { ok, badRequest, serverError } from 'wix-http-functions';
import wixData from 'wix-data';

/**
 * Consistent JSON response helper using wix-http-functions helpers
 */
function jsonOk(data) {
  return ok(data, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function jsonBadRequest(data) {
  return badRequest(data, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function jsonServerError(data) {
  return serverError(data, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function corsPreflight() {
  // OPTIONS handlers must return a valid response
  return ok(
    { success: true },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

// -----------------------------------------------------------------------------
// HEALTH
// -----------------------------------------------------------------------------
export function options_health() {
  return corsPreflight();
}

export function get_health(request) {
  return jsonOk({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    path: request.path,
  });
}

// -----------------------------------------------------------------------------
// PARQ
// -----------------------------------------------------------------------------
export function options_parq() {
  return corsPreflight();
}

export function get_parq() {
  // Using ok() because wix-http-functions doesn't provide a 405 helper.
  // Still returns JSON and tells caller to use POST.
  return ok(
    {
      success: false,
      statusCode: 405,
      error: 'Method Not Allowed. Use POST to submit PAR-Q data.',
      allowedMethods: ['POST', 'OPTIONS'],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

export async function post_parq(request) {
  try {
    // Wix HTTP functions body parsing:
    // request.body can be null. If present, use request.body.text()
    const raw = request.body ? await request.body.text() : '';
    let data;

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      return jsonBadRequest({
        success: false,
        statusCode: 400,
        error: 'Invalid JSON in request body',
      });
    }

    // Validate required fields
    const missing = ['firstName', 'lastName', 'email'].filter((k) => !data?.[k]);
    if (missing.length) {
      return jsonBadRequest({
        success: false,
        statusCode: 400,
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return jsonBadRequest({
        success: false,
        statusCode: 400,
        error: 'Invalid email format',
      });
    }

    // Build the item according to your collection schema
    // NOTE: Collection name appears to be "ParqSubmissions" (case-sensitive)
    const item = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      clientName: `${data.firstName} ${data.lastName}`,

      // store as Date (if provided)
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,

      // existing booleans (keep if these fields exist in the collection)
      hasHeartCondition: Boolean(data.hasHeartCondition),
      currentlyTakingMedication: Boolean(data.currentlyTakingMedication),

      // fields you said you added to the collection
      formData: typeof data.formData === 'string' ? data.formData : JSON.stringify(data.formData ?? data),
      submittedAt: new Date(),
    };

    const inserted = await wixData.insert('ParqSubmissions', item);

    return jsonOk({
      success: true,
      statusCode: 200,
      itemId: inserted._id,
      message: 'PAR-Q submission saved successfully',
    });
  } catch (err) {
    return jsonServerError({
      success: false,
      statusCode: 500,
      error: err?.message || 'Failed to save PAR-Q submission',
    });
  }
}
