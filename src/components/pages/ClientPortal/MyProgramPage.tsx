import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientPrograms, ClientAssignedWorkouts, WeeklyCoachesNotes } from '@/entities';
import { Play, ChevronDown, ChevronUp, CheckCircle2, Clock, Dumbbell, Target, ArrowRight, Volume2, AlertCircle, MessageCircle, Zap, Info } from 'lucide-react';
import { Image } from '@/components/ui/image';
import PostWorkoutFeedbackPrompt from '@/components/ClientPortal/PostWorkoutFeedbackPrompt';
import ProgramCompletionRing from '@/components/ClientPortal/ProgramCompletionRing';
import { recordWorkoutCompletion } from '@/lib/adherence-tracking';
import { 
  getActiveWorkoutsForCurrentWeek, 
  formatWeekDisplay, 
  getDaysSinceUpdate,
  getWeekStartDate 
} from '@/lib/workout-assignment-service';

interface WorkoutSession {
  day: string;
  exercises: ClientPrograms[];
  estimatedTime: number;
  completed: boolean;
}

interface SetState {
  setNumber: number;
  completed: boolean;
  usedWeight?: string;
}

interface ExerciseSetState {
  [exerciseId: string]: SetState[];
}

interface ExerciseCompleteState {
  [exerciseId: string]: boolean;
}

