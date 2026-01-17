/**
 * React Hook for Program Assignments with Access Control
 * 
 * Provides easy access to program assignments with built-in access control
 * based on the current user's role and memberId.
 */

import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { useRole } from '@/hooks/useRole';
import { 
  getAuthorizedProgramAssignments, 
  getClientProgramAssignments,
  type ProgramAssignmentFilters 
} from '@/lib/program-assignment-access-control';
import type { ProgramAssignments } from '@/entities';

interface UseProgramAssignmentsResult {
  assignments: ProgramAssignments[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch program assignments with automatic access control
 * based on the current authenticated user's role
 */
export function useProgramAssignments(): UseProgramAssignmentsResult {
  const { member } = useMember();
  const { role } = useRole();
  const [assignments, setAssignments] = useState<ProgramAssignments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    if (!member?._id || !role) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const filters: ProgramAssignmentFilters = {
        memberId: member._id,
        role: role as 'client' | 'trainer'
      };

      const data = await getAuthorizedProgramAssignments(filters);
      setAssignments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch program assignments');
      console.error('Error fetching program assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [member?._id, role]);

  return {
    assignments,
    isLoading,
    error,
    refetch: fetchAssignments
  };
}

/**
 * Hook to fetch program assignments for a specific client
 * with access control validation
 */
export function useClientProgramAssignments(clientId: string): UseProgramAssignmentsResult {
  const { member } = useMember();
  const { role } = useRole();
  const [assignments, setAssignments] = useState<ProgramAssignments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    if (!member?._id || !role || !clientId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getClientProgramAssignments(
        clientId,
        member._id,
        role as 'client' | 'trainer'
      );
      setAssignments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client program assignments');
      console.error('Error fetching client program assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [clientId, member?._id, role]);

  return {
    assignments,
    isLoading,
    error,
    refetch: fetchAssignments
  };
}
