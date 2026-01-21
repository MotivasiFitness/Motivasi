import { ok, badRequest, serverError } from "wix-http-functions";
import wixData from "wix-data";
import { mediaManager } from "wix-media-backend";

/**
 * Helper function to ensure JSON responses with proper Content-Type
 */
function json(helper, payload) {
  return helper(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

/**
 * Helper functions for uploadProfilePhoto endpoint
 */
function corsOk() {
  return ok({ success: true, statusCode: 200 }, { headers: JSON_HEADERS });
}

async function readJsonBody(request) {
  try {
    const raw = await request.body.text();
    const data = raw ? JSON.parse(raw) : {};
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: "Invalid JSON in request body" };
  }
}

function extractBase64AndMime(base64Input, fallbackMime) {
  if (typeof base64Input !== "string" || !base64Input) {
    return { base64: "", mimeType: fallbackMime || "" };
  }

  // If data URL: data:image/jpeg;base64,....
  const match = base64Input.match(/^data:(.+);base64,(.*)$/);
  if (match) {
    return { mimeType: match[1], base64: match[2] };
  }

  // Plain base64
  return { mimeType: fallbackMime || "", base64: base64Input };
}

function base64ToUint8Array(base64) {
  // Wix backend supports atob()
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * OPTIONS /_functions/uploadProfilePhoto
 */
export function options_uploadProfilePhoto() {
  return corsOk();
}

/**
 * POST /_functions/uploadProfilePhoto
 *
 * Body JSON:
 * {
 *   fileName: "photo.jpg",
 *   mimeType: "image/jpeg",
 *   base64: "data:image/jpeg;base64,...."  // or plain base64
 * }
 *
 * Returns:
 * { success: true, statusCode: 200, url: "..." }
 */
export async function post_uploadProfilePhoto(request) {
  try {
    console.log("=== Upload Profile Photo (Base64 JSON) ===");

    const parsed = await readJsonBody(request);
    if (!parsed.ok) {
      return badRequest(
        { success: false, statusCode: 400, error: parsed.error },
        { headers: JSON_HEADERS }
      );
    }

    const body = parsed.data || {};
    const fileName = String(body.fileName || "profile-photo.jpg");
    const fallbackMime = String(body.mimeType || "");

    const extracted = extractBase64AndMime(body.base64, fallbackMime);
    const mimeTypeRaw = String(extracted.mimeType || "").toLowerCase();
    const base64 = extracted.base64;

    if (!base64) {
      return badRequest(
        { success: false, statusCode: 400, error: "Missing base64 image data" },
        { headers: JSON_HEADERS }
      );
    }

    const mimeType = mimeTypeRaw === "image/jpg" ? "image/jpeg" : mimeTypeRaw;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(mimeType)) {
      return badRequest(
        {
          success: false,
          statusCode: 400,
          error: `File type must be JPG, PNG, or WebP (current: ${mimeType || "unknown"})`,
        },
        { headers: JSON_HEADERS }
      );
    }

    const bytes = base64ToUint8Array(base64);

    // 5MB limit
    const maxSize = 5 * 1024 * 1024;
    if (bytes.length > maxSize) {
      return badRequest(
        {
          success: false,
          statusCode: 400,
          error: `File size must be less than 5MB (current: ${(bytes.length / 1024 / 1024).toFixed(
            2
          )}MB)`,
        },
        { headers: JSON_HEADERS }
      );
    }

    console.log("Uploading to Media Manager...", { fileName, mimeType, bytes: bytes.length });

    const result = await mediaManager.upload("/trainer-profiles", bytes, fileName, {
      mediaOptions: {
        mimeType,
        mediaType: "image",
      },
    });

    const url = result?.fileUrl || result?.url;
    if (!url) {
      return serverError(
        { success: false, statusCode: 500, error: "Upload succeeded but no URL was returned" },
        { headers: JSON_HEADERS }
      );
    }

    console.log("Upload success URL:", url);

    return ok({ success: true, statusCode: 200, url }, { headers: JSON_HEADERS });
  } catch (err) {
    console.error("Upload failed:", err);
    return serverError(
      { success: false, statusCode: 500, error: err?.message || "Failed to upload profile photo" },
      { headers: JSON_HEADERS }
    );
  }
}
