import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WeeklySummary } from '@/lib/weekly-summary-service';

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
  showDetails?: boolean;
}

export default function WeeklySummaryCard({ summary, showDetails = true }: WeeklySummaryCardProps) {
  const completionPercentage = summary.workoutsAssigned && summary.workoutsAssigned > 0
    ? Math.round((summary.workoutsCompleted || 0) / summary.workoutsAssigned * 100)
    : 0;

  const isFullyCompleted = summary.completionStatus === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`border-2 ${isFullyCompleted ? 'border-primary bg-gradient-to-br from-soft-white to-warm-sand-beige' : 'border-warm-grey'}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="font-heading text-2xl text-charcoal-black flex items-center gap-2">
                {isFullyCompleted && <Trophy className="w-6 h-6 text-primary" />}
                Week {summary.weekNumber} Summary
              </CardTitle>
              {summary.programTitle && (
                <p className="font-paragraph text-sm text-warm-grey mt-1">
                  {summary.programTitle}
                </p>
              )}
            </div>
            <Badge 
              variant={isFullyCompleted ? "default" : "secondary"}
              className="ml-2"
            >
              {summary.completionStatus === 'completed' ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Completion Stats */}
          <div className="flex items-center justify-center py-6">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-warm-sand-beige"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionPercentage / 100)}`}
                  className={isFullyCompleted ? 'text-primary' : 'text-soft-bronze'}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-4xl font-bold text-charcoal-black">
                  {summary.workoutsCompleted}/{summary.workoutsAssigned}
                </span>
                <span className="font-paragraph text-xs text-warm-grey">
                  Workouts
                </span>
              </div>
            </div>
          </div>

          {/* Encouraging Message */}
          {isFullyCompleted && summary.encouragingMessage && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center"
            >
              <p className="font-paragraph text-base text-charcoal-black font-medium">
                {summary.encouragingMessage}
              </p>
            </motion.div>
          )}

          {/* Additional Details */}
          {showDetails && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-warm-grey/20">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-warm-grey" />
                <div>
                  <p className="font-paragraph text-xs text-warm-grey">Week Started</p>
                  <p className="font-paragraph text-sm text-charcoal-black font-medium">
                    {summary.startDate ? new Date(summary.startDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {summary.completedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-paragraph text-xs text-warm-grey">Completed</p>
                    <p className="font-paragraph text-sm text-charcoal-black font-medium">
                      {new Date(summary.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 col-span-2">
                <TrendingUp className="w-4 h-4 text-soft-bronze" />
                <div>
                  <p className="font-paragraph text-xs text-warm-grey">Completion Rate</p>
                  <p className="font-paragraph text-sm text-charcoal-black font-medium">
                    {completionPercentage}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
