import { useState } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle, ChevronRight, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAvailableRolesForOrg } from "@/components/organizations/accessRolesMockData";
import { MOCK_ADMIN_ROLES, MOCK_SCOPES } from "@/components/administrators/mockData";
import { baseOrganizations } from "@/components/OrganizationsTable";
import type { ParsedUser } from "./Step1Upload";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminRoleAssignment {
  roleId: string;
  scopeId: string;
  cascadable: boolean;
}

export interface OrgConfig {
  orgId: string;
  orgName: string;
  userCount: number;
  accessRoleIds: string[];
  adminRoleAssignments: AdminRoleAssignment[];
  configured: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getParentId(orgId: string): string | undefined {
  for (const org of baseOrganizations) {
    if (org.children?.some((c) => c.id === orgId)) return org.id;
  }
  return undefined;
}

function buildOrgConfigs(validUsers: ParsedUser[], existing: Record<string, OrgConfig>): Record<string, OrgConfig> {
  const counts = new Map<string, { name: string; count: number }>();
  validUsers.forEach((u) => {
    const existing = counts.get(u.organizationId);
    if (existing) existing.count++;
    else counts.set(u.organizationId, { name: u.organizationName, count: 1 });
  });

  const result: Record<string, OrgConfig> = {};
  counts.forEach(({ name, count }, orgId) => {
    result[orgId] = existing[orgId] ?? {
      orgId,
      orgName: name,
      userCount: count,
      accessRoleIds: [],
      adminRoleAssignments: [],
      configured: false,
    };
    result[orgId].userCount = count; // always sync count
  });
  return result;
}

// ─── Org config panel ─────────────────────────────────────────────────────────

interface OrgConfigPanelProps {
  config: OrgConfig;
  onSave: (updated: OrgConfig) => void;
  onBack: () => void;
}

function OrgConfigPanel({ config, onSave, onBack }: OrgConfigPanelProps) {
  const [accessRoleIds, setAccessRoleIds] = useState<string[]>(config.accessRoleIds);
  const [adminRoleAssignments, setAdminRoleAssignments] = useState<AdminRoleAssignment[]>(
    config.adminRoleAssignments
  );

  const parentId = getParentId(config.orgId);
  const availableRoles = getAvailableRolesForOrg(config.orgId, parentId);

  const toggleAccessRole = (id: string) => {
    setAccessRoleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAdminSelected = (roleId: string) =>
    adminRoleAssignments.some((a) => a.roleId === roleId);

  const toggleAdminRole = (roleId: string) => {
    if (isAdminSelected(roleId)) {
      setAdminRoleAssignments((prev) => prev.filter((a) => a.roleId !== roleId));
    } else {
      setAdminRoleAssignments((prev) => [...prev, { roleId, scopeId: "", cascadable: false }]);
    }
  };

  const patchAdmin = (roleId: string, patch: Partial<AdminRoleAssignment>) => {
    setAdminRoleAssignments((prev) =>
      prev.map((a) => (a.roleId === roleId ? { ...a, ...patch } : a))
    );
  };

  const missingScopeCount = adminRoleAssignments.filter((a) => !a.scopeId).length;

  const handleSave = () => {
    onSave({
      ...config,
      accessRoleIds,
      adminRoleAssignments,
      configured: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-bluegrey-500 hover:text-bluegrey-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to organizations
        </button>
        <h2 className="text-lg font-semibold text-bluegrey-900">Configure Organization</h2>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-base font-medium text-bluegrey-700">{config.orgName}</span>
          <span className="text-xs text-bluegrey-400">
            {config.userCount} user{config.userCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Section 1: Access Roles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-bluegrey-900">Assign Access Roles</h3>
          <span className="text-xs text-bluegrey-400">(optional)</span>
        </div>
        <p className="text-xs text-bluegrey-500">
          Every user assigned to <strong>{config.orgName}</strong> will receive the selected roles.
          Only roles belonging to this organization are shown.
        </p>

        {availableRoles.length === 0 ? (
          <div className="rounded-md border border-dashed border-bluegrey-300 px-4 py-6 text-center">
            <p className="text-sm text-bluegrey-400">No access roles available for this organization.</p>
          </div>
        ) : (
          <div className="rounded-md border border-bluegrey-200 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-bluegrey-50 border-b border-bluegrey-200">
                  <th className="w-10 px-3 py-2" />
                  <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bluegrey-100">
                {availableRoles.map((role) => {
                  const checked = accessRoleIds.includes(role.id);
                  return (
                    <tr
                      key={role.id}
                      onClick={() => toggleAccessRole(role.id)}
                      className={`cursor-pointer transition-colors ${checked ? "bg-blue-50" : "hover:bg-bluegrey-25"}`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAccessRole(role.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </td>
                      <td className="px-3 py-3 font-medium text-bluegrey-900">{role.name}</td>
                      <td className="px-3 py-3 text-bluegrey-500">{role.description || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {accessRoleIds.length > 0 && (
          <p className="text-xs text-blue-700 font-medium">
            {accessRoleIds.length} role{accessRoleIds.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Section 2: Admin Roles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-bluegrey-900">Assign Admin Roles</h3>
          <span className="text-xs text-bluegrey-400">(optional)</span>
        </div>
        <p className="text-xs text-bluegrey-500">
          Each selected admin role requires a scope. All users assigned to{" "}
          <strong>{config.orgName}</strong> will receive these admin roles.
        </p>

        <div className="rounded-md border border-bluegrey-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-bluegrey-50 border-b border-bluegrey-200">
                <th className="w-10 px-3 py-2" />
                <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide whitespace-nowrap">Role</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Description</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide whitespace-nowrap">
                  Scope <span className="text-red-500">*</span>
                </th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide whitespace-nowrap">Cascadable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bluegrey-100">
              {MOCK_ADMIN_ROLES.map((role) => {
                const checked = isAdminSelected(role.id);
                const assignment = adminRoleAssignments.find((a) => a.roleId === role.id);
                const scopeMissing = checked && !assignment?.scopeId;
                return (
                  <tr
                    key={role.id}
                    className={`align-top transition-colors ${checked ? "bg-purple-50" : "hover:bg-bluegrey-25"}`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAdminRole(role.id)}
                        className="w-4 h-4 accent-purple-600 cursor-pointer mt-0.5"
                      />
                    </td>
                    <td
                      className="px-3 py-3 font-medium text-bluegrey-900 cursor-pointer whitespace-nowrap"
                      onClick={() => toggleAdminRole(role.id)}
                    >
                      {role.name}
                    </td>
                    <td className="px-3 py-3 text-bluegrey-500 max-w-[180px]">{role.description}</td>
                    <td className="px-3 py-3 min-w-[160px]">
                      {checked ? (
                        <div className="space-y-1">
                          <select
                            value={assignment?.scopeId ?? ""}
                            onChange={(e) => patchAdmin(role.id, { scopeId: e.target.value })}
                            className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-300 bg-white ${
                              scopeMissing ? "border-red-400" : "border-bluegrey-300"
                            }`}
                          >
                            <option value="">Select scope…</option>
                            {MOCK_SCOPES.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          {scopeMissing && (
                            <p className="text-[10px] text-red-600">Scope required</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-bluegrey-300 italic">Select role first</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {checked ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <input
                            type="checkbox"
                            checked={assignment?.cascadable ?? false}
                            onChange={(e) => patchAdmin(role.id, { cascadable: e.target.checked })}
                            className="w-4 h-4 accent-purple-600 cursor-pointer"
                          />
                          <span className="text-[10px] text-bluegrey-400">
                            {assignment?.cascadable ? "Yes" : "No"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-bluegrey-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {missingScopeCount > 0 && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {missingScopeCount} admin role{missingScopeCount !== 1 ? "s" : ""} missing a scope
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-bluegrey-100">
        <Button variant="outline" onClick={onBack}>
          Back to organizations
        </Button>
        <Button
          onClick={handleSave}
          disabled={missingScopeCount > 0}
          className="gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          Save configuration
        </Button>
      </div>
    </div>
  );
}

// ─── Main step component ──────────────────────────────────────────────────────

interface Props {
  validUsers: ParsedUser[];
  orgConfigs: Record<string, OrgConfig>;
  onChange: (configs: Record<string, OrgConfig>) => void;
  showErrors: boolean;
}

export default function StepConfigureOrgs({ validUsers, orgConfigs, onChange, showErrors }: Props) {
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);

  // Sync configs whenever users change
  const configs = buildOrgConfigs(validUsers, orgConfigs);
  const orgList = Object.values(configs).sort((a, b) => a.orgName.localeCompare(b.orgName));
  const allConfigured = orgList.every((o) => o.configured);
  const configuredCount = orgList.filter((o) => o.configured).length;

  const handleSaveOrg = (updated: OrgConfig) => {
    const next = { ...configs, [updated.orgId]: updated };
    onChange(next);
    setEditingOrgId(null);
  };

  if (editingOrgId && configs[editingOrgId]) {
    return (
      <OrgConfigPanel
        config={configs[editingOrgId]}
        onSave={handleSaveOrg}
        onBack={() => setEditingOrgId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Configure Organizations</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          The following organizations were detected in your CSV. Configure access roles and admin
          roles for each organization before proceeding.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`font-medium ${allConfigured ? "text-green-700" : "text-bluegrey-600"}`}
        >
          {configuredCount} / {orgList.length} configured
        </span>
        {!allConfigured && showErrors && (
          <span className="text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            All organizations must be configured before proceeding
          </span>
        )}
      </div>

      {/* Org cards */}
      <div className="space-y-3">
        {orgList.map((org) => (
          <div
            key={org.orgId}
            className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Status icon */}
                {org.configured ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-bluegrey-900">{org.orgName}</p>
                  <p className="text-xs text-bluegrey-400 mt-0.5">
                    {org.userCount} user{org.userCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Config summary */}
                {org.configured && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-bluegrey-500">
                      {org.accessRoleIds.length} access role{org.accessRoleIds.length !== 1 ? "s" : ""}
                      {" · "}
                      {org.adminRoleAssignments.length} admin role{org.adminRoleAssignments.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-0.5">✓ Configured</p>
                  </div>
                )}
                {!org.configured && (
                  <span className="text-xs text-amber-600 font-medium hidden sm:block">
                    ⚠ Configuration required
                  </span>
                )}

                {/* Configure button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingOrgId(org.orgId)}
                  className="gap-1.5 whitespace-nowrap"
                >
                  {org.configured ? "Edit" : "Configure"}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Configured role pills */}
            {org.configured && (org.accessRoleIds.length > 0 || org.adminRoleAssignments.length > 0) && (
              <div className="px-4 pb-3 flex flex-wrap gap-1.5 border-t border-bluegrey-100 pt-3">
                {org.accessRoleIds.map((roleId) => {
                  const role = getAvailableRolesForOrg(org.orgId, getParentId(org.orgId)).find(
                    (r) => r.id === roleId
                  );
                  return role ? (
                    <span key={roleId} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                      {role.name}
                    </span>
                  ) : null;
                })}
                {org.adminRoleAssignments.map((a) => {
                  const role = MOCK_ADMIN_ROLES.find((r) => r.id === a.roleId);
                  const scope = MOCK_SCOPES.find((s) => s.id === a.scopeId);
                  return role ? (
                    <span key={a.roleId} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                      {role.name}{scope ? ` @ ${scope.name}` : ""}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {orgList.length === 0 && (
        <div className="rounded-md border border-dashed border-bluegrey-300 py-10 text-center">
          <p className="text-sm text-bluegrey-400">No organizations detected. Please go back and upload a valid CSV.</p>
        </div>
      )}
    </div>
  );
}
