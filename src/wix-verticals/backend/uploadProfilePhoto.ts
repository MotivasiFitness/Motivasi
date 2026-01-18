import { ok, badRequest, serverError } from 'wix-http-functions';
import { mediaManager } from 'wix-media-backend';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function corsOk() {
  return ok({ success: true, statusCode: 200 }, { headers: JSON_HEADERS });
}

async function readJsonBody(request) {
  try {
    const raw = await request.body.text();
    const data = raw ? JSON.parse(raw) : {};
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: 'Invalid JSON in request body' };
  }
}

function extractBase64AndMime(base64Input, fallbackMime) {
  if (typeof base64Input !== 'string' || !base64Input) {
    return { base64: '', mimeType: fallbackMime || '' };
  }

  // If data URL: data:image/jpeg;base64,....
  const match = base64Input.match(/^data:(.+);base64,(.*)$/);
  if (match) {
    return { mimeType: match[1], base64: match[2] };
  }

  // Plain base64
  return { mimeType: fallbackMime || '', base64: base64Input };
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
    console.log('=== Upload Profile Photo (Base64 JSON) ===');

    const parsed = await readJsonBody(request);
    if (!parsed.ok) {
      return badRequest(
        { success: false, statusCode: 400, error: parsed.error },
        { headers: JSON_HEADERS }
      );
    }

    const body = parsed.data || {};
    const fileName = String(body.fileName || 'profile-photo.jpg');
    const fallbackMime = String(body.mimeType || '');

    const extracted = extractBase64AndMime(body.base64, fallbackMime);
    const mimeTypeRaw = String(extracted.mimeType || '').toLowerCase();
    const base64 = extracted.base64;

    if (!base64) {
      return badRequest(
        { success: false, statusCode: 400, error: 'Missing base64 image data' },
        { headers: JSON_HEADERS }
      );
    }

    const mimeType = mimeTypeRaw === 'image/jpg' ? 'image/jpeg' : mimeTypeRaw;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      return badRequest(
        {
          success: false,
          statusCode: 400,
          error: `File type must be JPG, PNG, or WebP (current: ${mimeType || 'unknown'})`,
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

    console.log('Uploading to Media Manager...', { fileName, mimeType, bytes: bytes.length });

    const result = await mediaManager.upload('/trainer-profiles', bytes, fileName, {
      mediaOptions: {
        mimeType,
        mediaType: 'image',
      },
    });

    const url = result?.fileUrl || result?.url;
    if (!url) {
      return serverError(
        { success: false, statusCode: 500, error: 'Upload succeeded but no URL was returned' },
        { headers: JSON_HEADERS }
      );
    }

    console.log('Upload success URL:', url);

    return ok({ success: true, statusCode: 200, url }, { headers: JSON_HEADERS });
  } catch (err) {
    console.error('Upload failed:', err);
    return serverError(
      { success: false, statusCode: 500, error: err?.message || 'Failed to upload profile photo' },
      { headers: JSON_HEADERS }
    );
  }
}
