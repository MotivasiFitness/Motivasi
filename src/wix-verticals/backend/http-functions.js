import { ok, badRequest, serverError } from "wix-http-functions";
import wixData from "wix-data";

/**
 * Helper function to ensure JSON responses with proper Content-Type
 */
function json(helper, payload) {
  return helper({
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

/**
 * PAR-Q Ping Endpoint
 * GET /_functions/parq
 * 
 * Simple verification endpoint to confirm the HTTP function is live
 * Returns JSON response with ok: true
 */
export function get_parq() {
  return json(ok, {
    ok: true,
    message: "parq endpoint live",
    timestamp: new Date().toISOString()
  });
}

/**
 * PAR-Q Submission Endpoint
 * POST /_functions/parq
 * 
 * Accepts JSON body with:
 * - clientName: string (required)
 * - email: string (required)
 * - answers: object (required)
 * - memberId: string (optional)
 * - firstName: string (optional)
 * - lastName: string (optional)
 * - dateOfBirth: string (optional)
 * 
 * Returns JSON response with:
 * - ok: boolean
 * - id: string (on success)
 * - error: string (on failure)
 * - code: string (error code on failure)
 */
export async function post_parq(request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.body.json();
    } catch (e) {
      console.error("PAR-Q: Invalid JSON body", e);
      return json(badRequest, { 
        ok: false, 
        code: "INVALID_JSON", 
        error: "Invalid JSON body" 
      });
    }

    const { 
      clientName, 
      email, 
      answers, 
      memberId,
      firstName,
      lastName,
      dateOfBirth 
    } = body || {};

    // Validate required fields
    if (!clientName || !email || !answers) {
      console.error("PAR-Q: Missing required fields", { clientName, email, hasAnswers: !!answers });
      return json(badRequest, { 
        ok: false, 
        code: "VALIDATION_ERROR", 
        error: "Missing required fields: clientName, email, and answers are required" 
      });
    }

    // Compute flagsYes based on answers
    const flagsYes = typeof answers === 'object' 
      ? Object.values(answers).some((v) => v === true || v === "yes" || v === "Yes")
      : false;

    // Prepare data for insertion
    const submissionData = {
      clientName,
      email,
      answers: typeof answers === 'string' ? answers : JSON.stringify(answers),
      flagsYes,
      status: "New",
      submissionDate: new Date(),
      memberId: memberId || null,
    };

    // Add optional fields if provided
    if (firstName) submissionData.firstName = firstName;
    if (lastName) submissionData.lastName = lastName;
    if (dateOfBirth) submissionData.dateOfBirth = new Date(dateOfBirth);

    // Insert into database
    const inserted = await wixData.insert("ParqSubmissions", submissionData);

    console.log("PAR-Q submission successful:", inserted._id);

    // Return success response
    return json(ok, { 
      ok: true, 
      id: inserted._id 
    });

  } catch (err) {
    console.error("PAR-Q endpoint error:", err);
    
    // Return error response
    return json(serverError, {
      ok: false,
      code: "PARQ_SUBMIT_FAILED",
      error: "Unable to submit PAR-Q. Please try again.",
    });
  }
}
