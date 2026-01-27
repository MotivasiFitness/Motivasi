import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { FitnessPrograms, ProgramDrafts } from '@/entities';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, BookOpen, Calendar, Target, User, Sparkles, FileText, Plus, Edit2, Trash2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProgramAssignmentModal from './ProgramAssignmentModal';

export default function ProgramsCreatedPage() {
  const { member } = useMember();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<FitnessPrograms[]>([]);
  const [programDrafts, setProgramDrafts] = useState<ProgramDrafts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'assigned' | 'template'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<FitnessPrograms | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [programToAssign, setProgramToAssign] = useState<FitnessPrograms | null>(null);

  useEffect(() => {
    loadPrograms();
  }, [member?._id]);

  // Refresh programs when page becomes visible (after redirect from save)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📄 Page became visible, refreshing programs...');
        loadPrograms();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadPrograms = async () => {
    if (!member?._id) return;

    try {
      setIsLoading(true);

      console.log('🔄 Loading programs for trainer:', member._id);

      // Load programs from both collections
      const [programsResult, draftsResult] = await Promise.all([
        BaseCrudService.getAll<FitnessPrograms>('programs'),
        BaseCrudService.getAll<ProgramDrafts>('programdrafts'),
      ]);

      // Filter by trainer
      const trainerPrograms = programsResult.items.filter(p => p.trainerId === member._id);
      const trainerDrafts = draftsResult.items.filter(d => d.trainerId === member._id);

      console.log('✅ Programs loaded:', {
        totalPrograms: trainerPrograms.length,
        totalDrafts: trainerDrafts.length,
        programs: trainerPrograms.map(p => ({ id: p._id, name: p.programName, status: p.status })),
        drafts: trainerDrafts.map(d => ({ id: d._id, programId: d.programId, status: d.status })),
      });

      setPrograms(trainerPrograms);
      setProgramDrafts(trainerDrafts);
    } catch (error) {
      console.error('❌ Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredPrograms = () => {
    if (filter === 'all') {
      return programs;
    }
    return programs.filter(p => {
      const status = p.status?.toLowerCase();
      if (filter === 'draft') return status === 'draft';
      if (filter === 'assigned') return status === 'assigned' || status === 'active';
      if (filter === 'template') return status === 'template';
      return true;
    });
  };

  const filteredPrograms = getFilteredPrograms();

  const handleDeleteClick = (e: React.MouseEvent, program: FitnessPrograms) => {
    e.preventDefault();
    e.stopPropagation();
    setProgramToDelete(program);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!programToDelete) return;

    try {
      setIsDeleting(true);
      // Delete the program
      await BaseCrudService.delete('programs', programToDelete._id);
      
      // Delete associated draft if exists
      const associatedDraft = programDrafts.find(d => d.programId === programToDelete._id);
      if (associatedDraft) {
        await BaseCrudService.delete('programdrafts', associatedDraft._id);
      }

      // Update state
      setPrograms(programs.filter(p => p._id !== programToDelete._id));
      setProgramDrafts(programDrafts.filter(d => d.programId !== programToDelete._id));
      setDeleteDialogOpen(false);
      setProgramToDelete(null);
    } catch (error) {
      console.error('Error deleting program:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, programId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/trainer/program-view?id=${programId}`);
  };

  const handleAssignClick = (e: React.MouseEvent, program: FitnessPrograms) => {
    e.preventDefault();
    e.stopPropagation();
    setProgramToAssign(program);
    setAssignmentModalOpen(true);
  };

  const getStatusBadge = (status?: string) => {
    const statusLower = status?.toLowerCase() || 'draft';
    
    const styles = {
      draft: 'bg-warm-grey/20 text-warm-grey',
      assigned: 'bg-soft-bronze/20 text-soft-bronze',
      active: 'bg-soft-bronze/20 text-soft-bronze',
      template: 'bg-muted-rose/20 text-muted-rose',
      completed: 'bg-green-100 text-green-700',
      paused: 'bg-amber-100 text-amber-700',
    };

    const style = styles[statusLower as keyof typeof styles] || styles.draft;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
        {status || 'Draft'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="min-h-[400px] flex items-center justify-center">
            <Loader className="w-8 h-8 text-soft-bronze animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
                Programs Created
              </h1>
              <p className="font-paragraph text-lg text-warm-grey">
                View and manage all your training programs
              </p>
            </div>
            <Link
              to="/trainer/ai-assistant"
              className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors"
            >
              <Sparkles size={20} />
              Create with AI
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 border-b border-warm-sand-beige">
          {[
            { key: 'all', label: 'All Programs' },
            { key: 'draft', label: 'Drafts' },
            { key: 'assigned', label: 'Assigned' },
            { key: 'template', label: 'Templates' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-6 py-3 font-paragraph text-sm font-medium transition-colors relative ${
                filter === tab.key
                  ? 'text-soft-bronze'
                  : 'text-warm-grey hover:text-charcoal-black'
              }`}
            >
              {tab.label}
              {filter === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-soft-bronze"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-warm-grey mx-auto mb-4" />
            <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
              No Programs Yet
            </h3>
            <p className="font-paragraph text-base text-warm-grey mb-6">
              {filter === 'all'
                ? 'Create your first training program using the AI assistant'
                : `No ${filter} programs found`}
            </p>
            <Link
              to="/trainer/ai-assistant"
              className="inline-flex items-center gap-2 bg-charcoal-black text-soft-white px-6 py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors"
            >
              <Plus size={20} />
              Create Program
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program, index) => (
              <motion.div
                key={program._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 hover:border-soft-bronze transition-colors group h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors">
                        {program.programName || 'Untitled Program'}
                      </h3>
                      {getStatusBadge(program.status)}
                    </div>
                    <BookOpen className="text-soft-bronze flex-shrink-0 ml-4" size={24} />
                  </div>

                  {/* Description */}
                  {program.description && (
                    <p className="font-paragraph text-sm text-warm-grey mb-4 line-clamp-2">
                      {program.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="space-y-2 pt-4 border-t border-warm-sand-beige flex-1">
                    {program.duration && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-black">
                        <Calendar size={16} className="text-soft-bronze" />
                        <span className="font-paragraph">{program.duration}</span>
                      </div>
                    )}
                    {program.focusArea && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-black">
                        <Target size={16} className="text-soft-bronze" />
                        <span className="font-paragraph">{program.focusArea}</span>
                      </div>
                    )}
                    {program.clientId && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-black">
                        <User size={16} className="text-soft-bronze" />
                        <span className="font-paragraph">
                          Client {program.clientId.slice(0, 8)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI Badge */}
                  {programDrafts.find(d => d.programId === program._id)?.programJson && (
                    <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                      <div className="flex items-center gap-2 text-xs text-soft-bronze">
                        <Sparkles size={14} />
                        <span className="font-paragraph">AI Generated</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-warm-sand-beige flex gap-2">
                    <button
                      onClick={(e) => handleAssignClick(e, program)}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-soft-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
                    >
                      <Send size={16} />
                      Assign
                    </button>
                    <button
                      onClick={(e) => handleEditClick(e, program._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-soft-bronze text-soft-white px-4 py-2 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, program)}
                      className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-lg font-medium hover:bg-destructive/20 transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Program</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{programToDelete?.programName || 'Untitled Program'}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stats Summary */}
        {programs.length > 0 && (
          <div className="mt-12 bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-6">
              Program Statistics
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-1">Total Programs</p>
                <p className="font-heading text-3xl font-bold text-charcoal-black">
                  {programs.length}
                </p>
              </div>
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-1">Drafts</p>
                <p className="font-heading text-3xl font-bold text-charcoal-black">
                  {programs.filter(p => p.status?.toLowerCase() === 'draft').length}
                </p>
              </div>
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-1">Assigned</p>
                <p className="font-heading text-3xl font-bold text-charcoal-black">
                  {programs.filter(p => ['assigned', 'active'].includes(p.status?.toLowerCase() || '')).length}
                </p>
              </div>
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-1">Templates</p>
                <p className="font-heading text-3xl font-bold text-charcoal-black">
                  {programs.filter(p => p.status?.toLowerCase() === 'template').length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Program Assignment Modal */}
        {programToAssign && member?._id && (
          <ProgramAssignmentModal
            open={assignmentModalOpen}
            onOpenChange={setAssignmentModalOpen}
            programId={programToAssign._id}
            programName={programToAssign.programName || 'Untitled Program'}
            trainerId={member._id}
            onAssignSuccess={loadPrograms}
          />
        )}
      </div>
    </div>
  );
}
