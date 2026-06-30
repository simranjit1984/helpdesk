import { MOCK_ADMIN_ROLES } from "@/components/administrators/mockData";
import { MOCK_SCOPES } from "@/components/administrators/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminRoleAssignment {
  roleId: string;
  scopeId: string;
  cascadable: boolean;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  assignments: AdminRoleAssignment[];
  onChange: (assignments: AdminRoleAssignment[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSelected(assignments: AdminRoleAssignment[], roleId: string): boolean {
  return assignments.some((a) => a.roleId === roleId);
}

function getAssignment(
  assignments: AdminRoleAssignment[],
  roleId: string
): AdminRoleAssignment | undefined {
  return assignments.find((a) => a.roleId === roleId);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Step4AdminRoles({ assignments, onChange }: Props) {
  const toggleRole = (roleId: string) => {
    if (isSelected(assignments, roleId)) {
      onChange(assignments.filter((a) => a.roleId !== roleId));
    } else {
      onChange([...assignments, { roleId, scopeId: "", cascadable: false }]);
    }
  };

  const patchAssignment = (roleId: string, patch: Partial<AdminRoleAssignment>) => {
    onChange(
      assignments.map((a) => (a.roleId === roleId ? { ...a, ...patch } : a))
    );
  };

  const selectedCount = assignments.length;
  const missingScope = assignments.filter((a) => !a.scopeId).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Assign admin roles</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          Optionally assign admin roles to every invited user. Each admin role requires a{" "}
          <strong>scope</strong> that defines which organizations the role applies to.
          This step is optional.
        </p>
      </div>

      <div className="rounded-md border border-bluegrey-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-bluegrey-50 border-b border-bluegrey-200">
              <th className="w-10 px-3 py-2 flex-shrink-0" />
              <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide whitespace-nowrap">
                Role name
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">
                Description
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">
                Permissions
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide whitespace-nowrap">
                Scope <span className="text-red-500">*</span>
              </th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-bluegrey-500 uppercase tracking-wide whitespace-nowrap">
                Cascadable
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bluegrey-100">
            {MOCK_ADMIN_ROLES.map((role) => {
              const checked = isSelected(assignments, role.id);
              const assignment = getAssignment(assignments, role.id);
              const scopeMissing = checked && !assignment?.scopeId;

              return (
                <tr
                  key={role.id}
                  className={`transition-colors align-top ${checked ? "bg-blue-50" : "hover:bg-bluegrey-25"}`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(role.id)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer mt-0.5"
                    />
                  </td>

                  {/* Role name */}
                  <td
                    className="px-3 py-3 font-medium text-bluegrey-900 cursor-pointer whitespace-nowrap"
                    onClick={() => toggleRole(role.id)}
                  >
                    {role.name}
                  </td>

                  {/* Description */}
                  <td className="px-3 py-3 text-bluegrey-500 max-w-[200px]">
                    {role.description}
                  </td>

                  {/* Permissions */}
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-bluegrey-100 text-bluegrey-600 whitespace-nowrap"
                        >
                          {p}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-[10px] text-bluegrey-400 whitespace-nowrap">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Scope dropdown */}
                  <td className="px-3 py-3 min-w-[180px]">
                    {checked ? (
                      <div className="space-y-1">
                        <select
                          value={assignment?.scopeId ?? ""}
                          onChange={(e) => patchAssignment(role.id, { scopeId: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white ${
                            scopeMissing ? "border-red-400" : "border-bluegrey-300"
                          }`}
                        >
                          <option value="">Select scope…</option>
                          {MOCK_SCOPES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        {scopeMissing && (
                          <p className="text-[10px] text-red-600">Scope is required</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-bluegrey-300 italic">Select role first</span>
                    )}
                  </td>

                  {/* Cascadable checkbox */}
                  <td className="px-3 py-3 text-center">
                    {checked ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <input
                          type="checkbox"
                          checked={assignment?.cascadable ?? false}
                          onChange={(e) =>
                            patchAssignment(role.id, { cascadable: e.target.checked })
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                          title="When enabled, this admin role will cascade to child organizations within the scope"
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

      {/* Help text for cascadable */}
      <p className="text-xs text-bluegrey-400">
        <strong>Cascadable:</strong> when enabled, the admin role applies to the selected scope
        and all child organizations within it.
      </p>

      {/* Summary */}
      {selectedCount > 0 ? (
        <div className="flex items-center gap-3">
          <p className="text-sm text-blue-700 font-medium">
            {selectedCount} admin role{selectedCount !== 1 ? "s" : ""} selected
          </p>
          {missingScope > 0 && (
            <p className="text-sm text-red-600">
              — {missingScope} role{missingScope !== 1 ? "s" : ""} missing a scope
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-bluegrey-400">
          No admin roles selected — this step is optional.
        </p>
      )}
    </div>
  );
}
