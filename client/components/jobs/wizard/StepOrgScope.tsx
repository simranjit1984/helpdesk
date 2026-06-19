import { Checkbox } from "@/components/ui/checkbox";
import {
  CleanupJobFormState,
  JobType,
  MOCK_ORGANIZATIONS,
  USER_STATUS_FILTER_LABELS,
  UserStatusFilter,
  getAvailableRolesForOrgs,
} from "@/lib/jobsMockData";

interface Props {
  jobType: JobType;
  organizationIds: string[];
  includeAllOrgs: boolean;
  userStatusFilter: UserStatusFilter;
  specificAccessRoles: string[];
  includeAllRoles: boolean;
  excludeRoles: string[];
  onChange: (patch: Partial<CleanupJobFormState>) => void;
  showErrors: boolean;
}

const USER_STATUS_FILTERS: UserStatusFilter[] = ["active", "all", "custom"];

/** Orgs that are children of another org (they inherit parent's roles) */
const childOrgIds = new Set(
  MOCK_ORGANIZATIONS.filter((o) => o.parentId).map((o) => o.id)
);

export default function StepOrgScope({
  jobType,
  organizationIds,
  includeAllOrgs,
  userStatusFilter,
  specificAccessRoles,
  includeAllRoles,
  excludeRoles,
  onChange,
  showErrors,
}: Props) {
  const toggleOrg = (id: string) => {
    const next = organizationIds.includes(id)
      ? organizationIds.filter((o) => o !== id)
      : [...organizationIds, id];
    // When orgs change, clear any specific role selections that are no longer valid
    onChange({ organizationIds: next, specificAccessRoles: [], excludeRoles: [] });
  };

  // Roles available for the currently selected orgs (respects parent inheritance)
  const availableRoles = includeAllOrgs
    ? getAvailableRolesForOrgs([]) // all orgs → all roles
    : getAvailableRolesForOrgs(organizationIds);

  const toggleRole = (id: string) => {
    if (specificAccessRoles.includes(id)) {
      onChange({ specificAccessRoles: specificAccessRoles.filter((r) => r !== id) });
    } else {
      onChange({ specificAccessRoles: [...specificAccessRoles, id] });
    }
  };

  const toggleExcludeRole = (id: string) => {
    if (excludeRoles.includes(id)) {
      onChange({ excludeRoles: excludeRoles.filter((r) => r !== id) });
    } else {
      onChange({ excludeRoles: [...excludeRoles, id] });
    }
  };

  const hasOrgError = showErrors && !includeAllOrgs && organizationIds.length === 0;

  // Show inheritance note when child orgs are selected
  const selectedChildOrgs = organizationIds.filter((id) => childOrgIds.has(id));
  const showInheritanceNote = !includeAllOrgs && selectedChildOrgs.length > 0;
  const childOrgNames = MOCK_ORGANIZATIONS.filter((o) =>
    selectedChildOrgs.includes(o.id)
  ).map((o) => o.name);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-bluegrey-900 mb-1">Scope & target</h3>
        <p className="text-sm text-bluegrey-600">
          Configure which organizations and users this job should process.
        </p>
      </div>

      {/* Panel 1: Organizations */}
      <div className="p-4 rounded-lg border border-bluegrey-200 space-y-3">
        <h4 className="text-sm font-semibold text-bluegrey-700">Organizations to scan</h4>

        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            id="include-all-orgs"
            checked={includeAllOrgs}
            onCheckedChange={(v) =>
              onChange({
                includeAllOrgs: v === true,
                organizationIds: [],
                specificAccessRoles: [],
                excludeRoles: [],
              })
            }
          />
          <span className="text-sm text-bluegrey-800 font-medium">
            Include all organizations
          </span>
        </label>

        {!includeAllOrgs && (
          <div className="space-y-1 pl-6">
            {MOCK_ORGANIZATIONS.map((org) => (
              <label key={org.id} className="flex items-center gap-2 cursor-pointer py-1">
                <Checkbox
                  id={`org-${org.id}`}
                  checked={organizationIds.includes(org.id)}
                  onCheckedChange={() => toggleOrg(org.id)}
                />
                <span className="text-sm text-bluegrey-800 flex items-center gap-1.5">
                  {org.parentId && (
                    <span className="text-bluegrey-300 text-xs">└</span>
                  )}
                  {org.name}
                  {org.parentId && (
                    <span className="text-[10px] text-bluegrey-400 italic">
                      (child of{" "}
                      {MOCK_ORGANIZATIONS.find((o) => o.id === org.parentId)?.name})
                    </span>
                  )}
                </span>
              </label>
            ))}
            {hasOrgError && (
              <p className="text-xs text-red-600 mt-1">
                Select at least one organization or enable "Include all organizations".
              </p>
            )}
          </div>
        )}

        {/* Inheritance note */}
        {showInheritanceNote && (
          <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 mt-1">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Role inheritance: </span>
              {childOrgNames.join(" & ")}{" "}
              {childOrgNames.length === 1 ? "is a" : "are"} child{" "}
              {childOrgNames.length === 1 ? "organization" : "organizations"} — only access
              roles defined in the parent organization are available.
            </p>
          </div>
        )}
      </div>

      {/* Panel 2: User status filter */}
      <div className="p-4 rounded-lg border border-bluegrey-200 space-y-3">
        <h4 className="text-sm font-semibold text-bluegrey-700">User status filter</h4>
        <div className="space-y-2">
          {USER_STATUS_FILTERS.map((filter) => (
            <label
              key={filter}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                userStatusFilter === filter
                  ? "border-blue-500 bg-blue-50"
                  : "border-bluegrey-200 hover:border-blue-300 hover:bg-blue-50/30"
              }`}
            >
              <input
                type="radio"
                name="user-status-filter"
                value={filter}
                checked={userStatusFilter === filter}
                onChange={() => onChange({ userStatusFilter: filter })}
                className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-bluegrey-800">
                {USER_STATUS_FILTER_LABELS[filter]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Panel 3: Access roles to target (access-role-cleanup only) */}
      {jobType === "access-role-cleanup" && (
        <div className="p-4 rounded-lg border border-bluegrey-200 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-bluegrey-700">Access roles to target</h4>
            {!includeAllOrgs && organizationIds.length > 0 && (
              <p className="text-xs text-bluegrey-400 mt-0.5">
                Showing roles available for the selected organization(s).
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              id="include-all-roles"
              checked={includeAllRoles}
              onCheckedChange={(v) =>
                onChange({ includeAllRoles: v === true, specificAccessRoles: [] })
              }
            />
            <span className="text-sm text-bluegrey-800 font-medium">
              All access roles (default)
            </span>
          </label>

          {!includeAllRoles && (
            <div className="space-y-2 pl-6">
              <p className="text-xs text-bluegrey-500 mb-2">
                Select specific roles to target:
              </p>
              {availableRoles.length === 0 ? (
                <p className="text-xs text-bluegrey-400 italic">
                  No roles available for the selected organizations.
                </p>
              ) : (
                availableRoles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={specificAccessRoles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <span className="text-sm text-bluegrey-800">{role.name}</span>
                  </label>
                ))
              )}
            </div>
          )}

          {/* Exclude roles */}
          <div className="border-t border-bluegrey-100 pt-3 space-y-2">
            <h5 className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">
              Exclude roles
            </h5>
            <p className="text-xs text-bluegrey-400">
              These roles will be skipped even if they match the target criteria.
            </p>
            <div className="space-y-2">
              {availableRoles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id={`exclude-role-${role.id}`}
                    checked={excludeRoles.includes(role.id)}
                    onCheckedChange={() => toggleExcludeRole(role.id)}
                  />
                  <span className="text-sm text-bluegrey-800">{role.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
