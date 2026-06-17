import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RetryConfig, RETRY_DELAY_OPTIONS, RETRY_ERROR_OPTIONS } from "@/lib/jobsMockData";

interface Props {
  dryRunEnabled: boolean;
  retry: RetryConfig;
  onDryRunChange: (enabled: boolean) => void;
  onRetryChange: (patch: Partial<RetryConfig>) => void;
  showErrors: boolean;
}

export default function Step4DryRunRetry({
  dryRunEnabled,
  retry,
  onDryRunChange,
  onRetryChange,
  showErrors,
}: Props) {
  const toggleRetryOn = (key: string) => {
    const current = retry.retryOn;
    if (current.includes(key)) {
      onRetryChange({ retryOn: current.filter((k) => k !== key) });
    } else {
      onRetryChange({ retryOn: [...current, key] });
    }
  };

  const handleMaxAttempts = (val: string) => {
    const n = Number(val);
    if (!isNaN(n)) onRetryChange({ maxAttempts: Math.min(5, Math.max(1, n)) });
  };

  return (
    <div className="space-y-8">
      {/* Dry-run section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-bluegrey-900">Dry-run mode</h3>

        <div className="p-4 rounded-lg border border-bluegrey-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dry-run-toggle" className="text-sm font-medium text-bluegrey-900">
                Enable dry-run mode
              </Label>
              <p className="text-xs text-bluegrey-500 mt-0.5">
                Job runs in simulation mode first. Deletion requires manual approval after
                reviewing the dry-run report.
              </p>
            </div>
            <Switch
              id="dry-run-toggle"
              checked={dryRunEnabled}
              onCheckedChange={onDryRunChange}
            />
          </div>

          {dryRunEnabled && (
            <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
              Dry-run is <span className="font-medium">enabled</span>. The job will simulate
              deletion and produce a report. No users will be deleted until you review and approve
              the results.
            </div>
          )}
        </div>
      </div>

      {/* Retry section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-bluegrey-900">Retry configuration</h3>

        <div className="p-4 rounded-lg border border-bluegrey-200 space-y-5">
          {/* Max attempts */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-bluegrey-700">
              Max retry attempts
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={5}
                value={retry.maxAttempts}
                onChange={(e) => handleMaxAttempts(e.target.value)}
                className="w-20 border border-bluegrey-300 rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <span className="text-xs text-bluegrey-500">Between 1 and 5 attempts</span>
            </div>
            {showErrors && (retry.maxAttempts < 1 || retry.maxAttempts > 5) && (
              <p className="text-xs text-red-600">Must be between 1 and 5.</p>
            )}
          </div>

          {/* Retry delay */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-bluegrey-700">Retry delay</label>
            <select
              value={retry.delaySeconds}
              onChange={(e) => onRetryChange({ delaySeconds: Number(e.target.value) })}
              className="w-48 border border-bluegrey-300 rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {RETRY_DELAY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-bluegrey-500">
              Wait time between consecutive retry attempts.
            </p>
          </div>

          {/* Retry on */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-bluegrey-700">
              Retry on error types
            </label>
            <div className="space-y-2">
              {RETRY_ERROR_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id={`retry-${opt.key}`}
                    checked={retry.retryOn.includes(opt.key)}
                    onCheckedChange={() => toggleRetryOn(opt.key)}
                  />
                  <span className="text-sm text-bluegrey-800">{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-bluegrey-500">
              Select which error categories should trigger a retry attempt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
