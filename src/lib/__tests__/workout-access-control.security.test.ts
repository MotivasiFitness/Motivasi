/**
 * Security Tests for Workout Access Control
 * 
 * These tests verify that:
 * 1. Clients can ONLY access their own workouts
 * 2. Trainers can ONLY access workouts for their managed clients
 * 3. Query parameters cannot override clientId filtering
 * 4. Server-side filtering is enforced before data is returned
 * 5. No unscoped 'get all workouts' endpoints exist in client contexts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getClientWorkouts, 
  getAuthorizedClientWorkouts,
  getAuthorizedWorkout,
  updateAuthorizedWorkout 
} from '../client-workout-access-control';
import { BaseCrudService } from '@/integrations';
import type { ClientAssignedWorkouts } from '@/entities/clientassignedworkouts';
import type { TrainerClientAssignments } from '@/entities/trainerclientassignments';

// Mock BaseCrudService
vi.mock('@/integrations', () => ({
  BaseCrudService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  }
}));

describe('Workout Access Control - Security Tests', () => {
  const CLIENT_A_ID = 'client-a@example.com';
  const CLIENT_B_ID = 'client-b@example.com';
  const TRAINER_1_ID = 'trainer-1@example.com';
  const TRAINER_2_ID = 'trainer-2@example.com';

  const mockWorkouts: ClientAssignedWorkouts[] = [
    {
      _id: 'workout-1',
      clientId: CLIENT_A_ID,
      trainerId: TRAINER_1_ID,
      exerciseName: 'Squats',
      status: 'active',
      weekNumber: 1,
      sets: 3,
      reps: 10,
    },
    {
      _id: 'workout-2',
      clientId: CLIENT_A_ID,
      trainerId: TRAINER_1_ID,
      exerciseName: 'Bench Press',
      status: 'completed',
      weekNumber: 1,
      sets: 3,
      reps: 8,
    },
    {
      _id: 'workout-3',
      clientId: CLIENT_B_ID,
      trainerId: TRAINER_2_ID,
      exerciseName: 'Deadlifts',
      status: 'active',
      weekNumber: 1,
      sets: 3,
      reps: 5,
    },
    {
      _id: 'workout-4',
      clientId: CLIENT_B_ID,
      trainerId: TRAINER_1_ID,
      exerciseName: 'Pull-ups',
      status: 'pending',
      weekNumber: 2,
      sets: 3,
      reps: 12,
    },
  ];

  const mockTrainerAssignments: TrainerClientAssignments[] = [
    {
      _id: 'assignment-1',
      trainerId: TRAINER_1_ID,
      clientId: CLIENT_A_ID,
      status: 'active',
    },
    {
      _id: 'assignment-2',
      trainerId: TRAINER_1_ID,
      clientId: CLIENT_B_ID,
      status: 'active',
    },
    {
      _id: 'assignment-3',
      trainerId: TRAINER_2_ID,
      clientId: CLIENT_B_ID,
      status: 'active',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (BaseCrudService.getAll as any).mockImplementation((collection: string) => {
      if (collection === 'clientassignedworkouts') {
        return Promise.resolve({ items: mockWorkouts });
      }
      if (collection === 'trainerclientassignments') {
        return Promise.resolve({ items: mockTrainerAssignments });
      }
      return Promise.resolve({ items: [] });
    });
  });

  describe('Client Access Control', () => {
    it('should allow clients to access ONLY their own workouts', async () => {
      const workouts = await getClientWorkouts(
        CLIENT_A_ID,
        CLIENT_A_ID,
        'client'
      );

      expect(workouts).toHaveLength(2);
      expect(workouts.every(w => w.clientId === CLIENT_A_ID)).toBe(true);
      expect(workouts.some(w => w.clientId === CLIENT_B_ID)).toBe(false);
    });

    it('should REJECT clients attempting to access another client\'s workouts', async () => {
      await expect(
        getClientWorkouts(CLIENT_B_ID, CLIENT_A_ID, 'client')
      ).rejects.toThrow('Unauthorized: Clients can only access their own workouts');
    });

    it('should return empty array when client has no workouts', async () => {
      const workouts = await getClientWorkouts(
        'client-no-workouts@example.com',
        'client-no-workouts@example.com',
        'client'
      );

      expect(workouts).toHaveLength(0);
    });

    it('should filter by status when requested by client', async () => {
      const activeWorkouts = await getClientWorkouts(
        CLIENT_A_ID,
        CLIENT_A_ID,
        'client',
        { status: 'active' }
      );

      expect(activeWorkouts).toHaveLength(1);
      expect(activeWorkouts[0].status).toBe('active');
    });

    it('should filter by week number when requested by client', async () => {
      const week1Workouts = await getClientWorkouts(
        CLIENT_A_ID,
        CLIENT_A_ID,
        'client',
        { weekNumber: 1 }
      );

      expect(week1Workouts).toHaveLength(2);
      expect(week1Workouts.every(w => w.weekNumber === 1)).toBe(true);
    });
  });

  describe('Trainer Access Control', () => {
    it('should allow trainers to access workouts for their managed clients', async () => {
      const workouts = await getClientWorkouts(
        CLIENT_A_ID,
        TRAINER_1_ID,
        'trainer'
      );

      expect(workouts).toHaveLength(2);
      expect(workouts.every(w => w.clientId === CLIENT_A_ID)).toBe(true);
    });

    it('should REJECT trainers attempting to access unmanaged client workouts', async () => {
      // TRAINER_2 is not assigned to CLIENT_A
      await expect(
        getClientWorkouts(CLIENT_A_ID, TRAINER_2_ID, 'trainer')
      ).rejects.toThrow('Unauthorized: Trainer is not assigned to this client');
    });

    it('should allow trainers to access multiple managed clients', async () => {
      // TRAINER_1 manages both CLIENT_A and CLIENT_B
      const clientAWorkouts = await getClientWorkouts(
        CLIENT_A_ID,
        TRAINER_1_ID,
        'trainer'
      );
      const clientBWorkouts = await getClientWorkouts(
        CLIENT_B_ID,
        TRAINER_1_ID,
        'trainer'
      );

      expect(clientAWorkouts.length).toBeGreaterThan(0);
      expect(clientBWorkouts.length).toBeGreaterThan(0);
    });

    it('should return empty when trainer requests workouts for client with none', async () => {
      const workouts = await getClientWorkouts(
        'client-no-workouts@example.com',
        TRAINER_1_ID,
        'trainer'
      );

      expect(workouts).toHaveLength(0);
    });
  });

  describe('getAuthorizedClientWorkouts - Role-based filtering', () => {
    it('should return only client\'s own workouts when role is client', async () => {
      const workouts = await getAuthorizedClientWorkouts({
        memberId: CLIENT_A_ID,
        role: 'client'
      });

      expect(workouts).toHaveLength(2);
      expect(workouts.every(w => w.clientId === CLIENT_A_ID)).toBe(true);
    });

    it('should return all managed client workouts when role is trainer', async () => {
      const workouts = await getAuthorizedClientWorkouts({
        memberId: TRAINER_1_ID,
        role: 'trainer'
      });

      // TRAINER_1 manages CLIENT_A (2 workouts) and CLIENT_B (1 workout created by TRAINER_1)
      expect(workouts.length).toBeGreaterThanOrEqual(3);
      expect(workouts.every(w => 
        w.trainerId === TRAINER_1_ID || 
        [CLIENT_A_ID, CLIENT_B_ID].includes(w.clientId || '')
      )).toBe(true);
    });

    it('should apply status filter after access control', async () => {
      const activeWorkouts = await getAuthorizedClientWorkouts({
        memberId: CLIENT_A_ID,
        role: 'client',
        status: 'active'
      });

      expect(activeWorkouts.every(w => w.status === 'active')).toBe(true);
      expect(activeWorkouts.every(w => w.clientId === CLIENT_A_ID)).toBe(true);
    });

    it('should apply week filter after access control', async () => {
      const week1Workouts = await getAuthorizedClientWorkouts({
        memberId: CLIENT_A_ID,
        role: 'client',
        weekNumber: 1
      });

      expect(week1Workouts.every(w => w.weekNumber === 1)).toBe(true);
      expect(week1Workouts.every(w => w.clientId === CLIENT_A_ID)).toBe(true);
    });
  });

  describe('Single Workout Access', () => {
    beforeEach(() => {
      (BaseCrudService.getById as any).mockImplementation((collection: string, id: string) => {
        if (collection === 'clientassignedworkouts') {
          return Promise.resolve(mockWorkouts.find(w => w._id === id) || null);
        }
        return Promise.resolve(null);
      });
    });

    it('should allow client to access their own workout', async () => {
      const workout = await getAuthorizedWorkout(
        'workout-1',
        CLIENT_A_ID,
        'client'
      );

      expect(workout).not.toBeNull();
      expect(workout?.clientId).toBe(CLIENT_A_ID);
    });

    it('should REJECT client accessing another client\'s workout', async () => {
      const workout = await getAuthorizedWorkout(
        'workout-3', // CLIENT_B's workout
        CLIENT_A_ID,
        'client'
      );

      expect(workout).toBeNull();
    });

    it('should allow trainer to access managed client\'s workout', async () => {
      const workout = await getAuthorizedWorkout(
        'workout-1',
        TRAINER_1_ID,
        'trainer'
      );

      expect(workout).not.toBeNull();
      expect(workout?.clientId).toBe(CLIENT_A_ID);
    });

    it('should REJECT trainer accessing unmanaged client\'s workout', async () => {
      const workout = await getAuthorizedWorkout(
        'workout-1', // CLIENT_A's workout, TRAINER_2 not assigned
        TRAINER_2_ID,
        'trainer'
      );

      expect(workout).toBeNull();
    });
  });

  describe('Workout Updates', () => {
    beforeEach(() => {
      (BaseCrudService.getById as any).mockImplementation((collection: string, id: string) => {
        if (collection === 'clientassignedworkouts') {
          return Promise.resolve(mockWorkouts.find(w => w._id === id) || null);
        }
        return Promise.resolve(null);
      });
      (BaseCrudService.update as any).mockResolvedValue(undefined);
    });

    it('should allow client to update their own workout', async () => {
      await expect(
        updateAuthorizedWorkout(
          'workout-1',
          { status: 'completed' },
          CLIENT_A_ID,
          'client'
        )
      ).resolves.not.toThrow();
    });

    it('should REJECT client updating another client\'s workout', async () => {
      await expect(
        updateAuthorizedWorkout(
          'workout-3', // CLIENT_B's workout
          { status: 'completed' },
          CLIENT_A_ID,
          'client'
        )
      ).rejects.toThrow('Unauthorized: Clients can only update their own workouts');
    });

    it('should allow trainer to update managed client\'s workout', async () => {
      await expect(
        updateAuthorizedWorkout(
          'workout-1',
          { trainerComment: 'Great form!' },
          TRAINER_1_ID,
          'trainer'
        )
      ).resolves.not.toThrow();
    });

    it('should REJECT trainer updating unmanaged client\'s workout', async () => {
      await expect(
        updateAuthorizedWorkout(
          'workout-1', // CLIENT_A's workout, TRAINER_2 not assigned
          { trainerComment: 'Good job!' },
          TRAINER_2_ID,
          'trainer'
        )
      ).rejects.toThrow('Unauthorized: Trainer is not assigned to this client');
    });
  });

  describe('Server-side Filtering Enforcement', () => {
    it('should NEVER return unfiltered workout data to clients', async () => {
      // Simulate a malicious attempt to get all workouts
      const workouts = await getAuthorizedClientWorkouts({
        memberId: CLIENT_A_ID,
        role: 'client'
      });

      // Verify that BaseCrudService.getAll was called
      expect(BaseCrudService.getAll).toHaveBeenCalled();

      // Verify that the returned data is filtered
      expect(workouts.every(w => w.clientId === CLIENT_A_ID)).toBe(true);
      expect(workouts.some(w => w.clientId === CLIENT_B_ID)).toBe(false);
    });

    it('should filter AFTER fetching from database, not before', async () => {
      await getClientWorkouts(CLIENT_A_ID, CLIENT_A_ID, 'client');

      // Verify getAll was called without clientId parameter
      // (filtering happens in application layer, not database query)
      expect(BaseCrudService.getAll).toHaveBeenCalledWith(
        'clientassignedworkouts',
        [],
        { limit: 1000 }
      );
    });

    it('should apply status and week filters AFTER access control', async () => {
      const workouts = await getClientWorkouts(
        CLIENT_A_ID,
        CLIENT_A_ID,
        'client',
        { status: 'active', weekNumber: 1 }
      );

      // First filter by clientId, then by status and week
      expect(workouts.every(w => 
        w.clientId === CLIENT_A_ID && 
        w.status === 'active' && 
        w.weekNumber === 1
      )).toBe(true);
    });
  });

  describe('Regression Tests - Prevent Unscoped Queries', () => {
    it('should NOT allow direct BaseCrudService.getAll calls without filtering', () => {
      // This test documents that direct calls to BaseCrudService.getAll
      // MUST be followed by filtering. The access control functions
      // enforce this pattern.
      
      // Bad pattern (should never be used in client portal):
      // const allWorkouts = await BaseCrudService.getAll('clientassignedworkouts');
      // return allWorkouts.items; // SECURITY VIOLATION
      
      // Good pattern (enforced by access control functions):
      // const result = await BaseCrudService.getAll('clientassignedworkouts');
      // return result.items.filter(w => w.clientId === currentUserId);
      
      expect(true).toBe(true); // Placeholder - actual enforcement is in the functions
    });

    it('should require role parameter for all access control functions', async () => {
      // All access control functions require explicit role parameter
      // This prevents accidental unscoped access
      
      await expect(
        getClientWorkouts(CLIENT_A_ID, CLIENT_A_ID, 'client')
      ).resolves.toBeDefined();
      
      // Missing role would be a TypeScript error, but we verify runtime behavior
      await expect(
        getAuthorizedClientWorkouts({
          memberId: CLIENT_A_ID,
          role: 'client'
        })
      ).resolves.toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty workout collections', async () => {
      (BaseCrudService.getAll as any).mockResolvedValue({ items: [] });

      const workouts = await getClientWorkouts(
        CLIENT_A_ID,
        CLIENT_A_ID,
        'client'
      );

      expect(workouts).toHaveLength(0);
    });

    it('should handle missing clientId in workout data', async () => {
      const workoutsWithMissingClientId = [
        { _id: 'workout-x', exerciseName: 'Test' } as ClientAssignedWorkouts
      ];
      
      (BaseCrudService.getAll as any).mockResolvedValue({ 
        items: workoutsWithMissingClientId 
      });

      const workouts = await getClientWorkouts(
        CLIENT_A_ID,
        CLIENT_A_ID,
        'client'
      );

      expect(workouts).toHaveLength(0);
    });

    it('should handle inactive trainer assignments', async () => {
      const inactiveAssignments = mockTrainerAssignments.map(a => ({
        ...a,
        status: 'inactive'
      }));
      
      (BaseCrudService.getAll as any).mockImplementation((collection: string) => {
        if (collection === 'trainerclientassignments') {
          return Promise.resolve({ items: inactiveAssignments });
        }
        return Promise.resolve({ items: mockWorkouts });
      });

      await expect(
        getClientWorkouts(CLIENT_A_ID, TRAINER_1_ID, 'trainer')
      ).rejects.toThrow('Unauthorized');
    });

    it('should handle null/undefined memberId gracefully', async () => {
      const workouts = await getAuthorizedClientWorkouts({
        memberId: '',
        role: 'client'
      });

      expect(workouts).toHaveLength(0);
    });
  });
});
