import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  const toggle = (status: CleanupStatus) => {
    if (selected.includes(status)) {
      onChange(selected.filter((s) => s !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">
          Select user statuses to clean up
        </h3>
        <p className="text-sm text-bluegrey-600">
          Users matching the selected statuses will be permanently deleted during each job
          execution. Select at least one status.
        </p>
      </div>

      <div className="space-y-3">
        {ALL_STATUSES.map((status) => (
          <label
            key={status}
            className="flex items-start gap-3 p-4 rounded-lg border border-bluegrey-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
          >
            <Checkbox
              id={`status-${status}`}
              checked={selected.includes(status)}
              onCheckedChange={() => toggle(status)}
              className="mt-0.5"
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

      {showError && selected.length === 0 && (
        <p className="text-xs text-red-600">
          Please select at least one user status to continue.
        </p>
      )}
    </div>
  );
}
