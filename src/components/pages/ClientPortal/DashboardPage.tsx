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

      <div className="space-y-12 bg-soft-white min-h-screen p-8 lg:p-12">
      {/* Profile Completion Prompt - TERTIARY INFO BANNER */}
      {showProfilePrompt && (
        <div className="bg-soft-white border-2 border-soft-bronze/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-soft-bronze/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Smile className="w-6 h-6 text-soft-bronze" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
                Complete Your Profile
              </h3>
              <p className="font-paragraph text-charcoal-black/80 mb-4 leading-relaxed">
                Help us personalise your experience by adding your name and details.
              </p>
              <Link
                to="/portal/profile"
                className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg font-bold hover:bg-soft-bronze/90 transition-colors shadow-sm"
              >
                Complete Profile
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY HERO - Welcome Back State (Triggered by 7+ days of inactivity) */}
      {isInactive && (
        <div className="bg-gradient-to-br from-soft-bronze to-soft-bronze/90 rounded-2xl p-10 md:p-14 text-soft-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-soft-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Smile className="w-7 h-7 text-soft-white" />
              </div>
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3 leading-tight">
                  Welcome back, {displayName}
                </h1>
                <p className="text-soft-white/95 font-paragraph text-lg md:text-xl leading-relaxed">
                  It's been {daysSinceActivity} days. Your program is ready for you, and your trainer is here to support your comeback.
                </p>
              </div>
            </div>
            <Link
              to="/portal/program"
              className="inline-flex items-center gap-3 bg-soft-white text-soft-bronze px-10 py-5 rounded-xl font-bold text-xl hover:bg-soft-white/95 transition-all duration-300 whitespace-nowrap shadow-2xl flex-shrink-0"
            >
              Start Workout
              <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      )}

      {/* SECONDARY INFO BANNER - Weekly Coach Note (If Available) */}
      {weeklyCoachNote && weeklyCoachNote.noteContent && (
        <div className="bg-warm-sand-beige/40 border-l-4 border-soft-bronze rounded-xl p-8 shadow-sm">
          <div className="flex gap-5">
            <MessageCircle className="w-7 h-7 text-soft-bronze flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-3">
                This Week's Note from Your Coach
              </h2>
              <p className="font-paragraph text-charcoal-black/90 leading-relaxed text-lg">
                {weeklyCoachNote.noteContent}
              </p>
              <p className="text-sm text-warm-grey mt-4">
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

      {/* PRIMARY HERO - Welcome Section (Hidden when inactive) */}
      {!isInactive && (
        <div className="bg-gradient-to-br from-soft-bronze to-soft-bronze/90 rounded-2xl p-10 md:p-14 text-soft-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3 leading-tight">
                Welcome back, {displayName}!
              </h1>
              <p className="text-soft-white/95 text-lg md:text-xl">
                You're making great progress. Keep up the momentum!
              </p>
            </div>
            <Link
              to="/portal/bookings"
              className="inline-flex items-center gap-3 bg-soft-white text-soft-bronze px-10 py-5 rounded-xl font-bold text-xl hover:bg-soft-white/95 transition-colors whitespace-nowrap shadow-2xl"
            >
              Book Your Next Session
              <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      )}

      {/* PRIMARY SECTION - This Week's Training */}
      <div className="bg-charcoal-black rounded-2xl p-10 shadow-2xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="font-heading text-4xl font-bold text-soft-white mb-3">
              This Week's Training
            </h2>
            <p className="text-warm-sand-beige text-base">
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
        <div className="mb-8">
          <div className="h-4 bg-warm-grey/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-soft-bronze to-soft-bronze/90 rounded-full transition-all duration-500"
              style={{ width: `${totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Supportive messaging */}
        <div className="flex items-start gap-4 p-5 bg-soft-white/10 rounded-xl mb-8">
          <MessageCircle className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
          <p className="text-base text-soft-white/95 leading-relaxed">
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
          className="inline-flex items-center gap-3 bg-soft-bronze text-soft-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-soft-bronze/90 transition-colors w-full justify-center shadow-xl"
        >
          {completedWorkouts === 0 ? 'Start This Week' : completedWorkouts === totalWorkouts ? 'Review Week' : 'Continue Training'}
          <ArrowRight size={22} />
        </Link>
      </div>

      {/* SECONDARY SECTION - Weekly Check-In */}
      <div className="bg-warm-sand-beige/50 border-l-4 border-muted-rose rounded-xl p-10 shadow-md">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-2">
              Weekly Check-In
            </h2>
            <p className="text-warm-grey text-base">
              Help your coach understand how you're feeling
            </p>
          </div>
          <Badge 
            variant={checkInStatus === 'completed' ? 'default' : 'secondary'}
            className={checkInStatus === 'completed' 
              ? 'bg-green-100 text-green-800 hover:bg-green-100 px-4 py-2 text-sm font-bold' 
              : 'bg-amber-100 text-amber-800 hover:bg-amber-100 px-4 py-2 text-sm font-bold'
            }
          >
            {checkInStatus === 'completed' ? '✓ Completed' : 'Due'}
          </Badge>
        </div>

        {latestWeeklyCheckIn && hasCurrentWeekCheckIn ? (
          <div className="space-y-6">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-soft-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-soft-bronze" />
                  <p className="text-sm text-warm-grey font-medium">Energy</p>
                </div>
                <p className="font-heading text-2xl font-bold text-charcoal-black">
                  {latestWeeklyCheckIn.energyRating || 'N/A'}
                </p>
              </div>

              <div className="bg-soft-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-soft-bronze" />
                  <p className="text-sm text-warm-grey font-medium">Difficulty</p>
                </div>
                <p className="font-heading text-2xl font-bold text-charcoal-black">
                  {latestWeeklyCheckIn.difficultyRating || 'N/A'}
                </p>
              </div>
            </div>

            {/* Coach review message */}
            <div className="flex items-start gap-4 p-5 bg-soft-white rounded-xl shadow-sm">
              <Eye className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
              <p className="text-base text-charcoal-black/90 leading-relaxed">
                Your coach is reviewing this and will respond here.
              </p>
            </div>

            <Link
              to="/portal/progress"
              className="inline-flex items-center gap-2 text-soft-bronze hover:underline text-base font-bold"
            >
              View all check-ins
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-charcoal-black/90 text-base leading-relaxed">
              Share how this week's training is going. Your feedback helps your coach keep your program aligned with how you're feeling.
            </p>
            <button
              onClick={() => setShowCheckInModal(true)}
              className="inline-flex items-center gap-3 bg-muted-rose text-soft-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-muted-rose/90 transition-colors shadow-md"
            >
              <CheckCircle size={20} />
              Complete check-in (2 min)
            </button>
          </div>
        )}
      </div>

      {/* TERTIARY SECTION - Upcoming Sessions */}
      <div className="bg-soft-white border border-warm-sand-beige rounded-xl p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
              Upcoming Sessions
            </h2>
            <p className="text-warm-grey text-base">
              {upcomingBookings.length > 0 
                ? `${upcomingBookings.length} session${upcomingBookings.length !== 1 ? 's' : ''} scheduled`
                : 'Stay consistent by booking ahead'}
            </p>
          </div>
          {upcomingBookings.length > 0 && (
            <Link to="/portal/bookings" className="text-soft-bronze hover:underline text-base font-bold">
              View all
            </Link>
          )}
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.slice(0, 2).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-5 bg-warm-sand-beige/30 rounded-xl">
                <div>
                  <h3 className="font-paragraph font-bold text-charcoal-black text-lg">
                    {booking.serviceType}
                  </h3>
                  <p className="text-warm-grey text-base">
                    {new Date(booking.appointmentDate || '').toLocaleDateString('en-GB', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
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
                className="block text-center text-soft-bronze hover:underline text-base font-bold pt-3"
              >
                +{upcomingBookings.length - 2} more session{upcomingBookings.length - 2 !== 1 ? 's' : ''}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-charcoal-black/90 text-base leading-relaxed">
              Clients who book ahead stay more consistent around family life.
            </p>
            <Link 
              to="/portal/bookings" 
              className="inline-flex items-center gap-3 bg-soft-bronze text-soft-white hover:bg-soft-bronze/90 transition-colors font-bold px-8 py-4 rounded-xl text-lg shadow-md"
            >
              Book a session
              <ArrowRight size={18} />
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
          className="bg-soft-white border-2 border-warm-sand-beige rounded-xl p-8 hover:border-soft-bronze hover:shadow-md transition-all duration-200 group"
        >
          <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors">
            Nutrition
          </h3>
          <p className="text-warm-grey text-base">Meal plans & guidance</p>
        </Link>

        <Link
          to="/portal/video-library"
          className="bg-soft-white border-2 border-warm-sand-beige rounded-xl p-8 hover:border-soft-bronze hover:shadow-md transition-all duration-200 group"
        >
          <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors">
            Video Library
          </h3>
          <p className="text-warm-grey text-base">Exercise demos</p>
        </Link>

        <Link
          to="/portal/progress"
          className="bg-soft-white border-2 border-warm-sand-beige rounded-xl p-8 hover:border-soft-bronze hover:shadow-md transition-all duration-200 group"
        >
          <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors">
            Progress
          </h3>
          <p className="text-warm-grey text-base">Track your journey</p>
        </Link>
      </div>

      {/* Coach Support Footer - TERTIARY INFO BANNER */}
      <div className="bg-soft-white border-2 border-soft-bronze/30 rounded-xl p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <Heart className="text-soft-bronze flex-shrink-0 mt-1" size={28} />
          <div>
            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
              You're not doing this alone
            </h3>
            <p className="text-warm-grey text-base leading-relaxed">
              Your coach reviews your progress regularly and is here to support you. Reach out anytime if you need adjustments or have questions.
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
