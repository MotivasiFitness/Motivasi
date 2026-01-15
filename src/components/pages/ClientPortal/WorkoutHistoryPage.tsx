import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientAssignedWorkouts, WeeklyCoachesNotes } from '@/entities';
import { Calendar, ChevronDown, CheckCircle2, Clock, Dumbbell, MessageCircle, TrendingUp, Archive } from 'lucide-react';
import { formatWeekDisplay, getWeekStartDate } from '@/lib/workout-assignment-service';
import { getAllCycles, ProgramCycle } from '@/lib/program-cycle-service';
import { getWeeklySummary, WeeklySummary } from '@/lib/weekly-summary-service';
import WeeklySummaryCard from '@/components/ClientPortal/WeeklySummaryCard';

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
  trainerComment?: string;
  trainerCommentDate?: Date | string;
  trainerCommentBy?: string;
  difficultyRating?: string;
  clientReflectionNotes?: string;
  reflectionSubmittedAt?: Date | string;
}

interface WeekGroup {
  weekNumber: number;
  weekStartDate: Date | string;
  workouts: CompletedWorkout[];
  coachNote?: WeeklyCoachesNotes;
  weeklySummary?: WeeklySummary;
}

interface CycleGroup {
  cycle: ProgramCycle;
  weekGroups: WeekGroup[];
}

