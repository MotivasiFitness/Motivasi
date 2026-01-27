import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { ClientProfiles, TrainerClientAssignments, ProgramAssignments } from '@/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader, Search } from 'lucide-react';

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
  const [filteredClients, setFilteredClients] = useState<ClientProfiles[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  useEffect(() => {
    // Filter clients based on search term
    const filtered = clients.filter(client => {
      const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all trainer-client assignments for this trainer
      const assignmentsResult = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
      const trainerAssignments = assignmentsResult.items.filter(a => a.trainerId === trainerId);
      const clientIds = trainerAssignments.map(a => a.clientId);

      // Get all client profiles
      const clientsResult = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
      
      // Filter to only show clients assigned to this trainer
      const trainerClients = clientsResult.items.filter(c => clientIds.includes(c._id));
      
      setClients(trainerClients);
      setFilteredClients(trainerClients);
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

      // Create program assignment
      await BaseCrudService.create('programassignments', {
        _id: crypto.randomUUID(),
        programId,
        clientId: selectedClientId,
        trainerId,
        assignedAt: new Date().toISOString(),
        status: 'active',
      });

      // Update program status to assigned
      await BaseCrudService.update('programs', {
        _id: programId,
        status: 'assigned',
      });

      onOpenChange(false);
      setSelectedClientId('');
      setSearchTerm('');
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
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-warm-grey" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-warm-sand-beige rounded-lg font-paragraph text-sm focus:outline-none focus:border-soft-bronze"
            />
          </div>

          {/* Client List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 text-soft-bronze animate-spin" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-paragraph text-sm text-warm-grey">
                {clients.length === 0 ? 'No clients assigned to you yet' : 'No clients match your search'}
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 border border-warm-sand-beige rounded-lg p-2">
              {filteredClients.map(client => (
                <button
                  key={client._id}
                  onClick={() => setSelectedClientId(client._id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-paragraph text-sm ${
                    selectedClientId === client._id
                      ? 'bg-soft-bronze text-soft-white'
                      : 'bg-soft-white border border-warm-sand-beige hover:border-soft-bronze'
                  }`}
                >
                  <div className="font-medium">
                    {client.firstName} {client.lastName}
                  </div>
                  {client.fitnessGoals && (
                    <div className="text-xs opacity-75 mt-1">
                      Goal: {client.fitnessGoals}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Selected Client Summary */}
          {selectedClient && (
            <div className="bg-soft-bronze/10 border border-soft-bronze/20 rounded-lg p-4">
              <p className="font-paragraph text-sm text-charcoal-black">
                <span className="font-medium">Selected:</span> {selectedClient.firstName} {selectedClient.lastName}
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
