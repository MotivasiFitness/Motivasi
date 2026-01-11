import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Programs } from '@/entities';
import { MessageSquare, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClientInfo {
  clientId: string;
  programCount: number;
  activePrograms: number;
}

export default function TrainerClientsPage() {
  const { member } = useMember();
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      if (!member?._id) return;

      const { items } = await BaseCrudService.getAll<Programs>('programs');
      const trainerPrograms = items.filter(p => p.trainerId === member._id);

      // Group by client
      const clientMap = new Map<string, ClientInfo>();
      trainerPrograms.forEach((program) => {
        if (program.clientId) {
          const existing = clientMap.get(program.clientId) || {
            clientId: program.clientId,
            programCount: 0,
            activePrograms: 0,
          };
          existing.programCount += 1;
          if (program.status === 'Active') {
            existing.activePrograms += 1;
          }
          clientMap.set(program.clientId, existing);
        }
      });

      setClients(Array.from(clientMap.values()));
      setLoading(false);
    };

    fetchClients();
  }, [member?._id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading clients...</p>
      </div>
    );
  }

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
          <Link
            to="/trainer/programs"
            className="flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-charcoal-black transition-colors"
          >
            <Plus size={20} />
            New Program
          </Link>
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <p className="text-warm-grey text-lg mb-6">
              You don't have any clients yet.
            </p>
            <Link
              to="/trainer/programs"
              className="inline-block bg-charcoal-black text-soft-white px-8 py-3 rounded-lg hover:bg-soft-bronze transition-colors"
            >
              Create Your First Program
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.clientId}
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

                <button className="w-full flex items-center justify-center gap-2 bg-charcoal-black text-soft-white px-4 py-3 rounded-lg hover:bg-soft-bronze transition-colors">
                  <MessageSquare size={18} />
                  Message Client
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
