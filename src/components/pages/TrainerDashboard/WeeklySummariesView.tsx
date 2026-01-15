import React, { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Trophy, Calendar, TrendingUp, User, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { WeeklySummary } from '@/lib/weekly-summary-service';
import { getClientDisplayName } from '@/lib/client-display-name';

interface ClientInfo {
  _id: string;
  displayName: string;
}

export default function WeeklySummariesView() {
  const { member } = useMember();
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [clientsMap, setClientsMap] = useState<Map<string, ClientInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed'>('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!member?._id) return;

      try {
        // Fetch all weekly summaries for this trainer
        const { items: allSummaries } = await BaseCrudService.getAll<WeeklySummary>('weeklysummaries');
        const trainerSummaries = allSummaries.filter(s => s.trainerId === member._id);

        // Get unique client IDs
        const clientIds = [...new Set(trainerSummaries.map(s => s.clientId).filter(Boolean))];

        // Fetch client display names
        const clientsData = new Map<string, ClientInfo>();
        for (const clientId of clientIds) {
          const displayName = await getClientDisplayName(clientId as string);
          clientsData.set(clientId as string, {
            _id: clientId as string,
            displayName
          });
        }

        setClientsMap(clientsData);
        setSummaries(trainerSummaries.sort((a, b) => {
          const dateA = new Date(a._createdDate || 0).getTime();
          const dateB = new Date(b._createdDate || 0).getTime();
          return dateB - dateA; // Most recent first
        }));
      } catch (error) {
        console.error('Error fetching weekly summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member?._id]);

  const filteredSummaries = filter === 'completed'
    ? summaries.filter(s => s.completionStatus === 'completed')
    : summaries;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-soft-bronze/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-soft-bronze" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-3">
            No Weekly Summaries Yet
          </h3>
          <p className="text-warm-grey">
            Weekly summaries will appear here when clients complete all workouts in a week.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-charcoal-black">
            Weekly Summaries
          </h2>
          <p className="text-warm-grey text-sm mt-1">
            {filteredSummaries.length} summary{filteredSummaries.length !== 1 ? 'ies' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-soft-white'
                : 'bg-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige/70'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary text-soft-white'
                : 'bg-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige/70'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Summaries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSummaries.map((summary) => {
          const client = clientsMap.get(summary.clientId || '');
          const completionPercentage = summary.workoutsAssigned && summary.workoutsAssigned > 0
            ? Math.round((summary.workoutsCompleted || 0) / summary.workoutsAssigned * 100)
            : 0;
          const isFullyCompleted = summary.completionStatus === 'completed';

          return (
            <Card 
              key={summary._id}
              className={`border-2 ${isFullyCompleted ? 'border-primary' : 'border-warm-grey/30'}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-warm-grey" />
                      <span className="font-paragraph text-sm font-medium text-charcoal-black">
                        {client?.displayName || 'Unknown Client'}
                      </span>
                    </div>
                    <CardTitle className="font-heading text-xl text-charcoal-black flex items-center gap-2">
                      {isFullyCompleted && <Trophy className="w-5 h-5 text-primary" />}
                      Week {summary.weekNumber}
                    </CardTitle>
                    {summary.programTitle && (
                      <p className="font-paragraph text-xs text-warm-grey mt-1">
                        {summary.programTitle}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={isFullyCompleted ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {completionPercentage}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-paragraph text-warm-grey">Progress</span>
                    <span className="font-paragraph font-medium text-charcoal-black">
                      {summary.workoutsCompleted}/{summary.workoutsAssigned} workouts
                    </span>
                  </div>
                  <div className="w-full bg-warm-sand-beige rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isFullyCompleted ? 'bg-primary' : 'bg-soft-bronze'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-warm-grey/20">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-warm-grey" />
                    <div>
                      <p className="font-paragraph text-xs text-warm-grey">Started</p>
                      <p className="font-paragraph text-xs text-charcoal-black font-medium">
                        {summary.startDate ? new Date(summary.startDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {summary.completedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-paragraph text-xs text-warm-grey">Completed</p>
                        <p className="font-paragraph text-xs text-charcoal-black font-medium">
                          {new Date(summary.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Encouraging Message */}
                {isFullyCompleted && summary.encouragingMessage && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-3">
                    <p className="font-paragraph text-xs text-charcoal-black text-center">
                      {summary.encouragingMessage}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSummaries.length === 0 && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 text-center">
          <p className="text-warm-grey">
            No {filter === 'completed' ? 'completed' : ''} summaries to display.
          </p>
        </div>
      )}
    </div>
  );
}
