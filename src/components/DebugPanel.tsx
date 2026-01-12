import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface DebugPanelProps {
  memberId?: string;
  memberEmail?: string;
  roleRecordFound?: boolean;
  roleValue?: string | null;
  isLoading?: boolean;
  setupError?: string | null;
  debugInfo?: any;
  redirectReason?: string;
}

export default function DebugPanel({
  memberId,
  memberEmail,
  roleRecordFound,
  roleValue,
  isLoading,
  setupError,
  debugInfo,
  redirectReason,
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const debugData = {
    'Member ID': memberId || 'N/A',
    'Member Email': memberEmail || 'N/A',
    'Role Record Found': roleRecordFound !== undefined ? String(roleRecordFound) : 'N/A',
    'Role Value': roleValue || 'null',
    'Is Loading': isLoading !== undefined ? String(isLoading) : 'N/A',
    'Setup Error': setupError || 'None',
    'Redirect Reason': redirectReason || 'None',
    'Debug Timestamp': debugInfo?.timestamp ? new Date(debugInfo.timestamp).toISOString() : 'N/A',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-charcoal-black border-2 border-soft-bronze rounded-lg shadow-2xl">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-charcoal-black/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-soft-bronze animate-pulse" />
            <span className="font-heading text-sm font-bold text-soft-white">
              Debug Panel
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp size={20} className="text-soft-bronze" />
          ) : (
            <ChevronDown size={20} className="text-soft-bronze" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="border-t border-soft-bronze/30 p-4 space-y-3 bg-charcoal-black/50 max-h-96 overflow-y-auto">
            {Object.entries(debugData).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-paragraph text-xs font-bold text-soft-bronze">
                    {key}
                  </span>
                  <button
                    onClick={() => copyToClipboard(String(value), key)}
                    className="p-1 hover:bg-soft-bronze/20 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedField === key ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} className="text-soft-bronze/60" />
                    )}
                  </button>
                </div>
                <div className="bg-charcoal-black/80 rounded px-2 py-1 border border-soft-bronze/20">
                  <code className="font-mono text-xs text-soft-white break-all">
                    {value}
                  </code>
                </div>
              </div>
            ))}

            {/* Additional Debug Info */}
            {debugInfo && (
              <div className="mt-4 pt-4 border-t border-soft-bronze/30">
                <span className="font-paragraph text-xs font-bold text-soft-bronze block mb-2">
                  Raw Debug Info
                </span>
                <div className="bg-charcoal-black/80 rounded px-2 py-1 border border-soft-bronze/20">
                  <code className="font-mono text-xs text-soft-white break-all whitespace-pre-wrap">
                    {JSON.stringify(debugInfo, null, 2)}
                  </code>
                </div>
              </div>
            )}

            {/* Status Indicator */}
            <div className="mt-4 pt-4 border-t border-soft-bronze/30">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    setupError
                      ? 'bg-red-500 animate-pulse'
                      : isLoading
                      ? 'bg-yellow-500 animate-pulse'
                      : roleRecordFound
                      ? 'bg-green-500'
                      : 'bg-orange-500'
                  }`}
                />
                <span className="font-paragraph text-xs text-soft-white">
                  {setupError
                    ? 'Error'
                    : isLoading
                    ? 'Loading...'
                    : roleRecordFound
                    ? 'Ready'
                    : 'No Role Record'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
