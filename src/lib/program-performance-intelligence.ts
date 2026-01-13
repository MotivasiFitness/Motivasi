/**
 * Program Performance Intelligence Service
 * Tracks and analyzes program performance metrics
 * Provides insights and recommendations for program optimization
 */

import { BaseCrudService } from '@/integrations';
import { ProgramPerformanceMetrics, FitnessPrograms } from '@/entities';

export interface PerformanceInsight {
  type: 'high-performer' | 'low-performer' | 'drop-off-warning' | 'volume-concern' | 'engagement-issue';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  affectedPrograms?: string[];
  affectedClients?: string[];
  suggestedAction?: string;
}

export interface ProgramMetricsSnapshot {
  programId: string;
  clientId: string;
  completionRate: number;
  workoutCompletionRate: number;
  missedSessions: number;
  substitutionCount: number;
  dropOffWeek?: number;
  clientDifficulty?: number;
  trainerEditsPercentage: number;
  lastUpdated: Date;
}

export interface SmartAdjustmentSuggestion {
  _id: string;
  programId: string;
  clientId: string;
  trainerId: string;
  adjustmentType: 'load-increase' | 'load-decrease' | 'volume-increase' | 'volume-decrease' | 'deload-week' | 'exercise-swap' | 'frequency-change';
  targetWeek?: number;
  currentValue?: string;
  suggestedValue?: string;
  rationale: string;
  confidence: number; // 0-100
  basedOnMetrics: string[]; // Which metrics influenced this suggestion
  status: 'pending' | 'accepted' | 'edited' | 'ignored';
  createdAt: Date;
  respondedAt?: Date;
}

/**
 * Record program performance metrics
 */
export async function recordProgramMetrics(
  programId: string,
  clientId: string,
  trainerId: string,
  metrics: Partial<ProgramPerformanceMetrics>
): Promise<ProgramPerformanceMetrics> {
  try {
    const metricsRecord: ProgramPerformanceMetrics = {
      _id: crypto.randomUUID(),
      programId,
      clientId,
      trainerId,
      ...metrics,
      lastUpdated: new Date().toISOString(),
      status: 'active',
    };

    await BaseCrudService.create('programperformancemetrics', metricsRecord);
    return metricsRecord;
  } catch (error) {
    console.error('Error recording program metrics:', error);
    throw new Error('Failed to record program metrics');
  }
}

/**
 * Update program performance metrics
 */
