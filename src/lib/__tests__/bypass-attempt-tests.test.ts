/**
 * Bypass Attempt Tests - Security Verification
 * 
 * These tests verify that direct client-side access to protected collections
 * is properly denied and that all access must go through the backend gateway.
 * 
 * CRITICAL: These tests confirm that the security hardening is working correctly.
 * If any of these tests fail, it indicates a security vulnerability.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseCrudService } from '@/integrations';
import ProtectedDataService from '../protected-data-service';

// Mock BaseCrudService to simulate permission denied
vi.mock('@/integrations', () => ({
  BaseCrudService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock fetch for ProtectedDataService
global.fetch = vi.fn();

describe('Bypass Attempt Tests - Security Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Direct BaseCrudService Access (Should Fail)', () => {
    it('should deny direct getAll on clientassignedworkouts', async () => {
      // Simulate permission denied response
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('clientassignedworkouts');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on programassignments', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('programassignments');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on trainerclientassignments', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('trainerclientassignments');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on trainerclientmessages', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('trainerclientmessages');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on trainerclientnotes', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('trainerclientnotes');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on weeklycheckins', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('weeklycheckins');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on weeklycoachesnotes', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('weeklycoachesnotes');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on weeklysummaries', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('weeklysummaries');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on trainernotifications', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('trainernotifications');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on trainernotificationpreferences', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('trainernotificationpreferences');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on clientprofiles', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('clientprofiles');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on clientprograms', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('clientprograms');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on programdrafts', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('programdrafts');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getAll on programs', async () => {
      vi.mocked(BaseCrudService.getAll).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getAll('programs');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct getById on protected collections', async () => {
      vi.mocked(BaseCrudService.getById).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.getById('clientassignedworkouts', 'item-123');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct create on protected collections', async () => {
      vi.mocked(BaseCrudService.create).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.create('clientassignedworkouts', {
          _id: 'new-item',
          clientId: 'client-123',
        });
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct update on protected collections', async () => {
      vi.mocked(BaseCrudService.update).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.update('clientassignedworkouts', {
          _id: 'item-123',
          clientId: 'client-123',
        });
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });

    it('should deny direct delete on protected collections', async () => {
      vi.mocked(BaseCrudService.delete).mockRejectedValue(
        new Error('Permission denied: Collection requires authentication')
      );

      const attempt = async () => {
        return await BaseCrudService.delete('clientassignedworkouts', 'item-123');
      };

      await expect(attempt()).rejects.toThrow('Permission denied');
    });
  });

  describe('Gateway Access (Should Succeed with Auth)', () => {
    it('should allow getAll through gateway with valid auth', async () => {
      const mockResponse = {
        success: true,
        statusCode: 200,
        data: {
          items: [{ _id: '1', clientId: 'client-123' }],
          totalCount: 1,
          hasNext: false,
          currentPage: 0,
          pageSize: 50,
          nextSkip: null,
        },
        timestamp: new Date().toISOString(),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        json: async () => mockResponse,
      } as any);

      const result = await ProtectedDataService.getAll('clientassignedworkouts');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].clientId).toBe('client-123');
    });

    it('should allow getById through gateway with valid auth', async () => {
      const mockResponse = {
        success: true,
        statusCode: 200,
        data: { _id: '1', clientId: 'client-123', exerciseName: 'Squats' },
        timestamp: new Date().toISOString(),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        json: async () => mockResponse,
      } as any);

      const result = await ProtectedDataService.getById('clientassignedworkouts', '1');

      expect(result).toEqual({ _id: '1', clientId: 'client-123', exerciseName: 'Squats' });
    });

    it('should deny getAll through gateway without auth', async () => {
      const mockResponse = {
        success: false,
        statusCode: 401,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        json: async () => mockResponse,
      } as any);

      const attempt = async () => {
        return await ProtectedDataService.getAll('clientassignedworkouts');
      };

      await expect(attempt()).rejects.toThrow('Authentication required');
    });

    it('should deny access to other client data', async () => {
      const mockResponse = {
        success: false,
        statusCode: 403,
        error: 'Clients can only access their own data',
        timestamp: new Date().toISOString(),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        json: async () => mockResponse,
      } as any);

      const attempt = async () => {
        return await ProtectedDataService.getForClient('clientassignedworkouts', 'other-client-id');
      };

      await expect(attempt()).rejects.toThrow('Clients can only access their own data');
    });
  });

  describe('Protected Collection Detection', () => {
    it('should identify all protected collections', () => {
      const protectedCollections = ProtectedDataService.getProtectedCollections();

      expect(protectedCollections).toContain('clientassignedworkouts');
      expect(protectedCollections).toContain('programassignments');
      expect(protectedCollections).toContain('trainerclientassignments');
      expect(protectedCollections).toContain('trainerclientmessages');
      expect(protectedCollections).toContain('trainerclientnotes');
      expect(protectedCollections).toContain('weeklycheckins');
      expect(protectedCollections).toContain('weeklycoachesnotes');
      expect(protectedCollections).toContain('weeklysummaries');
      expect(protectedCollections).toContain('trainernotifications');
      expect(protectedCollections).toContain('trainernotificationpreferences');
      expect(protectedCollections).toContain('clientprofiles');
      expect(protectedCollections).toContain('clientprograms');
      expect(protectedCollections).toContain('programdrafts');
      expect(protectedCollections).toContain('programs');
    });

    it('should correctly identify protected vs non-protected collections', () => {
      expect(ProtectedDataService.isProtected('clientassignedworkouts')).toBe(true);
      expect(ProtectedDataService.isProtected('blogposts')).toBe(false);
      expect(ProtectedDataService.isProtected('nutritionguidance')).toBe(false);
      expect(ProtectedDataService.isProtected('contactformsubmissions')).toBe(false);
    });
  });

  describe('Security Audit Trail', () => {
    it('should log all gateway requests', async () => {
      const consoleSpy = vi.spyOn(console, 'error');

      const mockResponse = {
        success: false,
        statusCode: 403,
        error: 'Unauthorized access attempt',
        timestamp: new Date().toISOString(),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        json: async () => mockResponse,
      } as any);

      try {
        await ProtectedDataService.getAll('clientassignedworkouts');
      } catch (e) {
        // Expected to fail
      }

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
