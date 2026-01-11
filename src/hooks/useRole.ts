import { useMember } from '@/integrations';
import { getMemberRole, isTrainer, isClient, isAdmin } from '@/lib/role-utils';
import { MemberRole } from '@/entities';

/**
 * Hook to get and manage member role
 */
export function useRole() {
  const { member } = useMember();

  const memberId = member?._id;
  const role = memberId ? getMemberRole(memberId) : null;

  return {
    memberId,
    role,
    isTrainer: memberId ? isTrainer(memberId) : false,
    isClient: memberId ? isClient(memberId) : false,
    isAdmin: memberId ? isAdmin(memberId) : false,
  };
}
