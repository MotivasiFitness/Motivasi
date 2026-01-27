import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import {
  Loader,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Settings,
} from 'lucide-react';
import {
  GeneratedProgram,
  WorkoutDay,
  Exercise,
  updateProgramDraft,
  saveProgramAsTemplate,
  assignProgramToClient,
  regenerateProgramSection,
  createProgramVersion,
  assessProgramQuality,
  getTrainerPreferences,
  TrainerPreferences,
} from '@/lib/ai/ai-program-generator';
import { BaseCrudService } from '@/integrations';
import { TrainerClientAssignments } from '@/entities';
import { getTrainerClients } from '@/lib/role-utils';

export default function ProgramEditorEnhanced() {
  const { member } = useMember();
  const navigate = useNavigate();

  const [program, setProgram] = useState<GeneratedProgram | null>(null);
  const [programId, setProgramId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignedClients, setAssignedClients] = useState<TrainerClientAssignments[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [trainerPrefs, setTrainerPrefs] = useState<TrainerPreferences | null>(null);
  const [showPrefsPanel, setShowPrefsPanel] = useState(false);
  const [showQualityPanel, setShowQualityPanel] = useState(false);
  const [qualityScore, setQualityScore] = useState(100);
  const [qualityFlags, setQualityFlags] = useState<any[]>([]);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Load program from session storage
  useEffect(() => {
    const draftProgram = sessionStorage.getItem('draft_program');
    const draftProgramId = sessionStorage.getItem('draft_program_id');
    if (draftProgram) {
      try {
        const parsed = JSON.parse(draftProgram);
        setProgram(parsed);
        if (draftProgramId) {
          setProgramId(draftProgramId);
        }

        // Assess quality
        const { score, flags } = assessProgramQuality(parsed);
        setQualityScore(score);
        setQualityFlags(flags);
      } catch (err) {
        setError('Failed to load program');
      }
    }
    setIsLoading(false);

    // Load trainer preferences
    const loadPrefs = async () => {
      if (!member?._id) return;
      try {
        const prefs = await getTrainerPreferences(member._id);
        setTrainerPrefs(prefs);
      } catch (err) {
        console.error('Error loading preferences:', err);
      }
    };

    loadPrefs();

    // Load assigned clients
    const loadClients = async () => {
      if (!member?._id) return;
      try {
        const clients = await getTrainerClients(member._id);
        setAssignedClients(clients);
      } catch (err) {
        console.error('Error loading clients:', err);
      }
    };

    loadClients();
  }, [member?._id]);

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
            No Program to Edit
          </h1>
          <p className="font-paragraph text-lg text-warm-grey mb-8">
            Please generate a program first using the AI Assistant.
          </p>
          <button
            onClick={() => navigate('/trainer/ai-assistant')}
            className="bg-charcoal-black text-soft-white px-8 py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors"
          >
            Go to AI Assistant
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateProgram = async () => {
    setIsSaving(true);
    setError('');

    try {
      sessionStorage.setItem('draft_program', JSON.stringify(program));
      setSuccess('Program updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update program');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateSection = async (section: string, dayIndex?: number) => {
    setRegeneratingSection(section);
    setError('');

    try {
      // This would call the regeneration API
      // For now, show a placeholder message
      setSuccess(`Regenerating ${section}...`);
      setTimeout(() => {
        setSuccess('');
        setRegeneratingSection(null);
      }, 2000);
    } catch (err) {
      setError(`Failed to regenerate ${section}`);
      setRegeneratingSection(null);
    }
  };

  const handleSaveAsVersion = async () => {
    setIsSaving(true);
    setError('');

    try {
      await createProgramVersion(
        program._id || '',
        program,
        member?._id || '',
        'Trainer edits'
      );
      setSuccess('Program version saved');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save version');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await saveProgramAsTemplate(program._id || '', templateName, member?._id);
      setSuccess('Program saved as template');
      setShowTemplateModal(false);
      setTemplateName('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignToClient = async () => {
    if (!selectedClientId) {
      setError('Please select a client');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await assignProgramToClient(program._id || '', selectedClientId);
      setSuccess('Program assigned to client');
      setShowAssignModal(false);
      setSelectedClientId('');
      setTimeout(() => {
        navigate('/trainer');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign program';
      setError(errorMessage);
      console.error('Assign error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateExercise = (dayIndex: number, exerciseIndex: number, updatedExercise: Exercise) => {
    const updatedProgram = { ...program };
    updatedProgram.workoutDays[dayIndex].exercises[exerciseIndex] = updatedExercise;
    setProgram(updatedProgram);
  };

  const handleDeleteExercise = (dayIndex: number, exerciseIndex: number) => {
    const updatedProgram = { ...program };
    updatedProgram.workoutDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setProgram(updatedProgram);
  };

  const handleAddExercise = (dayIndex: number) => {
    const updatedProgram = { ...program };
    const newExercise: Exercise = {
      name: 'New Exercise',
      sets: 3,
      reps: '8-10',
      restSeconds: 60,
      notes: '',
      substitutions: [],
    };
    updatedProgram.workoutDays[dayIndex].exercises.push(newExercise);
    setProgram(updatedProgram);
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
            Edit Program
          </h1>
          <p className="font-paragraph text-lg text-warm-grey">
            Make adjustments to your AI-generated program
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="font-paragraph text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="font-paragraph text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Quality Assessment Panel */}
        <div className="mb-8 bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
          <button
            onClick={() => setShowQualityPanel(!showQualityPanel)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-soft-bronze" />
              <h3 className="font-heading text-lg font-bold text-charcoal-black">
                Quality Assessment
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                qualityScore >= 80
                  ? 'bg-green-100 text-green-700'
                  : qualityScore >= 60
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {qualityScore}/100
              </span>
            </div>
            {showQualityPanel ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showQualityPanel && (
            <div className="mt-6 space-y-4">
              {qualityFlags.length === 0 ? (
                <p className="font-paragraph text-sm text-green-700">
                  ✓ No quality issues detected
                </p>
              ) : (
                qualityFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      flag.severity === 'high'
                        ? 'bg-red-50 border-red-200'
                        : flag.severity === 'medium'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex gap-3">
                      <AlertTriangle
                        className={`flex-shrink-0 mt-0.5 ${
                          flag.severity === 'high'
                            ? 'text-red-600'
                            : flag.severity === 'medium'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                        size={18}
                      />
                      <div>
                        <p className="font-paragraph text-sm font-bold text-charcoal-black">
                          {flag.type.replace(/-/g, ' ').toUpperCase()}
                        </p>
                        <p className="font-paragraph text-sm text-charcoal-black mt-1">
                          {flag.message}
                        </p>
                        {flag.affectedExercises && (
                          <p className="font-paragraph text-xs text-warm-grey mt-2">
                            Affected: {flag.affectedExercises.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Trainer Preferences Panel */}
        <div className="mb-8 bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
          <button
            onClick={() => setShowPrefsPanel(!showPrefsPanel)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-soft-bronze" />
              <h3 className="font-heading text-lg font-bold text-charcoal-black">
                Your Preferences
              </h3>
            </div>
            {showPrefsPanel ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showPrefsPanel && trainerPrefs && (
            <div className="mt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-paragraph text-sm text-warm-grey mb-2">Coaching Tone</p>
                  <p className="font-paragraph text-base text-charcoal-black capitalize">
                    {trainerPrefs.coachingTone}
                  </p>
                </div>
                <div>
                  <p className="font-paragraph text-sm text-warm-grey mb-2">Favorite Exercises</p>
                  <p className="font-paragraph text-base text-charcoal-black">
                    {trainerPrefs.favoriteExercises.length > 0
                      ? trainerPrefs.favoriteExercises.join(', ')
                      : 'None set'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/trainer/preferences')}
                className="text-soft-bronze hover:underline font-paragraph text-sm"
              >
                Edit Preferences →
              </button>
            </div>
          )}
        </div>

        {/* Program Overview */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block font-paragraph text-sm text-warm-grey mb-2">
                Program Name
              </label>
              <input
                type="text"
                value={program.programName}
                onChange={(e) => setProgram({ ...program, programName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              />
            </div>
            <div>
              <label className="block font-paragraph text-sm text-warm-grey mb-2">
                Duration
              </label>
              <input
                type="text"
                value={program.duration}
                onChange={(e) => setProgram({ ...program, duration: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              />
            </div>
            <div>
              <label className="block font-paragraph text-sm text-warm-grey mb-2">
                Focus Area
              </label>
              <input
                type="text"
                value={program.focusArea}
                onChange={(e) => setProgram({ ...program, focusArea: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              />
            </div>
          </div>

          {/* AI Generation Info */}
          {program.aiGeneratedAt && (
            <div className="flex items-center gap-2 text-xs text-warm-grey mb-6 pb-6 border-b border-warm-sand-beige">
              <Clock size={14} />
              <span>Last AI generation: {new Date(program.aiGeneratedAt).toLocaleString()}</span>
            </div>
          )}

          <div>
            <label className="block font-paragraph text-sm text-warm-grey mb-2">
              Overview
            </label>
            <textarea
              value={program.overview}
              onChange={(e) => setProgram({ ...program, overview: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
            />
          </div>
        </div>

        {/* Workout Days */}
        <div className="space-y-6 mb-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black">
            Workout Days
          </h2>

          {program.workoutDays.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-bold text-charcoal-black">
                    {day.day}
                  </h3>
                  {day.generatedAt && (
                    <p className="font-paragraph text-xs text-warm-grey mt-1">
                      AI-generated: {new Date(day.generatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegenerateSection('workout-day', dayIndex)}
                    disabled={regeneratingSection === `day-${dayIndex}`}
                    className="p-2 rounded-lg bg-soft-bronze/10 text-soft-bronze hover:bg-soft-bronze/20 transition-colors disabled:opacity-50"
                    title="Regenerate this day"
                  >
                    {regeneratingSection === `day-${dayIndex}` ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <RotateCcw size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingDayIndex(editingDayIndex === dayIndex ? null : dayIndex)}
                    className="p-2 rounded-lg bg-warm-sand-beige text-charcoal-black hover:bg-soft-bronze hover:text-soft-white transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>

              {/* Day Details (Editable) */}
              {editingDayIndex === dayIndex && (
                <div className="space-y-4 mb-6 pb-6 border-b border-warm-sand-beige">
                  <div>
                    <label className="block font-paragraph text-sm text-warm-grey mb-2">
                      Day Name
                    </label>
                    <input
                      type="text"
                      value={day.day}
                      onChange={(e) => {
                        const updated = [...program.workoutDays];
                        updated[dayIndex].day = e.target.value;
                        setProgram({ ...program, workoutDays: updated });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    />
                  </div>

                  <div>
                    <label className="block font-paragraph text-sm text-warm-grey mb-2">
                      Warm-up
                    </label>
                    <textarea
                      value={day.warmUp}
                      onChange={(e) => {
                        const updated = [...program.workoutDays];
                        updated[dayIndex].warmUp = e.target.value;
                        setProgram({ ...program, workoutDays: updated });
                      }}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                    />
                    <button
                      onClick={() => handleRegenerateSection('warm-up-cool-down', dayIndex)}
                      disabled={regeneratingSection === `warmup-${dayIndex}`}
                      className="mt-2 text-xs text-soft-bronze hover:underline flex items-center gap-1"
                    >
                      {regeneratingSection === `warmup-${dayIndex}` ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RotateCcw size={12} />
                          Regenerate
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block font-paragraph text-sm text-warm-grey mb-2">
                      Cool-down
                    </label>
                    <textarea
                      value={day.coolDown}
                      onChange={(e) => {
                        const updated = [...program.workoutDays];
                        updated[dayIndex].coolDown = e.target.value;
                        setProgram({ ...program, workoutDays: updated });
                      }}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-paragraph text-sm text-warm-grey mb-2">
                      Notes
                    </label>
                    <textarea
                      value={day.notes}
                      onChange={(e) => {
                        const updated = [...program.workoutDays];
                        updated[dayIndex].notes = e.target.value;
                        setProgram({ ...program, workoutDays: updated });
                      }}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Exercises */}
              <div className="space-y-4">
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="border-l-4 border-soft-bronze pl-4 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-heading text-base font-bold text-charcoal-black">
                          {exercise.name}
                        </p>
                        <p className="font-paragraph text-sm text-warm-grey">
                          {exercise.sets} sets × {exercise.reps} reps • {exercise.restSeconds}s rest
                        </p>
                        {exercise.generatedAt && (
                          <p className="font-paragraph text-xs text-warm-grey/70 mt-1">
                            AI-generated: {new Date(exercise.generatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRegenerateSection('exercise-substitutions', dayIndex, exerciseIndex)}
                          disabled={regeneratingSection === `subs-${dayIndex}-${exerciseIndex}`}
                          className="p-2 rounded-lg bg-soft-bronze/10 text-soft-bronze hover:bg-soft-bronze/20 transition-colors disabled:opacity-50"
                          title="Regenerate substitutions"
                        >
                          {regeneratingSection === `subs-${dayIndex}-${exerciseIndex}` ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(dayIndex, exerciseIndex)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {exercise.notes && (
                      <p className="font-paragraph text-sm text-charcoal-black mb-2">
                        {exercise.notes}
                      </p>
                    )}

                    {exercise.substitutions && exercise.substitutions.length > 0 && (
                      <div className="mt-2 p-2 bg-warm-sand-beige/20 rounded text-xs">
                        <p className="font-paragraph text-warm-grey font-medium mb-1">
                          Substitutions:
                        </p>
                        <ul className="space-y-1">
                          {exercise.substitutions.map((sub, idx) => (
                            <li key={idx} className="font-paragraph text-charcoal-black">
                              • {sub}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => handleAddExercise(dayIndex)}
                  className="w-full py-2 rounded-lg border-2 border-dashed border-soft-bronze text-soft-bronze font-medium hover:bg-soft-bronze/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Exercise
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Progression Guidance */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block font-paragraph text-sm text-warm-grey">
              Progression Guidance
            </label>
            <button
              onClick={() => handleRegenerateSection('progression-guidance')}
              disabled={regeneratingSection === 'progression'}
              className="text-xs text-soft-bronze hover:underline flex items-center gap-1"
            >
              {regeneratingSection === 'progression' ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RotateCcw size={12} />
                  Regenerate
                </>
              )}
            </button>
          </div>
          <textarea
            value={program.progressionGuidance}
            onChange={(e) => setProgram({ ...program, progressionGuidance: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-warm-sand-beige">
          <button
            onClick={handleUpdateProgram}
            disabled={isSaving}
            className="flex-1 bg-charcoal-black text-soft-white py-3 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>

          <button
            onClick={handleSaveAsVersion}
            className="flex-1 bg-warm-sand-beige text-charcoal-black py-3 rounded-lg font-medium text-lg hover:bg-warm-sand-beige/80 transition-colors"
          >
            Save as Version
          </button>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex-1 bg-warm-sand-beige text-charcoal-black py-3 rounded-lg font-medium text-lg hover:bg-warm-sand-beige/80 transition-colors"
          >
            Save as Template
          </button>

          <button
            onClick={() => setShowAssignModal(true)}
            className="flex-1 bg-soft-bronze text-soft-white py-3 rounded-lg font-medium text-lg hover:bg-soft-bronze/80 transition-colors"
          >
            Assign to Client
          </button>
        </div>

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-soft-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                Save as Template
              </h3>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name"
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph mb-6"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    handleSaveAsTemplate();
                  }}
                  disabled={isSaving}
                  className="flex-1 bg-charcoal-black text-soft-white py-2 rounded-lg font-medium hover:bg-soft-bronze transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 bg-warm-sand-beige text-charcoal-black py-2 rounded-lg font-medium hover:bg-warm-sand-beige/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-soft-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                Assign to Client
              </h3>
              {assignedClients.length === 0 ? (
                <p className="font-paragraph text-warm-grey mb-6">
                  You don't have any assigned clients yet.
                </p>
              ) : (
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph mb-6"
                >
                  <option value="">Select a client</option>
                  {assignedClients.map((assignment) => (
                    <option key={assignment._id} value={assignment.clientId}>
                      Client {assignment.clientId?.slice(0, 8)}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleAssignToClient}
                  disabled={isSaving || assignedClients.length === 0}
                  className="flex-1 bg-charcoal-black text-soft-white py-2 rounded-lg font-medium hover:bg-soft-bronze transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Assigning...' : 'Assign'}
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-warm-sand-beige text-charcoal-black py-2 rounded-lg font-medium hover:bg-warm-sand-beige/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
