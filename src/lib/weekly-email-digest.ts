/**
 * Weekly Trainer Email Digest Service
 * Generates and sends weekly email summaries to trainers
 * Runs once per week (default Monday 8-9 am local time)
 */

import { BaseCrudService } from '@/integrations';
import {
  getTrainerClientAdherenceSignals,
  ClientAdherenceSignal,
  getActivitySummary,
  getRecentFeedback,
} from '@/lib/adherence-tracking';
import { getClientsNeedingCheckIn } from '@/lib/coach-checkin-service';
import { sendEmail } from '@/lib/email-service';

export interface WeeklyDigestMetrics {
  activeClients: number;
  onTrackCount: number;
  atRiskCount: number;
  inactiveCount: number;
  avgCompletionRate: number;
  avgDifficultyRating: number;
  clientsNeedingCheckIn: number;
  clientsNeedingCheckInList: Array<{
    clientId: string;
    firstName?: string;
  }>;
}

export interface TrainerEmailData {
  trainerId: string;
  trainerEmail: string;
  trainerName: string;
  metrics: WeeklyDigestMetrics;
  generatedAt: Date;
}

/**
 * Calculate weekly metrics for a trainer
 */
export async function calculateWeeklyMetrics(
  trainerId: string
): Promise<WeeklyDigestMetrics> {
  try {
    // Get all adherence signals for trainer's clients
    const signals = await getTrainerClientAdherenceSignals(trainerId);

    // Get clients needing check-in
    const checkInClients = await getClientsNeedingCheckIn(trainerId);

    // Calculate metrics
    const activeClients = signals.length;
    const onTrackCount = signals.filter((s) => s.status === 'On Track').length;
    const atRiskCount = signals.filter((s) => s.status === 'At Risk').length;
    const inactiveCount = signals.filter((s) => s.status === 'Inactive').length;

    // Calculate average completion rate
    let totalCompletionRate = 0;
    let completionRateCount = 0;

    for (const signal of signals) {
      const activitySummary = await getActivitySummary(signal.clientId, '');
      if (activitySummary.total > 0) {
        totalCompletionRate += activitySummary.completionRate;
        completionRateCount++;
      }
    }

    const avgCompletionRate =
      completionRateCount > 0 ? Math.round(totalCompletionRate / completionRateCount) : 0;

    // Calculate average difficulty rating
    let totalDifficulty = 0;
    let difficultyCount = 0;

    for (const signal of signals) {
      const recentFeedback = await getRecentFeedback(signal.clientId, '', 7);
      if (recentFeedback.length > 0) {
        const avgDiff =
          recentFeedback.reduce((sum, f) => sum + f.difficultyRating, 0) /
          recentFeedback.length;
        totalDifficulty += avgDiff;
        difficultyCount++;
      }
    }

    const avgDifficultyRating =
      difficultyCount > 0 ? Math.round((totalDifficulty / difficultyCount) * 10) / 10 : 0;

    // Get top 3 clients needing check-in (by urgency)
    const urgencyOrder: Record<string, number> = {
      Inactive: 0,
      'At Risk': 1,
      'Too Hard': 2,
      'Too Easy': 3,
      'On Track': 4,
    };

    const sortedCheckInClients = checkInClients.sort(
      (a, b) => (urgencyOrder[a.reason] || 5) - (urgencyOrder[b.reason] || 5)
    );

    const clientsNeedingCheckInList = sortedCheckInClients.slice(0, 3).map((client) => ({
      clientId: client.clientId,
      firstName: `Client ${client.clientId.slice(0, 8)}`, // Placeholder - would be replaced with actual name
    }));

    return {
      activeClients,
      onTrackCount,
      atRiskCount,
      inactiveCount,
      avgCompletionRate,
      avgDifficultyRating,
      clientsNeedingCheckIn: checkInClients.length,
      clientsNeedingCheckInList,
    };
  } catch (error) {
    console.error('Error calculating weekly metrics:', error);
    // Return empty metrics if calculation fails
    return {
      activeClients: 0,
      onTrackCount: 0,
      atRiskCount: 0,
      inactiveCount: 0,
      avgCompletionRate: 0,
      avgDifficultyRating: 0,
      clientsNeedingCheckIn: 0,
      clientsNeedingCheckInList: [],
    };
  }
}

