import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientPrograms } from '@/entities';
import { Play, ChevronDown, ChevronUp, CheckCircle2, Clock, Dumbbell, Target, ArrowRight } from 'lucide-react';
import { Image } from '@/components/ui/image';

interface WorkoutSession {
  day: string;
  exercises: ClientPrograms[];
  estimatedTime: number;
  completed: boolean;
}

export default function MyProgramPage() {
  const { member } = useMember();
  const [programs, setPrograms] = useState<ClientPrograms[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<string | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!member?._id) return;

      try {
        const { items } = await BaseCrudService.getAll<ClientPrograms>('clientprograms');
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
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [member?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading your program...</p>
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

  // Calculate workout overview stats
  const totalExercises = programs.length;
  const estimatedSessionTime = Math.ceil((totalExercises * 3 + 5) / 5) * 5; // Rough estimate: 3 mins per exercise + 5 min warmup
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
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-8">
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
              <p className="text-sm text-warm-grey mb-1">Weekly Frequency</p>
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
      )}

      {/* Workout Days as Cards */}
      <div className="space-y-4">
        {workoutDays.length > 0 ? (
          workoutDays.map((day, dayIndex) => {
            const dayExercises = groupedPrograms[day];
            const isExpanded = expandedDay === day;
            const isActive = activeWorkoutDay === day;
            const isCompleted = completedWorkouts.has(day);

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
                        {day}
                      </h3>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isActive ? 'text-soft-white/80' : 'text-warm-grey'}`}>
                      {dayExercises.length} exercises • {estimatedSessionTime}–{estimatedSessionTime + 5} min
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

                    {dayExercises.map((exercise, idx) => (
                      <div
                        key={exercise._id}
                        className="pb-6 border-b border-warm-sand-beige last:border-b-0 last:pb-0"
                      >
                        {/* Exercise Header with Toggle */}
                        <button
                          onClick={() =>
                            setExpandedExercise(
                              expandedExercise === exercise._id ? null : exercise._id
                            )
                          }
                          className="w-full text-left mb-4 group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-heading text-lg font-bold text-charcoal-black mb-3 group-hover:text-soft-bronze transition-colors">
                                {idx + 1}. {exercise.exerciseName}
                              </h4>

                              {/* Core Exercise Info (Always Visible) */}
                              <div className="flex flex-wrap gap-3 lg:gap-4 text-sm mb-3">
                                {exercise.sets && exercise.reps && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-warm-grey">Sets × Reps:</span>
                                    <span className="font-bold text-charcoal-black">
                                      {exercise.sets} × {exercise.reps}
                                    </span>
                                  </div>
                                )}
                                {exercise.weightOrResistance && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-warm-grey">Weight:</span>
                                    <span className="font-bold text-charcoal-black">
                                      {exercise.weightOrResistance}
                                    </span>
                                  </div>
                                )}
                                {exercise.restTimeSeconds && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-warm-grey">Rest:</span>
                                    <span className="font-bold text-charcoal-black">
                                      {exercise.restTimeSeconds}s
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Reassurance Copy */}
                              <p className="text-xs text-warm-grey italic">
                                Don't worry — focus on control rather than perfection.
                              </p>
                            </div>

                            {/* Expand Toggle */}
                            {(exercise.tempo || exercise.exerciseNotes) && (
                              <ChevronDown
                                size={20}
                                className={`text-soft-bronze transition-transform flex-shrink-0 mt-1 ${
                                  expandedExercise === exercise._id ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </div>
                        </button>

                        {/* Expandable Details */}
                        {expandedExercise === exercise._id && (
                          <div className="mt-4 pt-4 border-t border-warm-sand-beige/50 space-y-4">
                            {exercise.tempo && (
                              <div className="p-3 bg-warm-sand-beige/20 rounded-lg">
                                <p className="text-xs text-warm-grey mb-1">Tempo (movement speed)</p>
                                <p className="text-sm font-medium text-charcoal-black">
                                  {exercise.tempo}
                                </p>
                              </div>
                            )}

                            {exercise.exerciseNotes && (
                              <div className="p-3 bg-soft-bronze/5 rounded-lg border border-soft-bronze/20">
                                <p className="text-xs text-warm-grey mb-1 font-medium">Technique Tips</p>
                                <p className="text-sm text-charcoal-black leading-relaxed">
                                  {exercise.exerciseNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Video Button */}
                        {exercise.exerciseVideoUrl && (
                          <div className="mt-4">
                            <a
                              href={exercise.exerciseVideoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-charcoal-black text-soft-white px-4 py-3 rounded-lg font-medium text-sm hover:bg-soft-bronze transition-colors"
                            >
                              <Play size={16} />
                              Watch Exercise Video (short)
                            </a>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Workout Completion Action */}
                    <div className="mt-8 pt-6 border-t border-warm-sand-beige">
                      <button
                        onClick={() => {
                          setCompletedWorkouts(new Set([...completedWorkouts, day]));
                          setActiveWorkoutDay(null);
                          setExpandedDay(null);
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
                      {isCompleted && (
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
            <p className="text-warm-grey">
              Your personalized program will be added soon. Check back later!
            </p>
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
    </div>
  );
}
