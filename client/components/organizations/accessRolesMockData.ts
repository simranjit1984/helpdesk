export interface AccessRole {
  id: string;
  name: string;
  description: string;
}

export interface OrgAccessRoleAssignment {
  roleId: string;
  status: "active" | "inactive";
}

// All access roles defined in the system
export const ALL_ACCESS_ROLES: AccessRole[] = [
  { id: "ar-1", name: "General Partner User", description: "" },
  { id: "ar-2", name: "Limited Partner User", description: "" },
  { id: "ar-3", name: "Sales general", description: "" },
  { id: "ar-4", name: "Finance group", description: "For finance group" },
  { id: "ar-5", name: "Normal_User_K", description: "Normal_User_K" },
  { id: "ar-6", name: "Admin Access", description: "Full administrative access" },
  { id: "ar-7", name: "Read Only", description: "View-only permissions" },
];

// Per-org assignments — keyed by org ID
export const ORG_ACCESS_ROLE_ASSIGNMENTS: Record<string, OrgAccessRoleAssignment[]> = {
  "1": [
    { roleId: "ar-3", status: "active" },
    { roleId: "ar-5", status: "active" },
  ],
  "2": [
    { roleId: "ar-1", status: "active" },
    { roleId: "ar-4", status: "active" },
    { roleId: "ar-7", status: "inactive" },
  ],
  "3": [
    { roleId: "ar-2", status: "active" },
    { roleId: "ar-6", status: "active" },
  ],
  "4": [
    { roleId: "ar-3", status: "active" },
    { roleId: "ar-4", status: "active" },
  ],
  "5": [
    { roleId: "ar-1", status: "active" },
  ],
};

export function getOrgAccessRoles(orgId: string): (AccessRole & { status: "active" | "inactive" })[] {
  const assignments = ORG_ACCESS_ROLE_ASSIGNMENTS[orgId] ?? [];
  return assignments
    .map((a) => {
      const role = ALL_ACCESS_ROLES.find((r) => r.id === a.roleId);
      if (!role) return null;
      return { ...role, status: a.status };
    })
    .filter(Boolean) as (AccessRole & { status: "active" | "inactive" })[];
}

export function getAssignedRoleIds(orgId: string): string[] {
  return (ORG_ACCESS_ROLE_ASSIGNMENTS[orgId] ?? []).map((a) => a.roleId);
}

/**
 * Defines which roles are available (can be added) in each root organisation.
 * Child orgs inherit from their parent — pass the parent's ID to get the right set.
 * Orgs not listed here default to the full role catalogue.
 */
export const ORG_AVAILABLE_ROLE_IDS: Record<string, string[]> = {
  // Acme Corp (id: "1") — Sales general + Normal_User_K
  "1": ["ar-3", "ar-5"],
  // Tech Solutions (id: "2")
  "2": ["ar-1", "ar-2", "ar-4", "ar-6", "ar-7"],
  // Global Services (id: "3")
  "3": ["ar-1", "ar-2", "ar-6"],
};

/**
 * Returns the roles that can be added to the given org.
 * Child orgs (parentId supplied) inherit the parent's available roles.
 */
export function getAvailableRolesForOrg(
  orgId: string,
  parentId?: string
): AccessRole[] {
  const effectiveId = parentId ?? orgId;
  const allowedIds = ORG_AVAILABLE_ROLE_IDS[effectiveId];
  if (!allowedIds) return ALL_ACCESS_ROLES; // fallback: show all
  return ALL_ACCESS_ROLES.filter((r) => allowedIds.includes(r.id));
}
