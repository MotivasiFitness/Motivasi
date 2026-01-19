/**
 * HTTP Functions for Wix Backend
 * This file contains HTTP function handlers for the application
 */

import { ok, badRequest, serverError } from 'wix-http-functions';

/**
 * Example HTTP function handler
 * Access via: https://yoursite.com/_functions/example
 */
export function get_example(request) {
  const response = {
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      message: 'Example HTTP function',
      timestamp: new Date().toISOString()
    }
  };
  
  return ok(response);
}

/**
 * Example POST handler
 * Access via: https://yoursite.com/_functions/example (POST)
 */
export function post_example(request) {
  try {
    const body = request.body;
    
    const response = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        message: 'Data received',
        data: body
      }
    };
    
    return ok(response);
  } catch (error) {
    return serverError({
      body: {
        error: error.message
      }
    });
  }
}
