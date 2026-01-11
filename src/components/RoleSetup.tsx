import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { setMemberRole, isAdmin } from '@/lib/role-utils';
import { MemberRole } from '@/entities';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

export default function RoleSetup() {
  const { member } = useMember();
  const [selectedRole, setSelectedRole] = useState<MemberRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showTrainerRequest, setShowTrainerRequest] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!member?._id) {
        setIsLoadingAdmin(false);
        return;
      }
      
      try {
        const isAdminUser = await isAdmin(member._id);
        setUserIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setUserIsAdmin(false);
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [member?._id]);

  if (!member?._id) {
    return null;
  }

  if (isLoadingAdmin) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center px-8">
        <div className="text-center">
          <p className="font-paragraph text-xl text-warm-grey">Loading...</p>
        </div>
      </div>
    );
  }

  const handleRoleSelection = async (role: MemberRole) => {
    // Prevent non-admin users from selecting trainer role
    if (role === 'trainer' && !userIsAdmin) {
      setShowTrainerRequest(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await setMemberRole(member._id, role);
      setSelectedRole(role);
      setSubmitSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        if (role === 'trainer') {
          window.location.href = '/trainer';
        } else if (role === 'client') {
          window.location.href = '/portal';
        }
      }, 2000);
    } catch (error) {
      setSubmitError('Failed to set role. Please try again.');
      console.error('Error setting role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-white flex items-center justify-center px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-4">
            Welcome to Motivasi!
          </h1>
          <p className="font-paragraph text-xl text-warm-grey">
            Let's set up your account. Please select your role.
          </p>
        </div>

        {submitSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-paragraph text-sm text-green-800">
                Role set successfully! Redirecting...
              </p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-paragraph text-sm text-red-800">
                {submitError}
              </p>
            </div>
          </div>
        )}

        {showTrainerRequest && (
          <div className="mb-8 p-6 bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl">
            <div className="flex gap-4">
              <Lock className="text-soft-bronze flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                  Trainer Role Requires Admin Approval
                </h3>
                <p className="font-paragraph text-base text-charcoal-black mb-4 leading-relaxed">
                  To become a trainer on Motivasi, you need to be approved by an administrator. This ensures that only qualified professionals can create training programs and manage clients.
                </p>
                <p className="font-paragraph text-base text-warm-grey mb-6 leading-relaxed">
                  If you're interested in becoming a trainer, please contact us with your qualifications and experience:
                </p>
                <a
                  href="mailto:hello@motivasi.co.uk?subject=Trainer%20Role%20Request"
                  className="inline-block bg-charcoal-black text-soft-white px-6 py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors"
                >
                  Request Trainer Role
                </a>
                <p className="font-paragraph text-sm text-warm-grey mt-4">
                  In the meantime, you can set up your account as a client to explore the platform.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Trainer Option - Disabled for non-admins */}
          <button
            onClick={() => handleRoleSelection('trainer')}
            disabled={isSubmitting || !userIsAdmin}
            className={`group relative overflow-hidden p-12 rounded-2xl transition-all duration-300 ${
              userIsAdmin
                ? 'bg-charcoal-black text-soft-white hover:shadow-xl cursor-pointer'
                : 'bg-charcoal-black/50 text-soft-white/50 cursor-not-allowed'
            }`}
          >
            <div className="relative z-10 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                userIsAdmin ? 'bg-soft-bronze' : 'bg-soft-bronze/30'
              }`}>
                {!userIsAdmin && (
                  <Lock className="w-8 h-8 text-soft-white/70" />
                )}
                {userIsAdmin && (
                  <svg
                    className="w-8 h-8 text-soft-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                )}
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">
                {userIsAdmin ? "I'm a Trainer" : "Trainer Role"}
              </h3>
              <p className={`font-paragraph mb-6 ${
                userIsAdmin ? 'text-warm-grey' : 'text-soft-white/60'
              }`}>
                {userIsAdmin
                  ? 'Create and manage training programs, track client progress, and communicate with your clients.'
                  : 'Admin approval required. Contact us to request trainer access.'}
              </p>
              <div className={`font-medium transition-colors ${
                userIsAdmin
                  ? 'text-soft-bronze group-hover:text-soft-white'
                  : 'text-soft-white/40'
              }`}>
                {userIsAdmin ? 'Get Started →' : 'Admin Only'}
              </div>
            </div>
            {userIsAdmin && (
              <div className="absolute inset-0 bg-soft-bronze transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out -z-10" />
            )}
          </button>

          {/* Client Option */}
          <button
            onClick={() => handleRoleSelection('client')}
            disabled={isSubmitting}
            className="group relative overflow-hidden bg-soft-bronze text-soft-white p-12 rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-charcoal-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-soft-bronze"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">I'm a Client</h3>
              <p className="font-paragraph text-soft-white/80 mb-6">
                Access your training programs, track progress, receive nutrition guidance, and connect with your trainer.
              </p>
              <div className="text-charcoal-black font-medium group-hover:text-soft-white transition-colors">
                Get Started →
              </div>
            </div>
            <div className="absolute inset-0 bg-charcoal-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out -z-10" />
          </button>
        </div>

        <p className="text-center text-sm text-warm-grey mt-8">
          {userIsAdmin
            ? 'You can change your role later in your account settings.'
            : 'You can update your account settings after setup.'}
        </p>
      </div>
    </div>
  );
}
