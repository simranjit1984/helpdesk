import { Users, Building2, Shield, ShieldCheck, CheckCircle2, Info } from "lucide-react";
import { getAvailableRolesForOrg } from "@/components/organizations/accessRolesMockData";
import { MOCK_ADMIN_ROLES, MOCK_SCOPES } from "@/components/administrators/mockData";
import { baseOrganizations } from "@/components/OrganizationsTable";
import type { ParsedUser } from "./Step1Upload";
import type { OrgConfig } from "./StepConfigureOrgs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getParentId(orgId: string): string | undefined {
  for (const org of baseOrganizations) {
    if (org.children?.some((c) => c.id === orgId)) return org.id;
  }
  return undefined;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  validUsers: ParsedUser[];
  orgConfigs: Record<string, OrgConfig>;
  fileName: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepReview({ validUsers, orgConfigs, fileName }: Props) {
  const orgList = Object.values(orgConfigs).sort((a, b) => a.orgName.localeCompare(b.orgName));
  const totalOrgs = orgList.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Review &amp; submit</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          Review your configuration. Clicking "Start bulk invitation" will queue a background job
          — you can monitor its progress on the Bulk Invitation Jobs page.
        </p>
      </div>

      {/* Totals banner */}
      <div className="rounded-lg border border-bluegrey-200 bg-white px-5 py-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xl font-bold text-bluegrey-900">{validUsers.length}</p>
            <p className="text-xs text-bluegrey-500">Users</p>
          </div>
        </div>
        <div className="w-px h-8 bg-bluegrey-200" />
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xl font-bold text-bluegrey-900">{totalOrgs}</p>
            <p className="text-xs text-bluegrey-500">Organization{totalOrgs !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-bluegrey-400">Source file</p>
          <p className="text-xs font-medium text-bluegrey-700">{fileName}</p>
        </div>
      </div>

      {/* Per-org summary */}
      <div className="space-y-3">
        {orgList.map((org) => {
          const parentId = getParentId(org.orgId);
          const allRoles = getAvailableRolesForOrg(org.orgId, parentId);
          const selectedAccessRoles = allRoles.filter((r) => org.accessRoleIds.includes(r.id));

          return (
            <div key={org.orgId} className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
              {/* Org header */}
              <div className="px-4 py-3 bg-bluegrey-50 border-b border-bluegrey-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-bluegrey-500" />
                  <span className="font-semibold text-bluegrey-900">{org.orgName}</span>
                </div>
                <span className="text-xs text-bluegrey-500">
                  {org.userCount} user{org.userCount !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="px-4 py-4 space-y-4">
                {/* Access roles */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Access Roles</span>
                  </div>
                  {selectedAccessRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedAccessRoles.map((r) => (
                        <span key={r.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                          {r.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-bluegrey-400 italic">None</span>
                  )}
                </div>

                {/* Admin roles */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Admin Roles</span>
                  </div>
                  {org.adminRoleAssignments.length > 0 ? (
                    <div className="space-y-1.5">
                      {org.adminRoleAssignments.map((a) => {
                        const role = MOCK_ADMIN_ROLES.find((r) => r.id === a.roleId);
                        const scope = MOCK_SCOPES.find((s) => s.id === a.scopeId);
                        return (
                          <div key={a.roleId} className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                              {role?.name ?? a.roleId}
                            </span>
                            {scope && (
                              <span className="text-xs text-bluegrey-500">
                                Scope: {scope.name}
                              </span>
                            )}
                            {a.cascadable && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                                Cascadable
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-bluegrey-400 italic">None</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Async processing note */}
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 flex items-start gap-2 text-sm text-blue-700">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Invitations will be processed asynchronously in a background job. Each user is processed
          independently — failures for one user will not affect the remaining users. You can
          monitor progress on the Bulk Invitation Jobs page.
        </span>
      </div>
    </div>
  );
}
