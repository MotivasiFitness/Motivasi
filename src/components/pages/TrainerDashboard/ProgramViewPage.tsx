import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { ClientPrograms, FitnessPrograms } from '@/entities';
import { ChevronDown, ChevronUp, Edit2, Save, X, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkoutSession {
  day: string;
  exercises: ClientPrograms[];
}

export default function ProgramViewPage() {
  const { member } = useMember();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('id');

  const [program, setProgram] = useState<FitnessPrograms | null>(null);
  const [exercises, setExercises] = useState<ClientPrograms[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ClientPrograms | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ClientPrograms>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProgram();
  }, [programId, member?._id]);

  const loadProgram = async () => {
    if (!programId || !member?._id) return;

    try {
      setIsLoading(true);

      // Load the program
      const programData = await BaseCrudService.getById<FitnessPrograms>('programs', programId);
      
      // Verify trainer owns this program
      if (programData?.trainerId !== member._id) {
        navigate('/trainer/programs-created');
        return;
      }

      setProgram(programData);

      // Load all exercises for this program
      const { items: allExercises } = await BaseCrudService.getAll<ClientPrograms>('clientprograms');
      const programExercises = allExercises.filter(e => {
        // Match exercises by program title or other identifiers
        return e.programTitle === programData?.programName;
      });

      setExercises(programExercises);
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupExercisesByDay = (): WorkoutSession[] => {
    const grouped: { [key: string]: ClientPrograms[] } = {};

    exercises.forEach(exercise => {
      const day = exercise.workoutDay || 'Unassigned';
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(exercise);
    });

    return Object.entries(grouped).map(([day, exs]) => ({
      day,
      exercises: exs.sort((a, b) => (a.exerciseOrder || 0) - (b.exerciseOrder || 0)),
    }));
  };

  const handleEditExercise = (exercise: ClientPrograms) => {
    setEditingExercise(exercise);
    setEditFormData({ ...exercise });
  };

  const handleSaveExercise = async () => {
    if (!editingExercise) return;

    try {
      setIsSaving(true);
      await BaseCrudService.update('clientprograms', {
        _id: editingExercise._id,
        ...editFormData,
      });

      // Update local state
      setExercises(exercises.map(e => 
        e._id === editingExercise._id ? { ...e, ...editFormData } : e
      ));

      setEditingExercise(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error saving exercise:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
    setEditFormData({});
  };

  const workoutSessions = groupExercisesByDay();

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12 min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-8 lg:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-warm-grey mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-charcoal-black mb-4">
            Program Not Found
          </h1>
          <button
            onClick={() => navigate('/trainer/programs-created')}
            className="bg-charcoal-black text-soft-white px-8 py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors"
          >
            Back to Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 bg-soft-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/trainer/programs-created')}
            className="flex items-center gap-2 text-soft-bronze hover:text-soft-bronze/80 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-paragraph font-medium">Back</span>
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors"
          >
            <Edit2 size={20} />
            {editMode ? 'Done Editing' : 'Edit Program'}
          </button>
        </div>

        {/* Program Info */}
        <div className="bg-white border border-warm-sand-beige rounded-2xl p-8 mb-8">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-4">
            {program.programName || 'Untitled Program'}
          </h1>
          
          {program.description && (
            <p className="font-paragraph text-lg text-warm-grey mb-6">
              {program.description}
            </p>
          )}

          <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-warm-sand-beige">
            {program.duration && (
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-2">Duration</p>
                <p className="font-heading text-xl font-bold text-charcoal-black">
                  {program.duration}
                </p>
              </div>
            )}
            {program.focusArea && (
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-2">Focus Area</p>
                <p className="font-heading text-xl font-bold text-charcoal-black">
                  {program.focusArea}
                </p>
              </div>
            )}
            {program.status && (
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-2">Status</p>
                <p className="font-heading text-xl font-bold text-charcoal-black capitalize">
                  {program.status}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Workout Sessions */}
        <div className="space-y-6">
          {workoutSessions.length === 0 ? (
            <div className="bg-white border border-warm-sand-beige rounded-2xl p-12 text-center">
              <AlertCircle className="w-12 h-12 text-warm-grey mx-auto mb-4" />
              <p className="font-paragraph text-lg text-warm-grey">
                No exercises in this program yet
              </p>
            </div>
          ) : (
            workoutSessions.map((session, sessionIndex) => (
              <motion.div
                key={session.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sessionIndex * 0.1 }}
              >
                <div className="bg-white border border-warm-sand-beige rounded-2xl overflow-hidden">
                  {/* Day Header */}
                  <button
                    onClick={() => setExpandedDay(expandedDay === session.day ? null : session.day)}
                    className="w-full px-8 py-6 flex items-center justify-between hover:bg-soft-white transition-colors"
                  >
                    <div className="text-left">
                      <h2 className="font-heading text-2xl font-bold text-charcoal-black">
                        {session.day}
                      </h2>
                      <p className="font-paragraph text-sm text-warm-grey mt-1">
                        {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {expandedDay === session.day ? (
                      <ChevronUp className="text-soft-bronze" size={24} />
                    ) : (
                      <ChevronDown className="text-soft-bronze" size={24} />
                    )}
                  </button>

                  {/* Exercises */}
                  {expandedDay === session.day && (
                    <div className="border-t border-warm-sand-beige divide-y divide-warm-sand-beige">
                      {session.exercises.map((exercise, exerciseIndex) => (
                        <div key={exercise._id} className="p-8">
                          {editingExercise?._id === exercise._id ? (
                            // Edit Form
                            <div className="space-y-6">
                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Exercise Name
                                </label>
                                <input
                                  type="text"
                                  value={editFormData.exerciseName || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, exerciseName: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                />
                              </div>

                              <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                  <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                    Sets
                                  </label>
                                  <input
                                    type="number"
                                    value={editFormData.sets || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, sets: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  />
                                </div>
                                <div>
                                  <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                    Reps
                                  </label>
                                  <input
                                    type="number"
                                    value={editFormData.reps || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, reps: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  />
                                </div>
                                <div>
                                  <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                    Weight/Resistance
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.weightOrResistance || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, weightOrResistance: e.target.value })}
                                    className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  />
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                    Tempo
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.tempo || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, tempo: e.target.value })}
                                    className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  />
                                </div>
                                <div>
                                  <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                    Rest Time (seconds)
                                  </label>
                                  <input
                                    type="number"
                                    value={editFormData.restTimeSeconds || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, restTimeSeconds: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Primary Muscles
                                </label>
                                <input
                                  type="text"
                                  value={editFormData.primaryMuscles || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, primaryMuscles: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Secondary Muscles
                                </label>
                                <input
                                  type="text"
                                  value={editFormData.secondaryMuscles || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, secondaryMuscles: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Coach Cue
                                </label>
                                <textarea
                                  value={editFormData.coachCue || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, coachCue: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Exercise Notes
                                </label>
                                <textarea
                                  value={editFormData.exerciseNotes || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, exerciseNotes: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  rows={3}
                                />
                              </div>

                              <div className="flex gap-3 justify-end pt-4 border-t border-warm-sand-beige">
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center gap-2 px-6 py-2 border border-warm-sand-beige rounded-lg font-medium hover:bg-soft-white transition-colors"
                                >
                                  <X size={18} />
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveExercise}
                                  disabled={isSaving}
                                  className="flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-2 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors disabled:opacity-50"
                                >
                                  <Save size={18} />
                                  {isSaving ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Display Mode
                            <div>
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
                                    {exercise.exerciseName || 'Untitled Exercise'}
                                  </h3>
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    {exercise.sets && (
                                      <span className="font-paragraph text-warm-grey">
                                        <strong className="text-charcoal-black">{exercise.sets}</strong> sets
                                      </span>
                                    )}
                                    {exercise.reps && (
                                      <span className="font-paragraph text-warm-grey">
                                        <strong className="text-charcoal-black">{exercise.reps}</strong> reps
                                      </span>
                                    )}
                                    {exercise.weightOrResistance && (
                                      <span className="font-paragraph text-warm-grey">
                                        <strong className="text-charcoal-black">{exercise.weightOrResistance}</strong>
                                      </span>
                                    )}
                                    {exercise.tempo && (
                                      <span className="font-paragraph text-warm-grey">
                                        Tempo: <strong className="text-charcoal-black">{exercise.tempo}</strong>
                                      </span>
                                    )}
                                    {exercise.restTimeSeconds && (
                                      <span className="font-paragraph text-warm-grey">
                                        Rest: <strong className="text-charcoal-black">{exercise.restTimeSeconds}s</strong>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {editMode && (
                                  <button
                                    onClick={() => handleEditExercise(exercise)}
                                    className="flex items-center gap-2 px-4 py-2 bg-soft-bronze/10 text-soft-bronze rounded-lg font-medium hover:bg-soft-bronze/20 transition-colors"
                                  >
                                    <Edit2 size={16} />
                                    Edit
                                  </button>
                                )}
                              </div>

                              {exercise.primaryMuscles && (
                                <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                                  <p className="font-paragraph text-sm text-warm-grey mb-1">Primary Muscles</p>
                                  <p className="font-paragraph text-charcoal-black">{exercise.primaryMuscles}</p>
                                </div>
                              )}

                              {exercise.secondaryMuscles && (
                                <div className="mt-3">
                                  <p className="font-paragraph text-sm text-warm-grey mb-1">Secondary Muscles</p>
                                  <p className="font-paragraph text-charcoal-black">{exercise.secondaryMuscles}</p>
                                </div>
                              )}

                              {exercise.coachCue && (
                                <div className="mt-4 p-4 bg-soft-white rounded-lg border border-warm-sand-beige">
                                  <p className="font-paragraph text-sm text-warm-grey mb-2">Coach Cue</p>
                                  <p className="font-paragraph text-charcoal-black">{exercise.coachCue}</p>
                                </div>
                              )}

                              {exercise.exerciseNotes && (
                                <div className="mt-4 p-4 bg-soft-white rounded-lg border border-warm-sand-beige">
                                  <p className="font-paragraph text-sm text-warm-grey mb-2">Notes</p>
                                  <p className="font-paragraph text-charcoal-black">{exercise.exerciseNotes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
