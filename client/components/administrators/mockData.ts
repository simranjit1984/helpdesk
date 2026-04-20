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

export interface Scope {
  id: string;
  name: string;
  type: "Global" | "Organization" | "Group";
  description: string;
  entities: string[];
}

export const MOCK_SCOPES: Scope[] = [
  {
    id: "scope-1",
    name: "Global Scope",
    type: "Global",
    description: "Applies to all organizations and groups",
    entities: [],
  },
  {
    id: "scope-2",
    name: "Acme Corp Scope",
    type: "Organization",
    description: "Restricted to the Acme Corp organization",
    entities: ["Acme Corp"],
  },
  {
    id: "scope-3",
    name: "Beta Ltd Scope",
    type: "Organization",
    description: "Restricted to the Beta Ltd organization",
    entities: ["Beta Ltd"],
  },
  {
    id: "scope-4",
    name: "Finance Group Scope",
    type: "Group",
    description: "Scoped to the Finance department group",
    entities: ["Finance Group"],
  },
];

export const SCOPE_ENTITY_OPTIONS = [
  { value: "acme-corp", label: "Acme Corp" },
  { value: "beta-ltd", label: "Beta Ltd" },
  { value: "gamma-inc", label: "Gamma Inc" },
  { value: "delta-group", label: "Delta Group" },
  { value: "finance-group", label: "Finance Group" },
  { value: "engineering-group", label: "Engineering Group" },
  { value: "sales-group", label: "Sales Group" },
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
