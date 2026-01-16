import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientAssignedWorkouts, TrainerClientAssignments } from '@/entities';
import { AlertCircle, CheckCircle, Loader, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { Navigate } from 'react-router-dom';
import {
  getActiveWorkoutsForWeek,
  getTrainerWorkoutsForCurrentWeek,
  assignWorkout,
  updateWorkout,
  deleteWorkout,
  formatWeekDisplay,
  getWeekStartDate,
  getDaysSinceUpdate,
  checkWorkoutConflict,
} from '@/lib/workout-assignment-service';

interface WorkoutForm {
  clientId: string;
  workoutSlot: number;
  weekNumber: number;
  exerciseName: string;
  sets: number;
  reps: number;
  weightOrResistance: string;
  tempo: string;
  restTimeSeconds: number;
  exerciseNotes: string;
  exerciseVideoUrl: string;
  modification1Title: string;
  modification1Description: string;
  modification2Title: string;
  modification2Description: string;
  modification3Title: string;
  modification3Description: string;
}

export default function WorkoutAssignmentPage() {
  const { member } = useMember();
  const { isTrainer, isLoading: roleLoading } = useRole();
  const [clients, setClients] = useState<TrainerClientAssignments[]>([]);
  const [currentWorkouts, setCurrentWorkouts] = useState<ClientAssignedWorkouts[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictWorkout, setConflictWorkout] = useState<ClientAssignedWorkouts | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<WorkoutForm>({
    clientId: '',
    workoutSlot: 1,
    weekNumber: 1,
    exerciseName: '',
    sets: 4,
    reps: 8,
    weightOrResistance: '',
    tempo: '3-1-2',
    restTimeSeconds: 60,
    exerciseNotes: '',
    exerciseVideoUrl: '',
    modification1Title: '',
    modification1Description: '',
    modification2Title: '',
    modification2Description: '',
    modification3Title: '',
    modification3Description: '',
  });

  // Load trainer's clients
  useEffect(() => {
    const loadClients = async () => {
      if (!member?._id) return;
      
      try {
        const { items } = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
        const trainerClients = items.filter(
          a => a.trainerId === member._id && a.status === 'active'
        );
        setClients(trainerClients);
        
        if (trainerClients.length > 0) {
          setSelectedClient(trainerClients[0].clientId || '');
        }
      } catch (error) {
        console.error('Error loading clients:', error);
        setMessage({ type: 'error', text: 'Failed to load clients' });
      }
    };

    loadClients();
  }, [member?._id]);

  // Load current week's workouts
  useEffect(() => {
    const loadWorkouts = async () => {
      if (!member?._id) return;
      
      try {
        setIsLoading(true);
        const workouts = await getTrainerWorkoutsForCurrentWeek(member._id);
        setCurrentWorkouts(workouts);
      } catch (error) {
        console.error('Error loading workouts:', error);
        setMessage({ type: 'error', text: 'Failed to load workouts' });
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, [member?._id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const numValue = type === 'number' ? parseInt(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSaving(true);

    try {
      if (!formData.clientId || !formData.exerciseName) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        setIsSaving(false);
        return;
      }

      const weekStart = getWeekStartDate();

      if (editingWorkoutId) {
        // Update existing workout
        await updateWorkout(editingWorkoutId, {
          exerciseName: formData.exerciseName,
          sets: formData.sets,
          reps: formData.reps,
          weightOrResistance: formData.weightOrResistance,
          tempo: formData.tempo,
          restTimeSeconds: formData.restTimeSeconds,
          exerciseNotes: formData.exerciseNotes,
          exerciseVideoUrl: formData.exerciseVideoUrl,
          weekNumber: formData.weekNumber,
          modification1Title: formData.modification1Title,
          modification1Description: formData.modification1Description,
          modification2Title: formData.modification2Title,
          modification2Description: formData.modification2Description,
          modification3Title: formData.modification3Title,
          modification3Description: formData.modification3Description,
        });
        
        setMessage({ type: 'success', text: 'Workout updated successfully' });
        setEditingWorkoutId(null);
      } else {
        // Check for conflicts
        const conflict = await checkWorkoutConflict(
          formData.clientId,
          weekStart,
          formData.workoutSlot
        );

        if (conflict) {
          setConflictWorkout(conflict);
          setShowConflictDialog(true);
          setIsSaving(false);
          return;
        }

        // Create new assignment
        const result = await assignWorkout(
          formData.clientId,
          member?._id || '',
          weekStart,
          formData.workoutSlot,
          {
            programTitle: 'Weekly Workout',
            sessionTitle: `Workout ${formData.workoutSlot}`,
            exerciseName: formData.exerciseName,
            sets: formData.sets,
            reps: formData.reps,
            weightOrResistance: formData.weightOrResistance,
            tempo: formData.tempo,
            restTimeSeconds: formData.restTimeSeconds,
            exerciseNotes: formData.exerciseNotes,
            exerciseVideoUrl: formData.exerciseVideoUrl,
            weekNumber: formData.weekNumber,
            modification1Title: formData.modification1Title,
            modification1Description: formData.modification1Description,
            modification2Title: formData.modification2Title,
            modification2Description: formData.modification2Description,
            modification3Title: formData.modification3Title,
            modification3Description: formData.modification3Description,
          }
        );

        if (result.success) {
          setMessage({ type: 'success', text: 'Workout assigned successfully' });
          setFormData({
            clientId: formData.clientId,
            workoutSlot: formData.workoutSlot,
            weekNumber: formData.weekNumber,
            exerciseName: '',
            sets: 4,
            reps: 8,
            weightOrResistance: '',
            tempo: '3-1-2',
            restTimeSeconds: 60,
            exerciseNotes: '',
            exerciseVideoUrl: '',
            modification1Title: '',
            modification1Description: '',
            modification2Title: '',
            modification2Description: '',
            modification3Title: '',
            modification3Description: '',
          });
          
          // Reload workouts
          const workouts = await getTrainerWorkoutsForCurrentWeek(member?._id || '');
          setCurrentWorkouts(workouts);
        }
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      setMessage({ type: 'error', text: 'Failed to save workout' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReplaceConflict = async () => {
    if (!conflictWorkout?._id) return;

    setIsSaving(true);
    try {
      const weekStart = getWeekStartDate();
      
      // Delete the conflicting workout
      await deleteWorkout(conflictWorkout._id);

      // Create new assignment
      const result = await assignWorkout(
        formData.clientId,
        member?._id || '',
        weekStart,
        formData.workoutSlot,
        {
          programTitle: 'Weekly Workout',
          sessionTitle: `Workout ${formData.workoutSlot}`,
          exerciseName: formData.exerciseName,
          sets: formData.sets,
          reps: formData.reps,
          weightOrResistance: formData.weightOrResistance,
          tempo: formData.tempo,
          restTimeSeconds: formData.restTimeSeconds,
          exerciseNotes: formData.exerciseNotes,
          exerciseVideoUrl: formData.exerciseVideoUrl,
          weekNumber: formData.weekNumber,
          modification1Title: formData.modification1Title,
          modification1Description: formData.modification1Description,
          modification2Title: formData.modification2Title,
          modification2Description: formData.modification2Description,
          modification3Title: formData.modification3Title,
          modification3Description: formData.modification3Description,
        },
        true
      );

      if (result.success) {
        setMessage({ type: 'success', text: 'Workout replaced successfully' });
        setShowConflictDialog(false);
        setConflictWorkout(null);
        
        // Reload workouts
        const workouts = await getTrainerWorkoutsForCurrentWeek(member?._id || '');
        setCurrentWorkouts(workouts);
      }
    } catch (error) {
      console.error('Error replacing workout:', error);
      setMessage({ type: 'error', text: 'Failed to replace workout' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      await deleteWorkout(workoutId);
      setMessage({ type: 'success', text: 'Workout deleted successfully' });
      
      // Reload workouts
      const workouts = await getTrainerWorkoutsForCurrentWeek(member?._id || '');
      setCurrentWorkouts(workouts);
    } catch (error) {
      console.error('Error deleting workout:', error);
      setMessage({ type: 'error', text: 'Failed to delete workout' });
    }
  };

  const handleEditWorkout = (workout: ClientAssignedWorkouts) => {
    setFormData({
      clientId: workout.clientId || '',
      workoutSlot: workout.workoutSlot || 1,
      weekNumber: workout.weekNumber || 1,
      exerciseName: workout.exerciseName || '',
      sets: workout.sets || 4,
      reps: workout.reps || 8,
      weightOrResistance: workout.weightOrResistance || '',
      tempo: workout.tempo || '3-1-2',
      restTimeSeconds: workout.restTimeSeconds || 60,
      exerciseNotes: workout.exerciseNotes || '',
      exerciseVideoUrl: workout.exerciseVideoUrl || '',
      modification1Title: (workout as any).modification1Title || '',
      modification1Description: (workout as any).modification1Description || '',
      modification2Title: (workout as any).modification2Title || '',
      modification2Description: (workout as any).modification2Description || '',
      modification3Title: (workout as any).modification3Title || '',
      modification3Description: (workout as any).modification3Description || '',
    });
    setEditingWorkoutId(workout._id || null);
    setSelectedClient(workout.clientId || '');
    setSelectedSlot(workout.workoutSlot || 1);
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (!isTrainer) {
    return <Navigate to="/" replace />;
  }

  const weekDisplay = formatWeekDisplay(getWeekStartDate());
  const clientWorkouts = currentWorkouts.filter(w => w.clientId === selectedClient);

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Header */}
      <section className="py-12 px-8 lg:px-20 bg-warm-sand-beige border-b border-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
            Workout Assignment
          </h1>
          <p className="font-paragraph text-lg text-warm-grey">
            {weekDisplay} • Assign and manage weekly workouts for your clients
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          {/* Message Alert */}
          {message && (
            <div
              className={`mb-8 p-4 rounded-lg flex gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              )}
              <p
                className={`font-paragraph text-sm ${
                  message.type === 'success'
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Assignment Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6 bg-warm-sand-beige/20 border border-warm-sand-beige rounded-2xl p-8">
                <h2 className="font-heading text-2xl font-bold text-charcoal-black">
                  {editingWorkoutId ? 'Edit Workout' : 'Assign New Workout'}
                </h2>

                {/* Client Selection */}
                <div>
                  <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Select Client *
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => {
                      setSelectedClient(e.target.value);
                      setFormData(prev => ({ ...prev, clientId: e.target.value }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  >
                    <option value="">Choose a client...</option>
                    {clients.map(client => (
                      <option key={client._id} value={client.clientId}>
                        {client.clientId}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Workout Slot */}
                <div>
                  <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Workout Slot (1-4) *
                  </label>
                  <select
                    name="workoutSlot"
                    value={formData.workoutSlot}
                    onChange={(e) => {
                      const slot = parseInt(e.target.value);
                      setSelectedSlot(slot);
                      handleInputChange(e);
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  >
                    {[1, 2, 3, 4].map(slot => (
                      <option key={slot} value={slot}>
                        Workout {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Week Number */}
                <div>
                  <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Week Number *
                  </label>
                  <input
                    type="number"
                    name="weekNumber"
                    value={formData.weekNumber}
                    onChange={handleInputChange}
                    min="1"
                    max="52"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    placeholder="e.g., 1 for Week 1, 2 for Week 2"
                  />
                  <p className="text-xs text-warm-grey mt-1">
                    Assign this workout to a specific week of the program (1-52)
                  </p>
                </div>

                {/* Exercise Name */}
                <div>
                  <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    name="exerciseName"
                    value={formData.exerciseName}
                    onChange={handleInputChange}
                    placeholder="e.g., Barbell Squat"
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  />
                </div>

                {/* Sets and Reps */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                      Sets
                    </label>
                    <input
                      type="number"
                      name="sets"
                      value={formData.sets}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    />
                  </div>
                  <div>
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                      Reps
                    </label>
                    <input
                      type="number"
                      name="reps"
                      value={formData.reps}
                      onChange={handleInputChange}
                      min="1"
                      max="50"
                      className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    />
                  </div>
                </div>

                {/* Weight/Resistance */}
                <div>
                  <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Weight / Resistance
                  </label>
                  <input
                    type="text"
                    name="weightOrResistance"
                    value={formData.weightOrResistance}
                    onChange={handleInputChange}
                    placeholder="e.g., 60kg, Bodyweight, Light band"
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  />
                </div>

                {/* Tempo */}
                <div>
                  <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Tempo (e.g., 3-1-2)
                  </label>
                  <input
                    type="text"
                    name="tempo"
                    value={formData.tempo}
                    onChange={handleInputChange}
                    placeholder="e.g., 3-1-2 (eccentric-pause-concentric)"
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  />
                </div>

                {/* Rest Time */}
                <div>
                  <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Rest Time (seconds)
                  </label>
                  <input
                    type="number"
                    name="restTimeSeconds"
                    value={formData.restTimeSeconds}
                    onChange={handleInputChange}
                    min="0"
                    max="300"
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  />
                </div>

                {/* Exercise Notes */}
                <div>
                  <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Coach Notes
                  </label>
                  <textarea
                    name="exerciseNotes"
                    value={formData.exerciseNotes}
                    onChange={handleInputChange}
                    placeholder="Form cues, modifications, or special instructions..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Exercise Video URL
                  </label>
                  <input
                    type="url"
                    name="exerciseVideoUrl"
                    value={formData.exerciseVideoUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  />
                </div>

                {/* Exercise Modifications Section */}
                <div className="border-t border-warm-sand-beige pt-6 mt-6">
                  <h3 className="font-heading text-lg font-bold text-charcoal-black mb-4">
                    Exercise Modifications (Optional)
                  </h3>
                  <p className="text-xs text-warm-grey mb-4">
                    Provide 2-3 alternative options for this exercise (e.g., Easier, No equipment, Joint-friendly)
                  </p>

                  {/* Modification 1 */}
                  <div className="space-y-3 mb-4 p-4 bg-soft-white rounded-lg border border-warm-sand-beige">
                    <div>
                      <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                        Modification 1 Title
                      </label>
                      <input
                        type="text"
                        name="modification1Title"
                        value={formData.modification1Title}
                        onChange={handleInputChange}
                        placeholder="e.g., Easier Version"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                      />
                    </div>
                    <div>
                      <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                        Modification 1 Description
                      </label>
                      <textarea
                        name="modification1Description"
                        value={formData.modification1Description}
                        onChange={handleInputChange}
                        placeholder="Describe the modification..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                      />
                    </div>
                  </div>

                  {/* Modification 2 */}
                  <div className="space-y-3 mb-4 p-4 bg-soft-white rounded-lg border border-warm-sand-beige">
                    <div>
                      <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                        Modification 2 Title
                      </label>
                      <input
                        type="text"
                        name="modification2Title"
                        value={formData.modification2Title}
                        onChange={handleInputChange}
                        placeholder="e.g., No Equipment"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                      />
                    </div>
                    <div>
                      <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                        Modification 2 Description
                      </label>
                      <textarea
                        name="modification2Description"
                        value={formData.modification2Description}
                        onChange={handleInputChange}
                        placeholder="Describe the modification..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                      />
                    </div>
                  </div>

                  {/* Modification 3 */}
                  <div className="space-y-3 p-4 bg-soft-white rounded-lg border border-warm-sand-beige">
                    <div>
                      <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                        Modification 3 Title
                      </label>
                      <input
                        type="text"
                        name="modification3Title"
                        value={formData.modification3Title}
                        onChange={handleInputChange}
                        placeholder="e.g., Joint-Friendly"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                      />
                    </div>
                    <div>
                      <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                        Modification 3 Description
                      </label>
                      <textarea
                        name="modification3Description"
                        value={formData.modification3Description}
                        onChange={handleInputChange}
                        placeholder="Describe the modification..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-charcoal-black text-soft-white py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingWorkoutId ? (
                      <>
                        <Save size={18} />
                        Update Workout
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Assign Workout
                      </>
                    )}
                  </button>
                  {editingWorkoutId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingWorkoutId(null);
                        setFormData({
                          clientId: selectedClient,
                          workoutSlot: 1,
                          weekNumber: 1,
                          exerciseName: '',
                          sets: 4,
                          reps: 8,
                          weightOrResistance: '',
                          tempo: '3-1-2',
                          restTimeSeconds: 60,
                          exerciseNotes: '',
                          exerciseVideoUrl: '',
                          modification1Title: '',
                          modification1Description: '',
                          modification2Title: '',
                          modification2Description: '',
                          modification3Title: '',
                          modification3Description: '',
                        });
                      }}
                      className="px-6 py-3 rounded-lg font-medium border border-warm-sand-beige hover:bg-warm-sand-beige/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Current Workouts */}
            <div className="lg:col-span-1">
              <div className="bg-warm-sand-beige/20 border border-warm-sand-beige rounded-2xl p-8 sticky top-8">
                <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                  This Week's Workouts
                </h2>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-soft-bronze" />
                  </div>
                ) : clientWorkouts.length === 0 ? (
                  <p className="text-warm-grey text-sm">
                    No workouts assigned yet for this client this week.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {clientWorkouts.map(workout => (
                      <div
                        key={workout._id}
                        className="bg-soft-white border border-warm-sand-beige rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-heading text-lg font-bold text-charcoal-black">
                            Workout {workout.workoutSlot}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditWorkout(workout)}
                              className="p-1 text-soft-bronze hover:bg-warm-sand-beige rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteWorkout(workout._id || '')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-charcoal-black font-medium mb-1">
                          {workout.exerciseName}
                        </p>
                        <p className="text-xs text-warm-grey">
                          {workout.sets}×{workout.reps} @ {workout.weightOrResistance || 'BW'}
                        </p>
                        <p className="text-xs text-warm-grey/60 mt-2">
                          {getDaysSinceUpdate(workout._updatedDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conflict Dialog */}
      {showConflictDialog && conflictWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-soft-white rounded-2xl p-8 max-w-md">
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
              Workout Conflict
            </h2>
            <p className="font-paragraph text-warm-grey mb-6">
              A workout already exists for Workout {conflictWorkout.workoutSlot} this week:
            </p>
            <div className="bg-warm-sand-beige/20 border border-warm-sand-beige rounded-lg p-4 mb-6">
              <p className="font-medium text-charcoal-black mb-2">
                {conflictWorkout.exerciseName}
              </p>
              <p className="text-sm text-warm-grey">
                {conflictWorkout.sets}×{conflictWorkout.reps} @ {conflictWorkout.weightOrResistance || 'BW'}
              </p>
            </div>
            <p className="font-paragraph text-sm text-charcoal-black mb-6">
              Would you like to replace it with the new workout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConflictDialog(false);
                  setConflictWorkout(null);
                }}
                className="flex-1 px-4 py-3 rounded-lg border border-warm-sand-beige hover:bg-warm-sand-beige/20 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReplaceConflict}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-lg bg-soft-bronze text-soft-white hover:bg-soft-bronze/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Replacing...' : 'Replace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
