import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientBookings, ProgressCheckins, NutritionGuidance, ClientPrograms, ClientAssignedWorkouts, WeeklyCoachesNotes, ClientProfiles, WeeklyCheckins } from '@/entities';
import { Calendar, CheckCircle, TrendingUp, Zap, Heart, ArrowRight, MessageCircle, Smile, Activity, AlertCircle, Eye } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Link } from 'react-router-dom';
import ProgramCompletionRing from '@/components/ClientPortal/ProgramCompletionRing';
import { getClientDisplayName, isProfileIncomplete } from '@/lib/client-name-service';
import WelcomeMessage from '@/components/ClientPortal/WelcomeMessage';
import { getActiveCycle, getCompletedWeeksArray } from '@/lib/program-cycle-service';
import WeeklyCheckInModal from '@/components/ClientPortal/WeeklyCheckInModal';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { member } = useMember();
  const [upcomingBookings, setUpcomingBookings] = useState<ClientBookings[]>([]);
  const [latestCheckIn, setLatestCheckIn] = useState<ProgressCheckins | null>(null);
  const [latestWeeklyCheckIn, setLatestWeeklyCheckIn] = useState<WeeklyCheckins | null>(null);
  const [programs, setPrograms] = useState<ClientPrograms[]>([]);
  const [assignedWorkouts, setAssignedWorkouts] = useState<ClientAssignedWorkouts[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<number>(0);
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [weeklyCoachNote, setWeeklyCoachNote] = useState<WeeklyCoachesNotes | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInactive, setIsInactive] = useState(false);
  const [daysSinceActivity, setDaysSinceActivity] = useState<number>(0);
  const [clientProfile, setClientProfile] = useState<ClientProfiles | null>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [useNewSystem, setUseNewSystem] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [activeCycleId, setActiveCycleId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!member?.loginEmail) return;

      try {
        // Fetch client profile
        const { items: profiles } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
        const profile = profiles.find(p => p.memberId === member.loginEmail);
        setClientProfile(profile || null);

        // Check if this is the first login (profile complete but no welcome shown)
        const hasSeenWelcome = localStorage.getItem(`welcomeShown_${member.loginEmail}`);
        if (profile && !isProfileIncomplete(profile) && !hasSeenWelcome) {
          setShowWelcomeMessage(true);
        }

        // Fetch upcoming bookings
        const { items: bookings } = await BaseCrudService.getAll<ClientBookings>('clientbookings');
        const upcomingFiltered = bookings
          .filter(b => {
            const appointmentDate = new Date(b.appointmentDate || '');
            return appointmentDate > new Date();
          })
          .sort((a, b) => new Date(a.appointmentDate || '').getTime() - new Date(b.appointmentDate || '').getTime())
          .slice(0, 3);
        setUpcomingBookings(upcomingFiltered);

        // Fetch latest check-in
        const { items: checkins } = await BaseCrudService.getAll<ProgressCheckins>('progresscheckins');
        if (checkins.length > 0) {
          const sorted = checkins.sort((a, b) => 
            new Date(b.checkinDate || '').getTime() - new Date(a.checkinDate || '').getTime()
          );
          setLatestCheckIn(sorted[0]);

          // Check for inactivity (7+ days since last check-in)
          const lastCheckInDate = new Date(sorted[0].checkinDate || '');
          const today = new Date();
          const daysDiff = Math.floor((today.getTime() - lastCheckInDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= 7) {
            setIsInactive(true);
            setDaysSinceActivity(daysDiff);
          }
        }

        // Fetch active program cycle
        const cycle = await getActiveCycle(member.loginEmail);
        setActiveCycleId(cycle?._id || '');
        
        // Calculate current week start date
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(today.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        const weekStartStr = weekStart.toISOString().split('T')[0];
        setCurrentWeekStartDate(weekStartStr);
        setCurrentWeekNumber(cycle?.currentWeek || 1);
        
        // Try to fetch from new system first (assigned workouts)
        const { items: allAssignedWorkouts } = await BaseCrudService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');
        const clientWorkouts = allAssignedWorkouts.filter(w => w.clientId === member._id);
        
        if (clientWorkouts.length > 0) {
          // NEW SYSTEM: Use assigned workouts
          setUseNewSystem(true);
          
          // Get trainer ID from first workout
          const firstWorkout = clientWorkouts[0];
          setTrainerId(firstWorkout.trainerId || '');
          
          // Get completed weeks from the active cycle
          const completedWeeks = getCompletedWeeksArray(cycle?.weeksCompleted || 0);
          const currentWeek = cycle?.currentWeek || 1;
          
          // Filter workouts: only show active/pending from current week (not completed weeks)
          const activeWorkouts = clientWorkouts.filter(w => {
            // Exclude workouts from completed weeks
            if (w.weekNumber && completedWeeks.includes(w.weekNumber)) {
              return false;
            }
            
            // Only show workouts from current week or future weeks
            if (w.weekNumber && w.weekNumber < currentWeek) {
              return false;
            }
            
            // Only show active or pending workouts (not completed)
            return w.status === 'active' || w.status === 'pending';
          });
          
          setAssignedWorkouts(activeWorkouts);
          
          // Calculate completed workouts in current week
          const currentWeekWorkouts = clientWorkouts.filter(w => w.weekNumber === currentWeek);
          const currentWeekCompleted = currentWeekWorkouts.filter(w => w.status === 'completed');
          
          setCompletedWorkouts(currentWeekCompleted.length);
          setTotalWorkouts(currentWeekWorkouts.length);
        } else {
          // LEGACY SYSTEM: Fall back to clientprograms
          setUseNewSystem(false);
          const { items: programItems } = await BaseCrudService.getAll<ClientPrograms>('clientprograms');
          setPrograms(programItems);
          
          // Calculate completed workouts (unique workout days)
          const uniqueDays = new Set(programItems.map(p => p.workoutDay));
          setTotalWorkouts(uniqueDays.size);
          setCompletedWorkouts(Math.floor(uniqueDays.size * 0.6)); // Mock: 60% completion for demo
        }

        // Fetch latest weekly check-in
        const { items: weeklyCheckins } = await BaseCrudService.getAll<WeeklyCheckins>('weeklycheckins');
        const clientWeeklyCheckins = weeklyCheckins.filter(c => c.clientId === member._id);
        if (clientWeeklyCheckins.length > 0) {
          const sortedWeekly = clientWeeklyCheckins.sort((a, b) => 
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          );
          setLatestWeeklyCheckIn(sortedWeekly[0]);
        }

        // Fetch current week's coach note
        const { items: coachNotes } = await BaseCrudService.getAll<WeeklyCoachesNotes>('weeklycoachesnotes');

        const currentWeekNote = coachNotes.find(
          n =>
            n.clientId === member._id &&
            n.isPublished &&
            n.weekStartDate &&
            new Date(n.weekStartDate).toISOString().split('T')[0] === weekStartStr
        );
        setWeeklyCoachNote(currentWeekNote || null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member?.loginEmail, member?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading dashboard...</p>
      </div>
    );
  }

  const displayName = getClientDisplayName(clientProfile, member?.loginEmail);
  const showProfilePrompt = isProfileIncomplete(clientProfile);

  const handleDismissWelcome = () => {
    if (member?.loginEmail) {
      localStorage.setItem(`welcomeShown_${member.loginEmail}`, 'true');
    }
    setShowWelcomeMessage(false);
  };

  const handleCheckInSuccess = async () => {
    // Refresh weekly check-ins after submission
    if (!member?._id) return;
    
    try {
      const { items: weeklyCheckins } = await BaseCrudService.getAll<WeeklyCheckins>('weeklycheckins');
      const clientWeeklyCheckins = weeklyCheckins.filter(c => c.clientId === member._id);
      if (clientWeeklyCheckins.length > 0) {
        const sortedWeekly = clientWeeklyCheckins.sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        setLatestWeeklyCheckIn(sortedWeekly[0]);
      }
    } catch (error) {
      console.error('Error refreshing check-ins:', error);
    }
  };

  // Check if current week check-in exists
  const hasCurrentWeekCheckIn = latestWeeklyCheckIn && 
    latestWeeklyCheckIn.weekStartDate === currentWeekStartDate;

  // Determine check-in status
  const checkInStatus = hasCurrentWeekCheckIn ? 'completed' : 'due';

  return (
    <>
      {/* One-time welcome message */}
      {showWelcomeMessage && (
        <WelcomeMessage
          clientName={displayName}
          onDismiss={handleDismissWelcome}
        />
      )}

      <div className="space-y-8 bg-warm-sand-beige/40 min-h-screen p-8 rounded-2xl">
      {/* Profile Completion Prompt */}
      {showProfilePrompt && (
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Smile className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                Complete Your Profile
              </h3>
              <p className="font-paragraph text-charcoal-black mb-4">
                Help us personalise your experience by adding your name and details.
              </p>
              <Link
                to="/portal/profile"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Complete Profile
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Back State - Triggered by 7+ days of inactivity */}
      {isInactive && (
        <div className="bg-gradient-to-r from-soft-bronze via-soft-bronze/90 to-soft-bronze/80 rounded-2xl p-8 md:p-12 text-soft-white shadow-lg border border-soft-bronze/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-soft-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Smile className="w-6 h-6 text-soft-white" />
              </div>
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">
                  Welcome back, {displayName} — let's pick up where you left off
                </h2>
                <p className="text-soft-white/90 font-paragraph text-lg">
                  It's been {daysSinceActivity} days. Your program is ready for you, and your trainer is here to support your comeback.
                </p>
              </div>
            </div>
            <Link
              to="/portal/program"
              className="inline-flex items-center gap-2 bg-soft-white text-soft-bronze px-8 py-4 rounded-lg font-bold text-lg hover:bg-soft-white/95 transition-all duration-300 whitespace-nowrap shadow-lg flex-shrink-0"
            >
              Start Workout
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      )}

      {/* Weekly Coach Note - If Available */}
      {weeklyCoachNote && weeklyCoachNote.noteContent && (
        <div className="bg-gradient-to-r from-soft-bronze/10 to-soft-bronze/5 border-l-4 border-soft-bronze rounded-2xl p-6">
          <div className="flex gap-4">
            <MessageCircle className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                This Week's Note from Your Coach
              </h2>
              <p className="font-paragraph text-charcoal-black leading-relaxed">
                {weeklyCoachNote.noteContent}
              </p>
              <p className="text-xs text-warm-grey mt-3">
                Updated {new Date(weeklyCoachNote.lastUpdated || '').toLocaleDateString('en-GB', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section with Primary CTA - Hidden when inactive */}
      {!isInactive && (
        <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="font-heading text-4xl font-bold mb-2">
                Welcome back, {displayName}!
              </h1>
              <p className="text-soft-white/90">
                You're making great progress. Keep up the momentum!
              </p>
            </div>
            <Link
              to="/portal/bookings"
              className="inline-flex items-center gap-2 bg-soft-white text-soft-bronze px-10 py-5 rounded-lg font-bold text-lg hover:bg-soft-white/90 transition-colors whitespace-nowrap shadow-lg"
            >
              Book Your Next Session
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      )}

      {/* Primary Action Card - This Week's Training */}
      <div className="bg-soft-white border-2 border-soft-bronze/30 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
              This Week's Training
            </h2>
            <p className="text-warm-grey text-sm">
              Week {currentWeekNumber} • {completedWorkouts} of {totalWorkouts} workouts completed
            </p>
          </div>
          <div className="flex-shrink-0">
            <ProgramCompletionRing
              completedWorkouts={completedWorkouts}
              totalWorkouts={Math.max(1, totalWorkouts)}
              showAnimation={false}
              compact={true}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-3 bg-warm-sand-beige/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-full transition-all duration-500"
              style={{ width: `${totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Supportive messaging */}
        <div className="flex items-start gap-3 p-4 bg-soft-bronze/5 rounded-lg mb-4">
          <MessageCircle className="w-5 h-5 text-soft-bronze flex-shrink-0 mt-0.5" />
          <p className="text-sm text-charcoal-black">
            {completedWorkouts === 0 
              ? "Your coach has prepared this week's workouts. Start when you're ready."
              : completedWorkouts === totalWorkouts
              ? "Week complete! Your coach will review your progress and prepare next week's plan."
              : "Your coach is tracking your progress and will adjust your program as needed."}
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/portal/program"
          className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg font-bold hover:bg-soft-bronze/90 transition-colors w-full justify-center"
        >
          {completedWorkouts === 0 ? 'Start This Week' : completedWorkouts === totalWorkouts ? 'Review Week' : 'Continue Training'}
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Weekly Check-In Summary Card */}
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-1">
              Weekly Check-In
            </h2>
            <p className="text-warm-grey text-sm">
              Help your coach understand how you're feeling
            </p>
          </div>
          <Badge 
            variant={checkInStatus === 'completed' ? 'default' : 'secondary'}
            className={checkInStatus === 'completed' 
              ? 'bg-green-100 text-green-800 hover:bg-green-100' 
              : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
            }
          >
            {checkInStatus === 'completed' ? '✓ Completed' : 'Due'}
          </Badge>
        </div>

        {latestWeeklyCheckIn && hasCurrentWeekCheckIn ? (
          <div className="space-y-4">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-warm-sand-beige/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-soft-bronze" />
                  <p className="text-xs text-warm-grey">Energy</p>
                </div>
                <p className="font-heading text-xl font-bold text-charcoal-black">
                  {latestWeeklyCheckIn.energyRating || 'N/A'}
                </p>
              </div>

              <div className="bg-warm-sand-beige/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-soft-bronze" />
                  <p className="text-xs text-warm-grey">Difficulty</p>
                </div>
                <p className="font-heading text-xl font-bold text-charcoal-black">
                  {latestWeeklyCheckIn.difficultyRating || 'N/A'}
                </p>
              </div>
            </div>

            {/* Coach review message */}
            <div className="flex items-start gap-3 p-4 bg-soft-bronze/5 rounded-lg">
              <Eye className="w-5 h-5 text-soft-bronze flex-shrink-0 mt-0.5" />
              <p className="text-sm text-charcoal-black">
                Your coach is reviewing this and will respond here.
              </p>
            </div>

            <Link
              to="/portal/progress"
              className="inline-flex items-center gap-2 text-soft-bronze hover:underline text-sm font-medium"
            >
              View all check-ins
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-charcoal-black">
              Share how this week's training is going. Your feedback helps your coach keep your program aligned with how you're feeling.
            </p>
            <button
              onClick={() => setShowCheckInModal(true)}
              className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg font-bold hover:bg-soft-bronze/90 transition-colors"
            >
              <CheckCircle size={18} />
              Complete check-in (2 min)
            </button>
          </div>
        )}
      </div>

      {/* Upcoming Sessions Card */}
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-1">
              Upcoming Sessions
            </h2>
            <p className="text-warm-grey text-sm">
              {upcomingBookings.length > 0 
                ? `${upcomingBookings.length} session${upcomingBookings.length !== 1 ? 's' : ''} scheduled`
                : 'Stay consistent by booking ahead'}
            </p>
          </div>
          {upcomingBookings.length > 0 && (
            <Link to="/portal/bookings" className="text-soft-bronze hover:underline text-sm font-medium">
              View all
            </Link>
          )}
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.slice(0, 2).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-4 bg-warm-sand-beige/30 rounded-lg">
                <div>
                  <h3 className="font-paragraph font-bold text-charcoal-black">
                    {booking.serviceType}
                  </h3>
                  <p className="text-warm-grey text-sm">
                    {new Date(booking.appointmentDate || '').toLocaleDateString('en-GB', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
            {upcomingBookings.length > 2 && (
              <Link 
                to="/portal/bookings"
                className="block text-center text-soft-bronze hover:underline text-sm font-medium pt-2"
              >
                +{upcomingBookings.length - 2} more session{upcomingBookings.length - 2 !== 1 ? 's' : ''}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-charcoal-black">
              Clients who book ahead stay more consistent around family life.
            </p>
            <Link 
              to="/portal/bookings" 
              className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white hover:bg-soft-bronze/90 transition-colors font-bold px-6 py-3 rounded-lg"
            >
              Book a session
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Weekly Check-In Modal */}
      {showCheckInModal && member?._id && (
        <WeeklyCheckInModal
          isOpen={showCheckInModal}
          onClose={() => setShowCheckInModal(false)}
          weekNumber={currentWeekNumber}
          weekStartDate={currentWeekStartDate}
          clientId={member._id}
          trainerId={trainerId}
          programCycleId={activeCycleId}
          onSubmitSuccess={handleCheckInSuccess}
        />
      )}

      {/* Quick Links - Simplified */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/portal/nutrition"
          className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 hover:border-soft-bronze transition-all duration-200 group"
        >
          <h3 className="font-heading text-lg font-bold text-charcoal-black mb-1 group-hover:text-soft-bronze transition-colors">
            Nutrition
          </h3>
          <p className="text-warm-grey text-sm">Meal plans & guidance</p>
        </Link>

        <Link
          to="/portal/video-library"
          className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 hover:border-soft-bronze transition-all duration-200 group"
        >
          <h3 className="font-heading text-lg font-bold text-charcoal-black mb-1 group-hover:text-soft-bronze transition-colors">
            Video Library
          </h3>
          <p className="text-warm-grey text-sm">Exercise demos</p>
        </Link>

        <Link
          to="/portal/progress"
          className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 hover:border-soft-bronze transition-all duration-200 group"
        >
          <h3 className="font-heading text-lg font-bold text-charcoal-black mb-1 group-hover:text-soft-bronze transition-colors">
            Progress
          </h3>
          <p className="text-warm-grey text-sm">Track your journey</p>
        </Link>
      </div>

      {/* Coach Support Footer */}
      <div className="bg-gradient-to-r from-soft-bronze/10 to-soft-bronze/5 border border-soft-bronze/30 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Heart className="text-soft-bronze flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-heading text-lg font-bold text-charcoal-black mb-1">
              You're not doing this alone
            </h3>
            <p className="text-warm-grey text-sm">
              Your coach reviews your progress regularly and is here to support you. Reach out anytime if you need adjustments or have questions.
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
