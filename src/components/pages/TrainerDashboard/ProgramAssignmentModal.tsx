import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import ProtectedDataService from '@/lib/protected-data-service';
import { ClientProfiles, TrainerClientAssignments, ProgramAssignments, FitnessPrograms } from '@/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from 'lucide-react';
import { PROGRAM_STATUS, normalizeStatus } from '@/lib/program-status';

interface ProgramAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  programName: string;
  trainerId: string;
  programStatus?: string;
  onAssignSuccess?: () => void;
}

export default function ProgramAssignmentModal({
  open,
  onOpenChange,
  programId,
  programName,
  trainerId,
  programStatus,
  onAssignSuccess,
}: ProgramAssignmentModalProps) {
  const [clients, setClients] = useState<ClientProfiles[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDraft = normalizeStatus(programStatus) === PROGRAM_STATUS.DRAFT;

  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all trainer-client assignments (trainers can access their own assignments via getAll with role-based filtering)
      const assignmentsResult = await ProtectedDataService.getAll<TrainerClientAssignments>('trainerclientassignments');
      const clientIds = assignmentsResult.items.map(a => a.clientId);

      console.log('📋 [ProgramAssignmentModal] Loaded assignments:', {
        totalAssignments: assignmentsResult.items.length,
        clientIds,
      });

      if (clientIds.length === 0) {
        console.warn('⚠️ [ProgramAssignmentModal] No clients assigned to trainer');
        setClients([]);
        return;
      }

      // Get all client profiles (trainers can access their assigned clients' profiles via getAll with role-based filtering)
      const clientsResult = await ProtectedDataService.getAll<ClientProfiles>('clientprofiles');
      
      // Filter to only show clients assigned to this trainer
      const trainerClients = clientsResult.items.filter(c => clientIds.includes(c._id));
      
      console.log('✅ [ProgramAssignmentModal] Loaded clients:', {
        totalClients: trainerClients.length,
        clients: trainerClients.map(c => ({ id: c._id, name: `${c.firstName} ${c.lastName}` })),
      });
      
      setClients(trainerClients);
    } catch (err) {
      console.error('❌ [ProgramAssignmentModal] Error loading clients:', err);
      setError('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedClientId) {
      setError('Please select a client');
      return;
    }

    try {
      setIsAssigning(true);
      setError(null);

      console.log('🚀 [ProgramAssignmentModal] Starting program assignment:', {
        programId,
        clientId: selectedClientId,
        trainerId,
        programName,
      });

      // Step 1: Create program assignment
      console.log('📝 [ProgramAssignmentModal] Creating program assignment...');
      await ProtectedDataService.create('programassignments', {
        _id: crypto.randomUUID(),
        programId,
        clientId: selectedClientId,
        trainerId,
        assignedAt: new Date().toISOString(),
        status: 'active',
      });
      console.log('✅ [ProgramAssignmentModal] Program assignment created');

      // Step 2: Update program status to assigned
      console.log('📝 [ProgramAssignmentModal] Updating program status to ASSIGNED...');
      console.log('📋 [ProgramAssignmentModal] Update details:', {
        programId,
        trainerId,
        newStatus: PROGRAM_STATUS.ASSIGNED,
      });
      try {
        await ProtectedDataService.update('programs', programId, {
          status: PROGRAM_STATUS.ASSIGNED,
        });
        console.log('✅ [ProgramAssignmentModal] Program status updated');
      } catch (statusUpdateErr) {
        console.error('⚠️ [ProgramAssignmentModal] Failed to update program status:', {
          error: statusUpdateErr,
          programId,
          trainerId,
        });
        setError(`Failed to publish program: ${statusUpdateErr instanceof Error ? statusUpdateErr.message : 'Unknown error'}`);
        setIsAssigning(false);
        return;
      }

      // Step 3: Create placeholder entry in clientprograms so program shows up in client portal
      console.log('📝 [ProgramAssignmentModal] Creating placeholder exercise in clientprograms...');
      const placeholderExercise = {
        _id: crypto.randomUUID(),
        programTitle: programName,
        sessionTitle: 'Program Overview',
        workoutDay: 'Day 1',
        weekNumber: 1,
        exerciseName: 'Program created - exercises to be added',
        sets: 0,
        reps: 0,
        weightOrResistance: '',
        tempo: '',
        restTimeSeconds: 0,
        exerciseNotes: `This program has been assigned to you. Your trainer will add specific exercises soon.`,
        exerciseOrder: 1,
        exerciseVideoUrl: '',
      };

      try {
        await BaseCrudService.create('clientprograms', placeholderExercise);
        console.log('✅ [ProgramAssignmentModal] Placeholder exercise created');
      } catch (placeholderErr) {
        console.error('⚠️ [ProgramAssignmentModal] Failed to create placeholder exercise, continuing anyway:', placeholderErr);
        // Continue - the assignment was created, placeholder is secondary
      }

      console.log('✅ [ProgramAssignmentModal] Program assignment completed successfully');
      onOpenChange(false);
      setSelectedClientId('');
      onAssignSuccess?.();
    } catch (err) {
      console.error('❌ [ProgramAssignmentModal] Error assigning program:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign program';
      setError(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedClient = clients.find(c => c._id === selectedClientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isDraft ? 'Publish & Assign Program' : 'Assign Program to Client'}
          </DialogTitle>
          <DialogDescription>
            {isDraft 
              ? `Publish "${programName}" and assign it to one of your clients`
              : `Assign "${programName}" to one of your clients`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Dropdown */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 text-soft-bronze animate-spin" />
            </div>
          ) : clients.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-paragraph text-sm text-warm-grey">
                No clients assigned to you yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="font-paragraph text-sm font-medium text-charcoal-black">
                Select a Client
              </label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client._id} value={client._id}>
                      <div className="flex flex-col">
                        <span>{client.firstName} {client.lastName}</span>
                        {client.fitnessGoals && (
                          <span className="text-xs text-warm-grey">Goal: {client.fitnessGoals}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selected Client Summary */}
          {selectedClientId && clients.find(c => c._id === selectedClientId) && (
            <div className="bg-soft-bronze/10 border border-soft-bronze/20 rounded-lg p-4">
              <p className="font-paragraph text-sm text-charcoal-black">
                <span className="font-medium">Selected:</span> {clients.find(c => c._id === selectedClientId)?.firstName} {clients.find(c => c._id === selectedClientId)?.lastName}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="font-paragraph text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAssigning}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedClientId || isAssigning}
              className="flex-1 bg-soft-bronze hover:bg-soft-bronze/90"
            >
              {isAssigning ? 'Assigning...' : isDraft ? 'Publish & Assign' : 'Assign Program'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
