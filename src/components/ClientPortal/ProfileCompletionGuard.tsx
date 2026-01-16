import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientProfiles } from '@/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

export function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const { member } = useMember();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    async function checkProfileCompletion() {
      if (!member?.loginEmail) {
        setIsChecking(false);
        return;
      }

      try {
        // Fetch client profile by memberId
        const { items } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
        const profile = items.find(p => p.memberId === member.loginEmail);

        // Check if firstName and lastName exist
        const hasCompletedProfile = profile?.firstName && profile?.lastName;

        if (!hasCompletedProfile && location.pathname !== '/portal/profile') {
          // Redirect to profile page if names are missing
          navigate('/portal/profile', { replace: true });
          setProfileComplete(false);
        } else {
          setProfileComplete(true);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setProfileComplete(true); // Allow access on error to prevent blocking
      } finally {
        setIsChecking(false);
      }
    }

    checkProfileCompletion();
  }, [member, navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white">
        <LoadingSpinner />
      </div>
    );
  }

  // If on profile page or profile is complete, render children
  if (location.pathname === '/portal/profile' || profileComplete) {
    return <>{children}</>;
  }

  // Otherwise show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-white">
      <LoadingSpinner />
    </div>
  );
}
