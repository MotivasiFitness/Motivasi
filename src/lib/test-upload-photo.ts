/**
 * Test Utility for Profile Photo Upload
 * 
 * This utility helps test the profile photo upload flow end-to-end.
 * Use this in the browser console to diagnose upload issues.
 * 
 * Usage:
 * 1. Open browser console on /trainer/profile page
 * 2. Copy and paste this entire file into console
 * 3. Run: await testUploadFlow()
 */

import { getBackendEndpoint, BACKEND_FUNCTIONS, isPreviewEnvironment } from '@/lib/backend-config';
import { BaseCrudService } from '@/integrations';

/**
 * Create a test image blob (1x1 pixel red JPG)
 */
function createTestImage(): Blob {
  // Create a 1x1 red pixel canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 1, 1);
  
  // Convert to blob
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg', 0.9);
  });
}

/**
 * Test the upload endpoint
 */
async function testUploadEndpoint(): Promise<void> {
  console.group('🧪 Test Upload Endpoint');
  
  try {
    // Get endpoint
    const uploadUrl = getBackendEndpoint(BACKEND_FUNCTIONS.UPLOAD_PROFILE_PHOTO);
    const fullUrl = window.location.origin + uploadUrl;
    
    console.log('📍 Upload URL:', uploadUrl);
    console.log('🌐 Full URL:', fullUrl);
    console.log('🔧 Environment:', isPreviewEnvironment() ? 'Preview/Dev' : 'Production');
    console.log('🏠 Hostname:', window.location.hostname);
    
    // Create test image
    console.log('🎨 Creating test image...');
    const testBlob = await createTestImage();
    console.log('✅ Test image created:', testBlob.size, 'bytes');
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', testBlob, 'test-upload.jpg');
    
    console.log('📤 Sending upload request...');
    
    // Send request
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    // Log response details
    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📋 Content-Type:', response.headers.get('content-type'));
    console.log('🔗 Response URL:', response.url);
    
    // Get response text
    const responseText = await response.clone().text();
    console.log('📄 Response body (first 500 chars):', responseText.substring(0, 500));
    
    // Try to parse as JSON
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ Parsed JSON:', data);
      
      if (data.success && data.url) {
        console.log('✅ Upload successful!');
        console.log('🖼️ Image URL:', data.url);
      } else {
        console.error('❌ Upload failed:', data.error);
      }
    } else {
      console.error('❌ Response is not JSON');
      console.error('📄 Content-Type:', contentType);
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('📚 Error stack:', error.stack);
  } finally {
    console.groupEnd();
  }
}

/**
 * Test database access
 */
async function testDatabaseAccess(): Promise<void> {
  console.group('🧪 Test Database Access');
  
  try {
    console.log('📊 Fetching trainer profiles...');
    const result = await BaseCrudService.getAll('trainerprofiles');
    
    console.log('✅ Found', result.items.length, 'profile(s)');
    
    if (result.items.length > 0) {
      const profile = result.items[0];
      console.log('👤 Profile ID:', profile._id);
      console.log('📛 Display Name:', profile.displayName);
      console.log('🖼️ Profile Photo:', profile.profilePhoto);
      
      if (profile.profilePhoto) {
        console.log('✅ Profile has photo URL');
        
        // Test if URL is accessible
        try {
          const imgResponse = await fetch(profile.profilePhoto, { method: 'HEAD' });
          if (imgResponse.ok) {
            console.log('✅ Photo URL is accessible');
          } else {
            console.error('❌ Photo URL returned status:', imgResponse.status);
          }
        } catch (error) {
          console.error('❌ Failed to access photo URL:', error);
        }
      } else {
        console.log('ℹ️ No profile photo set');
      }
    } else {
      console.log('ℹ️ No profiles found');
    }
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error.message);
    console.error('📚 Error stack:', error.stack);
  } finally {
    console.groupEnd();
  }
}

/**
 * Test the complete upload flow
 */
export async function testUploadFlow(): Promise<void> {
  console.log('🚀 Starting Upload Flow Test');
  console.log('================================');
  
  // Test 1: Database access
  await testDatabaseAccess();
  
  console.log('');
  
  // Test 2: Upload endpoint
  await testUploadEndpoint();
  
  console.log('');
  console.log('================================');
  console.log('✅ Test complete!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Review the logs above for any errors');
  console.log('2. If upload succeeded, check the Image URL');
  console.log('3. If upload failed, note the error message and status code');
  console.log('4. Refer to UPLOAD_PHOTO_DEBUG_GUIDE.md for troubleshooting');
}

/**
 * Quick diagnostic check
 */
export function quickDiagnostic(): void {
  console.group('🔍 Quick Diagnostic');
  
  // Environment
  console.log('🔧 Environment:', isPreviewEnvironment() ? 'Preview/Dev' : 'Production');
  console.log('🏠 Hostname:', window.location.hostname);
  console.log('🌐 Origin:', window.location.origin);
  
  // Endpoints
  const uploadUrl = getBackendEndpoint(BACKEND_FUNCTIONS.UPLOAD_PROFILE_PHOTO);
  console.log('📍 Upload endpoint:', uploadUrl);
  console.log('🔗 Full URL:', window.location.origin + uploadUrl);
  
  // Browser capabilities
  console.log('📷 File API:', 'File' in window);
  console.log('📦 FormData API:', 'FormData' in window);
  console.log('🌐 Fetch API:', 'fetch' in window);
  console.log('🎨 Canvas API:', 'HTMLCanvasElement' in window);
  
  console.groupEnd();
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).testUploadFlow = testUploadFlow;
  (window as any).quickDiagnostic = quickDiagnostic;
  
  console.log('✅ Upload test utilities loaded!');
  console.log('Run: await testUploadFlow() to test the complete flow');
  console.log('Run: quickDiagnostic() for a quick environment check');
}
