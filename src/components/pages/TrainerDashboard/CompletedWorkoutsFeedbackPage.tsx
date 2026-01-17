import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientAssignedWorkouts, TrainerClientAssignments } from '@/entities';
import { getAuthorizedClientWorkouts } from '@/lib/client-workout-access-control';
import { MessageSquare, Save, CheckCircle, Calendar, User, Dumbbell, ChevronDown, Filter, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getClientDisplayName } from '@/lib/client-display-name';
import WeeklySummariesView from '@/components/pages/TrainerDashboard/WeeklySummariesView';

interface CompletedWorkoutWithClient extends ClientAssignedWorkouts {
  clientName?: string;
}

export default function CompletedWorkoutsFeedbackPage() {
  const { member } = useMember();
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkoutWithClient[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<CompletedWorkoutWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterFeedback, setFilterFeedback] = useState<'all' | 'with' | 'without'>('all');
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!member?._id) return;

      try {
        // Get trainer's clients
        const { items: assignments } = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
        const trainerClients = assignments.filter(
          a => a.trainerId === member._id && a.status === 'active'
        );
        const clientIds = trainerClients.map(a => a.clientId).filter(Boolean) as string[];

        // Fetch client names
        const clientsWithNames = await Promise.all(
          clientIds.map(async (clientId) => ({
            id: clientId,
            name: await getClientDisplayName(clientId),
          }))
        );
        setClients(clientsWithNames);

        // SECURITY: Get completed workouts using access-controlled method
        // This ensures trainer can only see workouts for their actively managed clients
        const completed = await getAuthorizedClientWorkouts({
          memberId: member._id,
          role: 'trainer',
          status: 'completed'
        });

        // Add client names to workouts
        const workoutsWithNames = await Promise.all(
          completed.map(async (workout) => ({
            ...workout,
            clientName: await getClientDisplayName(workout.clientId || ''),
          }))
        );

        // Sort by most recent first
        workoutsWithNames.sort((a, b) => {
          const dateA = new Date(a._updatedDate || 0).getTime();
          const dateB = new Date(b._updatedDate || 0).getTime();
          return dateB - dateA;
        });

        setCompletedWorkouts(workoutsWithNames);
        setFilteredWorkouts(workoutsWithNames);

        // Initialize comment text for workouts that already have comments
        const initialComments: Record<string, string> = {};
        workoutsWithNames.forEach(w => {
          if (w.trainerComment) {
            initialComments[w._id] = w.trainerComment;
          }
        });
        setCommentText(initialComments);
      } catch (error) {
        console.error('Error fetching completed workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member?._id]);

  // Apply filters
  useEffect(() => {
    let filtered = [...completedWorkouts];

    // Filter by client
    if (filterClient !== 'all') {
      filtered = filtered.filter(w => w.clientId === filterClient);
    }

    // Filter by feedback status
    if (filterFeedback === 'with') {
      filtered = filtered.filter(w => w.trainerComment && w.trainerComment.trim() !== '');
    } else if (filterFeedback === 'without') {
      filtered = filtered.filter(w => !w.trainerComment || w.trainerComment.trim() === '');
    }

    setFilteredWorkouts(filtered);
  }, [filterClient, filterFeedback, completedWorkouts]);

  const handleSaveComment = async (workoutId: string) => {
    setSavingId(workoutId);

    try {
      const comment = commentText[workoutId] || '';
      
      await BaseCrudService.update('clientassignedworkouts', {
        _id: workoutId,
        trainerComment: comment,
        trainerCommentDate: new Date().toISOString(),
        trainerCommentBy: member?._id,
      });

      // Update local state
      setCompletedWorkouts(prev =>
        prev.map(w =>
          w._id === workoutId
            ? {
                ...w,
                trainerComment: comment,
                trainerCommentDate: new Date().toISOString(),
                trainerCommentBy: member?._id,
              }
            : w
        )
      );

      setEditingId(null);
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Failed to save comment. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const handleEditComment = (workoutId: string, currentComment: string) => {
    setEditingId(workoutId);
    setCommentText(prev => ({
      ...prev,
      [workoutId]: currentComment || '',
    }));
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-12 flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading completed workouts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Workout Feedback & Summaries</h1>
        <p className="text-soft-white/90">
          Leave feedback on completed workouts and view weekly progress summaries
        </p>
      </div>

      {/* Tabs for Feedback and Summaries */}
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Workout Feedback
          </TabsTrigger>
          <TabsTrigger value="summaries" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Weekly Summaries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-6 mt-6">
          {/* Filters */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-soft-bronze" />
              <h2 className="font-heading text-lg font-bold text-charcoal-black">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-charcoal-black mb-2 block">
                  Client
                </label>
                <Select value={filterClient} onValueChange={setFilterClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal-black mb-2 block">
              Feedback Status
            </label>
            <Select value={filterFeedback} onValueChange={(v) => setFilterFeedback(v as 'all' | 'with' | 'without')}>
              <SelectTrigger>
                <SelectValue placeholder="All workouts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workouts</SelectItem>
                <SelectItem value="without">Without feedback</SelectItem>
                <SelectItem value="with">With feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-soft-bronze/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-soft-bronze" />
            </div>
            <div>
              <p className="text-sm text-warm-grey">Total Completed</p>
              <p className="font-heading text-2xl font-bold text-charcoal-black">
                {completedWorkouts.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-warm-grey">With Feedback</p>
              <p className="font-heading text-2xl font-bold text-charcoal-black">
                {completedWorkouts.filter(w => w.trainerComment && w.trainerComment.trim() !== '').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted-rose/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-muted-rose" />
            </div>
            <div>
              <p className="text-sm text-warm-grey">Needs Feedback</p>
              <p className="font-heading text-2xl font-bold text-charcoal-black">
                {completedWorkouts.filter(w => !w.trainerComment || w.trainerComment.trim() === '').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {filteredWorkouts.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-warm-grey mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
              No workouts found
            </h3>
            <p className="text-warm-grey">
              {filterClient !== 'all' || filterFeedback !== 'all'
                ? 'Try adjusting your filters'
                : 'Your clients haven\'t completed any workouts yet'}
            </p>
          </Card>
        ) : (
          filteredWorkouts.map(workout => {
            const isExpanded = expandedWorkout === workout._id;
            const isEditing = editingId === workout._id;
            const isSaving = savingId === workout._id;
            const hasComment = workout.trainerComment && workout.trainerComment.trim() !== '';

            return (
              <Card key={workout._id} className="overflow-hidden">
                {/* Workout Header */}
                <button
                  onClick={() => setExpandedWorkout(isExpanded ? null : workout._id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-warm-sand-beige/10 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-heading text-lg font-bold text-charcoal-black">
                        {workout.exerciseName}
                      </h3>
                      {hasComment && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <MessageSquare size={12} /> Feedback given
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-warm-grey">
                      <span className="flex items-center gap-1">
                        <User size={14} /> {workout.clientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> Week {workout.weekNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell size={14} /> {workout.sets}×{workout.reps}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-soft-bronze transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-warm-sand-beige px-6 py-4 space-y-4">
                    {/* Workout Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-warm-sand-beige/10 rounded-lg">
                      <div>
                        <p className="text-xs text-warm-grey mb-1">Sets × Reps</p>
                        <p className="font-bold text-charcoal-black">{workout.sets} × {workout.reps}</p>
                      </div>
                      <div>
                        <p className="text-xs text-warm-grey mb-1">Weight</p>
                        <p className="font-bold text-charcoal-black">{workout.weightOrResistance || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-warm-grey mb-1">Tempo</p>
                        <p className="font-bold text-charcoal-black">{workout.tempo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-warm-grey mb-1">Rest</p>
                        <p className="font-bold text-charcoal-black">{workout.restTimeSeconds}s</p>
                      </div>
                    </div>

                    {workout.exerciseNotes && (
                      <div className="p-4 bg-warm-sand-beige/10 rounded-lg">
                        <p className="text-xs text-warm-grey mb-1">Exercise Notes</p>
                        <p className="text-sm text-charcoal-black">{workout.exerciseNotes}</p>
                      </div>
                    )}

                    {/* Client Reflection Section */}
                    {(workout.difficultyRating || workout.clientReflectionNotes) && (
                      <div className="p-4 bg-soft-bronze/5 border border-soft-bronze/20 rounded-lg">
                        <h4 className="font-heading text-sm font-bold text-charcoal-black mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-soft-bronze" />
                          Client Reflection
                        </h4>
                        <div className="space-y-2">
                          {workout.difficultyRating && (
                            <div>
                              <p className="text-xs text-warm-grey mb-1">Difficulty Rating</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                workout.difficultyRating === 'Easy' 
                                  ? 'bg-green-100 text-green-700'
                                  : workout.difficultyRating === 'Moderate'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {workout.difficultyRating}
                              </span>
                            </div>
                          )}
                          {workout.clientReflectionNotes && (
                            <div>
                              <p className="text-xs text-warm-grey mb-1">Client Notes</p>
                              <p className="text-sm text-charcoal-black italic">"{workout.clientReflectionNotes}"</p>
                            </div>
                          )}
                          {workout.reflectionSubmittedAt && (
                            <p className="text-xs text-warm-grey mt-2">
                              Submitted: {formatDateTime(workout.reflectionSubmittedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Trainer Feedback Section */}
                    <div className="border-t border-warm-sand-beige pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-heading text-base font-bold text-charcoal-black flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-soft-bronze" />
                          Trainer Feedback
                        </h4>
                        {hasComment && !isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditComment(workout._id, workout.trainerComment || '')}
                          >
                            Edit
                          </Button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <Textarea
                            value={commentText[workout._id] || ''}
                            onChange={(e) =>
                              setCommentText(prev => ({
                                ...prev,
                                [workout._id]: e.target.value,
                              }))
                            }
                            placeholder="Leave feedback, encouragement, or form cues for your client..."
                            className="min-h-[100px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSaveComment(workout._id)}
                              disabled={isSaving}
                              className="flex items-center gap-2"
                            >
                              <Save size={16} />
                              {isSaving ? 'Saving...' : 'Save Feedback'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingId(null);
                                setCommentText(prev => ({
                                  ...prev,
                                  [workout._id]: workout.trainerComment || '',
                                }));
                              }}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : hasComment ? (
                        <div className="bg-soft-bronze/5 border-l-4 border-soft-bronze rounded-r-lg p-4">
                          <p className="text-sm text-charcoal-black leading-relaxed mb-2">
                            {workout.trainerComment}
                          </p>
                          {workout.trainerCommentDate && (
                            <p className="text-xs text-warm-grey">
                              Added on {formatDateTime(workout.trainerCommentDate)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-warm-grey mb-3">No feedback yet</p>
                          <Button
                            onClick={() => handleEditComment(workout._id, '')}
                            variant="outline"
                            className="flex items-center gap-2 mx-auto"
                          >
                            <MessageSquare size={16} />
                            Add Feedback
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
        </TabsContent>

        <TabsContent value="summaries" className="mt-6">
          <WeeklySummariesView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
