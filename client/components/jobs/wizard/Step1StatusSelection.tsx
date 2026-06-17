import { CLEANUP_STATUS_LABELS, CleanupStatus } from "@/lib/jobsMockData";

interface Props {
  selected: CleanupStatus | null;
  onChange: (status: CleanupStatus) => void;
  showError: boolean;
}

const ALL_STATUSES: CleanupStatus[] = [
  "invitation-expired",
  "invitation-withdrawn",
  "auth-blocked",
  "inactive",
];

const DESCRIPTIONS: Record<CleanupStatus, string> = {
  "invitation-expired": "Users whose invitation has passed the expiry date without being accepted.",
  "invitation-withdrawn": "Users whose invitation was manually revoked before acceptance.",
  "auth-blocked": "Users blocked due to repeated authentication failures.",
  inactive: "Users who have had no activity beyond the configured inactivity threshold.",
};

export default function Step1StatusSelection({ selected, onChange, showError }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">
          Select a user status to clean up
        </h3>
        <p className="text-sm text-bluegrey-600">
          Users matching the selected status will be permanently deleted during each job
          execution. Select exactly one status.
        </p>
      </div>

      <div className="space-y-3">
        {ALL_STATUSES.map((status) => (
          <label
            key={status}
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              selected === status
                ? "border-blue-500 bg-blue-50"
                : "border-bluegrey-200 hover:border-blue-300 hover:bg-blue-50/30"
            }`}
          >
            <input
              type="radio"
              name="cleanup-status"
              value={status}
              checked={selected === status}
              onChange={() => onChange(status)}
              className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-bluegrey-900">
                {CLEANUP_STATUS_LABELS[status]}
              </div>
              <div className="text-xs text-bluegrey-500 mt-0.5">{DESCRIPTIONS[status]}</div>
            </div>
          </label>
        ))}
      </div>

      {showError && selected === null && (
        <p className="text-xs text-red-600">Please select a user status to continue.</p>
      )}
    </div>
  );
}
