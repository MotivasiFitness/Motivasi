import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { getMemberRole, isTrainer, isClient, isAdmin, setDefaultRole } from '@/lib/role-utils';

export type MemberRole = 'client' | 'trainer' | 'admin';

/**
 * Hook to get and manage member role
 * Loads role from backend MemberRoles collection
 */
export function useRole() {
  const { member } = useMember();
  const [role, setRole] = useState<MemberRole | null>(null);
  const [isTrainerRole, setIsTrainerRole] = useState(false);
  const [isClientRole, setIsClientRole] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const memberId = member?._id;

  useEffect(() => {
    if (!memberId) {
      setRole(null);
      setIsTrainerRole(false);
      setIsClientRole(false);
      setIsAdminRole(false);
      return;
    }

    const loadRole = async () => {
      setIsLoading(true);
      try {
        let memberRole = await getMemberRole(memberId);
        
        // If user has no role, set default role to 'client'
        if (!memberRole) {
          await setDefaultRole(memberId);
          // Small delay to ensure database write is committed before checking role
          await new Promise(resolve => setTimeout(resolve, 100));
          // Refetch the role to ensure it's in the database
          memberRole = await getMemberRole(memberId);
          // If still no role, default to 'client' (shouldn't happen, but safety fallback)
          if (!memberRole) {
            memberRole = 'client';
          }
        }
        
        setRole(memberRole);
        
        const [isTrainerCheck, isClientCheck, isAdminCheck] = await Promise.all([
          isTrainer(memberId),
          isClient(memberId),
          isAdmin(memberId),
        ]);
        
        setIsTrainerRole(isTrainerCheck);
        setIsClientRole(isClientCheck);
        setIsAdminRole(isAdminCheck);
      } catch (error) {
        console.error('Error loading member role:', error);
        setRole(null);
        setIsTrainerRole(false);
        setIsClientRole(false);
        setIsAdminRole(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, [memberId]);

  return {
    memberId,
    role,
    isTrainer: isTrainerRole,
    isClient: isClientRole,
    isAdmin: isAdminRole,
    isLoading,
  };
}
