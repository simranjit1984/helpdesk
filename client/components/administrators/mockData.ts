// ─── Admin Roles ─────────────────────────────────────────────────────────────

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdDate: string;
}

export const MOCK_ADMIN_ROLES: AdminRole[] = [
  {
    id: "role-1",
    name: "User Admin",
    description: "Full access to user management operations",
    permissions: ["Create User", "Edit User", "Delete User", "View User", "Assign Role", "Reset Password"],
    createdDate: "2024-01-15",
  },
  {
    id: "role-2",
    name: "Helpdesk Admin",
    description: "Support-focused role with limited write access",
    permissions: ["View User", "Reset Password", "View Audit Log"],
    createdDate: "2024-02-03",
  },
  {
    id: "role-3",
    name: "Viewer",
    description: "Read-only access across the platform",
    permissions: ["View User", "View Audit Log"],
    createdDate: "2024-03-11",
  },
  {
    id: "role-4",
    name: "Org Admin",
    description: "Manage users and roles within an organization",
    permissions: ["Create User", "Edit User", "View User", "Assign Role", "View Audit Log", "Manage Organization"],
    createdDate: "2024-04-22",
  },
];

// Permission groups for the drawer
export const PERMISSION_GROUPS: { group: string; permissions: string[] }[] = [
  {
    group: "Users",
    permissions: ["Create User", "Edit User", "Delete User", "View User", "Reset Password"],
  },
  {
    group: "Roles",
    permissions: ["Assign Role", "Create Role", "Edit Role"],
  },
  {
    group: "Organization",
    permissions: ["Manage Organization", "View Organization"],
  },
  {
    group: "Audit",
    permissions: ["View Audit Log", "Export Audit Log"],
  },
];

// ─── Scopes ──────────────────────────────────────────────────────────────────

export type ScopeInclusionMode =
  | "only"
  | "direct-children"
  | "all-children"
  | "direct-children-excluding"
  | "all-children-excluding";

export type ScopeOrgContextMode = "user-membership" | "select";
export type ScopeAccessRoleContext = "org" | "any" | "none";
export type ScopeApplicationContext = "specific" | "at-assignment" | "none";

export interface Scope {
  id: string;
  name: string;
  description: string;
  organization: string;          // always required — scope is always org-bound
  inclusionMode: ScopeInclusionMode;
  accessRoleMode: "all" | "custom";
  accessRoleIds: string[];       // populated when accessRoleMode === "custom"
  /** Scopes V2 only: how the org context for this scope is determined. */
  orgContextMode?: ScopeOrgContextMode;
  /** Scopes V2 only: whether access roles are limited to the org context or open to any role in the system. */
  accessRoleContext?: ScopeAccessRoleContext;
  /** Scopes V2 only: how the application context for this scope is determined. */
  applicationContext?: ScopeApplicationContext;
  /** Scopes V2 only: populated when applicationContext === "specific". */
  applicationId?: string;
}

export const MOCK_SCOPES: Scope[] = [
  {
    id: "scope-1",
    name: "Acme Corp Scope",
    description: "Full scope for Acme Corp and all sub-orgs",
    organization: "Acme Corp",
    inclusionMode: "all-children",
    accessRoleMode: "all",
    accessRoleIds: [],
  },
  {
    id: "scope-2",
    name: "Beta Ltd Scope",
    description: "Restricted to the Beta Ltd organization only",
    organization: "Beta Ltd",
    inclusionMode: "only",
    accessRoleMode: "custom",
    accessRoleIds: ["ar-1", "ar-2"],
  },
  {
    id: "scope-3",
    name: "Gamma Inc Scope",
    description: "Scope covering Gamma Inc direct children",
    organization: "Gamma Inc",
    inclusionMode: "direct-children",
    accessRoleMode: "custom",
    accessRoleIds: ["ar-3", "ar-6"],
  },
];

export const SCOPE_ORG_OPTIONS = [
  { value: "acme-corp", label: "Acme Corp" },
  { value: "beta-ltd", label: "Beta Ltd" },
  { value: "gamma-inc", label: "Gamma Inc" },
  { value: "partner2", label: "Partner2" },
  { value: "delta-org", label: "Delta Organization" },
];

// ─── Scopes V2 ───────────────────────────────────────────────────────────────
// Sample data illustrating the new "Org context" and "Access role context"
// configuration options introduced in Scopes V2.

