import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientProfiles, TrainerClientAssignments } from '@/entities';
import { ArrowLeft, User, Phone, Target, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getClientDisplayName } from '@/lib/client-name-service';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ClientProfilePage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { member } = useMember();
  const [clientProfile, setClientProfile] = useState<ClientProfiles | null>(null);
  const [clientDisplayName, setClientDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const fetchClientProfile = async () => {
      if (!member?._id || !clientId) {
        setError('Missing required information');
        setLoading(false);
        return;
      }

      try {
        // First, verify that this trainer is assigned to this client
        const { items: assignments } = await BaseCrudService.getAll<TrainerClientAssignments>(
          'trainerclientassignments'
        );
        
        const isAssigned = assignments.some(
          a => a.trainerId === member._id && a.clientId === clientId && a.status === 'Active'
        );

        if (!isAssigned) {
          setError('You are not authorized to view this client profile');
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setIsAuthorized(true);

        // Fetch client profile
        const { items: profiles } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
        const profile = profiles.find(p => p.memberId === clientId);

        if (profile) {
          setClientProfile(profile);
        }

        // Get display name
        const displayName = await getClientDisplayName(clientId);
        setClientDisplayName(displayName);

      } catch (err) {
        console.error('Error fetching client profile:', err);
        setError('Failed to load client profile');
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [member?._id, clientId]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (): number => {
    if (!clientProfile) return 0;
    
    const fields = [
      clientProfile.firstName,
      clientProfile.lastName,
      clientProfile.phoneNumber,
      clientProfile.emergencyContact,
      clientProfile.fitnessGoals,
      clientProfile.medicalNotes
    ];

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !isAuthorized) {
    return (
      <div className="p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
              Access Denied
            </h2>
            <p className="text-warm-grey mb-6">
              {error || 'You do not have permission to view this client profile'}
            </p>
            <button
              onClick={() => navigate('/trainer/clients')}
              className="bg-charcoal-black text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze transition-colors"
            >
              Back to Clients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/trainer/clients')}
            className="flex items-center gap-2 text-warm-grey hover:text-charcoal-black transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-paragraph">Back to Clients</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
                Client Profile
              </h1>
              <p className="text-lg text-warm-grey">
                Read-only view of client information
              </p>
            </div>
            
            {/* Profile Completion Indicator */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-2">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#E8DED3"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#B08D57"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - profileCompletion / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute font-heading text-lg font-bold text-charcoal-black">
                  {profileCompletion}%
                </span>
              </div>
              <p className="text-xs text-warm-grey">Profile Complete</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info className="text-blue-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-paragraph text-sm text-blue-900">
              <strong>Read-Only View:</strong> This information was provided by the client and cannot be edited by trainers. 
              Future updates will include trainer-only notes and flags.
            </p>
          </div>
        </div>

        {/* Client Information Card */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-warm-sand-beige/30 px-8 py-6 border-b border-warm-sand-beige">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-soft-bronze rounded-full flex items-center justify-center">
                <User className="text-soft-white" size={32} />
              </div>
              <div>
                <h2 className="font-heading text-3xl font-bold text-charcoal-black">
                  {clientDisplayName}
                </h2>
                <p className="text-sm text-warm-grey mt-1">
                  Member ID: {clientId?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="p-8 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4 flex items-center gap-2">
                <User size={20} className="text-soft-bronze" />
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-warm-grey">
                    First Name
                  </label>
                  <div className="px-4 py-3 bg-warm-sand-beige/20 rounded-lg border border-warm-sand-beige">
                    <p className="font-paragraph text-charcoal-black">
                      {clientProfile?.firstName || (
                        <span className="text-warm-grey italic">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-warm-grey">
                    Last Name
                  </label>
                  <div className="px-4 py-3 bg-warm-sand-beige/20 rounded-lg border border-warm-sand-beige">
                    <p className="font-paragraph text-charcoal-black">
                      {clientProfile?.lastName || (
                        <span className="text-warm-grey italic">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4 flex items-center gap-2">
                <Phone size={20} className="text-soft-bronze" />
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-warm-grey">
                    Phone Number
                  </label>
                  <div className="px-4 py-3 bg-warm-sand-beige/20 rounded-lg border border-warm-sand-beige">
                    <p className="font-paragraph text-charcoal-black">
                      {clientProfile?.phoneNumber || (
                        <span className="text-warm-grey italic">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-warm-grey">
                    Emergency Contact
                  </label>
                  <div className="px-4 py-3 bg-warm-sand-beige/20 rounded-lg border border-warm-sand-beige">
                    <p className="font-paragraph text-charcoal-black">
                      {clientProfile?.emergencyContact || (
                        <span className="text-warm-grey italic">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fitness Goals */}
            <div>
              <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4 flex items-center gap-2">
                <Target size={20} className="text-soft-bronze" />
                Fitness Goals
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-warm-grey">
                  Client-Provided Goals
                </label>
                <div className="px-4 py-3 bg-warm-sand-beige/20 rounded-lg border border-warm-sand-beige min-h-[100px]">
                  <p className="font-paragraph text-charcoal-black whitespace-pre-wrap">
                    {clientProfile?.fitnessGoals || (
                      <span className="text-warm-grey italic">No fitness goals provided yet</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Notes */}
            <div>
              <h3 className="font-heading text-xl font-bold text-charcoal-black mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-muted-rose" />
                Medical Notes
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-warm-grey">
                  Client-Provided Medical Information
                </label>
                <div className="px-4 py-3 bg-muted-rose/10 rounded-lg border border-muted-rose/30 min-h-[100px]">
                  <p className="font-paragraph text-charcoal-black whitespace-pre-wrap">
                    {clientProfile?.medicalNotes || (
                      <span className="text-warm-grey italic">No medical notes provided</span>
                    )}
                  </p>
                </div>
                <p className="text-xs text-warm-grey italic flex items-start gap-2 mt-2">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  This information is client-provided and should be considered when designing programs. 
                  Always consult with healthcare professionals for medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Future Features Placeholder */}
        <div className="mt-8 bg-warm-sand-beige/30 border border-warm-sand-beige rounded-xl p-6">
          <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
            Coming Soon
          </h3>
          <ul className="space-y-2 text-sm text-warm-grey">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-soft-bronze" />
              <span>Trainer-only notes section for private observations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-soft-bronze" />
              <span>Risk flags and alerts for client safety</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-soft-bronze" />
              <span>Progress tracking integration</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-soft-bronze" />
              <span>Program history and adherence metrics</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/trainer/clients')}
            className="flex-1 bg-warm-sand-beige text-charcoal-black px-6 py-3 rounded-lg hover:bg-warm-sand-beige/80 transition-colors font-medium"
          >
            Back to Clients
          </button>
          <button
            onClick={() => navigate(`/trainer/workout-assignment?clientId=${clientId}`)}
            className="flex-1 bg-charcoal-black text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze transition-colors font-medium"
          >
            Assign Workouts
          </button>
        </div>
      </div>
    </div>
  );
}
