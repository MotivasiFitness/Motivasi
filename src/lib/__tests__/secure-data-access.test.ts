/**
 * Unit tests for Secure Data Access wrapper
 * 
 * Tests role-based scoping, access validation, and security enforcement
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecureDataAccess, getAuthContext, isValidAuthContext } from '../secure-data-access';
import { BaseCrudService } from '@/integrations';

// Mock BaseCrudService
vi.mock('@/integrations', () => ({
  BaseCrudService: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}));

describe('SecureDataAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getScoped', () => {
    it('should return only client-scoped data for clients', async () => {
      const mockWorkouts = [
        { _id: '1', clientId: 'client-123', exerciseName: 'Squats' },
        { _id: '2', clientId: 'client-456', exerciseName: 'Bench Press' },
        { _id: '3', clientId: 'client-123', exerciseName: 'Deadlifts' },
      ];

      vi.mocked(BaseCrudService.getAll).mockResolvedValue({
        items: mockWorkouts,
        totalCount: 3,
        hasNext: false,
        currentPage: 0,
        pageSize: 50,
        nextSkip: null,
      });

      const authContext = { memberId: 'client-123', role: 'client' as const };
      const result = await SecureDataAccess.getScoped(
        'clientassignedworkouts',
        authContext
      );

      // Should only return items for client-123
      expect(result.items).toHaveLength(2);
      expect(result.items.every((item: any) => item.clientId === 'client-123')).toBe(true);
    });

    it('should return only trainer-scoped data for trainers', async () => {
      const mockWorkouts = [
        { _id: '1', trainerId: 'trainer-123', clientId: 'client-1' },
        { _id: '2', trainerId: 'trainer-456', clientId: 'client-2' },
        { _id: '3', trainerId: 'trainer-123', clientId: 'client-3' },
      ];

      vi.mocked(BaseCrudService.getAll).mockResolvedValue({
        items: mockWorkouts,
        totalCount: 3,
        hasNext: false,
        currentPage: 0,
        pageSize: 50,
        nextSkip: null,
      });

      const authContext = { memberId: 'trainer-123', role: 'trainer' as const };
      const result = await SecureDataAccess.getScoped(
        'clientassignedworkouts',
        authContext
      );

      // Should only return items for trainer-123
      expect(result.items).toHaveLength(2);
      expect(result.items.every((item: any) => item.trainerId === 'trainer-123')).toBe(true);
    });

    it('should return all data for admins', async () => {
      const mockWorkouts = [
        { _id: '1', clientId: 'client-123' },
        { _id: '2', clientId: 'client-456' },
        { _id: '3', clientId: 'client-789' },
      ];

      vi.mocked(BaseCrudService.getAll).mockResolvedValue({
        items: mockWorkouts,
        totalCount: 3,
        hasNext: false,
        currentPage: 0,
        pageSize: 50,
        nextSkip: null,
      });

      const authContext = { memberId: 'admin-123', role: 'admin' as const };
      const result = await SecureDataAccess.getScoped(
        'clientassignedworkouts',
        authContext
      );

      // Should return all items for admin
      expect(result.items).toHaveLength(3);
    });

    it('should throw error for invalid auth context', async () => {
      const invalidContext = { memberId: '', role: 'client' as const };

      await expect(
        SecureDataAccess.getScoped('clientassignedworkouts', invalidContext)
      ).rejects.toThrow('Invalid authentication context');
    });

    it('should throw error for non-protected collection', async () => {
      const authContext = { memberId: 'client-123', role: 'client' as const };

      await expect(
        SecureDataAccess.getScoped('blogposts' as any, authContext)
      ).rejects.toThrow('not a protected collection');
    });
  });

  describe('getByIdScoped', () => {
    it('should return item if client owns it', async () => {
      const mockWorkout = {
        _id: 'workout-123',
        clientId: 'client-123',
        exerciseName: 'Squats',
      };

      vi.mocked(BaseCrudService.getById).mockResolvedValue(mockWorkout);

      const authContext = { memberId: 'client-123', role: 'client' as const };
      const result = await SecureDataAccess.getByIdScoped(
        'clientassignedworkouts',
        'workout-123',
        authContext
      );

      expect(result).toEqual(mockWorkout);
    });

    it('should throw error if client does not own item', async () => {
      const mockWorkout = {
        _id: 'workout-123',
        clientId: 'client-456', // Different client
        exerciseName: 'Squats',
      };

      vi.mocked(BaseCrudService.getById).mockResolvedValue(mockWorkout);

      const authContext = { memberId: 'client-123', role: 'client' as const };

      await expect(
        SecureDataAccess.getByIdScoped(
          'clientassignedworkouts',
          'workout-123',
          authContext
        )
      ).rejects.toThrow('Unauthorized');
    });

    it('should return item if trainer owns it', async () => {
      const mockWorkout = {
        _id: 'workout-123',
        trainerId: 'trainer-123',
        clientId: 'client-456',
      };

      vi.mocked(BaseCrudService.getById).mockResolvedValue(mockWorkout);

      const authContext = { memberId: 'trainer-123', role: 'trainer' as const };
      const result = await SecureDataAccess.getByIdScoped(
        'clientassignedworkouts',
        'workout-123',
        authContext
      );

      expect(result).toEqual(mockWorkout);
    });

    it('should return null if item does not exist', async () => {
      vi.mocked(BaseCrudService.getById).mockResolvedValue(null);

      const authContext = { memberId: 'client-123', role: 'client' as const };
      const result = await SecureDataAccess.getByIdScoped(
        'clientassignedworkouts',
        'nonexistent-id',
        authContext
      );

      expect(result).toBeNull();
    });

    it('should allow admin to access any item', async () => {
      const mockWorkout = {
        _id: 'workout-123',
        clientId: 'client-456',
        trainerId: 'trainer-789',
      };

      vi.mocked(BaseCrudService.getById).mockResolvedValue(mockWorkout);

      const authContext = { memberId: 'admin-123', role: 'admin' as const };
      const result = await SecureDataAccess.getByIdScoped(
        'clientassignedworkouts',
        'workout-123',
        authContext
      );

      expect(result).toEqual(mockWorkout);
    });
  });

  describe('getForClient', () => {
    it('should throw error if client tries to use it', async () => {
      const authContext = { memberId: 'client-123', role: 'client' as const };

      await expect(
        SecureDataAccess.getForClient(
          'clientassignedworkouts',
          'client-456',
          authContext
        )
      ).rejects.toThrow('Clients cannot query other clients');
    });

    it('should return client data for trainer with access', async () => {
      // Mock trainer-client assignment check
      vi.mocked(BaseCrudService.getAll).mockResolvedValueOnce({
        items: [
          {
            trainerId: 'trainer-123',
            clientId: 'client-456',
            status: 'active',
          },
        ],
        totalCount: 1,
        hasNext: false,
        currentPage: 0,
        pageSize: 1,
        nextSkip: null,
      });

      // Mock actual data query
      const mockWorkouts = [
        { _id: '1', clientId: 'client-456', trainerId: 'trainer-123' },
        { _id: '2', clientId: 'client-789', trainerId: 'trainer-123' },
      ];

      vi.mocked(BaseCrudService.getAll).mockResolvedValueOnce({
        items: mockWorkouts,
        totalCount: 2,
        hasNext: false,
        currentPage: 0,
        pageSize: 50,
        nextSkip: null,
      });

      const authContext = { memberId: 'trainer-123', role: 'trainer' as const };
      const result = await SecureDataAccess.getForClient(
        'clientassignedworkouts',
        'client-456',
        authContext
      );

      // Should only return items for client-456
      expect(result.items).toHaveLength(1);
      expect(result.items[0].clientId).toBe('client-456');
    });

    it('should throw error if trainer does not have access to client', async () => {
      // Mock trainer-client assignment check (no access)
      vi.mocked(BaseCrudService.getAll).mockResolvedValue({
        items: [],
        totalCount: 0,
        hasNext: false,
        currentPage: 0,
        pageSize: 1,
        nextSkip: null,
      });

      const authContext = { memberId: 'trainer-123', role: 'trainer' as const };

      await expect(
        SecureDataAccess.getForClient(
          'clientassignedworkouts',
          'client-456',
          authContext
        )
      ).rejects.toThrow('does not have access to client');
    });

    it('should allow admin to access any client data', async () => {
      const mockWorkouts = [
        { _id: '1', clientId: 'client-456' },
        { _id: '2', clientId: 'client-789' },
      ];

      vi.mocked(BaseCrudService.getAll).mockResolvedValue({
        items: mockWorkouts,
        totalCount: 2,
        hasNext: false,
        currentPage: 0,
        pageSize: 50,
        nextSkip: null,
      });

      const authContext = { memberId: 'admin-123', role: 'admin' as const };
      const result = await SecureDataAccess.getForClient(
        'clientassignedworkouts',
        'client-456',
        authContext
      );

      // Should only return items for client-456
      expect(result.items).toHaveLength(1);
      expect(result.items[0].clientId).toBe('client-456');
    });
  });

  describe('getForTrainer', () => {
    it('should throw error if non-admin tries to use it', async () => {
      const authContext = { memberId: 'trainer-123', role: 'trainer' as const };

      await expect(
        SecureDataAccess.getForTrainer(
          'clientassignedworkouts',
          'trainer-456',
          authContext
        )
      ).rejects.toThrow('Only admins can query trainer-scoped data');
    });

    it('should return trainer data for admin', async () => {
      const mockWorkouts = [
        { _id: '1', trainerId: 'trainer-456', clientId: 'client-1' },
        { _id: '2', trainerId: 'trainer-789', clientId: 'client-2' },
      ];

      vi.mocked(BaseCrudService.getAll).mockResolvedValue({
        items: mockWorkouts,
        totalCount: 2,
        hasNext: false,
        currentPage: 0,
        pageSize: 50,
        nextSkip: null,
      });

      const authContext = { memberId: 'admin-123', role: 'admin' as const };
      const result = await SecureDataAccess.getForTrainer(
        'clientassignedworkouts',
        'trainer-456',
        authContext
      );

      // Should only return items for trainer-456
      expect(result.items).toHaveLength(1);
      expect(result.items[0].trainerId).toBe('trainer-456');
    });
  });

  describe('isProtectedCollection', () => {
    it('should return true for protected collections', () => {
      expect(SecureDataAccess.isProtectedCollection('clientassignedworkouts')).toBe(true);
      expect(SecureDataAccess.isProtectedCollection('programassignments')).toBe(true);
    });

    it('should return false for non-protected collections', () => {
      expect(SecureDataAccess.isProtectedCollection('blogposts')).toBe(false);
      expect(SecureDataAccess.isProtectedCollection('nutritionguidance')).toBe(false);
    });
  });

  describe('getProtectedCollections', () => {
    it('should return list of protected collections', () => {
      const collections = SecureDataAccess.getProtectedCollections();
      
      expect(collections).toContain('clientassignedworkouts');
      expect(collections).toContain('programassignments');
      expect(collections.length).toBeGreaterThan(0);
    });
  });
});

describe('isValidAuthContext', () => {
  it('should return true for valid auth context', () => {
    const validContext = { memberId: 'user-123', role: 'client' };
    expect(isValidAuthContext(validContext)).toBe(true);
  });

  it('should return false for invalid auth context', () => {
    expect(isValidAuthContext(null)).toBe(false);
    expect(isValidAuthContext({})).toBe(false);
    expect(isValidAuthContext({ memberId: 'user-123' })).toBe(false);
    expect(isValidAuthContext({ role: 'client' })).toBe(false);
    expect(isValidAuthContext({ memberId: 'user-123', role: 'invalid' })).toBe(false);
  });
});

describe('getAuthContext', () => {
  it('should return null for invalid member', async () => {
    const result = await getAuthContext(null);
    expect(result).toBeNull();
  });

  it('should return auth context for valid member with role', async () => {
    const mockMember = { _id: 'member-123' };
    
    vi.mocked(BaseCrudService.getAll).mockResolvedValue({
      items: [
        {
          memberId: 'member-123',
          role: 'client',
          status: 'active',
        },
      ],
      totalCount: 1,
      hasNext: false,
      currentPage: 0,
      pageSize: 1,
      nextSkip: null,
    });

    const result = await getAuthContext(mockMember);
    
    expect(result).toEqual({
      memberId: 'member-123',
      role: 'client',
    });
  });

  it('should return null if no active role found', async () => {
    const mockMember = { _id: 'member-123' };
    
    vi.mocked(BaseCrudService.getAll).mockResolvedValue({
      items: [],
      totalCount: 0,
      hasNext: false,
      currentPage: 0,
      pageSize: 1,
      nextSkip: null,
    });

    const result = await getAuthContext(mockMember);
    expect(result).toBeNull();
  });
});
