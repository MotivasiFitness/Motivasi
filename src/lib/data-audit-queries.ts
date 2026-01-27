/**
 * Data Audit Queries
 * 
 * Provides functions to audit collections for missing foreign keys.
 * Used to identify records that need cleanup or backfilling.
 * 
 * USAGE:
 * const results = await runFullAudit();
 * console.log(results);
 */

import { BaseCrudService } from '@/integrations';
import {
  WeeklyCheckins,
  ProgressCheckins,
  ClientAssignedWorkouts,
  ProgramAssignments,
  TrainerClientNotes,
  WeeklyCoachesNotes,
  WeeklySummaries,
  ProgramDrafts,
  FitnessPrograms,
  TrainerClientAssignments
} from '@/entities';

/**
 * Result of auditing a single collection
 */
export interface AuditResult {
  collection: string;
  totalRecords: number;
  missingClientId: number;
  missingTrainerId: number;
  missingBoth: number;
  percentageAffected: number;
  sampleIds: string[];
  timestamp: string;
}

/**
 * Audit a single collection for missing foreign keys
 * 
 * @param collectionId - The collection to audit
 * @param requireClientId - Whether this collection should have clientId
 * @param requireTrainerId - Whether this collection should have trainerId
 * @returns Audit results with counts and sample IDs
 * 
 * @example
 * const result = await auditCollection('weeklycheckins', true, true);
 * console.log(`${result.missingClientId} records missing clientId`);
 */
