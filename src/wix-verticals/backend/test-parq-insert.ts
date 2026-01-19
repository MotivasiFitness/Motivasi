/**
 * Wix HTTP Function: Test PAR-Q Insert
 * Endpoint: POST /_functions/test-parq-insert
 * 
 * DIAGNOSTIC FUNCTION - Backend-only direct insert test
 * 
 * This function performs a minimal direct insert into ParqSubmissions
 * to isolate whether the database insert itself is working.
 * 
 * Usage:
 * POST /_functions/test-parq-insert
 * Body: {} (empty or any JSON)
 * 
 * Returns:
 * {
 *   "ok": true,
 *   "id": "inserted-record-id",
 *   "verification": { ... full record read back ... }
 * }
 */

import { ok, serverError } from 'wix-http-functions';
import wixData from 'wix-data';

type AnyRequest = {
  body?: {
    text?: () => Promise<string>;
  };
};

interface TestResponse {
  ok: boolean;
  id?: string;
  verification?: any;
  error?: string;
  details?: any;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function options_testParqInsert() {
  return ok({ ok: true }, { headers: JSON_HEADERS });
}

export async function post_testParqInsert(request: AnyRequest) {
  try {
    console.log('=== PAR-Q INSERT TEST FUNCTION ===');
    console.log('⚠️ This is a diagnostic function to test direct database inserts');

    // Create minimal test data
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      clientName: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      hasHeartCondition: false,
      currentlyTakingMedication: false,
      submissionDate: new Date(),
      answers: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        note: 'This is a backend test submission'
      }),
      flagsYes: false,
      status: 'Test',
      assignedTrainerId: 'd18a21c8-be77-496f-a2fd-ec6479ecba6d',
      notes: 'BACKEND TEST RECORD - Safe to delete',
    };

    console.log('📦 Test data to insert:', JSON.stringify(testData, null, 2));

    // Attempt insert
    console.log('💾 Attempting direct insert...');
    let insertResult;
    
    try {
      insertResult = await wixData.insert('ParqSubmissions', testData);
      console.log('✅ Insert completed');
      console.log('📋 Insert result:', JSON.stringify(insertResult, null, 2));
    } catch (insertError: any) {
      console.error('❌ Insert failed:', insertError);
      console.error('❌ Error details:', JSON.stringify(insertError, null, 2));
      
      return serverError({
        ok: false,
        error: 'Insert failed',
        details: {
          message: insertError.message || String(insertError),
          code: insertError.code,
          stack: insertError.stack,
        }
      } as TestResponse, { headers: JSON_HEADERS });
    }

    // Verify _id exists
    if (!insertResult || !insertResult._id) {
      console.error('❌ CRITICAL: Insert returned but NO _id!');
      console.error('❌ Result was:', JSON.stringify(insertResult, null, 2));
      
      return serverError({
        ok: false,
        error: 'Insert returned no _id',
        details: insertResult,
      } as TestResponse, { headers: JSON_HEADERS });
    }

    console.log('✅ _id confirmed:', insertResult._id);

    // Attempt to read back
    console.log('🔍 Attempting to read back record...');
    let verifyRecord;
    
    try {
      verifyRecord = await wixData.get('ParqSubmissions', insertResult._id);
      console.log('✅ Read back successful');
      console.log('📋 Verified record:', JSON.stringify(verifyRecord, null, 2));
    } catch (readError: any) {
      console.error('❌ Read back failed:', readError);
      
      return ok({
        ok: true,
        id: insertResult._id,
        error: 'Insert succeeded but read-back failed',
        details: {
          insertResult,
          readError: readError.message || String(readError),
        }
      } as TestResponse, { headers: JSON_HEADERS });
    }

    // Success - return full details
    console.log('✅ TEST PASSED: Insert and read-back both successful');
    
    return ok({
      ok: true,
      id: insertResult._id,
      verification: verifyRecord,
    } as TestResponse, { headers: JSON_HEADERS });

  } catch (error: any) {
    console.error('❌ Unexpected error in test function:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    
    return serverError({
      ok: false,
      error: 'Unexpected error',
      details: {
        message: error.message || String(error),
        stack: error.stack,
      }
    } as TestResponse, { headers: JSON_HEADERS });
  }
}