/**
 * Generate HTML email template for weekly digest
 */
export function generateWeeklyDigestEmail(data: TrainerEmailData): string {
  const { trainerName, metrics, generatedAt } = data;

  const weekStartDate = new Date(generatedAt);
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1); // Monday
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6); // Sunday

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });

  const weekRange = `${formatDate(weekStartDate)} – ${formatDate(weekEndDate)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Client Check-In Summary</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1F1F1F;
      background-color: #FAF9F7;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E8DED3;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      background-color: #E8DED3;
      padding: 32px 24px;
      text-align: center;
      border-bottom: 1px solid #D4C9BE;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1F1F1F;
      font-family: 'Cormorant Garamond', serif;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #B8B2AA;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 16px;
      color: #1F1F1F;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #1F1F1F;
      margin-bottom: 16px;
      font-family: 'Cormorant Garamond', serif;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-card {
      background-color: #FAF9F7;
      border: 1px solid #E8DED3;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #B08D57;
      margin-bottom: 4px;
    }
    .metric-label {
      font-size: 12px;
      color: #B8B2AA;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .focus-section {
      background-color: #FAF9F7;
      border-left: 4px solid #B08D57;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .focus-count {
      font-size: 18px;
      font-weight: 700;
      color: #1F1F1F;
      margin-bottom: 12px;
    }
    .client-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .client-list li {
      font-size: 14px;
      color: #1F1F1F;
      padding: 6px 0;
      padding-left: 20px;
      position: relative;
    }
    .client-list li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #B08D57;
      font-weight: bold;
    }
    .cta-button {
      display: inline-block;
      background-color: #1F1F1F;
      color: #FAF9F7;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      transition: background-color 0.3s ease;
      margin-top: 16px;
      width: 100%;
      box-sizing: border-box;
    }
    .cta-button:hover {
      background-color: #B08D57;
    }
    .footer {
      background-color: #FAF9F7;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #E8DED3;
      font-size: 12px;
      color: #B8B2AA;
    }
    .footer p {
      margin: 0;
      line-height: 1.6;
    }
    .divider {
      height: 1px;
      background-color: #E8DED3;
      margin: 24px 0;
    }
    @media (max-width: 600px) {
      .container {
        border-radius: 0;
        border: none;
      }
      .header {
        padding: 24px 16px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 24px 16px;
      }
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      .metric-value {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Weekly Client Check-In Summary</h1>
      <p>Week of ${weekRange}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <div class="greeting">
        <p>Hi ${trainerName},</p>
        <p>Here's a snapshot of your clients' progress this week. Use this summary to identify who might benefit from a quick check-in.</p>
      </div>

      <!-- Metrics Section -->
      <div class="section">
        <h2 class="section-title">Your Clients This Week</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${metrics.activeClients}</div>
            <div class="metric-label">Active Clients</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.onTrackCount}</div>
            <div class="metric-label">On Track</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.atRiskCount}</div>
            <div class="metric-label">At Risk</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.inactiveCount}</div>
            <div class="metric-label">Inactive</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.avgCompletionRate}%</div>
            <div class="metric-label">Avg Completion</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.avgDifficultyRating}</div>
            <div class="metric-label">Avg Difficulty</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Follow-Up Focus Section -->
      <div class="section">
        <h2 class="section-title">Follow-Up Focus</h2>
        <div class="focus-section">
          <div class="focus-count">
            ${metrics.clientsNeedingCheckIn} client${metrics.clientsNeedingCheckIn !== 1 ? 's' : ''} may benefit from a check-in
          </div>
          ${
            metrics.clientsNeedingCheckInList.length > 0
              ? `
            <p style="font-size: 14px; color: #1F1F1F; margin: 12px 0 0 0;">
              Top priority:
            </p>
            <ul class="client-list">
              ${metrics.clientsNeedingCheckInList
                .map((client) => `<li>${client.firstName}</li>`)
                .join('')}
            </ul>
          `
              : ''
          }
        </div>
      </div>

      <!-- Call to Action -->
      <a href="https://motivasi.co.uk/trainer#clients-to-review" class="cta-button">
        Review clients who may need a check-in
      </a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        This is an automated weekly summary from Motivasi. You're receiving this because you're a trainer on our platform.
      </p>
      <p style="margin-top: 12px; font-size: 11px;">
        © ${new Date().getFullYear()} Motivasi. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send weekly digest email to a trainer
 */
export async function sendWeeklyDigestEmail(
  trainerId: string,
  trainerEmail: string,
  trainerName: string
): Promise<boolean> {
  try {
    // Calculate metrics
    const metrics = await calculateWeeklyMetrics(trainerId);

    // Generate email
    const emailData: TrainerEmailData = {
      trainerId,
      trainerEmail,
      trainerName,
      metrics,
      generatedAt: new Date(),
    };

    const htmlContent = generateWeeklyDigestEmail(emailData);

    // Send email
    await sendEmail({
      to: trainerEmail,
      subject: 'Your Weekly Client Check-In Summary',
      html: htmlContent,
      text: `Weekly Client Check-In Summary\n\nHi ${trainerName},\n\nHere's a snapshot of your clients' progress this week:\n\nActive Clients: ${metrics.activeClients}\nOn Track: ${metrics.onTrackCount}\nAt Risk: ${metrics.atRiskCount}\nInactive: ${metrics.inactiveCount}\nAvg Completion Rate: ${metrics.avgCompletionRate}%\nAvg Difficulty Rating: ${metrics.avgDifficultyRating}\n\nClients needing check-in: ${metrics.clientsNeedingCheckIn}\n\nReview your clients in the dashboard to see who might benefit from a check-in.`,
    });

    return true;
  } catch (error) {
    // Log error silently without retries
    console.error(`Failed to send weekly digest email to trainer ${trainerId}:`, error);
    return false;
  }
}

/**
 * Send weekly digest emails to all trainers
 * This function should be called by a scheduled backend job (e.g., AWS Lambda, Cron)
 */
export async function sendWeeklyDigestToAllTrainers(): Promise<{
  sent: number;
  failed: number;
  errors: Array<{ trainerId: string; error: string }>;
}> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as Array<{ trainerId: string; error: string }>,
  };

  try {
    // Get all trainers from member roles
    const { items: memberRoles } = await BaseCrudService.getAll<any>('memberroles');

    // Filter for trainers
    const trainers = memberRoles.filter(
      (role) =>
        role.role === 'trainer' ||
        (role.roles && role.roles.includes('trainer'))
    );

    // Send email to each trainer
    for (const trainer of trainers) {
      try {
        // In a real implementation, we'd fetch the trainer's email and name from their member profile
        // For now, we'll use placeholder values
        const trainerEmail = `trainer-${trainer.memberId}@motivasi.co.uk`;
        const trainerName = trainer.memberId?.slice(0, 8) || 'Trainer';

        const success = await sendWeeklyDigestEmail(
          trainer.memberId,
          trainerEmail,
          trainerName
        );

        if (success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({
            trainerId: trainer.memberId,
            error: 'Failed to send email',
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          trainerId: trainer.memberId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending weekly digest emails:', error);
    return results;
  }
}

/**
 * Schedule weekly digest emails
 * This function should be called by a backend scheduler (e.g., AWS EventBridge, Cron)
 * Default: Monday 8-9 am local time
 */
export function scheduleWeeklyDigest(): void {
  // This is a placeholder for the actual scheduling logic
  // In production, this would be implemented in a backend service using:
  // - AWS EventBridge + Lambda
  // - Google Cloud Scheduler + Cloud Functions
  // - Node.js node-cron or similar
  // - Traditional cron jobs

  console.log(
    'Weekly digest scheduler initialized. Emails will be sent every Monday at 8:00 AM local time.'
  );
}

export default {
  calculateWeeklyMetrics,
  generateWeeklyDigestEmail,
  sendWeeklyDigestEmail,
  sendWeeklyDigestToAllTrainers,
  scheduleWeeklyDigest,
};
