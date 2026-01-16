import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientProfiles, TrainerClientAssignments } from '@/entities';
import { ArrowLeft, User, Phone, Target, AlertCircle, CheckCircle, Info, Edit2, Save, X, Flag, ClipboardCheck, Calendar, Star } from 'lucide-react';
import { getClientDisplayName } from '@/lib/client-name-service';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';

interface TrainerClientNotes {
  _id: string;
  trainerId?: string;
  clientId?: string;
  notes?: string;
  flags?: string;
  updatedAt?: Date | string;
}

interface WeeklyCheckIn {
  _id: string;
  clientId?: string;
  trainerId?: string;
  programCycleId?: string;
  weekNumber?: number;
  weekStartDate?: Date | string;
  difficultyRating?: string;
  energyRating?: string;
  sorenessRating?: string;
  sorenessNotes?: string;
  clientNotes?: string;
  createdAt?: Date | string;
}

const AVAILABLE_FLAGS = [
  'Knee sensitivity',
  'Back sensitivity',
  'Home workouts only',
  'Low confidence / needs encouragement',
  'High adherence'
];

export default function ClientProfilePage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { member } = useMember();
  const [clientProfile, setClientProfile] = useState<ClientProfiles | null>(null);
  const [clientDisplayName, setClientDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Trainer notes state
  const [trainerNotes, setTrainerNotes] = useState<TrainerClientNotes | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Weekly check-ins state
  const [weeklyCheckIns, setWeeklyCheckIns] = useState<WeeklyCheckIn[]>([]);

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

        // Fetch trainer notes
        const { items: notes } = await BaseCrudService.getAll<TrainerClientNotes>('trainerclientnotes');
        const existingNotes = notes.find(n => n.trainerId === member._id && n.clientId === clientId);
        
        if (existingNotes) {
          setTrainerNotes(existingNotes);
          setNotesText(existingNotes.notes || '');
          setSelectedFlags(existingNotes.flags ? JSON.parse(existingNotes.flags) : []);
        }

        // Fetch weekly check-ins for this client
        const { items: checkIns } = await BaseCrudService.getAll<WeeklyCheckIn>('weeklycheckins');
        const clientCheckIns = checkIns
          .filter(c => c.clientId === clientId && c.trainerId === member._id)
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA; // Newest first
          });
        setWeeklyCheckIns(clientCheckIns);

      } catch (err) {
        console.error('Error fetching client profile:', err);
        setError('Failed to load client profile');
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [member?._id, clientId]);

  const handleSaveNotes = async () => {
    if (!member?._id || !clientId) return;

    setSavingNotes(true);
    try {
      const flagsJson = JSON.stringify(selectedFlags);
      const now = new Date().toISOString();

      if (trainerNotes?._id) {
        // Update existing notes
        await BaseCrudService.update<TrainerClientNotes>('trainerclientnotes', {
          _id: trainerNotes._id,
          notes: notesText,
          flags: flagsJson,
          updatedAt: now
        });
        
        setTrainerNotes({
          ...trainerNotes,
          notes: notesText,
          flags: flagsJson,
          updatedAt: now
        });
      } else {
        // Create new notes
        const newNotes: TrainerClientNotes = {
          _id: crypto.randomUUID(),
          trainerId: member._id,
          clientId: clientId,
          notes: notesText,
          flags: flagsJson,
          updatedAt: now
        };
        
        await BaseCrudService.create('trainerclientnotes', newNotes);
        setTrainerNotes(newNotes);
      }

      setIsEditingNotes(false);
    } catch (err) {
      console.error('Error saving trainer notes:', err);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancelEdit = () => {
    setNotesText(trainerNotes?.notes || '');
    setSelectedFlags(trainerNotes?.flags ? JSON.parse(trainerNotes.flags) : []);
    setIsEditingNotes(false);
  };

  const toggleFlag = (flag: string) => {
    setSelectedFlags(prev => 
      prev.includes(flag) 
        ? prev.filter(f => f !== flag)
        : [...prev, flag]
    );
  };

  const formatLastUpdated = (date?: Date | string) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCheckInDate = (date?: Date | string) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

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
    <>
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
              <strong>Client Information:</strong> The information below was provided by the client and is read-only. 
              Use the Trainer Notes section to add your private observations and flags.
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
                🩺 Medical Notes (Client-Provided)
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-warm-grey">
                  Read-Only Information
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
                  This information is entered by your client and is read-only. Please review carefully for programming considerations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trainer Notes Section - Private to Trainers */}
        <div className="mt-8 bg-soft-bronze/10 border-2 border-soft-bronze rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-soft-bronze/20 px-8 py-4 border-b border-soft-bronze flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-soft-bronze rounded-full flex items-center justify-center">
                <Flag className="text-soft-white" size={20} />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal-black">
                  Trainer Notes & Flags
                </h3>
                <p className="text-xs text-warm-grey">
                  Private to trainers only • Not visible to clients
                </p>
              </div>
            </div>
            
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="flex items-center gap-2 bg-soft-bronze text-soft-white px-4 py-2 rounded-lg hover:bg-soft-bronze/80 transition-colors"
              >
                <Edit2 size={16} />
                <span className="font-medium">Edit</span>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Quick Flags */}
            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-3">
                Quick Flags
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_FLAGS.map(flag => {
                  const isSelected = selectedFlags.includes(flag);
                  return (
                    <button
                      key={flag}
                      onClick={() => isEditingNotes && toggleFlag(flag)}
                      disabled={!isEditingNotes}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-soft-bronze text-soft-white'
                          : 'bg-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige/70'
                      } ${!isEditingNotes ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {flag}
                    </button>
                  );
                })}
              </div>
              {selectedFlags.length === 0 && !isEditingNotes && (
                <p className="text-sm text-warm-grey italic mt-2">No flags set</p>
              )}
            </div>

            {/* Notes Text Area */}
            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-2">
                Private Notes
              </label>
              {isEditingNotes ? (
                <Textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Add your private observations, training considerations, or any other notes about this client..."
                  className="min-h-[150px] font-paragraph text-charcoal-black bg-soft-white border-warm-sand-beige focus:border-soft-bronze"
                />
              ) : (
                <div className="px-4 py-3 bg-soft-white rounded-lg border border-warm-sand-beige min-h-[150px]">
                  <p className="font-paragraph text-charcoal-black whitespace-pre-wrap">
                    {notesText || (
                      <span className="text-warm-grey italic">No notes added yet. Click Edit to add your observations.</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-between text-xs text-warm-grey pt-2 border-t border-warm-sand-beige">
              <span>Last updated: {formatLastUpdated(trainerNotes?.updatedAt)}</span>
              {isEditingNotes && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={savingNotes}
                    className="flex items-center gap-1 px-3 py-1.5 bg-warm-grey/20 text-charcoal-black rounded hover:bg-warm-grey/30 transition-colors disabled:opacity-50"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="flex items-center gap-1 px-3 py-1.5 bg-soft-bronze text-soft-white rounded hover:bg-soft-bronze/80 transition-colors disabled:opacity-50"
                  >
                    {savingNotes ? (
                      <>
                        <LoadingSpinner />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Notes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Check-Ins Section - Read-only for Trainers */}
        <div className="mt-8 bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-warm-sand-beige/30 px-8 py-4 border-b border-warm-sand-beige">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-soft-bronze rounded-full flex items-center justify-center">
                <ClipboardCheck className="text-soft-white" size={20} />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal-black">
                  Weekly Check-Ins
                </h3>
                <p className="text-xs text-warm-grey">
                  Client feedback after completing each week • Read-only
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {weeklyCheckIns.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardCheck className="w-12 h-12 text-warm-grey/40 mx-auto mb-3" />
                <p className="text-warm-grey italic">
                  No weekly check-ins submitted yet
                </p>
                <p className="text-sm text-warm-grey mt-2">
                  Check-ins will appear here after the client completes a week and submits their feedback
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Most Recent Check-In Summary Card */}
                {weeklyCheckIns[0] && (
                  <div className="bg-gradient-to-r from-soft-bronze/10 to-soft-bronze/5 border-2 border-soft-bronze rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-soft-bronze" />
                      <h4 className="font-heading text-lg font-bold text-charcoal-black">
                        Most Recent Check-In Summary
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-soft-white rounded-lg p-4">
                        <p className="text-xs text-warm-grey mb-2 font-medium">Overall Difficulty</p>
                        <p className={`text-xl font-bold ${
                          weeklyCheckIns[0].difficultyRating === 'Easy' 
                            ? 'text-green-600'
                            : weeklyCheckIns[0].difficultyRating === 'Moderate'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {weeklyCheckIns[0].difficultyRating}
                        </p>
                      </div>
                      <div className="bg-soft-white rounded-lg p-4">
                        <p className="text-xs text-warm-grey mb-2 font-medium">Energy Levels</p>
                        <p className={`text-xl font-bold ${
                          weeklyCheckIns[0].energyRating === 'High' 
                            ? 'text-green-600'
                            : weeklyCheckIns[0].energyRating === 'OK'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {weeklyCheckIns[0].energyRating}
                        </p>
                      </div>
                      <div className="bg-soft-white rounded-lg p-4">
                        <p className="text-xs text-warm-grey mb-2 font-medium">Soreness</p>
                        <p className={`text-xl font-bold ${
                          weeklyCheckIns[0].sorenessRating === 'None' 
                            ? 'text-green-600'
                            : weeklyCheckIns[0].sorenessRating === 'Mild'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {weeklyCheckIns[0].sorenessRating}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-xs text-warm-grey">
                      Week {weeklyCheckIns[0].weekNumber} • Submitted {formatCheckInDate(weeklyCheckIns[0].createdAt)}
                    </div>
                  </div>
                )}

                {/* All Check-Ins */}
                <div>
                  <h4 className="font-heading text-base font-bold text-charcoal-black mb-4">
                    All Check-Ins History
                  </h4>
                  <div className="space-y-4">
                {weeklyCheckIns.map((checkIn) => (
                  <div
                    key={checkIn._id}
                    className="bg-warm-sand-beige/20 border border-warm-sand-beige rounded-xl p-6"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-warm-sand-beige">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-soft-bronze" />
                        <div>
                          <h4 className="font-heading text-lg font-bold text-charcoal-black">
                            Week {checkIn.weekNumber}
                          </h4>
                          <p className="text-xs text-warm-grey">
                            Week of {formatCheckInDate(checkIn.weekStartDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-warm-grey">Submitted</p>
                        <p className="text-sm font-medium text-charcoal-black">
                          {formatCheckInDate(checkIn.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Ratings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-soft-white rounded-lg p-4">
                        <p className="text-xs text-warm-grey mb-2 font-medium">Overall Difficulty</p>
                        <p className={`text-lg font-bold ${
                          checkIn.difficultyRating === 'Easy' 
                            ? 'text-green-600'
                            : checkIn.difficultyRating === 'Moderate'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {checkIn.difficultyRating}
                        </p>
                      </div>
                      <div className="bg-soft-white rounded-lg p-4">
                        <p className="text-xs text-warm-grey mb-2 font-medium">Energy Levels</p>
                        <p className={`text-lg font-bold ${
                          checkIn.energyRating === 'High' 
                            ? 'text-green-600'
                            : checkIn.energyRating === 'OK'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {checkIn.energyRating}
                        </p>
                      </div>
                      <div className="bg-soft-white rounded-lg p-4">
                        <p className="text-xs text-warm-grey mb-2 font-medium">Soreness</p>
                        <p className={`text-lg font-bold ${
                          checkIn.sorenessRating === 'None' 
                            ? 'text-green-600'
                            : checkIn.sorenessRating === 'Mild'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {checkIn.sorenessRating}
                        </p>
                      </div>
                    </div>

                    {/* Soreness Notes */}
                    {checkIn.sorenessNotes && checkIn.sorenessNotes.trim() !== '' && (
                      <div className="bg-soft-white rounded-lg p-4 mb-3">
                        <p className="text-xs text-warm-grey font-medium mb-2">Soreness Notes</p>
                        <p className="text-sm text-charcoal-black leading-relaxed">
                          {checkIn.sorenessNotes}
                        </p>
                      </div>
                    )}

                    {/* Client Notes */}
                    {checkIn.clientNotes && checkIn.clientNotes.trim() !== '' && (
                      <div className="bg-soft-bronze/10 border-l-4 border-soft-bronze rounded-r-lg p-4">
                        <p className="text-xs text-soft-bronze font-bold mb-2">
                          💬 Notes for Coach
                        </p>
                        <p className="text-sm text-charcoal-black leading-relaxed italic">
                          "{checkIn.clientNotes}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
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
