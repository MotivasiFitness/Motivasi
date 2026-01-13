import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRole } from '@/hooks/useRole';
import { backfillExistingUsers, DEFAULT_TRAINER_ID } from '@/lib/trainer-assignment';
import { AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface BackfillResult {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
  errors: Array<{ clientId: string; error?: string }>;
}

export default function TrainerAssignmentMigration() {
  const { member } = useMember();
  const { isAdmin, isLoading: roleLoading } = useRole();
  const navigate = useNavigate();

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BackfillResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleRunBackfill = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const backfillResult = await backfillExistingUsers(DEFAULT_TRAINER_ID);
      setResult(backfillResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Header */}
      <section className="py-12 px-8 lg:px-20 bg-warm-sand-beige border-b border-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-soft-bronze" />
            <h1 className="font-heading text-5xl font-bold text-charcoal-black">
              Trainer Assignment Migration
            </h1>
          </div>
          <p className="font-paragraph text-lg text-warm-grey">
            Backfill existing users with trainer assignment
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-8 lg:px-20">
        <div className="max-w-2xl mx-auto">
          {/* Info Box */}
          <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
              About This Migration
            </h2>
            <div className="space-y-3 font-paragraph text-base text-charcoal-black">
              <p>
                This tool will assign all existing users to the default trainer:
              </p>
              <p className="font-mono bg-white p-3 rounded border border-soft-bronze/20">
                {DEFAULT_TRAINER_ID}
              </p>
              <p>
                The operation is <span className="font-bold">idempotent</span> - it will skip users already assigned to this trainer and will not overwrite existing assignments.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Checks for existing active assignments before creating new ones</li>
                <li>Logs all operations for audit purposes</li>
                <li>Can be safely run multiple times</li>
              </ul>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-paragraph font-bold text-red-800 mb-1">Error</p>
                <p className="font-paragraph text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mb-8 space-y-4">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-paragraph font-bold text-green-800 mb-3">
                    Migration Complete
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-green-200">
                      <p className="font-paragraph text-xs text-warm-grey">Total Users</p>
                      <p className="font-heading text-3xl font-bold text-charcoal-black">
                        {result.total}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200">
                      <p className="font-paragraph text-xs text-warm-grey">Successfully Assigned</p>
                      <p className="font-heading text-3xl font-bold text-green-600">
                        {result.successful}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200">
                      <p className="font-paragraph text-xs text-warm-grey">Already Assigned</p>
                      <p className="font-heading text-3xl font-bold text-soft-bronze">
                        {result.skipped}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200">
                      <p className="font-paragraph text-xs text-warm-grey">Failed</p>
                      <p className="font-heading text-3xl font-bold text-red-600">
                        {result.failed}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Failed Items */}
              {result.failed > 0 && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-paragraph font-bold text-red-800 mb-4">
                    Failed Assignments ({result.failed})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border border-red-200">
                        <p className="font-mono text-xs text-charcoal-black">{err.clientId}</p>
                        {err.error && (
                          <p className="font-paragraph text-xs text-red-600 mt-1">{err.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleRunBackfill}
              disabled={isRunning}
              className="w-full bg-charcoal-black text-soft-white py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Running Migration...
                </>
              ) : (
                'Run Trainer Assignment Backfill'
              )}
            </button>

            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-warm-sand-beige text-charcoal-black py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze hover:text-soft-white transition-colors duration-300"
            >
              Back to Admin Dashboard
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl">
            <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
              How This Works
            </h3>
            <ol className="space-y-2 font-paragraph text-sm text-charcoal-black list-decimal list-inside">
              <li>Fetches all existing users from the memberroles collection</li>
              <li>For each user, checks if they're already assigned to the trainer</li>
              <li>Creates new assignments only for users not yet assigned</li>
              <li>Logs all operations for audit purposes</li>
              <li>Returns a summary of successful, skipped, and failed assignments</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