export async function updateProgramMetrics(
  metricsId: string,
  updates: Partial<ProgramPerformanceMetrics>
): Promise<void> {
  try {
    await BaseCrudService.update('programperformancemetrics', {
      _id: metricsId,
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating program metrics:', error);
    throw new Error('Failed to update program metrics');
  }
}

/**
 * Get metrics for a specific program
 */
export async function getProgramMetrics(programId: string): Promise<ProgramPerformanceMetrics | null> {
  try {
    const { items } = await BaseCrudService.getAll<ProgramPerformanceMetrics>('programperformancemetrics');
    return items.find(m => m.programId === programId) || null;
  } catch (error) {
    console.error('Error fetching program metrics:', error);
    return null;
  }
}

/**
 * Get metrics for all programs by a trainer
 */
export async function getTrainerProgramMetrics(trainerId: string): Promise<ProgramPerformanceMetrics[]> {
  try {
    const { items } = await BaseCrudService.getAll<ProgramPerformanceMetrics>('programperformancemetrics');
    return items.filter(m => m.trainerId === trainerId);
  } catch (error) {
    console.error('Error fetching trainer metrics:', error);
    return [];
  }
}

/**
 * Analyze program performance and generate insights
 */
export async function analyzePerformance(trainerId: string): Promise<PerformanceInsight[]> {
  try {
    const metrics = await getTrainerProgramMetrics(trainerId);
    const insights: PerformanceInsight[] = [];

    // Group metrics by performance level
    const highPerformers = metrics.filter(m => (m.completionRate || 0) >= 80);
    const lowPerformers = metrics.filter(m => (m.completionRate || 0) < 50);
    const dropOffRisks = metrics.filter(m => (m.dropOffWeek || 0) > 0 && (m.dropOffWeek || 0) <= 4);
    const volumeConcerns = metrics.filter(m => {
      const totalSets = (m.aiGeneratedSectionsCount || 0) * 3; // Rough estimate
      return totalSets > 150;
    });

    // High performers insight
    if (highPerformers.length > 0) {
      insights.push({
        type: 'high-performer',
        severity: 'low',
        title: `${highPerformers.length} High-Performing Programs`,
        description: `You have ${highPerformers.length} program(s) with completion rates above 80%. These are working well for your clients.`,
        recommendation: 'Consider analyzing what makes these programs successful and apply similar principles to other programs.',
        affectedPrograms: highPerformers.map(m => m.programId || ''),
        suggestedAction: 'Review and document best practices',
      });
    }

    // Low performers insight
    if (lowPerformers.length > 0) {
      insights.push({
        type: 'low-performer',
        severity: 'high',
        title: `${lowPerformers.length} Low-Performing Programs`,
        description: `${lowPerformers.length} program(s) have completion rates below 50%. These may need adjustment.`,
        recommendation: 'Review these programs for complexity, volume, or client fit. Consider simplifying or adjusting intensity.',
        affectedPrograms: lowPerformers.map(m => m.programId || ''),
        suggestedAction: 'Schedule client check-ins to understand barriers',
      });
    }

    // Drop-off warning
    if (dropOffRisks.length > 0) {
      const avgDropOffWeek = Math.round(
        dropOffRisks.reduce((sum, m) => sum + (m.dropOffWeek || 0), 0) / dropOffRisks.length
      );
      insights.push({
        type: 'drop-off-warning',
        severity: 'high',
        title: `Drop-Off Pattern Detected (Week ${avgDropOffWeek})`,
        description: `${dropOffRisks.length} client(s) are dropping off around week ${avgDropOffWeek}. This suggests a specific point of difficulty.`,
        recommendation: `Implement a deload week or reduce volume in week ${avgDropOffWeek}. Add motivational check-ins before this week.`,
        affectedPrograms: dropOffRisks.map(m => m.programId || ''),
        suggestedAction: `Add deload week ${avgDropOffWeek} to future programs`,
      });
    }

    // Volume concerns
    if (volumeConcerns.length > 0) {
      insights.push({
        type: 'volume-concern',
        severity: 'medium',
        title: `${volumeConcerns.length} Programs with High Volume`,
        description: `${volumeConcerns.length} program(s) have high total volume, which may contribute to drop-off.`,
        recommendation: 'Consider reducing total sets or spreading exercises across more days.',
        affectedPrograms: volumeConcerns.map(m => m.programId || ''),
        suggestedAction: 'Review and reduce volume in high-volume programs',
      });
    }

    // Engagement issue (high substitutions)
    const highSubstitutions = metrics.filter(m => (m.exerciseSubstitutionCount || 0) > 5);
    if (highSubstitutions.length > 0) {
      insights.push({
        type: 'engagement-issue',
        severity: 'medium',
        title: `High Exercise Substitution Rate`,
        description: `${highSubstitutions.length} program(s) have frequent exercise substitutions, suggesting clients may not like the original exercises.`,
        recommendation: 'Review client feedback and consider adjusting exercise selection in future programs.',
        affectedPrograms: highSubstitutions.map(m => m.programId || ''),
        suggestedAction: 'Gather client feedback on exercise preferences',
      });
    }

    return insights;
  } catch (error) {
    console.error('Error analyzing performance:', error);
    return [];
  }
}

/**
 * Generate smart adjustment suggestions based on metrics and adherence data
 */
export async function generateSmartAdjustments(
  programId: string,
  clientId: string,
  trainerId: string,
  metrics: ProgramPerformanceMetrics,
  adherenceData?: {
    avgDifficulty?: number;
    missedWorkoutsLast7Days?: number;
    completionRate?: number;
  }
): Promise<SmartAdjustmentSuggestion[]> {
  try {
    const suggestions: SmartAdjustmentSuggestion[] = [];

    // Use adherence data if available, otherwise fall back to metrics
    const avgDifficulty = adherenceData?.avgDifficulty ?? (metrics.clientDifficultyRating || 5);
    const missedWorkouts = adherenceData?.missedWorkoutsLast7Days ?? (metrics.missedSessionCount || 0);
    const completionRate = adherenceData?.completionRate ?? (metrics.workoutCompletionRate || 0);

    // Load increase suggestion
    if (completionRate > 90 && avgDifficulty <= 3) {
      suggestions.push({
        _id: crypto.randomUUID(),
        programId,
        clientId,
        trainerId,
        adjustmentType: 'load-increase',
        rationale: 'Client is completing workouts consistently with low difficulty rating. Ready for increased load.',
        confidence: 85,
        basedOnMetrics: ['workoutCompletionRate', 'difficultyRating'],
        status: 'pending',
        createdAt: new Date(),
      });
    }

    // Volume decrease suggestion (high difficulty + missed workouts)
    if (missedWorkouts >= 2 && avgDifficulty >= 4) {
      suggestions.push({
        _id: crypto.randomUUID(),
        programId,
        clientId,
        trainerId,
        adjustmentType: 'volume-decrease',
        rationale: `Client has missed ${missedWorkouts} workouts and reports high difficulty (${avgDifficulty.toFixed(1)}/5). Reduce volume to improve adherence.`,
        confidence: 90,
        basedOnMetrics: ['missedWorkouts', 'difficultyRating'],
        status: 'pending',
        createdAt: new Date(),
      });
    }

    // Deload week suggestion
    if ((metrics.dropOffWeek || 0) > 0 && (metrics.dropOffWeek || 0) <= 6) {
      suggestions.push({
        _id: crypto.randomUUID(),
        programId,
        clientId,
        trainerId,
        adjustmentType: 'deload-week',
        targetWeek: (metrics.dropOffWeek || 0) - 1,
        rationale: `Client typically drops off in week ${metrics.dropOffWeek}. Implement deload week before to prevent fatigue.`,
        confidence: 80,
        basedOnMetrics: ['dropOffWeek'],
        status: 'pending',
        createdAt: new Date(),
      });
    }

    // Exercise swap suggestion
    if ((metrics.exerciseSubstitutionCount || 0) > 3) {
      suggestions.push({
        _id: crypto.randomUUID(),
        programId,
        clientId,
        trainerId,
        adjustmentType: 'exercise-swap',
        rationale: `Client has substituted exercises ${metrics.exerciseSubstitutionCount} times. Consider replacing with preferred alternatives.`,
        confidence: 75,
        basedOnMetrics: ['exerciseSubstitutionCount'],
        status: 'pending',
        createdAt: new Date(),
      });
    }

    // Frequency change suggestion
    if (completionRate < 60 && missedWorkouts > 2) {
      suggestions.push({
        _id: crypto.randomUUID(),
        programId,
        clientId,
        trainerId,
        adjustmentType: 'frequency-change',
        rationale: `Client is missing ${missedWorkouts} sessions. Consider reducing training frequency to match their schedule.`,
        confidence: 85,
        basedOnMetrics: ['completionRate', 'missedWorkouts'],
        status: 'pending',
        createdAt: new Date(),
      });
    }

    // Too easy suggestion (low difficulty feedback)
    if (avgDifficulty <= 2 && completionRate > 80) {
      suggestions.push({
        _id: crypto.randomUUID(),
        programId,
        clientId,
        trainerId,
        adjustmentType: 'load-increase',
        rationale: `Client reports low difficulty (${avgDifficulty.toFixed(1)}/5) and high completion. Consider increasing intensity.`,
        confidence: 75,
        basedOnMetrics: ['difficultyRating', 'completionRate'],
        status: 'pending',
        createdAt: new Date(),
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Error generating smart adjustments:', error);
    return [];
  }
}

/**
 * Record trainer response to adjustment suggestion
 */
export async function recordAdjustmentResponse(
  suggestionId: string,
  status: 'accepted' | 'edited' | 'ignored',
  editedSuggestion?: Partial<SmartAdjustmentSuggestion>
): Promise<void> {
  try {
    // In a real implementation, this would update a suggestions collection
    // For now, we'll store in localStorage
    const suggestions = JSON.parse(localStorage.getItem('adjustment_suggestions') || '[]');
    const index = suggestions.findIndex((s: any) => s._id === suggestionId);
    
    if (index !== -1) {
      suggestions[index].status = status;
      suggestions[index].respondedAt = new Date().toISOString();
      
      if (editedSuggestion) {
        suggestions[index] = { ...suggestions[index], ...editedSuggestion };
      }
      
      localStorage.setItem('adjustment_suggestions', JSON.stringify(suggestions));
    }
  } catch (error) {
    console.error('Error recording adjustment response:', error);
    throw new Error('Failed to record adjustment response');
  }
}

/**
 * Get performance summary for dashboard
 */
export async function getPerformanceSummary(trainerId: string) {
  try {
    const metrics = await getTrainerProgramMetrics(trainerId);
    
    if (metrics.length === 0) {
      return {
        totalPrograms: 0,
        averageCompletion: 0,
        highPerformers: 0,
        needsAttention: 0,
        insights: [],
      };
    }

    const avgCompletion = Math.round(
      metrics.reduce((sum, m) => sum + (m.completionRate || 0), 0) / metrics.length
    );

    const highPerformers = metrics.filter(m => (m.completionRate || 0) >= 80).length;
    const needsAttention = metrics.filter(m => (m.completionRate || 0) < 60).length;

    const insights = await analyzePerformance(trainerId);

    return {
      totalPrograms: metrics.length,
      averageCompletion: avgCompletion,
      highPerformers,
      needsAttention,
      insights,
    };
  } catch (error) {
    console.error('Error getting performance summary:', error);
    return {
      totalPrograms: 0,
      averageCompletion: 0,
      highPerformers: 0,
      needsAttention: 0,
      insights: [],
    };
  }
}

export default {
  recordProgramMetrics,
  updateProgramMetrics,
  getProgramMetrics,
  getTrainerProgramMetrics,
  analyzePerformance,
  generateSmartAdjustments,
  recordAdjustmentResponse,
  getPerformanceSummary,
};
