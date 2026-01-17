/**
 * Wix Velo HTTP Function: Upload Profile Photo
 * Endpoint: POST /_functions/uploadProfilePhoto
 * 
 * Handles profile photo uploads to Wix Media Manager
 * 
 * CRITICAL REQUIREMENTS:
 * - ALWAYS returns JSON with Content-Type: application/json
 * - NEVER redirects (returns 401/403/500 as JSON)
 * - Standardized response format with { success, statusCode }
 * - Validates file size (max 5MB) and type (JPG/PNG/WebP)
 * - Uploads to Wix Media Manager
 * - Returns public URL for uploaded image
 * 
 * Request: multipart/form-data with 'file' field
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "url": "https://static.wixstatic.com/media/..."
 * }
 * 
 * Error Response (400/401/500):
 * {
 *   "success": false,
 *   "statusCode": number,
 *   "error": "Error message"
 * }
 */

import { ok, badRequest, serverError, unauthorized } from 'wix-http-functions';
import wixMediaBackend from 'wix-media-backend';

// Helper to create JSON response
function jsonResponse(statusCode: number, body: any) {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  };
}

export async function post_uploadProfilePhoto(request: any): Promise<any> {
  try {
    // Parse the request body
    const contentType = request.headers['content-type'] || request.headers['Content-Type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'Content-Type must be multipart/form-data'
      });
    }

    // Get the file from the request
    // In Wix Velo, multipart data is available in request.body
    const file = request.body?.file;
    
    if (!file) {
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'No file provided'
      });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'File size must be less than 5MB'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'File type must be JPG, PNG, or WebP'
      });
    }

    // Upload to Wix Media Manager
    const uploadResult = await wixMediaBackend.upload(
      '/trainer-profiles',
      file,
      file.name,
      {
        mediaType: 'image',
        mimeType: file.type
      }
    );

    // Return the uploaded file URL
    return jsonResponse(200, {
      success: true,
      statusCode: 200,
      url: uploadResult.fileUrl
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Handle specific errors
    if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
      return jsonResponse(401, {
        success: false,
        statusCode: 401,
        error: 'Unauthorized: You do not have permission to upload files'
      });
    }

    return jsonResponse(500, {
      success: false,
      statusCode: 500,
      error: error.message || 'Failed to upload file'
    });
  }
}

// Handle OPTIONS for CORS preflight
export async function options_uploadProfilePhoto(request: any): Promise<any> {
  return {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
}
