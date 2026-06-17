import { Checkbox } from "@/components/ui/checkbox";
import {
  CleanupJobFormState,
  CLEANUP_STATUS_LABELS,
  FREQUENCY_LABELS,
  JOB_TYPE_LABELS,
  LAST_ORG_BEHAVIOR_LABELS,
  LAST_ROLE_BEHAVIOR_LABELS,
  MOCK_ACCESS_ROLE_OPTIONS,
  MOCK_ORGANIZATIONS,
  USER_STATUS_FILTER_LABELS,
  formatHour,
} from "@/lib/jobsMockData";

interface Props {
  form: CleanupJobFormState;
  confirmed: boolean;
  onConfirmChange: (v: boolean) => void;
  showError: boolean;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 py-3 border-b border-bluegrey-100 last:border-0">
      <span className="text-sm font-medium text-bluegrey-500">{label}</span>
      <span className="text-sm text-bluegrey-900">{value}</span>
    </div>
  );
}

function frequencyDisplay(form: CleanupJobFormState): string {
  if (form.frequency === "daily") return "Daily";
  if (form.frequency === "weekly")
    return `Weekly on ${form.frequencyDays[0] || "Monday"}`;
  if (form.frequency === "twice-weekly")
    return `Twice weekly — ${form.frequencyDays[0] || "Monday"} & ${
      form.frequencyDays[1] || "Thursday"
    }`;
  if (form.frequency === "monthly")
    return `Monthly on day ${form.frequencyDayOfMonth}`;
  return FREQUENCY_LABELS[form.frequency];
}

function JobTypeBadge({ jobType }: { jobType: string }) {
  const cls =
    jobType === "org-membership-cleanup"
      ? "bg-purple-100 text-purple-800"
      : jobType === "access-role-cleanup"
      ? "bg-teal-100 text-teal-800"
      : "bg-blue-100 text-blue-800";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {JOB_TYPE_LABELS[jobType as keyof typeof JOB_TYPE_LABELS] ?? jobType}
    </span>
  );
}

export default function Step5Review({ form, confirmed, onConfirmChange, showError }: Props) {
  const jobType = form.jobType ?? "user-status-cleanup";

  const orgNames = form.includeAllOrgs
    ? "All organizations"
    : form.organizationIds.length === 0
    ? "None selected"
    : MOCK_ORGANIZATIONS.filter((o) => form.organizationIds.includes(o.id))
        .map((o) => o.name)
        .join(", ");

  const roleNames = form.includeAllRoles
    ? "All access roles"
    : form.specificAccessRoles.length === 0
    ? "None selected"
    : MOCK_ACCESS_ROLE_OPTIONS.filter((r) => form.specificAccessRoles.includes(r.id))
        .map((r) => r.name)
        .join(", ");

  const excludedRoleNames =
    form.excludeRoles.length === 0
      ? "None"
      : MOCK_ACCESS_ROLE_OPTIONS.filter((r) => form.excludeRoles.includes(r.id))
          .map((r) => r.name)
          .join(", ");

  const gracePeriodDays = form.gracePeriodDays;
  const triggerCondition =
    gracePeriodDays === 0
      ? "end date ≤ today (immediate)"
      : `end date + ${gracePeriodDays} day${gracePeriodDays !== 1 ? "s" : ""} ≤ today`;

  const warningText =
    jobType === "org-membership-cleanup"
      ? "This job will repeatedly remove users from the selected organizations when their membership end date has passed."
      : jobType === "access-role-cleanup"
      ? "This job will repeatedly revoke access role assignments when the role's end date has passed."
      : "This action will permanently and repeatedly delete users matching the selected status.";

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
          <Row
            label="Job name"
            value={form.name || <span className="text-bluegrey-400 italic">Unnamed job</span>}
          />
          <Row label="Job type" value={<JobTypeBadge jobType={jobType} />} />

          {/* User status cleanup: show status */}
          {jobType === "user-status-cleanup" && (
            <Row
              label="Status to delete"
              value={
                form.status ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                    {CLEANUP_STATUS_LABELS[form.status]}
                  </span>
                ) : (
                  <span className="text-bluegrey-400 italic">None selected</span>
                )
              }
            />
          )}

          {/* Org / Access Role: shared fields */}
          {(jobType === "org-membership-cleanup" || jobType === "access-role-cleanup") && (
            <>
              <Row label="Target organizations" value={orgNames} />
              <Row label="User status filter" value={USER_STATUS_FILTER_LABELS[form.userStatusFilter]} />
              <Row label="Grace period" value={`${gracePeriodDays} day${gracePeriodDays !== 1 ? "s" : ""}`} />
              <Row label="Trigger condition" value={triggerCondition} />
            </>
          )}

          {/* Org Membership: specific fields */}
          {jobType === "org-membership-cleanup" && (
            <>
              <Row
                label="Revoke roles on removal"
                value={form.orgBehavior.revokeAccessRoles ? "Yes" : "No"}
              />
              <Row
                label="Send notification"
                value={form.orgBehavior.sendNotification ? "Yes" : "No"}
              />
              <Row
                label="If last organization"
                value={LAST_ORG_BEHAVIOR_LABELS[form.orgBehavior.lastOrgBehavior]}
              />
            </>
          )}

          {/* Access Role: specific fields */}
          {jobType === "access-role-cleanup" && (
            <>
              <Row label="Target roles" value={roleNames} />
              {form.excludeRoles.length > 0 && (
                <Row label="Excluded roles" value={excludedRoleNames} />
              )}
              <Row
                label="Remove from entitlements"
                value={form.roleBehavior.removeFromEntitlements ? "Yes" : "No"}
              />
              <Row
                label="Send notification"
                value={form.roleBehavior.sendNotification ? "Yes" : "No"}
              />
              <Row
                label="If last role removed"
                value={LAST_ROLE_BEHAVIOR_LABELS[form.roleBehavior.lastRoleBehavior]}
              />
            </>
          )}

          <Row label="Frequency" value={frequencyDisplay(form)} />
          <Row label="Execution schedule" value={`${formatHour(form.executionHour)} CET`} />
          <Row label="Created by" value="admin@example.com" />
          <Row label="Created date" value={new Date().toLocaleDateString()} />
        </div>
      </div>

      {/* Confirmation */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
        <p className="text-sm font-medium text-amber-800">⚠ {warningText}</p>
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox
            id="confirm-checkbox"
            checked={confirmed}
            onCheckedChange={(v) => onConfirmChange(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-amber-900">
            I understand and confirm this job's behavior.
          </span>
        </label>
        {showError && !confirmed && (
          <p className="text-xs text-red-600">Please check the confirmation box before saving.</p>
        )}
      </div>
    </div>
  );
}
