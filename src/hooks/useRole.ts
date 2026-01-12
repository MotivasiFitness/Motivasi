import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { getMemberRole, isTrainer, isClient, isAdmin, setDefaultRole, getMemberRoleDebugInfo } from '@/lib/role-utils';

export type MemberRole = 'client' | 'trainer' | 'admin';

/**
 * Hook to get and manage member role
 * Loads role from backend MemberRoles collection
 * Implements retry logic for role creation
 */
export function useRole() {
  const { member } = useMember();
  const [role, setRole] = useState<MemberRole | null>(null);
  const [isTrainerRole, setIsTrainerRole] = useState(false);
  const [isClientRole, setIsClientRole] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const memberId = member?._id;

  useEffect(() => {
    if (!memberId) {
      setRole(null);
      setIsTrainerRole(false);
      setIsClientRole(false);
      setIsAdminRole(false);
      setIsLoading(false);
      return;
    }

    const loadRole = async () => {
      setIsLoading(true);
      setSetupError(null);
      
      try {
        console.log(`[useRole] Starting role load for memberId: ${memberId}`);
        
        // Get initial debug info
        const initialDebug = await getMemberRoleDebugInfo(memberId);
        setDebugInfo(initialDebug);
        
        let memberRole = await getMemberRole(memberId);
        
        // If user has no role, attempt to create one with retry logic
        if (!memberRole) {
          console.log(`[useRole] No role found for ${memberId}, attempting to create default role`);
          try {
            memberRole = await setDefaultRole(memberId, 3);
            console.log(`[useRole] Successfully created default role: ${memberRole}`);
          } catch (error) {
            console.error(`[useRole] Failed to create default role:`, error);
            setSetupError(`Failed to set up your account: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Don't redirect - show error and let user retry
            setIsLoading(false);
            return;
          }
        }
        
        console.log(`[useRole] Role loaded: ${memberRole}`);
        setRole(memberRole);
        
        // Verify role checks
        const [isTrainerCheck, isClientCheck, isAdminCheck] = await Promise.all([
          isTrainer(memberId),
          isClient(memberId),
          isAdmin(memberId),
        ]);
        
        console.log(`[useRole] Role checks - trainer: ${isTrainerCheck}, client: ${isClientCheck}, admin: ${isAdminCheck}`);
        
        setIsTrainerRole(isTrainerCheck);
        setIsClientRole(isClientCheck);
        setIsAdminRole(isAdminCheck);
        
        // Update debug info with final state
        const finalDebug = await getMemberRoleDebugInfo(memberId);
        setDebugInfo(finalDebug);
      } catch (error) {
        console.error('[useRole] Error loading member role:', error);
        setSetupError(`Error loading role: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    setupError,
    debugInfo,
  };
}
