import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientPrograms } from '@/entities';
import { Play, ChevronDown } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function MyProgramPage() {
  const { member } = useMember();
  const [programs, setPrograms] = useState<ClientPrograms[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">My Personalized Program</h1>
        <p className="text-soft-white/90">
          Follow your customized workout plan designed specifically for your goals
        </p>
      </div>

      {/* Program Overview */}
      {programs.length > 0 && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
            {programs[0]?.programTitle || 'Your Program'}
          </h2>
          {programs[0]?.sessionTitle && (
            <p className="text-warm-grey mb-6">
              Session: {programs[0].sessionTitle}
            </p>
          )}
          <p className="text-charcoal-black">
            Total Exercises: <span className="font-bold">{programs.length}</span>
          </p>
        </div>
      )}

      {/* Workout Days */}
      <div className="space-y-4">
        {workoutDays.length > 0 ? (
          workoutDays.map((day) => (
            <div key={day} className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden">
              {/* Day Header */}
              <button
                onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-warm-sand-beige/30 transition-colors"
              >
                <h3 className="font-heading text-xl font-bold text-charcoal-black">
                  {day}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-warm-grey text-sm">
                    {groupedPrograms[day].length} exercises
                  </span>
                  <ChevronDown
                    size={24}
                    className={`text-soft-bronze transition-transform ${
                      expandedDay === day ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Exercises List */}
              {expandedDay === day && (
                <div className="border-t border-warm-sand-beige px-8 py-6 space-y-6">
                  {groupedPrograms[day].map((exercise, idx) => (
                    <div key={exercise._id} className="pb-6 border-b border-warm-sand-beige last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                            {idx + 1}. {exercise.exerciseName}
                          </h4>
                          <div className="flex flex-wrap gap-4 text-sm">
                            {exercise.sets && (
                              <span className="text-warm-grey">
                                <span className="font-bold text-charcoal-black">{exercise.sets}</span> sets
                              </span>
                            )}
                            {exercise.reps && (
                              <span className="text-warm-grey">
                                <span className="font-bold text-charcoal-black">{exercise.reps}</span> reps
                              </span>
                            )}
                            {exercise.weightOrResistance && (
                              <span className="text-warm-grey">
                                <span className="font-bold text-charcoal-black">{exercise.weightOrResistance}</span>
                              </span>
                            )}
                            {exercise.tempo && (
                              <span className="text-warm-grey">
                                Tempo: <span className="font-bold text-charcoal-black">{exercise.tempo}</span>
                              </span>
                            )}
                            {exercise.restTimeSeconds && (
                              <span className="text-warm-grey">
                                Rest: <span className="font-bold text-charcoal-black">{exercise.restTimeSeconds}s</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {exercise.exerciseNotes && (
                        <div className="mb-4 p-4 bg-warm-sand-beige/30 rounded-lg">
                          <p className="text-sm text-charcoal-black">
                            <span className="font-bold">Notes:</span> {exercise.exerciseNotes}
                          </p>
                        </div>
                      )}

                      {exercise.exerciseVideoUrl && (
                        <a
                          href={exercise.exerciseVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-soft-bronze hover:text-soft-bronze/80 transition-colors font-medium"
                        >
                          <Play size={16} />
                          Watch Exercise Video
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <p className="text-warm-grey">
              Your personalized program will be added soon. Check back later!
            </p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8">
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
