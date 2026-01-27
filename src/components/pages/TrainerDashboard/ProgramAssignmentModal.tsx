import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { ProtectedDataService } from '@/lib/protected-data-service';
import { ClientProfiles, TrainerClientAssignments, ProgramAssignments } from '@/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from 'lucide-react';

interface ProgramAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  programName: string;
  trainerId: string;
  onAssignSuccess?: () => void;
}

export default function ProgramAssignmentModal({
  open,
  onOpenChange,
  programId,
  programName,
  trainerId,
  onAssignSuccess,
}: ProgramAssignmentModalProps) {
  const [clients, setClients] = useState<ClientProfiles[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get trainer-client assignments for this trainer using protected service
      const assignmentsResult = await ProtectedDataService.getForTrainer<TrainerClientAssignments>('trainerclientassignments', trainerId);
      const clientIds = assignmentsResult.items.map(a => a.clientId);

      if (clientIds.length === 0) {
        setClients([]);
        return;
      }

      // Get client profiles for the assigned clients
      const clientsResult = await ProtectedDataService.getAll<ClientProfiles>('clientprofiles');
      
      // Filter to only show clients assigned to this trainer
      const trainerClients = clientsResult.items.filter(c => clientIds.includes(c._id));
      
      setClients(trainerClients);
    } catch (err) {
      console.error('Error loading clients:', err);
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

      // Create program assignment using protected service
      await ProtectedDataService.create('programassignments', {
        _id: crypto.randomUUID(),
        programId,
        clientId: selectedClientId,
        trainerId,
        assignedAt: new Date().toISOString(),
        status: 'active',
      });

      // Update program status to assigned using protected service
      await ProtectedDataService.update('programs', programId, {
        status: 'assigned',
      });

      onOpenChange(false);
      setSelectedClientId('');
      onAssignSuccess?.();
    } catch (err) {
      console.error('Error assigning program:', err);
      setError('Failed to assign program');
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedClient = clients.find(c => c._id === selectedClientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Program to Client</DialogTitle>
          <DialogDescription>
            Assign "{programName}" to one of your clients
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
              {isAssigning ? 'Assigning...' : 'Assign Program'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
