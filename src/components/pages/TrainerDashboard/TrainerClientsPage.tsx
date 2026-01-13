import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { FitnessPrograms, TrainerClientAssignments, MemberRoles, TrainerClientMessages } from '@/entities';
import { MessageSquare, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTrainerClients, assignClientToTrainer } from '@/lib/role-utils';

interface ClientInfo {
  assignmentId: string;
  clientId: string;
  programCount: number;
  activePrograms: number;
  assignmentStatus: string;
  conversationId?: string;
}

interface AvailableClient {
  memberId: string;
  role: string;
  email?: string;
}

export default function TrainerClientsPage() {
  const { member } = useMember();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [availableClients, setAvailableClients] = useState<AvailableClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [messagingClientId, setMessagingClientId] = useState<string | null>(null);

  const fetchClients = async () => {
    if (!member?._id) return;

    try {
      // Get assigned clients
      const assignments = await getTrainerClients(member._id);
      
      // Get programs for each client
      const { items: programs } = await BaseCrudService.getAll<FitnessPrograms>('programs');
      const trainerPrograms = programs.filter(p => p.trainerId === member._id);

      // Get all messages to find/create conversation IDs
      const { items: messages } = await BaseCrudService.getAll<TrainerClientMessages>('trainerclientmessages');

      // Build client info
      const clientMap = new Map<string, ClientInfo>();
      
      assignments.forEach((assignment) => {
        if (assignment.clientId) {
          // Find existing conversation for this client
          const existingConversation = messages.find(
            m => (m.senderId === member._id && m.recipientId === assignment.clientId) ||
                 (m.senderId === assignment.clientId && m.recipientId === member._id)
          );
          
          clientMap.set(assignment.clientId, {
            assignmentId: assignment._id,
            clientId: assignment.clientId,
            programCount: 0,
            activePrograms: 0,
            assignmentStatus: assignment.status || 'Active',
            conversationId: existingConversation?.conversationId || `${member._id}-${assignment.clientId}`,
          });
        }
      });

      // Count programs
      trainerPrograms.forEach((program) => {
        if (program.clientId && clientMap.has(program.clientId)) {
          const client = clientMap.get(program.clientId)!;
          client.programCount += 1;
          if (program.status === 'Active') {
            client.activePrograms += 1;
          }
        }
      });

      setClients(Array.from(clientMap.values()));

      // Fetch all available clients (users with client role)
      const { items: memberRoles } = await BaseCrudService.getAll<MemberRoles>('memberroles');
      const clientRoles = memberRoles.filter(
        (mr) => mr.role === 'client' && mr.status === 'active'
      );

      // Filter out already assigned clients
      const assignedClientIds = new Set(assignments.map(a => a.clientId));
      const unassignedClients = clientRoles.filter(
        (mr) => !assignedClientIds.has(mr.memberId)
      );

      setAvailableClients(
        unassignedClients.map((mr) => ({
          memberId: mr.memberId || '',
          role: mr.role || 'client',
          email: mr.memberId || '',
        }))
      );
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [member?._id]);

  const handleAssignClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignmentError('');
    setAssignmentSuccess('');
    setIsAssigning(true);

    try {
      if (!newClientId.trim()) {
        setAssignmentError('Please enter a client ID');
        setIsAssigning(false);
        return;
      }

      if (!member?._id) {
        setAssignmentError('Trainer ID not found');
        setIsAssigning(false);
        return;
      }

      await assignClientToTrainer(member._id, newClientId.trim());
      setAssignmentSuccess('Client assigned successfully!');
      setNewClientId('');
      setShowAssignForm(false);
      
      // Refresh clients list
      await fetchClients();

      setTimeout(() => setAssignmentSuccess(''), 3000);
    } catch (error) {
      setAssignmentError('Failed to assign client. Please try again.');
      console.error('Error assigning client:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleMessageClient = async (clientId: string, conversationId: string) => {
    console.log('[handleMessageClient] Starting message flow', { clientId, conversationId, trainerId: member?._id });
    setMessageError('');
    setMessagingClientId(clientId);

    try {
      // Validate required data
      if (!clientId || !clientId.trim()) {
        const error = 'Client ID is missing or invalid';
        console.error('[handleMessageClient] Validation failed:', error);
        setMessageError(error);
        setMessagingClientId(null);
        return;
      }

      if (!member?._id) {
        const error = 'Trainer ID not found - please ensure you are logged in';
        console.error('[handleMessageClient] Validation failed:', error);
        setMessageError(error);
        setMessagingClientId(null);
        return;
      }

      console.log('[handleMessageClient] Validation passed, navigating to messages');

      // Navigate to messages page with client ID as query parameter
      // The messages page will handle creating/finding the conversation
      navigate(`/trainer/messages?clientId=${encodeURIComponent(clientId)}&conversationId=${encodeURIComponent(conversationId)}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to open messaging';
      console.error('[handleMessageClient] Error:', errorMsg, error);
      setMessageError(errorMsg);
      setMessagingClientId(null);
    }
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
              My Clients
            </h1>
            <p className="text-lg text-warm-grey">
              Manage and communicate with your assigned clients
            </p>
          </div>
          {/* Only show top-right button if clients exist */}
          {clients.length > 0 && (
            <button
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-charcoal-black transition-colors"
            >
              <Plus size={20} />
              Assign Client
            </button>
          )}
        </div>

        {/* Assign Client Form */}
        {showAssignForm && (
          <div className="mb-8 bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
              Assign a New Client
            </h2>
            
            {assignmentError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="font-paragraph text-sm text-red-800">{assignmentError}</p>
              </div>
            )}

            {assignmentSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <p className="font-paragraph text-sm text-green-800">{assignmentSuccess}</p>
              </div>
            )}

            <form onSubmit={handleAssignClient} className="space-y-6">
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Select a Client *
                </label>
                {availableClients.length === 0 ? (
                  <div className="p-4 bg-warm-sand-beige/30 rounded-lg text-center">
                    <p className="font-paragraph text-sm text-warm-grey">
                      All available clients have been assigned. No new clients to assign.
                    </p>
                  </div>
                ) : (
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  >
                    <option value="">-- Select a client --</option>
                    {availableClients.map((client) => (
                      <option key={client.memberId} value={client.memberId}>
                        {client.email || client.memberId}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-warm-grey mt-2">
                  Select from the list of available clients who are not yet assigned to a trainer.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isAssigning || availableClients.length === 0}
                  className="flex-1 bg-charcoal-black text-soft-white py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors disabled:opacity-50"
                >
                  {isAssigning ? 'Assigning...' : 'Assign Client'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="flex-1 bg-warm-sand-beige text-charcoal-black py-3 rounded-lg font-medium hover:bg-warm-sand-beige/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-warm-grey">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <p className="text-charcoal-black text-lg font-medium mb-4">
              You don't have any clients assigned yet
            </p>
            <p className="text-warm-grey text-base mb-8 max-w-2xl mx-auto">
              Assign a client to start managing workouts, messaging, video reviews, and progress tracking — all in one place.
            </p>
            <button
              onClick={() => setShowAssignForm(true)}
              className="inline-block bg-charcoal-black text-soft-white px-8 py-3 rounded-lg hover:bg-soft-bronze transition-colors mb-8"
            >
              Assign Your First Client
            </button>
            <div className="space-y-3 pt-8 border-t border-warm-sand-beige">
              <p className="text-warm-grey text-sm">
                Once assigned, clients will automatically appear in your messages, programs, video reviews, and progress pages.
              </p>
              <p className="text-warm-grey text-sm italic">
                You can assign or remove clients at any time.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.assignmentId}
                className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 hover:border-soft-bronze transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-charcoal-black">
                      Client {client.clientId.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-warm-grey mt-1">
                      {client.activePrograms} active • {client.programCount} total
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    client.assignmentStatus === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {client.assignmentStatus}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-warm-sand-beige/30 rounded-lg">
                    <span className="text-sm text-warm-grey">Active Programs</span>
                    <span className="font-bold text-charcoal-black">{client.activePrograms}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-warm-sand-beige/30 rounded-lg">
                    <span className="text-sm text-warm-grey">Total Programs</span>
                    <span className="font-bold text-charcoal-black">{client.programCount}</span>
                  </div>
                </div>

                {/* Message Error Alert */}
                {messageError && messagingClientId === client.clientId && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
                    <p className="font-paragraph text-xs text-red-800">{messageError}</p>
                  </div>
                )}

                <button
                  onClick={() => handleMessageClient(client.clientId, client.conversationId || `${member?._id}-${client.clientId}`)}
                  disabled={messagingClientId === client.clientId}
                  className="w-full flex items-center justify-center gap-2 bg-charcoal-black text-soft-white px-4 py-3 rounded-lg hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Open messaging with this client"
                >
                  <MessageSquare size={18} />
                  {messagingClientId === client.clientId ? 'Opening...' : 'Message Client'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
