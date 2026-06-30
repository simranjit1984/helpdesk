import { Users, Building2, Shield, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ALL_ACCESS_ROLES } from "@/components/organizations/accessRolesMockData";
import { MOCK_ADMIN_ROLES } from "@/components/administrators/mockData";
import { baseOrganizations } from "@/components/OrganizationsTable";
import type { ParsedUser } from "./Step1Upload";

interface Props {
  validUsers: ParsedUser[];
  orgId: string;
  accessRoleIds: string[];
  adminRoleIds: string[];
  fileName: string;
}

function findOrgName(id: string): string {
  for (const org of baseOrganizations) {
    if (org.id === id) return org.name;
    const child = org.children?.find((c) => c.id === id);
    if (child) return `${org.name} › ${child.name}`;
  }
  return id;
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-bluegrey-100 last:border-0">
      <div className="w-8 h-8 rounded-full bg-bluegrey-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-bluegrey-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-bluegrey-900">{value}</div>
      </div>
    </div>
  );
}

export default function Step5Review({ validUsers, orgId, accessRoleIds, adminRoleIds, fileName }: Props) {
  const orgName = findOrgName(orgId);
  const accessRoleNames = ALL_ACCESS_ROLES.filter((r) => accessRoleIds.includes(r.id)).map((r) => r.name);
  const adminRoleNames = MOCK_ADMIN_ROLES.filter((r) => adminRoleIds.includes(r.id)).map((r) => r.name);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Review &amp; submit</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          Review your configuration. Clicking "Start bulk invitation" will queue a background job
          — you can monitor its progress on the Bulk Invitation Jobs page.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border border-bluegrey-200 bg-white divide-y divide-bluegrey-100">
        <div className="px-4 py-3 bg-bluegrey-50 rounded-t-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-bluegrey-500">Job summary</p>
        </div>
        <div className="px-4">
          <Row
            icon={Users}
            label="Users to invite"
            value={
              <div>
                <span className="font-semibold text-bluegrey-900">{validUsers.length}</span>
                <span className="text-bluegrey-500 ml-2 text-xs">from {fileName}</span>
                <div className="mt-1 text-xs text-bluegrey-500">
                  Sample: {validUsers.slice(0, 3).map((u) => u.email).join(", ")}
                  {validUsers.length > 3 && ` +${validUsers.length - 3} more`}
                </div>
              </div>
            }
          />
          <Row
            icon={Building2}
            label="Organization"
            value={orgName}
          />
          <Row
            icon={Shield}
            label="Access roles"
            value={
              accessRoleNames.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {accessRoleNames.map((n) => (
                    <span key={n} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-bluegrey-400 italic text-xs">None selected</span>
              )
            }
          />
          <Row
            icon={ShieldCheck}
            label="Admin roles"
            value={
              adminRoleNames.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {adminRoleNames.map((n) => (
                    <span key={n} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-bluegrey-400 italic text-xs">None</span>
              )
            }
          />
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 flex items-start gap-2 text-sm text-blue-700">
        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Invitations will be processed asynchronously in a background job. Each user is processed
          independently — individual failures won't stop the rest.
        </span>
      </div>
    </div>
  );
}
