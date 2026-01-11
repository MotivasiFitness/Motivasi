import { useState } from 'react';
import { useMember } from '@/integrations';
import { setMemberRole } from '@/lib/role-utils';
import { MemberRole } from '@/entities';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function RoleSetup() {
  const { member } = useMember();
  const [selectedRole, setSelectedRole] = useState<MemberRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!member?._id) {
    return null;
  }

  const handleRoleSelection = async (role: MemberRole) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      setMemberRole(member._id, role);
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
            Let's set up your account. Are you a trainer or a client?
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Trainer Option */}
          <button
            onClick={() => handleRoleSelection('trainer')}
            disabled={isSubmitting}
            className="group relative overflow-hidden bg-charcoal-black text-soft-white p-12 rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-soft-bronze rounded-full flex items-center justify-center mx-auto mb-6">
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
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">I'm a Trainer</h3>
              <p className="font-paragraph text-warm-grey mb-6">
                Create and manage training programs, track client progress, and communicate with your clients.
              </p>
              <div className="text-soft-bronze font-medium group-hover:text-soft-white transition-colors">
                Get Started →
              </div>
            </div>
            <div className="absolute inset-0 bg-soft-bronze transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out -z-10" />
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
          You can change your role later in your account settings.
        </p>
      </div>
    </div>
  );
}
