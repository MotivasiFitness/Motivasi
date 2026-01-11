import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { getMemberRole, isTrainer, isClient, isAdmin } from '@/lib/role-utils';
import { MemberRole } from '@/entities';

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
        const memberRole = await getMemberRole(memberId);
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
