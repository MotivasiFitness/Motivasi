/**
 * API Test Utilities - Verify API endpoints are working correctly
 * Use these utilities to test and debug API issues
 */

import { safeFetch, handleApiError, isJsonResponse } from './api-response-handler';

export interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  responseTime?: number;
}

/**
 * Test if an API endpoint exists and returns JSON
 * @param endpoint - API endpoint URL
 * @param method - HTTP method (default: GET)
 * @returns Test result
 */
export async function testApiEndpoint(
  endpoint: string,
  method: string = 'GET'
): Promise<ApiTestResult> {
  const startTime = performance.now();

  try {
    const response = await fetch(endpoint, { method });
    const responseTime = performance.now() - startTime;

    // Check if response is JSON
    if (!isJsonResponse(response)) {
      const contentType = response.headers.get('content-type');
      return {
        endpoint,
        status: 'error',
        message: `Endpoint returned non-JSON response (${response.status})`,
        details: {
          contentType,
          expectedContentType: 'application/json',
          statusCode: response.status,
        },
        responseTime,
      };
    }

    // Try to parse JSON
    try {
      const json = await response.json();
      return {
        endpoint,
        status: 'success',
        message: `Endpoint is working and returns JSON`,
        details: {
          statusCode: response.status,
          responseStructure: Object.keys(json),
        },
        responseTime,
      };
    } catch (parseError) {
      return {
        endpoint,
        status: 'error',
        message: `Endpoint returned invalid JSON`,
        details: {
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          statusCode: response.status,
        },
        responseTime,
      };
    }
  } catch (error) {
    return {
      endpoint,
      status: 'error',
      message: `Failed to reach endpoint`,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      responseTime: performance.now() - startTime,
    };
  }
}

/**
 * Test program generation endpoint
 * @param input - Program generation input
 * @param trainerId - Trainer ID
 * @returns Test result
 */
export async function testProgramGeneration(
  input: any,
  trainerId: string
): Promise<ApiTestResult> {
  const startTime = performance.now();

  try {
    const response = await fetch('/api/generate-program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, trainerId }),
    });

    const responseTime = performance.now() - startTime;

    // Check status
    if (!response.ok) {
      const errorInfo = await handleApiError(response, 'Program generation');
      return {
        endpoint: '/api/generate-program',
        status: 'error',
        message: `Program generation failed with status ${response.status}`,
        details: errorInfo,
        responseTime,
      };
    }

    // Check if JSON
    if (!isJsonResponse(response)) {
      return {
        endpoint: '/api/generate-program',
        status: 'error',
        message: `Endpoint returned non-JSON response`,
        details: {
          contentType: response.headers.get('content-type'),
        },
        responseTime,
      };
    }

    // Parse response
    try {
      const program = await response.json();
      return {
        endpoint: '/api/generate-program',
        status: 'success',
        message: `Program generated successfully`,
        details: {
          programName: program.programName || program.data?.programName,
          workoutDays: program.workoutDays?.length || program.data?.workoutDays?.length,
          statusCode: response.status,
        },
        responseTime,
      };
    } catch (parseError) {
      return {
        endpoint: '/api/generate-program',
        status: 'error',
        message: `Failed to parse program response`,
        details: {
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
        },
        responseTime,
      };
    }
  } catch (error) {
    return {
      endpoint: '/api/generate-program',
      status: 'error',
      message: `Failed to call program generation endpoint`,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      responseTime: performance.now() - startTime,
    };
  }
}

/**
 * Run comprehensive API diagnostics
 * @returns Array of test results
 */
export async function runApiDiagnostics(): Promise<ApiTestResult[]> {
  const results: ApiTestResult[] = [];

  // Test health endpoint first
  const healthResult = await testApiEndpoint('/api/health', 'GET');
  results.push(healthResult);

  // Test program generation with sample data
  const sampleProgramInput = {
    programGoal: 'Build strength',
    programLength: '8 weeks',
    daysPerWeek: 3,
    experienceLevel: 'intermediate',
    equipment: ['dumbbells', 'barbell'],
    timePerWorkout: 60,
    injuries: 'None',
    trainingStyle: 'strength',
    additionalNotes: 'Test program generation',
  };

  const programResult = await testProgramGeneration(sampleProgramInput, 'test-trainer-id');
  results.push(programResult);

  return results;
}

/**
 * Log API test results in a readable format
 * @param results - Array of test results
 */
export function logApiTestResults(results: ApiTestResult[]): void {
  console.log('\n=== API Diagnostics Results ===\n');

  for (const result of results) {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.endpoint}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message}`);

    if (result.responseTime) {
      console.log(`   Response Time: ${result.responseTime.toFixed(2)}ms`);
    }

    if (result.details) {
      console.log(`   Details:`, result.details);
    }

    console.log();
  }

  // Summary
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  console.log('=== Summary ===');
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log();

  if (errorCount > 0) {
    console.log('🔧 Troubleshooting:');
    console.log('1. Verify API endpoints are implemented in your backend');
    console.log('2. Check that all responses have Content-Type: application/json');
    console.log('3. Ensure authentication returns 401 JSON, not redirects');
    console.log('4. Check server logs for errors');
    console.log('5. See API_BUG_FIX_GUIDE.md for implementation details');
  }
}

/**
 * Create a test program generation input
 * @returns Sample input for testing
 */
export function createTestProgramInput(): any {
  return {
    programGoal: 'Build muscle and strength',
    programLength: '8 weeks',
    daysPerWeek: 4,
    experienceLevel: 'intermediate',
    equipment: ['dumbbells', 'barbell', 'machines'],
    timePerWorkout: 60,
    injuries: 'None',
    trainingStyle: 'strength',
    additionalNotes: 'Focus on compound movements',
  };
}

/**
 * Interactive API testing function
 * Run this in browser console to test your API
 */
export async function interactiveApiTest(): Promise<void> {
  console.log('🧪 Starting API diagnostics...\n');

  // Run diagnostics
  const results = await runApiDiagnostics();
  logApiTestResults(results);

  // If endpoints exist, try program generation
  const generateEndpointExists = results.some(
    r => r.endpoint === '/api/generate-program' && r.status === 'success'
  );

  if (generateEndpointExists) {
    console.log('🚀 Testing program generation...\n');
    const testInput = createTestProgramInput();
    const testResult = await testProgramGeneration(testInput, 'test-trainer-123');
    console.log('Program Generation Test Result:');
    console.log(testResult);
  } else {
    console.log('⚠️  Program generation endpoint not responding. Skipping generation test.');
  }
}

export default {
  testApiEndpoint,
  testProgramGeneration,
  runApiDiagnostics,
  logApiTestResults,
  createTestProgramInput,
  interactiveApiTest,
};
