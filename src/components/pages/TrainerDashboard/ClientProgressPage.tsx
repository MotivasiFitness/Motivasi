import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ProgressCheckins, TrainerClientAssignments } from '@/entities';
import { TrendingUp, AlertCircle, Image as ImageIcon, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { getTrainerClients } from '@/lib/role-utils';

interface ClientProgress {
  clientId: string;
  checkins: ProgressCheckins[];
  latestCheckin?: ProgressCheckins;
}

export default function ClientProgressPage() {
  const { member } = useMember();
  const [clientProgress, setClientProgress] = useState<ClientProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [expandedCheckins, setExpandedCheckins] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');

  useEffect(() => {
    const fetchData = async () => {
      if (!member?._id) return;

      try {
        // Get trainer's assigned clients
        const assignments = await getTrainerClients(member._id);
        const clientIds = assignments.map(a => a.clientId).filter(Boolean) as string[];

        // Get all progress check-ins
        const { items } = await BaseCrudService.getAll<ProgressCheckins>('progresscheckins');

        // Group by client
        const progressMap = new Map<string, ClientProgress>();
        
        clientIds.forEach(clientId => {
          progressMap.set(clientId, {
            clientId,
            checkins: [],
          });
        });

        items.forEach(checkin => {
          // Find which client this belongs to by checking if it's in the trainer's clients
          // For now, we'll use a simple approach - check if the checkin has any identifying info
          clientIds.forEach(clientId => {
            const progress = progressMap.get(clientId);
            if (progress) {
              progress.checkins.push(checkin);
            }
          });
        });

        // Sort checkins by date and set latest
        progressMap.forEach(progress => {
          progress.checkins.sort((a, b) => {
            const dateA = new Date(a.checkinDate || 0).getTime();
            const dateB = new Date(b.checkinDate || 0).getTime();
            return dateB - dateA;
          });
          progress.latestCheckin = progress.checkins[0];
        });

        setClientProgress(Array.from(progressMap.values()));
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member?._id]);

  const toggleCheckinExpanded = (checkinId: string) => {
    setExpandedCheckins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(checkinId)) {
        newSet.delete(checkinId);
      } else {
        newSet.add(checkinId);
      }
      return newSet;
    });
  };

  const sortedClientProgress = [...clientProgress].sort((a, b) => {
    const dateA = a.latestCheckin?.checkinDate ? new Date(a.latestCheckin.checkinDate).getTime() : 0;
    const dateB = b.latestCheckin?.checkinDate ? new Date(b.latestCheckin.checkinDate).getTime() : 0;
    return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
  });

  if (loading) {
    return (
      <div className="p-8 lg:p-12 flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading progress data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
                Client Progress
              </h1>
              <p className="text-lg text-warm-grey">
                View progress check-ins from your assigned clients
              </p>
            </div>
            {clientProgress.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-warm-grey font-paragraph">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest')}
                  className="px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Clients List */}
        {clientProgress.length === 0 ? (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <TrendingUp className="mx-auto text-warm-grey mb-4" size={48} />
            <p className="text-warm-grey text-lg mb-4">
              No clients assigned yet or no progress data available
            </p>
            <p className="text-sm text-warm-grey/70">
              Progress check-ins will appear here once your clients submit them.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedClientProgress.map((progress) => (
              <div
                key={progress.clientId}
                className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden"
              >
                {/* Client Header */}
                <button
                  onClick={() => setSelectedClient(selectedClient === progress.clientId ? null : progress.clientId)}
                  className="w-full p-6 flex items-center justify-between hover:bg-warm-sand-beige/30 transition-colors"
                >
                  <div className="text-left flex-1">
                    <h3 className="font-heading text-xl font-bold text-charcoal-black">
                      Client {progress.clientId.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-warm-grey mt-1">
                      {progress.checkins.length} check-in{progress.checkins.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    {progress.latestCheckin && (
                      <div>
                        <p className="text-sm text-warm-grey">Latest Check-in</p>
                        <p className="font-medium text-charcoal-black">
                          {new Date(progress.latestCheckin.checkinDate || '').toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedClient === progress.clientId ? (
                    <ChevronUp className="text-soft-bronze" size={24} />
                  ) : (
                    <ChevronDown className="text-warm-grey" size={24} />
                  )}
                </button>

                {/* Checkins List */}
                {selectedClient === progress.clientId && (
                  <div className="border-t border-warm-sand-beige p-6 space-y-6">
                    {progress.checkins.length === 0 ? (
                      <p className="text-warm-grey text-center py-8">
                        No check-ins yet
                      </p>
                    ) : (
                      progress.checkins.map((checkin) => {
                        const isExpanded = expandedCheckins.has(checkin._id);
                        return (
                          <div
                            key={checkin._id}
                            className="border border-warm-sand-beige rounded-xl overflow-hidden"
                          >
                            {/* Checkin Header */}
                            <button
                              onClick={() => toggleCheckinExpanded(checkin._id)}
                              className="w-full p-4 flex items-center justify-between hover:bg-warm-sand-beige/20 transition-colors"
                            >
                              <div className="text-left flex-1">
                                <p className="text-sm text-warm-grey uppercase tracking-widest mb-1">Check-in Date</p>
                                <p className="font-medium text-charcoal-black">
                                  {new Date(checkin.checkinDate || '').toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              {checkin.currentWeight && (
                                <div className="text-right mr-4">
                                  <p className="text-sm text-warm-grey uppercase tracking-widest mb-1">Weight</p>
                                  <p className="font-bold text-charcoal-black">{checkin.currentWeight}</p>
                                </div>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="text-soft-bronze" size={20} />
                              ) : (
                                <ChevronDown className="text-warm-grey" size={20} />
                              )}
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="border-t border-warm-sand-beige p-6 space-y-6 bg-warm-sand-beige/10">
                                {/* Energy Level */}
                                {checkin.energyLevel && (
                                  <div>
                                    <p className="text-sm text-warm-grey uppercase tracking-widest mb-3">Energy Level</p>
                                    <div className="flex items-center gap-3">
                                      <div className="flex gap-1">
                                        {[...Array(10)].map((_, i) => (
                                          <div
                                            key={i}
                                            className={`w-2 h-6 rounded-sm ${
                                              i < checkin.energyLevel
                                                ? 'bg-soft-bronze'
                                                : 'bg-warm-sand-beige'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="font-medium text-charcoal-black">{checkin.energyLevel}/10</span>
                                    </div>
                                  </div>
                                )}

                                {/* Weight */}
                                {checkin.currentWeight && (
                                  <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg p-4">
                                    <p className="text-sm text-warm-grey uppercase tracking-widest mb-2">Current Weight</p>
                                    <p className="font-heading text-3xl font-bold text-charcoal-black">
                                      {checkin.currentWeight} <span className="text-lg text-warm-grey">kg/lbs</span>
                                    </p>
                                  </div>
                                )}

                                {/* Body Measurements */}
                                {checkin.bodyMeasurements && (
                                  <div>
                                    <p className="text-sm text-warm-grey uppercase tracking-widest mb-2">Body Measurements</p>
                                    <p className="font-paragraph text-charcoal-black whitespace-pre-wrap bg-warm-sand-beige/30 p-4 rounded-lg">
                                      {checkin.bodyMeasurements}
                                    </p>
                                  </div>
                                )}

                                {/* Client Notes */}
                                {checkin.clientNotes && (
                                  <div>
                                    <p className="text-sm text-warm-grey uppercase tracking-widest mb-2">Client Notes</p>
                                    <p className="font-paragraph text-charcoal-black whitespace-pre-wrap bg-warm-sand-beige/30 p-4 rounded-lg">
                                      {checkin.clientNotes}
                                    </p>
                                  </div>
                                )}

                                {/* Progress Photos */}
                                <div className="space-y-4">
                                  {[
                                    { label: 'Front', url: checkin.progressPhotoFront },
                                    { label: 'Side', url: checkin.progressPhotoSide },
                                    { label: 'Back', url: checkin.progressPhotoBack }
                                  ].map((photo) => (
                                    photo.url && (
                                      <div key={photo.label}>
                                        <p className="text-sm text-warm-grey uppercase tracking-widest mb-2">
                                          {photo.label} Progress Photo
                                        </p>
                                        <div className="aspect-[3/4] rounded-lg overflow-hidden border border-warm-sand-beige">
                                          <Image
                                            src={photo.url}
                                            alt={`${photo.label} progress photo`}
                                            className="w-full h-full object-cover"
                                            width={400}
                                          />
                                        </div>
                                      </div>
                                    )
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
