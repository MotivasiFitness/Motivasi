import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { ClientPrograms, FitnessPrograms } from '@/entities';
import { ChevronDown, ChevronUp, Edit2, Save, X, Loader, AlertCircle, ArrowLeft, Plus, Trash2, Volume2, Lightbulb } from 'lucide-react';
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
  const [expandedExercise, setExpandedExercise] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ClientPrograms | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ClientPrograms>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

      // First, try to load exercises from clientprograms (for assigned programs)
      const { items: allExercises } = await BaseCrudService.getAll<ClientPrograms>('clientprograms');
      let programExercises = allExercises.filter(e => {
        // Match exercises by program title or program name
        return e.programTitle === programData?.programName || 
               e.programTitle === programData?.programName;
      });

      // If no exercises found in clientprograms, try loading from programdrafts
      if (programExercises.length === 0) {
        try {
          const { items: drafts } = await BaseCrudService.getAll<any>('programdrafts');
          const programDraft = drafts.find(d => d.programId === programId);
          
          if (programDraft && programDraft.programJson) {
            const parsedProgram = JSON.parse(programDraft.programJson);
            
            // Convert workout days and exercises to ClientPrograms format
            if (parsedProgram.workoutDays && Array.isArray(parsedProgram.workoutDays)) {
              const convertedExercises: ClientPrograms[] = [];
              
              parsedProgram.workoutDays.forEach((day: any, dayIndex: number) => {
                if (day.exercises && Array.isArray(day.exercises)) {
                  day.exercises.forEach((exercise: any, exerciseIndex: number) => {
                    convertedExercises.push({
                      _id: `${programId}-${dayIndex}-${exerciseIndex}`,
                      programTitle: programData?.programName || '',
                      workoutDay: day.day || `Day ${dayIndex + 1}`,
                      exerciseName: exercise.name || '',
                      sets: exercise.sets || 0,
                      reps: parseInt(exercise.reps?.split('-')[0] || '0'),
                      weightOrResistance: exercise.weight || '',
                      tempo: '3-1-1',
                      restTimeSeconds: exercise.restSeconds || 90,
                      exerciseNotes: exercise.notes || '',
                      exerciseVideoUrl: '',
                      primaryMuscles: '',
                      secondaryMuscles: '',
                      modification1Title: '',
                      modification1Description: '',
                      modification2Title: '',
                      modification2Description: '',
                      modification3Title: '',
                      modification3Description: '',
                      progression: '',
                      coachCue: '',
                      exerciseOrder: exerciseIndex,
                    });
                  });
                }
              });
              
              programExercises = convertedExercises;
            }
          }
        } catch (draftError) {
          console.warn('Could not load program from draft:', draftError);
        }
      }

      // Sort by workout day and exercise order
      const sorted = programExercises.sort((a, b) => {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayA = dayOrder.indexOf(a.workoutDay || '');
        const dayB = dayOrder.indexOf(b.workoutDay || '');
        if (dayA !== dayB) return dayA - dayB;
        return (a.exerciseOrder || 0) - (b.exerciseOrder || 0);
      });

      setExercises(sorted);
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupExercisesByDay = (): WorkoutSession[] => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped: { [key: string]: ClientPrograms[] } = {};

    exercises.forEach(exercise => {
      const day = exercise.workoutDay || 'Unassigned';
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(exercise);
    });

    return Object.entries(grouped)
      .sort(([dayA], [dayB]) => {
        const indexA = dayOrder.indexOf(dayA);
        const indexB = dayOrder.indexOf(dayB);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      })
      .map(([day, exs]) => ({
        day,
        exercises: exs.sort((a, b) => (a.exerciseOrder || 0) - (b.exerciseOrder || 0)),
      }));
  };

  const toggleExercise = (exerciseId: string) => {
    setExpandedExercise(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
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

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    try {
      setIsDeleting(true);
      await BaseCrudService.delete('clientprograms', exerciseId);
      setExercises(exercises.filter(e => e._id !== exerciseId));
    } catch (error) {
      console.error('Error deleting exercise:', error);
    } finally {
      setIsDeleting(false);
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
                      {session.exercises.map((exercise) => (
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
                                  Progression
                                </label>
                                <textarea
                                  value={editFormData.progression || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, progression: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Modification 1 Title
                                </label>
                                <input
                                  type="text"
                                  value={editFormData.modification1Title || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, modification1Title: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Modification 1 Description
                                </label>
                                <textarea
                                  value={editFormData.modification1Description || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, modification1Description: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  rows={2}
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Modification 2 Title
                                </label>
                                <input
                                  type="text"
                                  value={editFormData.modification2Title || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, modification2Title: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Modification 2 Description
                                </label>
                                <textarea
                                  value={editFormData.modification2Description || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, modification2Description: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  rows={2}
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Modification 3 Title
                                </label>
                                <input
                                  type="text"
                                  value={editFormData.modification3Title || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, modification3Title: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Modification 3 Description
                                </label>
                                <textarea
                                  value={editFormData.modification3Description || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, modification3Description: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
                                  rows={2}
                                />
                              </div>

                              <div>
                                <label className="font-paragraph text-sm font-medium text-charcoal-black mb-2 block">
                                  Exercise Video URL
                                </label>
                                <input
                                  type="url"
                                  value={editFormData.exerciseVideoUrl || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, exerciseVideoUrl: e.target.value })}
                                  className="w-full px-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph focus:outline-none focus:border-soft-bronze"
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
                            // Display Mode - Client-like format
                            <div>
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-3">
                                    {exercise.exerciseName || 'Untitled Exercise'}
                                  </h3>
                                  
                                  {/* Quick Stats */}
                                  <div className="flex flex-wrap gap-4 text-sm mb-4">
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
                                    className="flex items-center gap-2 px-4 py-2 bg-soft-bronze/10 text-soft-bronze rounded-lg font-medium hover:bg-soft-bronze/20 transition-colors ml-4"
                                  >
                                    <Edit2 size={16} />
                                    Edit
                                  </button>
                                )}
                              </div>

                              {/* Muscle Groups */}
                              {(exercise.primaryMuscles || exercise.secondaryMuscles) && (
                                <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-soft-white rounded-lg border border-warm-sand-beige">
                                  {exercise.primaryMuscles && (
                                    <div>
                                      <p className="font-paragraph text-xs text-warm-grey uppercase tracking-wide mb-1">Primary Muscles</p>
                                      <p className="font-paragraph text-charcoal-black">{exercise.primaryMuscles}</p>
                                    </div>
                                  )}
                                  {exercise.secondaryMuscles && (
                                    <div>
                                      <p className="font-paragraph text-xs text-warm-grey uppercase tracking-wide mb-1">Secondary Muscles</p>
                                      <p className="font-paragraph text-charcoal-black">{exercise.secondaryMuscles}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Coach Cue */}
                              {exercise.coachCue && (
                                <div className="mb-4">
                                  <button
                                    onClick={() => toggleSection(`cue-${exercise._id}`)}
                                    className="w-full flex items-center justify-between p-4 bg-soft-white rounded-lg border border-warm-sand-beige hover:bg-soft-white/80 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Volume2 size={18} className="text-soft-bronze" />
                                      <span className="font-paragraph font-medium text-charcoal-black">Coach Cue</span>
                                    </div>
                                    {expandedSections.has(`cue-${exercise._id}`) ? (
                                      <ChevronUp size={18} className="text-soft-bronze" />
                                    ) : (
                                      <ChevronDown size={18} className="text-soft-bronze" />
                                    )}
                                  </button>
                                  {expandedSections.has(`cue-${exercise._id}`) && (
                                    <div className="mt-2 p-4 bg-soft-white rounded-lg border border-warm-sand-beige border-t-0">
                                      <p className="font-paragraph text-charcoal-black">{exercise.coachCue}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Progression */}
                              {exercise.progression && (
                                <div className="mb-4">
                                  <button
                                    onClick={() => toggleSection(`prog-${exercise._id}`)}
                                    className="w-full flex items-center justify-between p-4 bg-soft-white rounded-lg border border-warm-sand-beige hover:bg-soft-white/80 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Lightbulb size={18} className="text-soft-bronze" />
                                      <span className="font-paragraph font-medium text-charcoal-black">Progression</span>
                                    </div>
                                    {expandedSections.has(`prog-${exercise._id}`) ? (
                                      <ChevronUp size={18} className="text-soft-bronze" />
                                    ) : (
                                      <ChevronDown size={18} className="text-soft-bronze" />
                                    )}
                                  </button>
                                  {expandedSections.has(`prog-${exercise._id}`) && (
                                    <div className="mt-2 p-4 bg-soft-white rounded-lg border border-warm-sand-beige border-t-0">
                                      <p className="font-paragraph text-charcoal-black">{exercise.progression}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Modifications */}
                              {(exercise.modification1Title || exercise.modification2Title || exercise.modification3Title) && (
                                <div className="mb-4">
                                  <button
                                    onClick={() => toggleSection(`mod-${exercise._id}`)}
                                    className="w-full flex items-center justify-between p-4 bg-soft-white rounded-lg border border-warm-sand-beige hover:bg-soft-white/80 transition-colors"
                                  >
                                    <span className="font-paragraph font-medium text-charcoal-black">Modifications</span>
                                    {expandedSections.has(`mod-${exercise._id}`) ? (
                                      <ChevronUp size={18} className="text-soft-bronze" />
                                    ) : (
                                      <ChevronDown size={18} className="text-soft-bronze" />
                                    )}
                                  </button>
                                  {expandedSections.has(`mod-${exercise._id}`) && (
                                    <div className="mt-2 space-y-3 p-4 bg-soft-white rounded-lg border border-warm-sand-beige border-t-0">
                                      {exercise.modification1Title && (
                                        <div>
                                          <p className="font-paragraph font-medium text-charcoal-black mb-1">{exercise.modification1Title}</p>
                                          {exercise.modification1Description && (
                                            <p className="font-paragraph text-warm-grey text-sm">{exercise.modification1Description}</p>
                                          )}
                                        </div>
                                      )}
                                      {exercise.modification2Title && (
                                        <div>
                                          <p className="font-paragraph font-medium text-charcoal-black mb-1">{exercise.modification2Title}</p>
                                          {exercise.modification2Description && (
                                            <p className="font-paragraph text-warm-grey text-sm">{exercise.modification2Description}</p>
                                          )}
                                        </div>
                                      )}
                                      {exercise.modification3Title && (
                                        <div>
                                          <p className="font-paragraph font-medium text-charcoal-black mb-1">{exercise.modification3Title}</p>
                                          {exercise.modification3Description && (
                                            <p className="font-paragraph text-warm-grey text-sm">{exercise.modification3Description}</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Exercise Notes */}
                              {exercise.exerciseNotes && (
                                <div className="p-4 bg-soft-white rounded-lg border border-warm-sand-beige">
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
