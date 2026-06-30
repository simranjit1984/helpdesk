import { useState } from "react";
import { Search, Shield, ShieldCheck, Building2, AlertCircle } from "lucide-react";
import { baseOrganizations } from "@/components/OrganizationsTable";
import { getAvailableRolesForOrg } from "@/components/organizations/accessRolesMockData";
import { MOCK_ADMIN_ROLES, MOCK_SCOPES } from "@/components/administrators/mockData";
import type { AdminRoleAssignment } from "./StepConfigureOrgs";

// ─── Org helpers ──────────────────────────────────────────────────────────────

interface FlatOrg { id: string; name: string; parentId?: string; }

function flattenOrgs(): FlatOrg[] {
  const result: FlatOrg[] = [];
  baseOrganizations.forEach((org) => {
    result.push({ id: org.id, name: org.name });
    org.children?.forEach((child) => {
      result.push({ id: child.id, name: `${org.name} › ${child.name}`, parentId: org.id });
    });
  });
  return result;
}

const FLAT_ORGS = flattenOrgs();
void FLAT_ORGS; // used via selectedOrg lookup

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  orgId: string;
  orgName: string;
  accessRoleIds: string[];
  adminRoleAssignments: AdminRoleAssignment[];
  onChange: (patch: {
    orgId?: string;
    orgName?: string;
    accessRoleIds?: string[];
    adminRoleAssignments?: AdminRoleAssignment[];
  }) => void;
  showErrors: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepSingleOrgRoles({
  orgId,
  orgName,
  accessRoleIds,
  adminRoleAssignments,
  onChange,
  showErrors,
}: Props) {
  const [roleSearch, setRoleSearch] = useState("");

  const selectedOrg = FLAT_ORGS.find((o) => o.id === orgId);
  const availableRoles = orgId
    ? getAvailableRolesForOrg(orgId, selectedOrg?.parentId)
    : [];

  const filteredRoles = availableRoles.filter((r) =>
    r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
    r.description.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const toggleAccessRole = (id: string) => {
    const next = accessRoleIds.includes(id)
      ? accessRoleIds.filter((x) => x !== id)
      : [...accessRoleIds, id];
    onChange({ accessRoleIds: next });
  };

  const isAdminSelected = (roleId: string) =>
    adminRoleAssignments.some((a) => a.roleId === roleId);

  const toggleAdminRole = (roleId: string) => {
    const next = isAdminSelected(roleId)
      ? adminRoleAssignments.filter((a) => a.roleId !== roleId)
      : [...adminRoleAssignments, { roleId, scopeId: "", cascadable: false }];
    onChange({ adminRoleAssignments: next });
  };

  const patchAdmin = (roleId: string, patch: Partial<AdminRoleAssignment>) => {
    onChange({
      adminRoleAssignments: adminRoleAssignments.map((a) =>
        a.roleId === roleId ? { ...a, ...patch } : a
      ),
    });
  };

  const missingScopeCount = adminRoleAssignments.filter((a) => !a.scopeId).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Role Assignment</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          Assign access roles and admin roles for <strong>{orgName}</strong>. Every uploaded user
          will be invited into this organization with the chosen roles.
        </p>
      </div>

      {/* Organization badge (read-only — set from admin scope) */}
      <div className="flex items-center gap-2 px-3 py-2 bg-bluegrey-50 border border-bluegrey-200 rounded-md w-fit">
        <Building2 className="w-4 h-4 text-bluegrey-500" />
        <span className="text-sm font-medium text-bluegrey-800">{orgName}</span>
        <span className="text-xs text-bluegrey-400">— your organization</span>
      </div>

      {/* Section: Access Roles */}
      {orgId && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-bluegrey-900">Access Roles</h3>
            <span className="text-xs text-bluegrey-400">(optional)</span>
          </div>
          <p className="text-xs text-bluegrey-500">
            Every user invited to <strong>{orgName}</strong> will receive the selected access roles.
            Only roles available for this organization are shown.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
            <input
              type="text"
              placeholder="Search access roles…"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {filteredRoles.length === 0 ? (
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
                  {filteredRoles.map((role) => {
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
      )}

      {/* Section 3: Admin Roles */}
      {orgId && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-bluegrey-900">Admin Roles</h3>
            <span className="text-xs text-bluegrey-400">(optional)</span>
          </div>
          <p className="text-xs text-bluegrey-500">
            Each selected admin role requires a scope. All uploaded users will receive these admin roles.
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
      )}
    </div>
  );
}
