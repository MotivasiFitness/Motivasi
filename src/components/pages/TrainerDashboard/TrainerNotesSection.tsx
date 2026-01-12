import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { TrainerNotes } from '@/entities';
import { Edit2, Save, X, Plus, Loader, AlertCircle } from 'lucide-react';

interface TrainerNotesSectionProps {
  clientId: string;
  clientName?: string;
}

export default function TrainerNotesSection({ clientId, clientName }: TrainerNotesSectionProps) {
  const { member } = useMember();
  const [notes, setNotes] = useState<TrainerNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      if (!member?._id || !clientId) return;

      try {
        setLoading(true);
        const { items } = await BaseCrudService.getAll<TrainerNotes>('trainernotes');
        const clientNotes = items.filter(
          n => n.trainerId === member._id && n.clientId === clientId
        );
        setNotes(clientNotes.sort((a, b) => {
          const dateA = new Date(a.noteDate || 0).getTime();
          const dateB = new Date(b.noteDate || 0).getTime();
          return dateB - dateA;
        }));
      } catch (err) {
        console.error('Error fetching trainer notes:', err);
        setError('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [member?._id, clientId]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !member?._id) return;

    setIsSaving(true);
    setError('');

    try {
      const note: TrainerNotes = {
        _id: crypto.randomUUID(),
        trainerId: member._id,
        clientId,
        noteContent: newNote.trim(),
        noteDate: new Date(),
      };

      await BaseCrudService.create('trainernotes', note);
      setNotes(prev => [note, ...prev]);
      setNewNote('');
      setIsEditing(false);
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;

    setIsSaving(true);
    setError('');

    try {
      await BaseCrudService.update<TrainerNotes>('trainernotes', {
        _id: noteId,
        noteContent: editingContent.trim(),
        noteDate: new Date(),
      });

      setNotes(prev => prev.map(n =>
        n._id === noteId
          ? { ...n, noteContent: editingContent.trim(), noteDate: new Date() }
          : n
      ));
      setEditingNoteId(null);
      setEditingContent('');
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      await BaseCrudService.delete('trainernotes', noteId);
      setNotes(prev => prev.filter(n => n._id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-soft-bronze" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-2xl font-bold text-charcoal-black">
            Private Trainer Notes
          </h3>
          <p className="text-sm text-warm-grey mt-1">
            {clientName ? `Notes for ${clientName}` : 'Client-specific notes (private to trainer only)'}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-soft-bronze text-soft-white px-4 py-2 rounded-lg hover:bg-soft-bronze/90 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add Note
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="font-paragraph text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* New Note Form */}
      {isEditing && (
        <div className="mb-6 p-6 bg-warm-sand-beige/20 border border-warm-sand-beige rounded-xl">
          <label className="block text-sm font-medium text-charcoal-black mb-3">
            Add a new note
          </label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="e.g., Injury history, preferences, coaching cues, personal context..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm resize-none"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isSaving}
              className="flex items-center gap-2 bg-charcoal-black text-soft-white px-4 py-2 rounded-lg hover:bg-soft-bronze transition-colors text-sm font-medium disabled:opacity-50"
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
              onClick={() => {
                setIsEditing(false);
                setNewNote('');
              }}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-warm-grey mb-4">No notes yet. Add one to track important information about this client.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note._id} className="p-4 bg-warm-sand-beige/10 border border-warm-sand-beige rounded-lg">
              {editingNoteId === note._id ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNote(note._id)}
                      disabled={!editingContent.trim() || isSaving}
                      className="flex items-center gap-2 bg-charcoal-black text-soft-white px-3 py-1.5 rounded text-sm font-medium hover:bg-soft-bronze transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditingContent('');
                      }}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded text-sm font-medium border border-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige/20 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-paragraph text-sm text-charcoal-black mb-2">
                    {note.noteContent}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-warm-grey">
                      {note.noteDate ? new Date(note.noteDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'No date'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingNoteId(note._id);
                          setEditingContent(note.noteContent || '');
                        }}
                        className="p-1.5 rounded text-charcoal-black hover:bg-warm-sand-beige/50 transition-colors"
                        title="Edit note"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete note"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg">
        <p className="font-paragraph text-xs text-charcoal-black">
          <span className="font-bold">🔒 Private:</span> These notes are only visible to you and other admins. Clients cannot see them.
        </p>
      </div>
    </div>
  );
}
