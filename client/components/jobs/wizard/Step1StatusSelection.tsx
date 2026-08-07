import { CLEANUP_STATUS_LABELS, CleanupStatus } from "@/lib/jobsMockData";

interface Props {
  selected: CleanupStatus[];
  onChange: (statuses: CleanupStatus[]) => void;
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
  function toggle(status: CleanupStatus) {
    if (selected.includes(status)) {
      onChange(selected.filter((s) => s !== status));
    } else {
      onChange([...selected, status]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">
          Select user statuses to clean up
        </h3>
        <p className="text-sm text-bluegrey-600">
          Users matching any of the selected statuses will be permanently deleted during each job
          execution. Select one or more statuses.
        </p>
      </div>

      <div className="space-y-3">
        {ALL_STATUSES.map((status) => {
          const checked = selected.includes(status);
          return (
            <label
              key={status}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                checked
                  ? "border-blue-500 bg-blue-50"
                  : "border-bluegrey-200 hover:border-blue-300 hover:bg-blue-50/30"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(status)}
                className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-bluegrey-900">
                  {CLEANUP_STATUS_LABELS[status]}
                </div>
                <div className="text-xs text-bluegrey-500 mt-0.5">{DESCRIPTIONS[status]}</div>
              </div>
            </label>
          );
        })}
      </div>

      {showError && selected.length === 0 && (
        <p className="text-xs text-red-600">Please select at least one user status to continue.</p>
      )}
    </div>
  );
}
