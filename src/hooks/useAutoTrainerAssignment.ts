/**
 * Hook for automatic trainer assignment on user registration
 * Assigns new users to the default trainer automatically
 * Non-blocking: errors are logged but don't prevent signup
 */

import { useEffect } from 'react';
import { useMember } from '@/integrations';
import { assignNewUserToTrainer } from '@/lib/trainer-assignment';

/**
 * Hook that automatically assigns a newly authenticated user to the default trainer
 * Should be called in a component that wraps the authentication flow
 * Non-blocking: assignment failures won't prevent user signup
 */
export function useAutoTrainerAssignment() {
  const { member, isAuthenticated } = useMember();

  useEffect(() => {
    // Only run if user is authenticated and has a member ID
    if (isAuthenticated && member?._id) {
      // Run assignment in background (non-blocking)
      assignNewUserToTrainer(member._id).catch((error) => {
        // Error is already logged in assignNewUserToTrainer
        // This catch is just for safety
        console.error('Unexpected error in useAutoTrainerAssignment:', error);
      });
    }
  }, [isAuthenticated, member?._id]);
}

export default useAutoTrainerAssignment;
