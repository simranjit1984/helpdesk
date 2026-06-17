import { JobType } from "@/lib/jobsMockData";

interface Props {
  selected: JobType | null;
  onChange: (type: JobType) => void;
  showError: boolean;
}

const JOB_TYPES: { type: JobType; label: string; description: string }[] = [
  {
    type: "user-status-cleanup",
    label: "User Status Cleanup",
    description:
      "Removes users from the system based on their account status (expired invitations, blocked, inactive, etc.)",
  },
  {
    type: "org-membership-cleanup",
    label: "Org Membership Cleanup",
    description:
      "Removes users from organizations when their membership validity period (end date) has expired.",
  },
  {
    type: "access-role-cleanup",
    label: "Access Role Cleanup",
    description:
      "Revokes access role assignments from users when the role's end date has passed.",
  },
];

export default function StepJobType({ selected, onChange, showError }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">Select a job type</h3>
        <p className="text-sm text-bluegrey-600">
          Choose what kind of cleanup operation this job should perform. Each type targets a
          different aspect of user lifecycle management.
        </p>
      </div>

      <div className="space-y-3">
        {JOB_TYPES.map(({ type, label, description }) => (
          <label
            key={type}
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              selected === type
                ? "border-blue-500 bg-blue-50"
                : "border-bluegrey-200 hover:border-blue-300 hover:bg-blue-50/30"
            }`}
          >
            <input
              type="radio"
              name="job-type"
              value={type}
              checked={selected === type}
              onChange={() => onChange(type)}
              className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-bluegrey-900">{label}</div>
              <div className="text-xs text-bluegrey-500 mt-0.5">{description}</div>
            </div>
          </label>
        ))}
      </div>

      {showError && selected === null && (
        <p className="text-xs text-red-600">Please select a job type to continue.</p>
      )}
    </div>
  );
}