export default function WorkoutHistoryPage() {
  const { member } = useMember();
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [weekGroups, setWeekGroups] = useState<WeekGroup[]>([]);
  const [cycleGroups, setCycleGroups] = useState<CycleGroup[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedWorkouts = async () => {
      if (!member?._id) return;

      try {
        // Fetch all program cycles for the client
        const cycles = await getAllCycles(member._id);
        
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

        // Fetch weekly summaries
        const { items: allSummaries } = await BaseCrudService.getAll<WeeklySummary>('weeklysummaries');
        const clientSummaries = allSummaries.filter(
          summary => summary.clientId === member._id
        );

        // Group workouts by cycle
        const cycleGroupsData: CycleGroup[] = cycles
          .filter(cycle => cycle.status === 'completed' || cycle.status === 'archived')
          .map(cycle => {
            // Get workouts for this cycle (filter by cycle start date range)
            const cycleWorkouts = completed.filter(workout => {
              const workoutDate = new Date(workout.weekStartDate || '');
              const cycleStart = new Date(cycle.cycleStartDate || '');
              const cycleEnd = cycle.cycleCompletedAt 
                ? new Date(cycle.cycleCompletedAt) 
                : new Date(cycleStart.getTime() + 28 * 24 * 60 * 60 * 1000); // 4 weeks
              return workoutDate >= cycleStart && workoutDate <= cycleEnd;
            });

            // Group by week number within the cycle
            const grouped = cycleWorkouts.reduce((acc, workout) => {
              const weekNum = workout.weekNumber || 1;
              if (!acc[weekNum]) {
                const weekCoachNote = clientNotes.find(
                  note => note.weekStartDate === workout.weekStartDate
                );
                const weekSummary = clientSummaries.find(
                  summary => summary.weekNumber === weekNum && summary.programTitle === cycle.programTitle
                );
                
                acc[weekNum] = {
                  weekNumber: weekNum,
                  weekStartDate: workout.weekStartDate || new Date(),
                  workouts: [],
                  coachNote: weekCoachNote,
                  weeklySummary: weekSummary,
                };
              }
              acc[weekNum].workouts.push(workout as CompletedWorkout);
              return acc;
            }, {} as Record<number, WeekGroup>);

            // Convert to array and sort by week number
            const weekGroupsArray = Object.values(grouped).sort(
              (a, b) => a.weekNumber - b.weekNumber
            );

            return {
              cycle,
              weekGroups: weekGroupsArray,
            };
          });

        setCompletedWorkouts(completed as CompletedWorkout[]);
        setCycleGroups(cycleGroupsData);
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
            <Archive className="w-6 h-6 text-soft-bronze mb-2" />
            <p className="text-sm text-warm-grey mb-1">Completed Cycles</p>
            <p className="font-heading text-3xl font-bold text-charcoal-black">
              {cycleGroups.length}
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

      {/* Cycle-by-Cycle History */}
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold text-charcoal-black">
          Program Cycles History
        </h2>

        {cycleGroups.map((cycleGroup) => {
          const isExpanded = expandedCycle === cycleGroup.cycle._id;

          return (
            <div
              key={cycleGroup.cycle._id}
              className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden"
            >
              {/* Cycle Header */}
              <button
                onClick={() => setExpandedCycle(isExpanded ? null : cycleGroup.cycle._id)}
                className="w-full px-6 lg:px-8 py-5 lg:py-6 flex items-center justify-between hover:bg-warm-sand-beige/20 transition-all duration-300"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-heading text-lg lg:text-xl font-bold text-charcoal-black">
                      Cycle {cycleGroup.cycle.cycleNumber} - {cycleGroup.cycle.programTitle}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle2 size={14} /> Complete
                    </span>
                  </div>
                  <p className="text-sm text-warm-grey">
                    {formatDate(cycleGroup.cycle.cycleStartDate)} - {formatDate(cycleGroup.cycle.cycleCompletedAt)} • {cycleGroup.weekGroups.length} weeks
                  </p>
                </div>

                <ChevronDown
                  size={24}
                  className={`text-soft-bronze transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded Cycle Content - Weeks */}
              {isExpanded && (
                <div className="border-t border-warm-sand-beige px-6 lg:px-8 py-6 space-y-4">
                  {cycleGroup.weekGroups.map((weekGroup) => {
                    const isWeekExpanded = expandedWeek === weekGroup.weekNumber;
                    const stats = calculateWeekStats(weekGroup.workouts);

                    return (
                      <div
                        key={weekGroup.weekNumber}
                        className="bg-warm-sand-beige/10 border border-warm-sand-beige rounded-xl overflow-hidden"
                      >
                        {/* Week Header */}
                        <button
                          onClick={() => setExpandedWeek(isWeekExpanded ? null : weekGroup.weekNumber)}
                          className="w-full px-4 lg:px-6 py-4 flex items-center justify-between hover:bg-warm-sand-beige/20 transition-all duration-300"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-heading text-base lg:text-lg font-bold text-charcoal-black">
                                Week {weekGroup.weekNumber}
                              </h4>
                            </div>
                            <p className="text-sm text-warm-grey">
                              {formatDate(weekGroup.weekStartDate)} • {stats.totalWorkouts} workout{stats.totalWorkouts !== 1 ? 's' : ''} • {stats.totalSets} sets
                            </p>
                          </div>

                          <ChevronDown
                            size={20}
                            className={`text-soft-bronze transition-transform flex-shrink-0 ${
                              isWeekExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Expanded Week Details */}
                        {isWeekExpanded && (
                          <div className="border-t border-warm-sand-beige px-4 lg:px-6 py-4 space-y-4">
                            {/* Weekly Summary if available */}
                            {weekGroup.weeklySummary && (
                              <div className="mb-4">
                                <WeeklySummaryCard summary={weekGroup.weeklySummary} showDetails={true} />
                              </div>
                            )}

                            {/* Coach Note if available */}
                            {weekGroup.coachNote && (
                              <div className="bg-warm-sand-beige/40 border-l-4 border-muted-rose rounded-r-lg p-3">
                                <div className="flex items-start gap-2">
                                  <MessageCircle size={16} className="text-muted-rose flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-xs text-charcoal-black mb-1">Coach's note:</p>
                                    <p className="text-xs text-charcoal-black leading-relaxed">
                                      {weekGroup.coachNote.noteContent}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Workouts in this week */}
                            <div className="space-y-2">
                              {weekGroup.workouts.map((workout) => (
                                <div
                                  key={workout._id}
                                  className="bg-soft-white border border-warm-sand-beige rounded-lg p-3"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-heading text-sm font-bold text-charcoal-black">
                                      Workout {workout.workoutSlot}
                                    </h5>
                                    <span className="text-xs text-green-600 font-medium">✓</span>
                                  </div>
                                  <p className="text-xs text-warm-grey mb-2">
                                    {workout.exerciseName} • {workout.sets}×{workout.reps}
                                  </p>
                                  
                                  {/* Client Reflection - Read-only view */}
                                  {(workout.difficultyRating || workout.clientReflectionNotes) && (
                                    <div className="mt-2 pt-2 border-t border-warm-sand-beige">
                                      <div className="bg-soft-bronze/5 border-l-3 border-soft-bronze rounded-r p-2">
                                        <p className="text-xs font-bold text-soft-bronze mb-1">
                                          📝 Your Reflection
                                        </p>
                                        {workout.difficultyRating && (
                                          <p className="text-xs text-charcoal-black mb-1">
                                            <span className="font-medium">Difficulty:</span>{' '}
                                            <span className={`font-bold ${
                                              workout.difficultyRating === 'Easy' 
                                                ? 'text-green-600'
                                                : workout.difficultyRating === 'Moderate'
                                                ? 'text-yellow-600'
                                                : 'text-red-600'
                                            }`}>
                                              {workout.difficultyRating}
                                            </span>
                                          </p>
                                        )}
                                        {workout.clientReflectionNotes && (
                                          <p className="text-xs text-charcoal-black leading-relaxed italic">
                                            "{workout.clientReflectionNotes}"
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Trainer Feedback */}
                                  {workout.trainerComment && workout.trainerComment.trim() !== '' && (
                                    <div className="mt-2 pt-2 border-t border-warm-sand-beige">
                                      <div className="bg-soft-bronze/5 border-l-3 border-soft-bronze rounded-r p-2">
                                        <p className="text-xs font-bold text-soft-bronze mb-1">
                                          💬 Trainer Feedback
                                        </p>
                                        <p className="text-xs text-charcoal-black leading-relaxed">
                                          {workout.trainerComment}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
