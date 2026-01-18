/**
 * Unit Tests for Backend Configuration
 * Tests environment detection and endpoint routing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isPreviewEnvironment,
  getBackendBasePath,
  getBackendEndpoint,
  BACKEND_FUNCTIONS,
  getAllBackendEndpoints,
} from '../backend-config';

describe('Backend Configuration', () => {
  // Store original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { hostname: '' };
  });

  afterEach(() => {
    // Restore original window.location
    window.location = originalLocation;
  });

  describe('isPreviewEnvironment', () => {
    it('should return true for localhost', () => {
      window.location.hostname = 'localhost';
      expect(isPreviewEnvironment()).toBe(true);
    });

    it('should return true for 127.0.0.1', () => {
      window.location.hostname = '127.0.0.1';
      expect(isPreviewEnvironment()).toBe(true);
    });

    it('should return true for preview domains', () => {
      window.location.hostname = 'mysite.preview.wixsite.com';
      expect(isPreviewEnvironment()).toBe(true);
    });

    it('should return true for editorx.io domains', () => {
      window.location.hostname = 'editor.editorx.io';
      expect(isPreviewEnvironment()).toBe(true);
    });

    it('should return true for wixsite.com/studio', () => {
      window.location.hostname = 'mysite.wixsite.com/studio';
      expect(isPreviewEnvironment()).toBe(true);
    });

    it('should return false for production domains', () => {
      window.location.hostname = 'mysite.com';
      expect(isPreviewEnvironment()).toBe(false);
    });

    it('should return false for custom production domains', () => {
      window.location.hostname = 'www.example.com';
      expect(isPreviewEnvironment()).toBe(false);
    });

    it('should return false for wixsite.com without studio', () => {
      window.location.hostname = 'mysite.wixsite.com';
      expect(isPreviewEnvironment()).toBe(false);
    });
  });

  describe('getBackendBasePath', () => {
    it('should return /_functions-dev/ for preview environment', () => {
      window.location.hostname = 'localhost';
      expect(getBackendBasePath()).toBe('/_functions-dev/');
    });

    it('should return /_functions/ for production environment', () => {
      window.location.hostname = 'mysite.com';
      expect(getBackendBasePath()).toBe('/_functions/');
    });

    it('should return /_functions-dev/ for preview.wixsite.com', () => {
      window.location.hostname = 'mysite.preview.wixsite.com';
      expect(getBackendBasePath()).toBe('/_functions-dev/');
    });

    it('should return /_functions/ for regular wixsite.com', () => {
      window.location.hostname = 'mysite.wixsite.com';
      expect(getBackendBasePath()).toBe('/_functions/');
    });
  });

  describe('getBackendEndpoint', () => {
    it('should return correct endpoint for preview environment', () => {
      window.location.hostname = 'localhost';
      const endpoint = getBackendEndpoint('uploadProfilePhoto');
      expect(endpoint).toBe('/_functions-dev/uploadProfilePhoto');
    });

    it('should return correct endpoint for production environment', () => {
      window.location.hostname = 'mysite.com';
      const endpoint = getBackendEndpoint('uploadProfilePhoto');
      expect(endpoint).toBe('/_functions/uploadProfilePhoto');
    });

    it('should work with BACKEND_FUNCTIONS constants', () => {
      window.location.hostname = 'localhost';
      const endpoint = getBackendEndpoint(BACKEND_FUNCTIONS.GENERATE_PROGRAM);
      expect(endpoint).toBe('/_functions-dev/generateProgram');
    });

    it('should handle all backend function names', () => {
      window.location.hostname = 'mysite.com';
      
      expect(getBackendEndpoint(BACKEND_FUNCTIONS.GENERATE_PROGRAM))
        .toBe('/_functions/generateProgram');
      
      expect(getBackendEndpoint(BACKEND_FUNCTIONS.REGENERATE_PROGRAM_SECTION))
        .toBe('/_functions/regenerateProgramSection');
      
      expect(getBackendEndpoint(BACKEND_FUNCTIONS.GENERATE_PROGRAM_DESCRIPTION))
        .toBe('/_functions/generateProgramDescription');
      
      expect(getBackendEndpoint(BACKEND_FUNCTIONS.UPLOAD_PROFILE_PHOTO))
        .toBe('/_functions/uploadProfilePhoto');
      
      expect(getBackendEndpoint(BACKEND_FUNCTIONS.HEALTH))
        .toBe('/_functions/health');
    });
  });

  describe('getAllBackendEndpoints', () => {
    it('should return all endpoints for preview environment', () => {
      window.location.hostname = 'localhost';
      const endpoints = getAllBackendEndpoints();
      
      expect(endpoints).toEqual({
        generateProgram: '/_functions-dev/generateProgram',
        regenerateProgramSection: '/_functions-dev/regenerateProgramSection',
        generateProgramDescription: '/_functions-dev/generateProgramDescription',
        uploadProfilePhoto: '/_functions-dev/uploadProfilePhoto',
        health: '/_functions-dev/health',
      });
    });

    it('should return all endpoints for production environment', () => {
      window.location.hostname = 'mysite.com';
      const endpoints = getAllBackendEndpoints();
      
      expect(endpoints).toEqual({
        generateProgram: '/_functions/generateProgram',
        regenerateProgramSection: '/_functions/regenerateProgramSection',
        generateProgramDescription: '/_functions/generateProgramDescription',
        uploadProfilePhoto: '/_functions/uploadProfilePhoto',
        health: '/_functions/health',
      });
    });
  });

  describe('Environment-specific routing', () => {
    it('should route to dev endpoints on localhost:3000', () => {
      window.location.hostname = 'localhost';
      expect(getBackendEndpoint('testFunction')).toBe('/_functions-dev/testFunction');
    });

    it('should route to dev endpoints on 127.0.0.1', () => {
      window.location.hostname = '127.0.0.1';
      expect(getBackendEndpoint('testFunction')).toBe('/_functions-dev/testFunction');
    });

    it('should route to production endpoints on custom domain', () => {
      window.location.hostname = 'www.myfitnessapp.com';
      expect(getBackendEndpoint('testFunction')).toBe('/_functions/testFunction');
    });

    it('should route to dev endpoints on preview subdomain', () => {
      window.location.hostname = 'mysite.preview.wixsite.com';
      expect(getBackendEndpoint('testFunction')).toBe('/_functions-dev/testFunction');
    });

    it('should route to production endpoints on published wixsite', () => {
      window.location.hostname = 'mysite.wixsite.com';
      expect(getBackendEndpoint('testFunction')).toBe('/_functions/testFunction');
    });
  });

  describe('Cross-platform consistency', () => {
    const testFunction = 'uploadProfilePhoto';

    it('should return consistent endpoints across multiple calls', () => {
      window.location.hostname = 'mysite.com';
      
      const call1 = getBackendEndpoint(testFunction);
      const call2 = getBackendEndpoint(testFunction);
      const call3 = getBackendEndpoint(testFunction);
      
      expect(call1).toBe(call2);
      expect(call2).toBe(call3);
      expect(call1).toBe('/_functions/uploadProfilePhoto');
    });

    it('should handle rapid environment changes', () => {
      // Simulate environment change (e.g., from dev to prod)
      window.location.hostname = 'localhost';
      expect(getBackendEndpoint(testFunction)).toBe('/_functions-dev/uploadProfilePhoto');
      
      window.location.hostname = 'mysite.com';
      expect(getBackendEndpoint(testFunction)).toBe('/_functions/uploadProfilePhoto');
      
      window.location.hostname = 'localhost';
      expect(getBackendEndpoint(testFunction)).toBe('/_functions-dev/uploadProfilePhoto');
    });
  });
});
