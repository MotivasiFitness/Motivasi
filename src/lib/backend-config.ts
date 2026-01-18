/**
 * Backend Functions Configuration
 * 
 * Centralized configuration for all backend function endpoints.
 * This ensures consistency across environments and prevents hardcoding regressions.
 * 
 * USAGE:
 * ```typescript
 * import { getBackendEndpoint, BACKEND_FUNCTIONS } from '@/lib/backend-config';
 * 
 * // Get environment-aware endpoint
 * const uploadUrl = getBackendEndpoint(BACKEND_FUNCTIONS.UPLOAD_PROFILE_PHOTO);
 * 
 * // Or use the helper directly
 * const response = await fetch(getBackendEndpoint('uploadProfilePhoto'), { ... });
 * ```
 */

/**
 * Available backend function names
 */
export const BACKEND_FUNCTIONS = {
  GENERATE_PROGRAM: 'generateProgram',
  REGENERATE_PROGRAM_SECTION: 'regenerateProgramSection',
  GENERATE_PROGRAM_DESCRIPTION: 'generateProgramDescription',
  UPLOAD_PROFILE_PHOTO: 'uploadProfilePhoto',
  HEALTH: 'health',
} as const;

export type BackendFunctionName = typeof BACKEND_FUNCTIONS[keyof typeof BACKEND_FUNCTIONS];

/**
 * Environment detection
 * Determines if we're in preview/development or production environment
 */
export function isPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side, assume production
  }

  const hostname = window.location.hostname;
  
  return (
    hostname.includes('preview') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('editorx.io') ||
    hostname.includes('wixsite.com/studio')
  );
}

/**
 * Get the base path for backend functions based on environment
 * 
 * @returns '/_functions-dev/' for preview/dev, '/_functions/' for production
 */
export function getBackendBasePath(): string {
  return isPreviewEnvironment() ? '/_functions-dev/' : '/_functions/';
}

/**
 * Get the full endpoint URL for a backend function
 * 
 * @param functionName - Name of the backend function (e.g., 'uploadProfilePhoto')
 * @returns Full endpoint path (e.g., '/_functions-dev/uploadProfilePhoto')
 * 
 * @example
 * ```typescript
 * const uploadUrl = getBackendEndpoint('uploadProfilePhoto');
 * // Returns: '/_functions-dev/uploadProfilePhoto' (in preview)
 * // Returns: '/_functions/uploadProfilePhoto' (in production)
 * ```
 */
export function getBackendEndpoint(functionName: BackendFunctionName | string): string {
  const basePath = getBackendBasePath();
  const endpoint = `${basePath}${functionName}`;
  
  // Only log in development (localhost only)
  if (
    typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.log('[Backend Config]', {
      functionName,
      environment: isPreviewEnvironment() ? 'preview/dev' : 'production',
      basePath,
      endpoint,
      hostname: window.location.hostname,
    });
  }
  
  return endpoint;
}

/**
 * Get all backend endpoints as an object
 * Useful for health checks and diagnostics
 * 
 * @returns Object mapping function names to their full endpoint paths
 */
export function getAllBackendEndpoints(): Record<string, string> {
  const endpoints: Record<string, string> = {};
  
  for (const [key, functionName] of Object.entries(BACKEND_FUNCTIONS)) {
    endpoints[functionName] = getBackendEndpoint(functionName);
  }
  
  return endpoints;
}

/**
 * Validate that a backend response is JSON
 * Throws an error if the response is not JSON (e.g., HTML error page)
 * 
 * @param response - Fetch Response object
 * @param functionName - Name of the function being called (for error messages)
 * @throws Error if response is not JSON
 */
export async function validateBackendResponse(
  response: Response,
  functionName: string
): Promise<void> {
  const contentType = response.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    const textResponse = await response.text();
    
    // Only log detailed errors in development
    const isDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (isDev) {
      console.error(`[Backend Config] ERROR: ${functionName} returned ${contentType} instead of JSON`);
      console.error(`[Backend Config] Response body (first 500 chars):`, textResponse.substring(0, 500));
    }
    
    // User-friendly error message for production
    throw new Error(
      `Unable to process request. Please try again or contact support if the issue persists.`
    );
  }
}

/**
 * Helper function to call a backend function with automatic environment detection
 * 
 * @param functionName - Name of the backend function
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Parsed JSON response
 * 
 * @example
 * ```typescript
 * const result = await callBackendFunction('uploadProfilePhoto', {
 *   method: 'POST',
 *   body: formData,
 * });
 * ```
 */
export async function callBackendFunction<T = any>(
  functionName: BackendFunctionName | string,
  options: RequestInit = {}
): Promise<T> {
  const endpoint = getBackendEndpoint(functionName);
  
  const response = await fetch(endpoint, options);
  
  // Validate response is JSON
  await validateBackendResponse(response, functionName);
  
  // Parse JSON
  const data = await response.json();
  
  // Check for errors
  if (!response.ok || !data.success) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  
  return data;
}

export default {
  BACKEND_FUNCTIONS,
  isPreviewEnvironment,
  getBackendBasePath,
  getBackendEndpoint,
  getAllBackendEndpoints,
  validateBackendResponse,
  callBackendFunction,
};
