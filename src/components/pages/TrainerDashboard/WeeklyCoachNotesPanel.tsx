import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { WeeklyCoachesNotes, TrainerClientAssignments } from '@/entities';
import { Edit2, Save, X, Plus, Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface ClientWithNote {
  clientId: string;
  clientName?: string;
  currentNote?: WeeklyCoachesNotes;
}

export default function WeeklyCoachNotesPanel() {
  const { member } = useMember();
  const [clients, setClients] = useState<ClientWithNote[]>([]);
  const [notes, setNotes] = useState<WeeklyCoachesNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getWeekStartDate = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!member?._id) return;

      try {
        setLoading(true);

        // Fetch trainer's assigned clients
        const { items: assignments } = await BaseCrudService.getAll<TrainerClientAssignments>(
          'trainerclientassignments'
        );
        const trainerClients = assignments.filter(a => a.trainerId === member._id && a.status === 'active');

        // Fetch all weekly notes
        const { items: allNotes } = await BaseCrudService.getAll<WeeklyCoachesNotes>(
          'weeklycoachesnotes'
        );
        setNotes(allNotes);

        // Get current week's start date
        const weekStart = getWeekStartDate();
        const weekStartStr = weekStart.toISOString().split('T')[0];

        // Build client list with their current notes
        const clientList: ClientWithNote[] = trainerClients.map(assignment => {
          const currentNote = allNotes.find(
            n =>
              n.clientId === assignment.clientId &&
              n.trainerId === member._id &&
              n.weekStartDate &&
              new Date(n.weekStartDate).toISOString().split('T')[0] === weekStartStr
          );

          return {
            clientId: assignment.clientId || '',
            currentNote,
          };
        });

        setClients(clientList);
      } catch (error) {
        console.error('Error fetching coach notes data:', error);
        setMessage({ type: 'error', text: 'Failed to load coach notes' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member?._id]);

  const handleEditNote = (note: WeeklyCoachesNotes | undefined) => {
    if (note) {
      setEditingNoteId(note._id);
      setEditContent(note.noteContent || '');
    }
  };

  const handleCreateNote = (clientId: string) => {
    setEditingNoteId(`new-${clientId}`);
    setEditContent('');
  };

  const handleSaveNote = async (clientId: string) => {
    if (!member?._id) return;

    setIsSaving(true);
    try {
      const weekStart = getWeekStartDate();
      const existingNote = clients.find(c => c.clientId === clientId)?.currentNote;

      if (existingNote && editingNoteId === existingNote._id) {
        // Update existing note
        await BaseCrudService.update<WeeklyCoachesNotes>('weeklycoachesnotes', {
          _id: existingNote._id,
          noteContent: editContent,
          lastUpdated: new Date(),
          isPublished: true,
        });

        setNotes(prevNotes =>
          prevNotes.map(n =>
            n._id === existingNote._id
              ? {
                  ...n,
                  noteContent: editContent,
                  lastUpdated: new Date(),
                  isPublished: true,
                }
              : n
          )
        );
      } else {
        // Create new note
        const newNote: WeeklyCoachesNotes = {
          _id: crypto.randomUUID(),
          clientId,
          trainerId: member._id,
          weekStartDate: weekStart,
          noteContent: editContent,
          lastUpdated: new Date(),
          isPublished: true,
        };

        await BaseCrudService.create('weeklycoachesnotes', newNote);
        setNotes(prevNotes => [...prevNotes, newNote]);
      }

      // Update local client list
      setClients(prevClients =>
        prevClients.map(c => {
          if (c.clientId === clientId) {
            const weekStartStr = weekStart.toISOString().split('T')[0];
            const updatedNote = notes.find(
              n =>
                n.clientId === clientId &&
                n.trainerId === member._id &&
                n.weekStartDate &&
                new Date(n.weekStartDate).toISOString().split('T')[0] === weekStartStr
            );
            return { ...c, currentNote: updatedNote };
          }
          return c;
        })
      );

      setMessage({ type: 'success', text: 'Coach note saved successfully' });
      setEditingNoteId(null);
      setEditContent('');

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving coach note:', error);
      setMessage({ type: 'error', text: 'Failed to save coach note' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-soft-bronze" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
      <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
        Weekly Coach Notes
      </h2>
      <p className="font-paragraph text-sm text-warm-grey mb-6">
        Add optional weekly notes for your clients. These will appear at the top of their Program overview.
      </p>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex gap-3 ${
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
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Clients List */}
      {clients.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-warm-grey mx-auto mb-4" />
          <p className="font-paragraph text-lg text-warm-grey">
            You don't have any assigned clients yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map(client => (
            <div
              key={client.clientId}
              className="border border-warm-sand-beige rounded-xl p-6 hover:border-soft-bronze/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-charcoal-black">
                    Client ID: {client.clientId}
                  </h3>
                  {client.currentNote && (
                    <p className="text-xs text-warm-grey mt-1">
                      Last updated:{' '}
                      {new Date(client.currentNote.lastUpdated || '').toLocaleDateString('en-GB', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                {client.currentNote && client.currentNote.isPublished && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    ✓ Published
                  </span>
                )}
              </div>

              {editingNoteId === client.currentNote?._id || editingNoteId === `new-${client.clientId}` ? (
                // Edit Mode
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Write your weekly note here... (optional)"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveNote(client.clientId)}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-soft-bronze text-soft-white px-4 py-2 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Note
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-warm-sand-beige text-charcoal-black px-4 py-2 rounded-lg font-medium hover:bg-warm-sand-beige/80 transition-colors disabled:opacity-50"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  {client.currentNote && client.currentNote.noteContent ? (
                    <div className="space-y-4">
                      <div className="bg-warm-sand-beige/20 border border-warm-sand-beige rounded-lg p-4">
                        <p className="font-paragraph text-charcoal-black whitespace-pre-wrap">
                          {client.currentNote.noteContent}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditNote(client.currentNote)}
                        className="flex items-center gap-2 text-soft-bronze hover:text-soft-bronze/80 font-medium text-sm"
                      >
                        <Edit2 size={16} />
                        Edit Note
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-warm-grey text-sm mb-4">No note for this week yet</p>
                      <button
                        onClick={() => handleCreateNote(client.clientId)}
                        className="flex items-center gap-2 bg-warm-sand-beige text-charcoal-black px-4 py-2 rounded-lg font-medium hover:bg-warm-sand-beige/80 transition-colors mx-auto"
                      >
                        <Plus size={16} />
                        Add Note
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