export async function auditCollection(
  collectionId: string,
  requireClientId: boolean = false,
  requireTrainerId: boolean = false
): Promise<AuditResult> {
  try {
    const { items } = await BaseCrudService.getAll<any>(
      collectionId,
      {},
      { limit: 10000 }
    );

    let missingClientId = 0;
    let missingTrainerId = 0;
    let missingBoth = 0;
    const sampleIds: string[] = [];

    for (const item of items) {
      const noClientId = !item.clientId || item.clientId === '';
      const noTrainerId = !item.trainerId || item.trainerId === '';

      if (noClientId && noTrainerId) {
        missingBoth++;
        if (sampleIds.length < 10) sampleIds.push(item._id);
      } else if (noClientId && requireClientId) {
        missingClientId++;
        if (sampleIds.length < 10) sampleIds.push(item._id);
      } else if (noTrainerId && requireTrainerId) {
        missingTrainerId++;
        if (sampleIds.length < 10) sampleIds.push(item._id);
      }
    }

    const totalAffected = missingClientId + missingTrainerId + missingBoth;
    const percentageAffected = items.length > 0
      ? Math.round((totalAffected / items.length) * 100)
      : 0;

    return {
      collection: collectionId,
      totalRecords: items.length,
      missingClientId,
      missingTrainerId,
      missingBoth,
      percentageAffected,
      sampleIds,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Audit failed for ${collectionId}:`, error);
    throw error;
  }
}

/**
 * Run full audit on all protected collections
 * 
 * @returns Array of audit results for all collections
 * 
 * @example
 * const results = await runFullAudit();
 * results.forEach(r => {
 *   if (r.percentageAffected > 0) {
 *     console.log(`${r.collection}: ${r.percentageAffected}% affected`);
 *   }
 * });
 */
export async function runFullAudit(): Promise<AuditResult[]> {
  const results: AuditResult[] = [];

  // Define which collections require which fields
  const auditConfigs = [
    { collection: 'weeklycheckins', requireClientId: true, requireTrainerId: true },
    { collection: 'progresscheckins', requireClientId: true, requireTrainerId: false },
    { collection: 'clientassignedworkouts', requireClientId: true, requireTrainerId: true },
    { collection: 'programassignments', requireClientId: true, requireTrainerId: true },
    { collection: 'trainerclientnotes', requireClientId: true, requireTrainerId: true },
    { collection: 'weeklycoachesnotes', requireClientId: true, requireTrainerId: true },
    { collection: 'weeklysummaries', requireClientId: true, requireTrainerId: true },
    { collection: 'programdrafts', requireClientId: false, requireTrainerId: true },
    { collection: 'programs', requireClientId: false, requireTrainerId: true },
    { collection: 'trainerclientassignments', requireClientId: true, requireTrainerId: true },
  ];

  for (const config of auditConfigs) {
    try {
      const result = await auditCollection(
        config.collection,
        config.requireClientId,
        config.requireTrainerId
      );
      results.push(result);
    } catch (error) {
      console.error(`Failed to audit ${config.collection}:`, error);
      results.push({
        collection: config.collection,
        totalRecords: 0,
        missingClientId: 0,
        missingTrainerId: 0,
        missingBoth: 0,
        percentageAffected: 0,
        sampleIds: [],
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
}

/**
 * Generate audit report as formatted string
 * 
 * @param results - Audit results from runFullAudit()
 * @returns Formatted report string
 */
export function formatAuditReport(results: AuditResult[]): string {
  let report = '=== DATA INTEGRITY AUDIT REPORT ===\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;

  // Summary
  const totalRecords = results.reduce((sum, r) => sum + r.totalRecords, 0);
  const totalAffected = results.reduce(
    (sum, r) => sum + r.missingClientId + r.missingTrainerId + r.missingBoth,
    0
  );

  report += `SUMMARY:\n`;
  report += `Total Records: ${totalRecords}\n`;
  report += `Total Affected: ${totalAffected} (${totalRecords > 0 ? Math.round((totalAffected / totalRecords) * 100) : 0}%)\n\n`;

  // Details
  report += `COLLECTION DETAILS:\n`;
  report += `${'Collection'.padEnd(30)} | ${'Total'.padEnd(8)} | ${'Missing ClientId'.padEnd(16)} | ${'Missing TrainerId'.padEnd(16)} | ${'Missing Both'.padEnd(12)} | ${'% Affected'.padEnd(10)}\n`;
  report += '-'.repeat(120) + '\n';

  for (const result of results) {
    report += `${result.collection.padEnd(30)} | `;
    report += `${result.totalRecords.toString().padEnd(8)} | `;
    report += `${result.missingClientId.toString().padEnd(16)} | `;
    report += `${result.missingTrainerId.toString().padEnd(16)} | `;
    report += `${result.missingBoth.toString().padEnd(12)} | `;
    report += `${result.percentageAffected}%\n`;

    if (result.sampleIds.length > 0) {
      report += `  Sample IDs: ${result.sampleIds.slice(0, 3).join(', ')}\n`;
    }
  }

  report += '\n';

  // Affected collections
  const affected = results.filter(r => r.percentageAffected > 0);
  if (affected.length > 0) {
    report += `COLLECTIONS REQUIRING CLEANUP:\n`;
    for (const result of affected) {
      report += `- ${result.collection}: ${result.percentageAffected}% affected (${result.missingClientId + result.missingTrainerId + result.missingBoth} records)\n`;
    }
  } else {
    report += `✅ All collections are clean!\n`;
  }

  return report;
}

/**
 * Get records with missing foreign keys from a collection
 * 
 * @param collectionId - The collection to query
 * @param requireClientId - Whether to filter for missing clientId
 * @param requireTrainerId - Whether to filter for missing trainerId
 * @returns Array of records with missing fields
 */
export async function getRecordsWithMissingFields(
  collectionId: string,
  requireClientId: boolean = false,
  requireTrainerId: boolean = false
): Promise<any[]> {
  try {
    const { items } = await BaseCrudService.getAll<any>(
      collectionId,
      {},
      { limit: 10000 }
    );

    return items.filter(item => {
      const noClientId = !item.clientId || item.clientId === '';
      const noTrainerId = !item.trainerId || item.trainerId === '';

      if (requireClientId && requireTrainerId) {
        return noClientId || noTrainerId;
      } else if (requireClientId) {
        return noClientId;
      } else if (requireTrainerId) {
        return noTrainerId;
      }

      return false;
    });
  } catch (error) {
    console.error(`Failed to get records with missing fields from ${collectionId}:`, error);
    throw error;
  }
}

/**
 * Export audit results as JSON
 * 
 * @param results - Audit results
 * @returns JSON string
 */
export function exportAuditResultsAsJson(results: AuditResult[]): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Export audit results as CSV
 * 
 * @param results - Audit results
 * @returns CSV string
 */
export function exportAuditResultsAsCsv(results: AuditResult[]): string {
  let csv = 'Collection,Total Records,Missing ClientId,Missing TrainerId,Missing Both,Percentage Affected,Timestamp\n';

  for (const result of results) {
    csv += `"${result.collection}",${result.totalRecords},${result.missingClientId},${result.missingTrainerId},${result.missingBoth},${result.percentageAffected}%,"${result.timestamp}"\n`;
  }

  return csv;
}
