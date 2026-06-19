import { Checkbox } from "@/components/ui/checkbox";
import {
  AccessRoleBehavior,
  CleanupJobFormState,
  LAST_ORG_BEHAVIOR_LABELS,
  LAST_ROLE_BEHAVIOR_LABELS,
  LastOrgBehavior,
  LastRoleBehavior,
  OrgMembershipBehavior,
} from "@/lib/jobsMockData";

interface Props {
  jobType: "org-membership-cleanup" | "access-role-cleanup";
  orgBehavior: OrgMembershipBehavior;
  roleBehavior: AccessRoleBehavior;
  onChange: (patch: Partial<CleanupJobFormState>) => void;
}

const LAST_ORG_OPTIONS: LastOrgBehavior[] = ["orphan-org", "delete-user"];
const LAST_ROLE_OPTIONS: LastRoleBehavior[] = ["keep-in-org", "mark-no-roles"];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-semibold text-bluegrey-700 mb-3">{children}</h4>
  );
}

function OrgBehaviorPanel({
  orgBehavior,
  onChange,
}: {
  orgBehavior: OrgMembershipBehavior;
  onChange: (patch: Partial<CleanupJobFormState>) => void;
}) {
  const patch = (updates: Partial<OrgMembershipBehavior>) =>
    onChange({ orgBehavior: { ...orgBehavior, ...updates } });

  return (
    <div className="space-y-4">
      {/* Section 1: On removal actions */}
      <div className="p-4 rounded-lg border border-bluegrey-200 space-y-3">
        <SectionHeader>On removal actions</SectionHeader>
        <div className="space-y-3">
          <label className="flex items-start gap-2">
            <Checkbox
              id="org-revoke-roles"
              checked={true}
              disabled
              className="mt-0.5 opacity-60"
            />
            <div>
              <span className="text-sm text-bluegrey-500">
                Automatically revoke all access roles assigned in this organization
              </span>
              <p className="text-xs text-bluegrey-400 mt-0.5">
                Always enabled. All roles tied to this organization are immediately revoked upon membership removal.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              id="org-send-notification"
              checked={orgBehavior.sendNotification}
              onCheckedChange={(v) => patch({ sendNotification: v === true })}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm text-bluegrey-800">
                Send notification email to user
              </span>
              <p className="text-xs text-bluegrey-400 mt-0.5">
                User receives an email informing them of their organization membership removal.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-2">
            <Checkbox
              id="org-audit-trail"
              checked={true}
              disabled
              className="mt-0.5 opacity-60"
            />
            <div>
              <span className="text-sm text-bluegrey-500">
                Log audit trail entry
              </span>
              <p className="text-xs text-bluegrey-400 mt-0.5">
                Always enabled. Every removal is recorded in the audit trail.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Section 2: Last org behavior */}
      <div className="p-4 rounded-lg border border-bluegrey-200 space-y-3">
        <SectionHeader>If user has no other organizations</SectionHeader>
        <p className="text-xs text-bluegrey-500 -mt-1 mb-2">
          Choose what to do when this removal leaves the user without any organization membership.
        </p>
        <div className="space-y-2">
          {LAST_ORG_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                orgBehavior.lastOrgBehavior === option
                  ? "border-blue-500 bg-blue-50"
                  : "border-bluegrey-200 hover:border-blue-300 hover:bg-blue-50/30"
              }`}
            >
              <input
                type="radio"
                name="last-org-behavior"
                value={option}
                checked={orgBehavior.lastOrgBehavior === option}
                onChange={() => patch({ lastOrgBehavior: option })}
                className="w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-bluegrey-800">
                {LAST_ORG_BEHAVIOR_LABELS[option]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleBehaviorPanel({
  roleBehavior,
  onChange,
}: {
  roleBehavior: AccessRoleBehavior;
  onChange: (patch: Partial<CleanupJobFormState>) => void;
}) {
  const patch = (updates: Partial<AccessRoleBehavior>) =>
    onChange({ roleBehavior: { ...roleBehavior, ...updates } });

  return (
    <div className="space-y-4">
      {/* Section 1: On removal actions */}
      <div className="p-4 rounded-lg border border-bluegrey-200 space-y-3">
        <SectionHeader>On removal actions</SectionHeader>
        <div className="space-y-3">
          <label className="flex items-start gap-2">
            <Checkbox
              id="role-revoke-immediate"
              checked={true}
              disabled
              className="mt-0.5 opacity-60"
            />
            <div>
              <span className="text-sm text-bluegrey-500">
                Immediately revoke access role
              </span>
              <p className="text-xs text-bluegrey-400 mt-0.5">
                Always enabled. The role is revoked immediately upon job execution.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              id="role-send-notification"
              checked={roleBehavior.sendNotification}
              onCheckedChange={(v) => patch({ sendNotification: v === true })}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm text-bluegrey-800">
                Notify user of access revocation
              </span>
              <p className="text-xs text-bluegrey-400 mt-0.5">
                User receives an email informing them that their access role has been revoked.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-2">
            <Checkbox
              id="role-audit-trail"
              checked={true}
              disabled
              className="mt-0.5 opacity-60"
            />
            <div>
              <span className="text-sm text-bluegrey-500">
                Log audit trail entry
              </span>
              <p className="text-xs text-bluegrey-400 mt-0.5">
                Always enabled. Every revocation is recorded in the audit trail.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              id="role-remove-entitlements"
              checked={roleBehavior.removeFromEntitlements}
              onCheckedChange={(v) => patch({ removeFromEntitlements: v === true })}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm text-bluegrey-800">
                Remove from application entitlements
              </span>
              <p className="text-xs text-bluegrey-400 mt-0.5">
                The user will also be removed from any application entitlements linked to this role.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Section 2: Last role behavior */}
      <div className="p-4 rounded-lg border border-bluegrey-200 space-y-3">
        <SectionHeader>If last access role is removed</SectionHeader>
        <p className="text-xs text-bluegrey-500 -mt-1 mb-2">
          Choose what to do when this is the user's last active access role in the organization.
        </p>
        <div className="space-y-2">
          {LAST_ROLE_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                roleBehavior.lastRoleBehavior === option
                  ? "border-blue-500 bg-blue-50"
                  : "border-bluegrey-200 hover:border-blue-300 hover:bg-blue-50/30"
              }`}
            >
              <input
                type="radio"
                name="last-role-behavior"
                value={option}
                checked={roleBehavior.lastRoleBehavior === option}
                onChange={() => patch({ lastRoleBehavior: option })}
                className="w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-bluegrey-800">
                {LAST_ROLE_BEHAVIOR_LABELS[option]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StepBehaviorConfig({
  jobType,
  orgBehavior,
  roleBehavior,
  onChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">Removal behavior</h3>
        <p className="text-sm text-bluegrey-600">
          Configure what actions to take when{" "}
          {jobType === "org-membership-cleanup"
            ? "a user is removed from an organization"
            : "an access role is revoked from a user"}
          .
        </p>
      </div>

      {jobType === "org-membership-cleanup" ? (
        <OrgBehaviorPanel orgBehavior={orgBehavior} onChange={onChange} />
      ) : (
        <RoleBehaviorPanel roleBehavior={roleBehavior} onChange={onChange} />
      )}
    </div>
  );
}
