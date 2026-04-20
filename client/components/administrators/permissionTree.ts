export interface PermissionNode {
  id: string;
  label: string;
  description?: string;
  children?: PermissionNode[];
}

// Permissions available for Root administrator roles
export const ROOT_PERMISSIONS: PermissionNode[] = [
  {
    id: "user-management",
    label: "User management",
    description: "Manage users, invitations, and role assignments",
    children: [
      {
        id: "users",
        label: "Users",
        children: [
          { id: "users-view", label: "View users" },
          { id: "users-create", label: "Create users" },
          { id: "users-edit", label: "Edit users" },
          { id: "users-delete", label: "Delete users" },
        ],
      },
      {
        id: "invitations",
        label: "Invitations",
        children: [
          { id: "invitations-send", label: "Send invitations" },
          { id: "invitations-view", label: "View invitations" },
          { id: "invitations-withdraw", label: "Withdraw invitations" },
        ],
      },
      {
        id: "access-role-assignments",
        label: "Access role assignments",
        children: [
          { id: "access-role-assignments-view", label: "View assignments" },
          { id: "access-role-assignments-manage", label: "Manage assignments" },
        ],
      },
    ],
  },
  {
    id: "organization-management",
    label: "Organization management",
    description: "Manage organizations, and access role assignments",
    children: [
      { id: "org-add", label: "Add organization" },
      { id: "org-view", label: "View organization" },
      { id: "org-edit", label: "Edit organization" },
      { id: "org-activate", label: "Activate / deactivate organization" },
      { id: "org-delete", label: "Delete organization" },
      {
        id: "access-role-assignment",
        label: "Access role assignment",
        children: [
          { id: "access-role-assignment-view", label: "View assignments" },
          { id: "access-role-assignment-manage", label: "Manage assignments" },
        ],
      },
    ],
  },
  {
    id: "application-management",
    label: "Application management",
    description: "Configure applications and manage application permissions",
    children: [
      { id: "app-add", label: "Add application" },
      { id: "app-view", label: "View application" },
      { id: "app-edit", label: "Edit application" },
      { id: "app-activate", label: "Activate / deactivate application" },
      { id: "app-delete", label: "Delete application" },
    ],
  },
  {
    id: "access-role-management",
    label: "Access role management",
    description: "Create and edit access roles by selecting application permissions",
    children: [
      { id: "access-role-add", label: "Add access role" },
      { id: "access-role-view", label: "View access role" },
      { id: "access-role-edit", label: "Edit access role" },
      { id: "access-role-activate", label: "Activate / deactivate access role" },
      { id: "access-role-delete", label: "Delete access role" },
    ],
  },
  {
    id: "administrator-management",
    label: "Administrator management",
    children: [
      {
        id: "scope",
        label: "Scope",
        children: [
          { id: "scope-view", label: "View scopes" },
          { id: "scope-manage", label: "Manage scopes" },
        ],
      },
    ],
  },
];

// "Other" roles exclude Application management
export const OTHER_PERMISSIONS: PermissionNode[] = ROOT_PERMISSIONS.filter(
  (p) => p.id !== "application-management",
);

/** Collect all leaf IDs under a node (for select-all logic) */
export function collectLeafIds(nodes: PermissionNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      ids.push(...collectLeafIds(node.children));
    } else {
      ids.push(node.id);
    }
  }
  return ids;
}

/** Collect all IDs (including parent IDs) under a node */
export function collectAllIds(nodes: PermissionNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children) {
      ids.push(...collectAllIds(node.children));
    }
  }
  return ids;
}
