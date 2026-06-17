import { Checkbox } from "@/components/ui/checkbox";
import {
  CleanupStatus,
  Frequency,
  RetryConfig,
  CLEANUP_STATUS_LABELS,
  FREQUENCY_LABELS,
  RETRY_DELAY_OPTIONS,
  RETRY_ERROR_OPTIONS,
  formatHour,
} from "@/lib/jobsMockData";

interface Props {
  name: string;
  statuses: CleanupStatus[];
  frequency: Frequency;
  frequencyDays: string[];
  frequencyDayOfMonth: number;
  executionHour: number;
  dryRunEnabled: boolean;
  retry: RetryConfig;
  confirmed: boolean;
  onConfirmChange: (v: boolean) => void;
  showError: boolean;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 py-3 border-b border-bluegrey-100 last:border-0">
      <span className="text-sm font-medium text-bluegrey-500">{label}</span>
      <span className="text-sm text-bluegrey-900">{value}</span>
    </div>
  );
}

function frequencyDisplay(
  frequency: Frequency,
  frequencyDays: string[],
  frequencyDayOfMonth: number
): string {
  if (frequency === "daily") return "Daily";
  if (frequency === "weekly") return `Weekly on ${frequencyDays[0] || "Monday"}`;
  if (frequency === "twice-weekly")
    return `Twice weekly — ${frequencyDays[0] || "Monday"} & ${frequencyDays[1] || "Thursday"}`;
  if (frequency === "monthly") return `Monthly on day ${frequencyDayOfMonth}`;
  return FREQUENCY_LABELS[frequency];
}

function delayLabel(seconds: number): string {
  return RETRY_DELAY_OPTIONS.find((o) => o.value === seconds)?.label ?? `${seconds}s`;
}

export default function Step5Review({
  name,
  statuses,
  frequency,
  frequencyDays,
  frequencyDayOfMonth,
  executionHour,
  dryRunEnabled,
  retry,
  confirmed,
  onConfirmChange,
  showError,
}: Props) {
  const retryOnLabels = RETRY_ERROR_OPTIONS.filter((o) => retry.retryOn.includes(o.key)).map(
    (o) => o.label
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">Review configuration</h3>
        <p className="text-sm text-bluegrey-600">
          Review the cleanup job configuration below. Once confirmed, the job will be saved and
          scheduled.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border border-bluegrey-200 divide-y divide-bluegrey-100 bg-white">
        <div className="px-4 py-3 bg-bluegrey-50 rounded-t-lg">
          <span className="text-xs font-semibold uppercase tracking-wide text-bluegrey-500">
            Job summary
          </span>
        </div>
        <div className="px-4">
          <Row label="Job name" value={name || <span className="text-bluegrey-400 italic">Unnamed job</span>} />
          <Row
            label="Statuses to delete"
            value={
              statuses.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {statuses.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {CLEANUP_STATUS_LABELS[s]}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-bluegrey-400 italic">None selected</span>
              )
            }
          />
          <Row
            label="Frequency"
            value={frequencyDisplay(frequency, frequencyDays, frequencyDayOfMonth)}
          />
          <Row label="Execution schedule" value={`${formatHour(executionHour)} CET`} />
          <Row label="Dry-run mode" value={dryRunEnabled ? "Enabled" : "Disabled"} />
          <Row label="Max retry attempts" value={retry.maxAttempts} />
          <Row label="Retry delay" value={delayLabel(retry.delaySeconds)} />
          <Row
            label="Retry on errors"
            value={
              retryOnLabels.length > 0 ? (
                <ul className="list-disc list-inside space-y-0.5">
                  {retryOnLabels.map((l) => (
                    <li key={l} className="text-sm text-bluegrey-800">
                      {l}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-bluegrey-400 italic">None</span>
              )
            }
          />
          <Row label="Created by" value="admin@example.com" />
          <Row label="Created date" value={new Date().toLocaleDateString()} />
        </div>
      </div>

      {/* Confirmation */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
        <p className="text-sm font-medium text-amber-800">
          ⚠ This action will permanently and repeatedly delete users matching the selected
          criteria.
        </p>
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox
            id="confirm-checkbox"
            checked={confirmed}
            onCheckedChange={(v) => onConfirmChange(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-amber-900">
            I understand this will permanently and repeatedly delete selected users.
          </span>
        </label>
        {showError && !confirmed && (
          <p className="text-xs text-red-600">
            Please check the confirmation box before saving.
          </p>
        )}
      </div>
    </div>
  );
}