export default function MyProgramPage() {
  const { member } = useMember();
  const [programs, setPrograms] = useState<ClientPrograms[]>([]);
  const [assignedWorkouts, setAssignedWorkouts] = useState<ClientAssignedWorkouts[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<string | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [exerciseSetStates, setExerciseSetStates] = useState<ExerciseSetState>({});
  const [restingExerciseId, setRestingExerciseId] = useState<string | null>(null);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [workoutActivityId, setWorkoutActivityId] = useState<string>('');
  const [sessionCompleteMessage, setSessionCompleteMessage] = useState(false);
  const [exerciseCompleteStates, setExerciseCompleteStates] = useState<ExerciseCompleteState>({});
  const [expandedWeightInputs, setExpandedWeightInputs] = useState<Set<string>>(new Set());
  const [showCompletionRing, setShowCompletionRing] = useState(false);
  const [ringAnimationTrigger, setRingAnimationTrigger] = useState(false);
  const [useNewSystem, setUseNewSystem] = useState(false);
  const [weeklyCoachNote, setWeeklyCoachNote] = useState<WeeklyCoachesNotes | null>(null);

  // Rest timer effect
  useEffect(() => {
    if (restingExerciseId === null || restTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev <= 1) {
          setRestingExerciseId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restingExerciseId, restTimeRemaining]);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!member?._id) return;

      try {
        // Try to fetch from new system first
        const { items: assignedItems } = await BaseCrudService.getAll<ClientAssignedWorkouts>('clientassignedworkouts');
        const activeWorkouts = await getActiveWorkoutsForCurrentWeek(member._id);
        
        if (activeWorkouts.length > 0) {
          setAssignedWorkouts(activeWorkouts);
          setUseNewSystem(true);
          setLoading(false);
          return;
        }
        
        // Fall back to legacy system - fetch ALL items without filtering
        // The clientprograms collection doesn't have owner filtering, so we get all items
        const { items } = await BaseCrudService.getAll<ClientPrograms>('clientprograms');
        
        console.log('[MyProgramPage] Fetched clientprograms:', items.length, 'items');
        console.log('[MyProgramPage] Current member ID:', member._id);
        
        // IMPORTANT: clientprograms collection doesn't have a clientId field to filter by
        // All programs are shown to all clients - this is the legacy system behavior
        // Programs are identified by programTitle, not by client assignment
        
        // Group by workout day
        const grouped = items.reduce((acc, program) => {
          const day = program.workoutDay || 'Unassigned';
          if (!acc[day]) acc[day] = [];
          acc[day].push(program);
          return acc;
        }, {} as Record<string, ClientPrograms[]>);

        // Sort exercises within each day by order
        Object.keys(grouped).forEach(day => {
          grouped[day].sort((a, b) => (a.exerciseOrder || 0) - (b.exerciseOrder || 0));
        });

        setPrograms(items);

        // Initialize set states for all exercises
        const initialSetStates: ExerciseSetState = {};
        items.forEach(exercise => {
          if (exercise._id && exercise.sets) {
            initialSetStates[exercise._id] = Array.from({ length: exercise.sets }, (_, i) => ({
              setNumber: i + 1,
              completed: false,
            }));
          }
        });
        setExerciseSetStates(initialSetStates);
        setUseNewSystem(false);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [member?._id]);

  const handleSetComplete = (exerciseId: string, setNumber: number, restTime: number, totalSets: number) => {
    // Mark set as completed
    setExerciseSetStates(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(s =>
        s.setNumber === setNumber ? { ...s, completed: true } : s
      ),
    }));

    // Check if all sets are complete
    const updatedStates = exerciseSetStates[exerciseId].map(s =>
      s.setNumber === setNumber ? { ...s, completed: true } : s
    );
    const allComplete = updatedStates.every(s => s.completed);
    
    if (allComplete) {
      // Show exercise complete message
      setExerciseCompleteStates(prev => ({
        ...prev,
        [exerciseId]: true,
      }));
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setExerciseCompleteStates(prev => ({
          ...prev,
          [exerciseId]: false,
        }));
      }, 2000);
    } else {
      // Start rest timer
      setRestingExerciseId(exerciseId);
      setRestTimeRemaining(restTime);
    }
  };

  const handleWeightInputChange = (exerciseId: string, setNumber: number, weight: string) => {
    setExerciseSetStates(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(s =>
        s.setNumber === setNumber ? { ...s, usedWeight: weight } : s
      ),
    }));
  };

  const toggleWeightInput = (weightKey: string) => {
    setExpandedWeightInputs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weightKey)) {
        newSet.delete(weightKey);
      } else {
        newSet.add(weightKey);
      }
      return newSet;
    });
  };

  const handleWorkoutComplete = async (day: string) => {
    try {
      const activityId = crypto.randomUUID();
      setWorkoutActivityId(activityId);

      // Record workout completion
      await recordWorkoutCompletion(
        member?._id || '',
        programs[0]?.programTitle || '',
        day
      );

      setCompletedWorkouts(new Set([...completedWorkouts, day]));
      
      // Trigger completion ring animation
      setShowCompletionRing(true);
      setRingAnimationTrigger(true);
      
      setSessionCompleteMessage(true);

      // Show feedback prompt after 2.5 seconds (after ring animation)
      setTimeout(() => {
        setSessionCompleteMessage(false);
        setShowFeedback(true);
        setShowCompletionRing(false);
        setRingAnimationTrigger(false);
      }, 2500);
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading your program...</p>
      </div>
    );
  }

  // NEW SYSTEM: Render assigned workouts
  if (useNewSystem && assignedWorkouts.length > 0) {
    const weekStart = getWeekStartDate();
    const weekDisplay = formatWeekDisplay(weekStart);
    
    // Group workouts by week number
    const workoutsByWeek = assignedWorkouts.reduce((acc, workout) => {
      const week = workout.weekNumber || 1;
      if (!acc[week]) acc[week] = [];
      acc[week].push(workout);
      return acc;
    }, {} as Record<number, typeof assignedWorkouts>);
    
    // Sort weeks
    const sortedWeeks = Object.keys(workoutsByWeek).map(Number).sort((a, b) => a - b);
    
    // Find next incomplete workout across all weeks
    const nextWorkout = assignedWorkouts.find(w => !completedWorkouts.has(w._id || ''));
    const nextWorkoutSlot = nextWorkout?.workoutSlot || null;
    const allWorkoutsComplete = !nextWorkout;
    
    return (
      <div className="space-y-8 bg-warm-sand-beige/40 min-h-screen p-6 lg:p-8 rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
          <h1 className="font-heading text-4xl font-bold mb-2">My Personalized Program</h1>
          <p className="text-soft-white/90">
            {weekDisplay} • Follow your customized workout plan designed specifically for your goals
          </p>
        </div>

        {/* Next Workout Card */}
        {allWorkoutsComplete ? (
          <div className="bg-gradient-to-r from-green-50 to-green-50/80 border-2 border-green-200 rounded-2xl p-8 lg:p-10 text-center">
            <div className="text-5xl mb-4">👏</div>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-black mb-2">
              You're All Caught Up!
            </h2>
            <p className="font-paragraph text-lg text-warm-grey">
              Great work! You've completed all your assigned workouts. Rest and recover, and check back for new assignments.
            </p>
          </div>
        ) : nextWorkout ? (
          <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/90 rounded-2xl p-6 lg:p-8 text-soft-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Content */}
              <div className="flex-1">
                <p className="font-paragraph text-sm lg:text-base text-soft-white/80 mb-2">
                  Your Next Workout • Week {nextWorkout.weekNumber || 1}
                </p>
                <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
                  {nextWorkout.exerciseName}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-2xl font-bold">
                      Workout {nextWorkoutSlot}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span className="font-paragraph text-base">
                      Estimated time: 30–35 min
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Button */}
              <button
                onClick={() => {
                  setActiveWorkoutDay(nextWorkout._id || null);
                  setExpandedDay(nextWorkout._id || null);
                }}
                className="w-full lg:w-auto bg-soft-white text-soft-bronze px-8 py-4 rounded-lg font-heading text-lg font-bold hover:bg-soft-white/90 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                [ Start Workout ]
              </button>
            </div>
          </div>
        ) : null}

        {/* Workouts Organized by Week */}
        {sortedWeeks.map((weekNum) => {
          const weekWorkouts = workoutsByWeek[weekNum];
          
          return (
            <div key={weekNum} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8">
              <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                Week {weekNum} Workouts
              </h2>
              
              {/* Week Overview Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                {weekWorkouts.map((workout) => {
                  const isCompleted = completedWorkouts.has(workout._id || '');
                  return (
                    <div
                      key={workout._id}
                      className={`flex flex-col items-center text-center p-4 rounded-xl transition-all ${
                        isCompleted
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-soft-bronze/10 border border-soft-bronze/30'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="font-heading text-2xl font-bold text-charcoal-black">
                          Workout {workout.workoutSlot}
                        </div>
                        {isCompleted && (
                          <CheckCircle2 size={24} className="text-green-600" />
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${isCompleted ? 'text-green-700 font-medium' : 'text-warm-grey'}`}>
                        {isCompleted ? '✓ Completed' : workout.exerciseName || 'Workout'}
                      </p>
                      <p className="text-xs text-warm-grey/60">
                        {getDaysSinceUpdate(workout._updatedDate)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Workout Cards for this week */}
              <div className="space-y-4">
                {weekWorkouts.map((workout, idx) => {
                  const workoutSlot = workout.workoutSlot || idx + 1;
                  const isExpanded = expandedDay === workout._id;
                  const isActive = activeWorkoutDay === workout._id;
                  const isCompleted = completedWorkouts.has(workout._id || '');

                  return (
                    <div
                      key={workout._id}
                      className={`bg-soft-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                        isActive
                          ? 'border-soft-bronze shadow-lg'
                          : isCompleted
                          ? 'border-green-200 bg-green-50/30'
                          : 'border-warm-sand-beige'
                      }`}
                    >
                {/* Workout Card Header */}
                <button
                  onClick={() => {
                    setExpandedDay(isExpanded ? null : workout._id || null);
                    setActiveWorkoutDay(isExpanded ? null : workout._id || null);
                  }}
                  className={`w-full px-6 lg:px-8 py-5 lg:py-6 flex items-center justify-between transition-all duration-300 ${
                    isActive
                      ? 'bg-soft-bronze text-soft-white'
                      : 'hover:bg-soft-bronze hover:text-soft-white'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-heading text-lg lg:text-xl font-bold ${
                        isActive ? 'text-soft-white' : 'text-charcoal-black'
                      }`}>
                        Workout {workoutSlot}
                      </h3>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isActive ? 'text-soft-white/80' : 'text-warm-grey'}`}>
                      {workout.exerciseName} • {getDaysSinceUpdate(workout._updatedDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {!isExpanded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveWorkoutDay(workout._id || null);
                          setExpandedDay(workout._id || null);
                        }}
                        className="hidden sm:flex items-center gap-2 bg-soft-bronze text-soft-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-soft-bronze/90 transition-colors whitespace-nowrap"
                      >
                        Start Workout <ArrowRight size={16} />
                      </button>
                    )}
                    <ChevronDown
                      size={24}
                      className={`${isActive ? 'text-soft-white' : 'text-soft-bronze'} transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Mobile Start Button */}
                {!isExpanded && (
                  <div className="sm:hidden px-6 py-3 border-t border-warm-sand-beige">
                    <button
                      onClick={() => {
                        setActiveWorkoutDay(workout._id || null);
                        setExpandedDay(workout._id || null);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-soft-bronze text-soft-white px-4 py-3 rounded-lg font-bold text-base hover:bg-soft-bronze/90 transition-colors"
                    >
                      Start Workout <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {/* Expanded Workout Details */}
                {isExpanded && (
                  <div className="border-t border-warm-sand-beige px-6 lg:px-8 py-6 space-y-6">
                    {/* Session Overview */}
                    <div className="bg-soft-bronze/5 border border-soft-bronze/20 rounded-xl p-5 space-y-4">
                      <h3 className="font-heading text-lg font-bold text-charcoal-black flex items-center gap-2">
                        <Zap size={20} className="text-soft-bronze" />
                        Session Overview
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-warm-grey mb-1">Focus</p>
                          <p className="font-bold text-sm text-charcoal-black">Full Body Strength</p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-grey mb-1">Duration</p>
                          <p className="font-bold text-sm text-charcoal-black">30-35 min</p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-grey mb-1">Intensity</p>
                          <p className="font-bold text-sm text-charcoal-black">Moderate</p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-grey mb-1">Equipment</p>
                          <p className="font-bold text-sm text-charcoal-black">{workout.weightOrResistance || 'Bodyweight'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Exercise Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-heading text-xl font-bold text-charcoal-black mb-1">
                          {workout.exerciseName}
                        </h4>
                        <p className="text-sm text-soft-bronze font-medium">
                          Targets: Primary muscle groups
                        </p>
                      </div>

                      {/* Clear Instruction Block */}
                      <div className="bg-warm-sand-beige/30 border-l-4 border-soft-bronze rounded-r-lg p-4">
                        <div className="flex items-start gap-2">
                          <Info size={18} className="text-soft-bronze flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-sm text-charcoal-black mb-1">How to perform:</p>
                            <p className="text-sm text-charcoal-black leading-relaxed">
                              Complete all sets with controlled movement. Rest between sets as indicated. Focus on form over speed.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sets x Reps with Enhanced Visual Hierarchy */}
                      <div className="flex flex-wrap gap-4 text-base">
                        {workout.sets && (
                          <div className="flex items-center gap-2">
                            <span className="text-warm-grey">Sets × Reps:</span>
                            <span className="font-bold text-xl text-charcoal-black">
                              {workout.sets} × {workout.reps}
                            </span>
                          </div>
                        )}
                        {workout.weightOrResistance && (
                          <div className="flex items-center gap-2">
                            <span className="text-warm-grey">Weight:</span>
                            <span className="font-bold text-lg text-charcoal-black">
                              {workout.weightOrResistance}
                            </span>
                          </div>
                        )}
                        {workout.restTimeSeconds && (
                          <div className="flex items-center gap-2">
                            <span className="text-warm-grey">Rest:</span>
                            <span className="font-bold text-lg text-charcoal-black">
                              {workout.restTimeSeconds}s
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Simplified Progression Text */}
                      <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg p-3">
                        <p className="text-sm text-charcoal-black font-medium">
                          <span className="font-bold">Progression:</span> When you complete all reps with good form, increase weight by 2.5-5kg next session.
                        </p>
                      </div>

                      {/* Coach Guidance with Consistent Icon */}
                      {workout.exerciseNotes && (
                        <div className="bg-warm-sand-beige/40 border-l-4 border-muted-rose rounded-r-lg p-4">
                          <div className="flex items-start gap-2">
                            <MessageCircle size={18} className="text-muted-rose flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-sm text-charcoal-black mb-1">Coach's tip:</p>
                              <p className="text-sm text-charcoal-black leading-relaxed">{workout.exerciseNotes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {workout.exerciseVideoUrl && (
                        <a
                          href={workout.exerciseVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-charcoal-black text-soft-white px-5 py-3 rounded-lg font-bold text-sm hover:bg-soft-bronze transition-colors"
                        >
                          <Play size={18} />
                          Watch Form Demo (30s)
                        </a>
                      )}
                    </div>

                    {/* Completion Button */}
                    <div className="pt-6 border-t border-warm-sand-beige">
                      <button
                        onClick={() => {
                          setCompletedWorkouts(new Set([...completedWorkouts, workout._id || '']));
                          setShowCompletionRing(true);
                          setRingAnimationTrigger(true);
                        }}
                        disabled={isCompleted}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-base transition-all ${
                          isCompleted
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-soft-bronze text-soft-white hover:bg-soft-bronze/90'
                        }`}
                      >
                        <CheckCircle2 size={20} />
                        {isCompleted ? 'Workout Completed!' : '✓ Mark Workout Complete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Group programs by workout day
  const groupedPrograms = programs.reduce((acc, program) => {
    const day = program.workoutDay || 'Unassigned';
    if (!acc[day]) acc[day] = [];
    acc[day].push(program);
    return acc;
  }, {} as Record<string, ClientPrograms[]>);

  // Sort each day's exercises
  Object.keys(groupedPrograms).forEach(day => {
    groupedPrograms[day].sort((a, b) => (a.exerciseOrder || 0) - (b.exerciseOrder || 0));
  });

  const workoutDays = Object.keys(groupedPrograms).sort();
  
  // Create a mapping of day to workout number for display
  const workoutNumberMap = new Map<string, number>();
  workoutDays.forEach((day, index) => {
    workoutNumberMap.set(day, index + 1);
  });

  // Calculate workout overview stats
  const totalExercises = programs.length;
  const estimatedSessionTime = Math.ceil((totalExercises * 3 + 5) / 5) * 5;
  const weeklyFrequency = workoutDays.length;
  
  // Get unique equipment from all exercises
  const equipmentSet = new Set<string>();
  programs.forEach(p => {
    if (p.weightOrResistance) {
      equipmentSet.add(p.weightOrResistance);
    }
  });
  const equipment = Array.from(equipmentSet).join(' + ') || 'Bodyweight';

  // Get training focus from program title
  const trainingFocus = programs[0]?.programTitle || 'Full-body strength';

  return (
    <div className="space-y-8 bg-warm-sand-beige/40 min-h-screen p-6 lg:p-8 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">My Personalized Program</h1>
        <p className="text-soft-white/90">
          Follow your customized workout plan designed specifically for your goals
        </p>
      </div>

      {/* Workout Overview Section */}
      {programs.length > 0 && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Progress Ring - Left Side */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="w-full max-w-xs">
                <ProgramCompletionRing
                  completedWorkouts={completedWorkouts.size}
                  totalWorkouts={workoutDays.length}
                  compact={true}
                />
              </div>
            </div>

            {/* Stats Grid - Right Side */}
            <div className="lg:col-span-4">
              <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                Workout Overview
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Session Length */}
                <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
                  <Clock className="w-6 h-6 text-soft-bronze mb-2" />
                  <p className="text-sm text-warm-grey mb-1">Session Length</p>
                  <p className="font-heading text-2xl font-bold text-charcoal-black">
                    {estimatedSessionTime}–{estimatedSessionTime + 5} min
                  </p>
                </div>

                {/* Weekly Frequency */}
                <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
                  <Target className="w-6 h-6 text-soft-bronze mb-2" />
                  <p className="text-sm text-warm-grey mb-1\">Weekly Frequency</p>
                  <p className="font-heading text-2xl font-bold text-charcoal-black">
                    {weeklyFrequency}x per week
                  </p>
                </div>

                {/* Equipment Needed */}
                <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
                  <Dumbbell className="w-6 h-6 text-soft-bronze mb-2" />
                  <p className="text-sm text-warm-grey mb-1">Equipment</p>
                  <p className="font-heading text-sm font-bold text-charcoal-black">
                    {equipment}
                  </p>
                </div>

                {/* Training Focus */}
                <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-soft-bronze mb-2" />
                  <p className="text-sm text-warm-grey mb-1">Training Focus</p>
                  <p className="font-heading text-sm font-bold text-charcoal-black">
                    {trainingFocus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Days as Cards */}
      <div className="space-y-4">
        {workoutDays.length > 0 ? (
          workoutDays.map((day, dayIndex) => {
            const dayExercises = groupedPrograms[day];
            const isExpanded = expandedDay === day;
            const isActive = activeWorkoutDay === day;
            const isCompleted = completedWorkouts.has(day);
            const workoutNumber = workoutNumberMap.get(day) || dayIndex + 1;

            return (
              <div
                key={day}
                className={`bg-soft-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isActive
                    ? 'border-soft-bronze shadow-lg'
                    : isCompleted
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-warm-sand-beige'
                }`}
              >
                {/* Workout Card Header */}
                <button
                  onClick={() => {
                    setExpandedDay(isExpanded ? null : day);
                    setActiveWorkoutDay(isExpanded ? null : day);
                  }}
                  className={`w-full px-6 lg:px-8 py-5 lg:py-6 flex items-center justify-between transition-all duration-300 ${
                    isActive
                      ? 'bg-soft-bronze text-soft-white'
                      : 'hover:bg-soft-bronze hover:text-soft-white'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-heading text-lg lg:text-xl font-bold ${
                        isActive ? 'text-soft-white' : 'text-charcoal-black'
                      }`}>
                        Workout {workoutNumber}
                      </h3>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isActive ? 'text-soft-white/80' : 'text-warm-grey'}`}>
                      {dayExercises.length} exercises • {estimatedSessionTime}–{estimatedSessionTime + 5} min
                      {day !== 'Unassigned' && (
                        <span className={`ml-2 ${isActive ? 'text-soft-white/60' : 'text-warm-grey/60'}`}>
                          ({day})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {!isExpanded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveWorkoutDay(day);
                          setExpandedDay(day);
                        }}
                        className="hidden sm:flex items-center gap-2 bg-soft-bronze text-soft-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-soft-bronze/90 transition-colors whitespace-nowrap"
                      >
                        Start Workout <ArrowRight size={16} />
                      </button>
                    )}
                    <ChevronDown
                      size={24}
                      className={`${isActive ? 'text-soft-white' : 'text-soft-bronze'} transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Mobile Start Button */}
                {!isExpanded && (
                  <div className="sm:hidden px-6 py-3 border-t border-warm-sand-beige">
                    <button
                      onClick={() => {
                        setActiveWorkoutDay(day);
                        setExpandedDay(day);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-soft-bronze text-soft-white px-4 py-3 rounded-lg font-bold text-base hover:bg-soft-bronze/90 transition-colors"
                    >
                      Start Workout <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {/* Exercises List */}
                {isExpanded && (
                  <div className="border-t border-warm-sand-beige px-6 lg:px-8 py-6 space-y-6">
                    {/* Session Overview */}
                    <div className="bg-soft-bronze/5 border border-soft-bronze/20 rounded-xl p-5 space-y-4">
                      <h3 className="font-heading text-lg font-bold text-charcoal-black flex items-center gap-2">
                        <Zap size={20} className="text-soft-bronze" />
                        Session Overview
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-warm-grey mb-1">Focus</p>
                          <p className="font-bold text-sm text-charcoal-black">{trainingFocus}</p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-grey mb-1">Duration</p>
                          <p className="font-bold text-sm text-charcoal-black">{estimatedSessionTime}-{estimatedSessionTime + 5} min</p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-grey mb-1">Intensity</p>
                          <p className="font-bold text-sm text-charcoal-black">Moderate-High</p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-grey mb-1">Equipment</p>
                          <p className="font-bold text-sm text-charcoal-black">{equipment}</p>
                        </div>
                      </div>
                    </div>

                    {/* Workout Progress Indicator */}
                    <div className="flex items-center gap-3 pb-4 border-b border-warm-sand-beige">
                      <div className="flex-1 h-2 bg-warm-sand-beige rounded-full overflow-hidden">
                        <div
                          className="h-full bg-soft-bronze transition-all duration-300"
                          style={{ width: '0%' }}
                        />
                      </div>
                      <span className="text-sm font-medium text-warm-grey whitespace-nowrap">
                        Exercise 1 of {dayExercises.length}
                      </span>
                    </div>

                    {dayExercises.map((exercise, idx) => {
                      const setStates = exerciseSetStates[exercise._id || ''] || [];
                      const isResting = restingExerciseId === exercise._id;
                      const repRange = exercise.reps ? `${Math.max(1, exercise.reps - 2)}-${exercise.reps}` : exercise.reps;

                      return (
                        <div
                          key={exercise._id}
                          className="pb-6 border-b border-warm-sand-beige last:border-b-0 last:pb-0"
                        >
                          {/* Exercise Header */}
                          <div className="mb-4">
                            <h4 className="font-heading text-xl font-bold text-charcoal-black mb-1">
                              {idx + 1}. {exercise.exerciseName}
                            </h4>
                            <p className="text-sm text-soft-bronze font-medium">
                              Focus: {exercise.exerciseNotes?.split('.')[0] || 'Strength building'}
                            </p>
                          </div>

                          {/* Clear Instruction Block */}
                          <div className="bg-warm-sand-beige/30 border-l-4 border-soft-bronze rounded-r-lg p-4 mb-4">
                            <div className="flex items-start gap-2">
                              <Info size={18} className="text-soft-bronze flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-sm text-charcoal-black mb-1">How to perform:</p>
                                <p className="text-sm text-charcoal-black leading-relaxed">
                                  Complete all sets with controlled movement. Rest {exercise.restTimeSeconds || 60}s between sets. Focus on maintaining proper form throughout.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Core Exercise Info with Enhanced Visual Hierarchy */}
                          <div className="flex flex-wrap gap-4 text-base mb-4">
                            {exercise.sets && (
                              <div className="flex items-center gap-2">
                                <span className="text-warm-grey">Sets × Reps:</span>
                                <span className="font-bold text-xl text-charcoal-black">
                                  {exercise.sets} × {repRange}
                                </span>
                              </div>
                            )}
                            {exercise.weightOrResistance && (
                              <div className="flex items-center gap-2">
                                <span className="text-warm-grey">Weight:</span>
                                <span className="font-bold text-lg text-charcoal-black">
                                  {exercise.weightOrResistance}
                                </span>
                              </div>
                            )}
                            {exercise.restTimeSeconds && (
                              <div className="flex items-center gap-2">
                                <span className="text-warm-grey">Rest:</span>
                                <span className="font-bold text-lg text-charcoal-black">
                                  {exercise.restTimeSeconds}s
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Simplified Progression Text */}
                          <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg p-3 mb-4">
                            <p className="text-sm text-charcoal-black font-medium">
                              <span className="font-bold">Progression:</span> When you complete all reps with good form, increase weight by 2.5-5kg next session.
                            </p>
                          </div>

                          {/* Coach Note with Consistent Icon */}
                          {exercise.exerciseNotes && (
                            <div className="bg-warm-sand-beige/40 border-l-4 border-muted-rose rounded-r-lg p-4 mb-4">
                              <div className="flex items-start gap-2">
                                <MessageCircle size={18} className="text-muted-rose flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-sm text-charcoal-black mb-1">Coach's tip:</p>
                                  <p className="text-sm text-charcoal-black leading-relaxed">{exercise.exerciseNotes}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Video Demo Button */}
                          {exercise.exerciseVideoUrl && (
                            <div className="mb-4">
                              <a
                                href={exercise.exerciseVideoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-charcoal-black text-soft-white px-5 py-3 rounded-lg font-bold text-sm hover:bg-soft-bronze transition-colors"
                              >
                                <Play size={18} />
                                Watch Form Demo (30s)
                              </a>
                            </div>
                          )}

                          {/* Interactive Sets Display with Improved Weight Logging */}
                          <div className="mb-4">
                            <p className="text-xs font-medium text-warm-grey mb-3 uppercase tracking-wide">Tap each set to mark complete</p>
                            
                            {/* Optional: Log one weight for all sets */}
                            {setStates.length > 0 && !setStates.every(s => s.completed) && (
                              <div className="mb-3 p-3 bg-soft-bronze/5 border border-soft-bronze/20 rounded-lg">
                                <label className="block text-xs font-medium text-warm-grey mb-2">
                                  Weight used (applies to all sets):
                                </label>
                                <input
                                  type="text"
                                  placeholder={exercise.weightOrResistance || 'e.g., 20kg'}
                                  onChange={(e) => {
                                    // Auto-fill all sets with the same weight
                                    setStates.forEach(set => {
                                      handleWeightInputChange(exercise._id || '', set.setNumber, e.target.value);
                                    });
                                  }}
                                  className="w-full px-3 py-2 text-sm rounded border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              {setStates.map((set) => (
                                <div key={set.setNumber}>
                                  <button
                                    onClick={() => {
                                      if (!set.completed && !isResting) {
                                        handleSetComplete(exercise._id || '', set.setNumber, exercise.restTimeSeconds || 60, exercise.sets || 0);
                                      }
                                    }}
                                    disabled={isResting || set.completed}
                                    className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                                      set.completed
                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                        : isResting
                                        ? 'bg-warm-sand-beige/30 text-warm-grey border border-warm-sand-beige cursor-not-allowed'
                                        : 'bg-soft-bronze text-soft-white border border-soft-bronze hover:bg-soft-bronze/90 active:scale-95'
                                    }`}
                                  >
                                    {set.completed ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <CheckCircle2 size={16} />
                                        Set {set.setNumber} Complete {set.usedWeight && `• ${set.usedWeight}`}
                                      </span>
                                    ) : isResting ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <Clock size={16} className="animate-spin" />
                                        Rest {restTimeRemaining}s
                                      </span>
                                    ) : (
                                      `Set ${set.setNumber}`
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Exercise Complete Feedback */}
                          {exerciseCompleteStates[exercise._id || ''] && (
                            <div className="mb-4 text-center py-4 px-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in">
                              <p className="font-heading text-lg font-bold text-green-700">
                                Exercise complete — nice work 💪
                              </p>
                            </div>
                          )}

                          {/* Technique Tips Collapsible */}
                          {exercise.tempo && (
                            <div className="mb-4">
                              <button
                                onClick={() =>
                                  setExpandedExercise(
                                    expandedExercise === exercise._id ? null : exercise._id
                                  )
                                }
                                className="w-full flex items-center justify-between p-3 bg-warm-sand-beige/20 rounded-lg hover:bg-warm-sand-beige/30 transition-colors"
                              >
                                <span className="font-medium text-sm text-charcoal-black flex items-center gap-2">
                                  <AlertCircle size={16} className="text-soft-bronze" />
                                  Advanced technique tips
                                </span>
                                <ChevronDown
                                  size={16}
                                  className={`text-soft-bronze transition-transform ${
                                    expandedExercise === exercise._id ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              {expandedExercise === exercise._id && (
                                <div className="mt-3 space-y-3 pl-3 border-l-2 border-soft-bronze/30">
                                  {exercise.tempo && (
                                    <div>
                                      <p className="text-xs text-warm-grey mb-1 font-medium">Tempo (movement speed)</p>
                                      <p className="text-sm text-charcoal-black">
                                        {exercise.tempo}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Workout Completion Action */}
                    <div className="mt-8 pt-6 border-t border-warm-sand-beige">
                      {showCompletionRing && (
                        <div className="mb-8 bg-warm-sand-beige/20 border border-warm-sand-beige rounded-2xl p-6">
                          <ProgramCompletionRing
                            completedWorkouts={completedWorkouts.size}
                            totalWorkouts={workoutDays.length}
                            showAnimation={ringAnimationTrigger}
                            onAnimationComplete={() => {
                              // Animation complete callback
                            }}
                          />
                        </div>
                      )}
                      
                      {sessionCompleteMessage ? (
                        <div className="text-center py-6">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="font-heading text-2xl font-bold text-charcoal-black">
                            Session complete — nice work 💪
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleWorkoutComplete(day)}
                          disabled={isCompleted}
                          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-base transition-all ${
                            isCompleted
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-soft-bronze text-soft-white hover:bg-soft-bronze/90'
                          }`}
                        >
                          <CheckCircle2 size={20} />
                          {isCompleted ? 'Workout Completed!' : '✓ Mark Workout Complete'}
                        </button>
                      )}
                      {isCompleted && !sessionCompleteMessage && (
                        <p className="text-center text-sm text-green-700 font-medium mt-3">
                          Great job — consistency builds confidence! 🔥
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-soft-bronze/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-soft-bronze" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-3">
                No Program Assigned Yet
              </h3>
              <p className="text-warm-grey mb-6">
                Your personalised training programme will be added by your coach soon. You'll be notified once it's ready!
              </p>
              <div className="text-sm text-warm-grey/80 italic">
                💡 In the meantime, check out your nutrition guidance and progress tracking sections
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-6 lg:p-8">
        <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
          Program Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">✓ Form First</h4>
            <p className="text-warm-grey">
              Always prioritize proper form over heavy weight. Quality reps build better results.
            </p>
          </div>
          <div>
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">✓ Rest Days Matter</h4>
            <p className="text-warm-grey">
              Recovery is when your body adapts. Don't skip rest days—they're part of your program.
            </p>
          </div>
          <div>
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">✓ Progressive Overload</h4>
            <p className="text-warm-grey">
              Gradually increase weight, reps, or sets each week to continue making progress.
            </p>
          </div>
          <div>
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">✓ Track Your Workouts</h4>
            <p className="text-warm-grey">
              Keep notes on how you felt and any modifications. This helps us adjust your program.
            </p>
          </div>
        </div>
      </div>

      {/* Post-Workout Feedback Modal */}
      {showFeedback && (
        <PostWorkoutFeedbackPrompt
          clientId={member?._id || ''}
          programId={programs[0]?.programTitle || ''}
          workoutActivityId={workoutActivityId}
          workoutTitle="Your Workout"
          onClose={() => {
            setShowFeedback(false);
            setActiveWorkoutDay(null);
            setExpandedDay(null);
          }}
          onSuccess={() => {
            // Optionally handle success
          }}
        />
      )}
    </div>
  );
}
