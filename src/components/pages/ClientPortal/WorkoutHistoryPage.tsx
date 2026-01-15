import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientAssignedWorkouts, WeeklyCoachesNotes } from '@/entities';
import { Calendar, ChevronDown, CheckCircle2, Clock, Dumbbell, MessageCircle, TrendingUp, Archive } from 'lucide-react';
import { formatWeekDisplay, getWeekStartDate } from '@/lib/workout-assignment-service';

interface CompletedWorkout {
  _id: string;
  clientId?: string;
  weekNumber?: number;
  trainerId?: string;
  weekStartDate?: Date | string;
  workoutSlot?: number;
  status?: string;
  exerciseName?: string;
  sets?: number;
  reps?: number;
  weightOrResistance?: string;
  tempo?: string;
  restTimeSeconds?: number;
  exerciseNotes?: string;
  exerciseVideoUrl?: string;
  completedDate?: Date | string;
  _updatedDate?: Date;
}

interface WeekGroup {
  weekNumber: number;
  weekStartDate: Date | string;
  workouts: CompletedWorkout[];
  coachNote?: WeeklyCoachesNotes;
}

export default function WorkoutHistoryPage() {
  const { member } = useMember();
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [weekGroups, setWeekGroups] = useState<WeekGroup[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedWorkouts = async () => {
      if (!member?._id) return;

      try {
        // Fetch all assigned workouts for the client
        const { items: allWorkouts } = await BaseCrudService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');
        
        // Filter for completed workouts belonging to this client
        const completed = allWorkouts.filter(
          w => w.clientId === member._id && w.status === 'completed'
        );

        // Fetch coach notes for all weeks
        const { items: allNotes } = await BaseCrudService.getAll<WeeklyCoachesNotes>('weeklycoachesnotes');
        const clientNotes = allNotes.filter(
          note => note.clientId === member._id && note.isPublished
        );

        // Group by week number
        const grouped = completed.reduce((acc, workout) => {
          const weekNum = workout.weekNumber || 1;
          if (!acc[weekNum]) {
            acc[weekNum] = {
              weekNumber: weekNum,
              weekStartDate: workout.weekStartDate || new Date(),
              workouts: [],
              coachNote: clientNotes.find(
                note => note.weekStartDate === workout.weekStartDate
              ),
            };
          }
          acc[weekNum].workouts.push(workout as CompletedWorkout);
          return acc;
        }, {} as Record<number, WeekGroup>);

        // Convert to array and sort by week number (most recent first)
        const groupedArray = Object.values(grouped).sort(
          (a, b) => b.weekNumber - a.weekNumber
        );

        setCompletedWorkouts(completed as CompletedWorkout[]);
        setWeekGroups(groupedArray);
      } catch (error) {
        console.error('Error fetching completed workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedWorkouts();
  }, [member?._id]);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateWeekStats = (workouts: CompletedWorkout[]) => {
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce((sum, w) => sum + (w.sets || 0), 0);
    const totalReps = workouts.reduce((sum, w) => sum + (w.reps || 0) * (w.sets || 0), 0);
    return { totalWorkouts, totalSets, totalReps };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading your workout history...</p>
      </div>
    );
  }

  if (completedWorkouts.length === 0) {
    return (
      <div className="space-y-8 bg-warm-sand-beige/40 min-h-screen p-6 lg:p-8 rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
          <h1 className="font-heading text-4xl font-bold mb-2">Workout History</h1>
          <p className="text-soft-white/90">
            View your completed workouts and track your progress over time
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-soft-bronze/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="w-8 h-8 text-soft-bronze" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-3">
              No Completed Workouts Yet
            </h3>
            <p className="text-warm-grey mb-6">
              Complete your first workout to start building your history. Your progress will be tracked here!
            </p>
            <div className="text-sm text-warm-grey/80 italic">
              💡 Head to "My Program" to start your first workout
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-warm-sand-beige/40 min-h-screen p-6 lg:p-8 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Workout History</h1>
        <p className="text-soft-white/90">
          {completedWorkouts.length} completed workout{completedWorkouts.length !== 1 ? 's' : ''} • Track your progress and review past sessions
        </p>
      </div>

      {/* Overall Stats Card */}
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8">
        <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
          Your Progress Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-soft-bronze mb-2" />
            <p className="text-sm text-warm-grey mb-1">Total Workouts</p>
            <p className="font-heading text-3xl font-bold text-charcoal-black">
              {completedWorkouts.length}
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
            <Calendar className="w-6 h-6 text-soft-bronze mb-2" />
            <p className="text-sm text-warm-grey mb-1">Weeks Tracked</p>
            <p className="font-heading text-3xl font-bold text-charcoal-black">
              {weekGroups.length}
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
            <Dumbbell className="w-6 h-6 text-soft-bronze mb-2" />
            <p className="text-sm text-warm-grey mb-1">Total Sets</p>
            <p className="font-heading text-3xl font-bold text-charcoal-black">
              {completedWorkouts.reduce((sum, w) => sum + (w.sets || 0), 0)}
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-soft-bronze mb-2" />
            <p className="text-sm text-warm-grey mb-1">Total Reps</p>
            <p className="font-heading text-3xl font-bold text-charcoal-black">
              {completedWorkouts.reduce((sum, w) => sum + (w.reps || 0) * (w.sets || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Week-by-Week History */}
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold text-charcoal-black">
          Completed Weeks
        </h2>

        {weekGroups.map((weekGroup) => {
          const isExpanded = expandedWeek === weekGroup.weekNumber;
          const stats = calculateWeekStats(weekGroup.workouts);

          return (
            <div
              key={weekGroup.weekNumber}
              className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden"
            >
              {/* Week Header */}
              <button
                onClick={() => setExpandedWeek(isExpanded ? null : weekGroup.weekNumber)}
                className="w-full px-6 lg:px-8 py-5 lg:py-6 flex items-center justify-between hover:bg-warm-sand-beige/20 transition-all duration-300"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-heading text-lg lg:text-xl font-bold text-charcoal-black">
                      Week {weekGroup.weekNumber}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  </div>
                  <p className="text-sm text-warm-grey">
                    {formatDate(weekGroup.weekStartDate)} • {stats.totalWorkouts} workout{stats.totalWorkouts !== 1 ? 's' : ''} • {stats.totalSets} sets • {stats.totalReps} reps
                  </p>
                </div>

                <ChevronDown
                  size={24}
                  className={`text-soft-bronze transition-transform flex-shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded Week Details */}
              {isExpanded && (
                <div className="border-t border-warm-sand-beige px-6 lg:px-8 py-6 space-y-6">
                  {/* Coach Note if available */}
                  {weekGroup.coachNote && (
                    <div className="bg-warm-sand-beige/40 border-l-4 border-muted-rose rounded-r-lg p-4">
                      <div className="flex items-start gap-2">
                        <MessageCircle size={18} className="text-muted-rose flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm text-charcoal-black mb-1">Coach's note for this week:</p>
                          <p className="text-sm text-charcoal-black leading-relaxed">
                            {weekGroup.coachNote.noteContent}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Workouts in this week */}
                  <div className="space-y-3">
                    {weekGroup.workouts.map((workout) => {
                      const isWorkoutExpanded = expandedWorkout === workout._id;

                      return (
                        <div
                          key={workout._id}
                          className="bg-warm-sand-beige/10 border border-warm-sand-beige rounded-xl overflow-hidden"
                        >
                          {/* Workout Header */}
                          <button
                            onClick={() => setExpandedWorkout(isWorkoutExpanded ? null : workout._id)}
                            className="w-full px-5 py-4 flex items-center justify-between hover:bg-warm-sand-beige/20 transition-colors"
                          >
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-heading text-base font-bold text-charcoal-black">
                                  Workout {workout.workoutSlot}
                                </h4>
                                <span className="text-xs text-green-600 font-medium">✓</span>
                              </div>
                              <p className="text-sm text-warm-grey">
                                {workout.exerciseName} • Completed {formatDate(workout._updatedDate)}
                              </p>
                            </div>

                            <ChevronDown
                              size={20}
                              className={`text-soft-bronze transition-transform flex-shrink-0 ${
                                isWorkoutExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {/* Expanded Workout Details */}
                          {isWorkoutExpanded && (
                            <div className="border-t border-warm-sand-beige px-5 py-4 space-y-4 bg-soft-white">
                              {/* Exercise Details - Read Only */}
                              <div>
                                <h5 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                                  {workout.exerciseName}
                                </h5>

                                {/* Exercise Stats */}
                                <div className="flex flex-wrap gap-4 text-sm mb-4">
                                  {workout.sets && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-warm-grey">Sets × Reps:</span>
                                      <span className="font-bold text-charcoal-black">
                                        {workout.sets} × {workout.reps}
                                      </span>
                                    </div>
                                  )}
                                  {workout.weightOrResistance && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-warm-grey">Weight:</span>
                                      <span className="font-bold text-charcoal-black">
                                        {workout.weightOrResistance}
                                      </span>
                                    </div>
                                  )}
                                  {workout.restTimeSeconds && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-warm-grey">Rest:</span>
                                      <span className="font-bold text-charcoal-black">
                                        {workout.restTimeSeconds}s
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Coach Notes */}
                                {workout.exerciseNotes && (
                                  <div className="bg-warm-sand-beige/30 border-l-4 border-soft-bronze rounded-r-lg p-3">
                                    <p className="text-xs font-bold text-charcoal-black mb-1">Coach's guidance:</p>
                                    <p className="text-sm text-charcoal-black leading-relaxed">
                                      {workout.exerciseNotes}
                                    </p>
                                  </div>
                                )}

                                {/* Tempo if available */}
                                {workout.tempo && (
                                  <div className="mt-3">
                                    <p className="text-xs text-warm-grey mb-1">Tempo:</p>
                                    <p className="text-sm text-charcoal-black font-medium">
                                      {workout.tempo}
                                    </p>
                                  </div>
                                )}

                                {/* Completion Info */}
                                <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                                  <div className="flex items-center gap-2 text-sm text-green-700">
                                    <CheckCircle2 size={16} />
                                    <span className="font-medium">
                                      Completed on {formatDate(workout._updatedDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational Footer */}
      <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-6 lg:p-8 text-center">
        <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
          Keep Building Your Legacy 💪
        </h3>
        <p className="text-warm-grey">
          Every workout completed is a step closer to your goals. Stay consistent and watch your progress grow!
        </p>
      </div>
    </div>
  );
}