export const MOCK_SCOPES_V2: Scope[] = [
  {
    id: "scope-v2-1",
    name: "My Org — Full Access",
    description: "Every admin gets this scope automatically for their own organization, with unrestricted role access.",
    organization: "User membership org",
    inclusionMode: "only",
    orgContextMode: "user-membership",
    accessRoleContext: "org",
    accessRoleMode: "all",
    accessRoleIds: [],
    applicationContext: "specific",
    applicationId: "app-2",
  },
  {
    id: "scope-v2-2",
    name: "Acme Corp — All Roles",
    description: "Covers Acme Corp and every organization beneath it, with all access roles in scope.",
    organization: "Acme Corp",
    inclusionMode: "all-children",
    orgContextMode: "select",
    accessRoleContext: "org",
    accessRoleMode: "all",
    accessRoleIds: [],
    applicationContext: "at-assignment",
  },
  {
    id: "scope-v2-3",
    name: "Beta Ltd — Finance & Admin",
    description: "Restricted to Beta Ltd only, limited to the Finance group and Admin Access roles.",
    organization: "Beta Ltd",
    inclusionMode: "only",
    orgContextMode: "select",
    accessRoleContext: "org",
    accessRoleMode: "custom",
    accessRoleIds: ["ar-4", "ar-6"],
    applicationContext: "specific",
    applicationId: "app-1",
  },
  {
    id: "scope-v2-4",
    name: "My Org — Support Roles Only",
    description: "Scoped to the admin's own organization, but limited to a hand-picked set of support-related roles from anywhere in the system.",
    organization: "User membership org",
    inclusionMode: "only",
    orgContextMode: "user-membership",
    accessRoleContext: "any",
    accessRoleMode: "custom",
    accessRoleIds: ["ar-5", "ar-7"],
    applicationContext: "none",
  },
  {
    id: "scope-v2-5",
    name: "Gamma Inc — Any Access Role",
    description: "Gamma Inc and its direct children, open to any access role defined anywhere in the system.",
    organization: "Gamma Inc",
    inclusionMode: "direct-children",
    orgContextMode: "select",
    accessRoleContext: "any",
    accessRoleMode: "all",
    accessRoleIds: [],
    applicationContext: "at-assignment",
  },
  {
    id: "scope-v2-6",
    name: "Delta Organization — Sales & Read Only",
    description: "Delta Organization scope with a system-wide, hand-picked role selection unrelated to org membership.",
    organization: "Delta Organization",
    inclusionMode: "all-children-excluding",
    orgContextMode: "select",
    accessRoleContext: "any",
    accessRoleMode: "custom",
    accessRoleIds: ["ar-3", "ar-7"],
    applicationContext: "specific",
    applicationId: "app-4",
  },
];

// ─── Assignable Policies ─────────────────────────────────────────────────────

export interface AssignablePolicy {
  id: string;
  name: string;
  description: string;
  ruleType: "All" | "Tag-based" | "Custom";
  allowedRoles: string[];
}

export const MOCK_POLICIES: AssignablePolicy[] = [
  {
    id: "policy-1",
    name: "Default Policy",
    description: "Allows all roles to be assigned without restrictions",
    ruleType: "All",
    allowedRoles: ["User Admin", "Helpdesk Admin", "Viewer", "Org Admin"],
  },
  {
    id: "policy-2",
    name: "Delegatable Only",
    description: "Restricts assignment to roles that are marked as delegatable",
    ruleType: "Tag-based",
    allowedRoles: ["User Admin", "Org Admin"],
  },
  {
    id: "policy-3",
    name: "Limited Admin Policy",
    description: "Allows only low-privilege admin roles",
    ruleType: "Custom",
    allowedRoles: ["Helpdesk Admin", "Viewer"],
  },
  {
    id: "policy-4",
    name: "Finance Policy",
    description: "Roles assignable within the Finance department",
    ruleType: "Tag-based",
    allowedRoles: ["Org Admin", "Viewer"],
  },
];

export const POLICY_ROLE_OPTIONS = [
  { value: "user-admin", label: "User Admin" },
  { value: "helpdesk-admin", label: "Helpdesk Admin" },
  { value: "viewer", label: "Viewer" },
  { value: "org-admin", label: "Org Admin" },
];

export const POLICY_TAG_OPTIONS = [
  { value: "delegatable", label: "Delegatable" },
  { value: "limited", label: "Limited" },
  { value: "finance", label: "Finance" },
  { value: "engineering", label: "Engineering" },
];
