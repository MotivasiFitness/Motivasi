/**
 * API Response Handler - Robust JSON parsing with error handling
 * Ensures all API responses are properly validated and parsed
 * Guards against HTML responses and non-JSON content
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Safely parse JSON response with validation
 * @param response - Fetch response object
 * @param context - Context for error messages
 * @returns Parsed JSON or throws descriptive error
 */
export async function safeJsonParse<T = any>(
  response: Response,
  context: string = 'API request'
): Promise<T> {
  // Check content-type header
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    
    // Log the actual response for debugging
    console.error(`[${context}] Non-JSON response received:`, {
      status: response.status,
      contentType,
      responseLength: text.length,
      responsePreview: text.substring(0, 200),
    });

    throw new Error(
      `${context} returned non-JSON response (${response.status}). ` +
      `Expected JSON but got ${contentType || 'unknown content type'}. ` +
      `This usually means the API endpoint is missing or returning an error page.`
    );
  }

  try {
    // Read response text ONCE to avoid 'body already read' errors
    const text = await response.text();
    
    // Parse the text as JSON
    const json = JSON.parse(text);
    return json as T;
  } catch (parseError) {
    // Text is already read above, so we can't read it again
    // Use the error message instead
    console.error(`[${context}] JSON parse error:`, {
      error: parseError,
      status: response.status,
    });

    throw new Error(
      `${context} returned invalid JSON. ` +
      `Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
    );
  }
}

/**
 * Handle API error responses with proper JSON structure
 * @param response - Fetch response object
 * @param context - Context for error messages
 * @returns Error object with details
 */
export async function handleApiError(
  response: Response,
  context: string = 'API request'
): Promise<{ error: string; statusCode: number; details?: any }> {
  const contentType = response.headers.get('content-type');

  // Try to parse as JSON if content-type indicates JSON
  if (contentType && contentType.includes('application/json')) {
    try {
      const errorData = await response.json();
      return {
        error: errorData.error || errorData.message || `${context} failed`,
        statusCode: response.status,
        details: errorData,
      };
    } catch {
      // Fall through to text parsing
    }
  }

  // Fall back to text response
  const text = await response.text();
  
  // Detect common error patterns
  let errorMessage = `${context} failed with status ${response.status}`;
  
  if (response.status === 401) {
    errorMessage = 'Authentication required. Please log in again.';
  } else if (response.status === 403) {
    errorMessage = 'You do not have permission to perform this action.';
  } else if (response.status === 404) {
    errorMessage = `${context} endpoint not found. The API route may not be implemented.`;
  } else if (response.status === 500) {
    errorMessage = 'Server error. Please try again later.';
  } else if (text && text.length < 500) {
    errorMessage = text;
  }

  return {
    error: errorMessage,
    statusCode: response.status,
    details: { responseText: text.substring(0, 200) },
  };
}

/**
 * Make a safe API request with JSON validation
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param context - Context for error messages
 * @returns Parsed JSON response
 */
export async function safeFetch<T = any>(
  url: string,
  options: RequestInit = {},
  context: string = 'API request'
): Promise<T> {
  try {
    // Ensure we're sending JSON
    if (options.body && typeof options.body === 'string') {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
    }

    const response = await fetch(url, options);

    // Handle non-OK responses
    if (!response.ok) {
      const errorInfo = await handleApiError(response, context);
      throw new Error(errorInfo.error);
    }

    // Parse and validate JSON response
    return await safeJsonParse<T>(response, context);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${context}] Error:`, errorMessage);
    throw error;
  }
}

/**
 * Validate that a response is JSON before attempting to parse
 * @param response - Fetch response object
 * @returns true if response is JSON, false otherwise
 */
export function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  return contentType ? contentType.includes('application/json') : false;
}

/**
 * Create a standardized JSON error response
 * @param error - Error message or Error object
 * @param statusCode - HTTP status code
 * @returns Standardized error response
 */
export function createErrorResponse(
  error: string | Error,
  statusCode: number = 400
): ApiResponse {
  return {
    success: false,
    error: error instanceof Error ? error.message : error,
    statusCode,
  };
}

/**
 * Create a standardized JSON success response
 * @param data - Response data
 * @param statusCode - HTTP status code
 * @returns Standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): ApiResponse<T> {
  return {
    success: true,
    data,
    statusCode,
  };
}

export default {
  safeJsonParse,
  handleApiError,
  safeFetch,
  isJsonResponse,
  createErrorResponse,
  createSuccessResponse,
};
