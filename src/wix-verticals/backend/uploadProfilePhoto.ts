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
    // Enhanced logging for debugging
    console.log('=== Upload Profile Photo Backend ===');
    console.log('Request method:', request.method);
    console.log('Request headers:', JSON.stringify(request.headers, null, 2));
    console.log('Request body type:', typeof request.body);
    console.log('Request body keys:', request.body ? Object.keys(request.body) : 'null');
    
    // Parse the request body
    const contentType = request.headers['content-type'] || request.headers['Content-Type'] || '';
    console.log('Content-Type:', contentType);
    
    if (!contentType.includes('multipart/form-data')) {
      console.error('Invalid Content-Type:', contentType);
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'Content-Type must be multipart/form-data'
      });
    }

    // Get the file from the request
    // In Wix Velo, multipart data is available in request.body
    const file = request.body?.file;
    console.log('File present:', !!file);
    console.log('File object type:', file ? typeof file : 'undefined');
    
    if (!file) {
      console.error('No file in request body');
      console.error('Available body keys:', request.body ? Object.keys(request.body) : 'none');
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'No file provided in request'
      });
    }

    // Log file details
    console.log('File details:', {
      name: file.name || 'unknown',
      size: file.size || 0,
      type: file.type || 'unknown',
      hasData: !!file.data || !!file.buffer || !!file.content
    });

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const fileSize = file.size || 0;
    if (fileSize > maxSize) {
      console.error('File too large:', fileSize, 'bytes');
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: `File size must be less than 5MB (current: ${(fileSize / 1024 / 1024).toFixed(2)}MB)`
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileType = (file.type || '').toLowerCase();
    if (!allowedTypes.includes(fileType)) {
      console.error('Invalid file type:', fileType);
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: `File type must be JPG, PNG, or WebP (current: ${fileType || 'unknown'})`
      });
    }

    console.log('Starting upload to Wix Media Manager...');
    console.log('Upload parameters:', {
      folder: '/trainer-profiles',
      fileName: file.name,
      mediaType: 'image',
      mimeType: fileType
    });
    
    // Upload to Wix Media Manager
    // Note: wixMediaBackend.upload expects (folder, file, fileName, options)
    const uploadResult = await wixMediaBackend.upload(
      '/trainer-profiles',
      file,
      file.name || 'profile-photo.jpg',
      {
        mediaType: 'image',
        mimeType: fileType
      }
    );

    console.log('Upload successful!');
    console.log('Upload result keys:', uploadResult ? Object.keys(uploadResult) : 'null');
    console.log('Upload result:', JSON.stringify(uploadResult, null, 2));
    
    // Extract the file URL from the upload result
    // Wix Media Manager returns fileUrl or url
    const uploadedUrl = uploadResult.fileUrl || uploadResult.url;
    console.log('Extracted URL:', uploadedUrl);

    if (!uploadedUrl) {
      console.error('No URL in upload result:', uploadResult);
      return jsonResponse(500, {
        success: false,
        statusCode: 500,
        error: 'Upload succeeded but no URL was returned from Wix Media Manager'
      });
    }

    // Return the uploaded file URL
    return jsonResponse(200, {
      success: true,
      statusCode: 200,
      url: uploadedUrl
    });

  } catch (error: any) {
    console.error('=== Upload Error ===');
    console.error('Error type:', error.constructor?.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    // Handle specific errors
    if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
      return jsonResponse(401, {
        success: false,
        statusCode: 401,
        error: 'Unauthorized: You do not have permission to upload files'
      });
    }

    if (error.message?.includes('size') || error.message?.includes('too large')) {
      return jsonResponse(400, {
        success: false,
        statusCode: 400,
        error: 'File size exceeds maximum allowed size'
      });
    }

    return jsonResponse(500, {
      success: false,
      statusCode: 500,
      error: error.message || 'Failed to upload file to Wix Media Manager'
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
