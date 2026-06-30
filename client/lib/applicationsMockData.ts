// ─── Types ────────────────────────────────────────────────────────────────────

export type AppType = "federated" | "non-federated";
export type AppStatus = "active" | "inactive";

export interface Permission {
  id: string;
  displayName: string;
  description: string;
  identifier: string;
}

export interface Application {
  id: string;
  type: AppType;
  /** For federated apps — the IDP/SAML app identifier */
  federatedAppId?: string;
  entityId?: string;
  displayName: string;
  description: string;
  externalId: string;
  status: AppStatus;
  permissions: Permission[];
}

// ─── Federated apps available in the system (from SAML/OIDC broker) ──────────

export const FEDERATED_APP_OPTIONS = [
  { value: "dmv2-container", label: "dmv2-container" },
  { value: "crm-saml",       label: "CRM (SAML)" },
  { value: "doc-transfer",   label: "Document Transfer App" },
  { value: "dmv2-core",      label: "DMv2 Core" },
];

// ─── Mock permissions ─────────────────────────────────────────────────────────

const COMMON_PERMISSIONS: Permission[] = [
  {
    id: "p-1",
    displayName: "Activate / deactivate access role",
    description: "Activate / deactivate access role",
    identifier: "update_status",
  },
  {
    id: "p-2",
    displayName: "Activate / deactivate application",
    description: "",
    identifier: "application_update_status",
  },
];

const CRM_PERMISSIONS: Permission[] = [
  { id: "crm-p-1", displayName: "View accounts",  description: "Read-only access to accounts", identifier: "view_accounts"  },
  { id: "crm-p-2", displayName: "Edit accounts",  description: "Create and update accounts",   identifier: "edit_accounts"  },
  { id: "crm-p-3", displayName: "Delete accounts",description: "Permanently remove accounts",  identifier: "delete_accounts"},
  { id: "crm-p-4", displayName: "View reports",   description: "Access CRM reports",           identifier: "view_reports"   },
];

const DMV2_PERMISSIONS: Permission[] = [
  { id: "dmv2-p-1", displayName: "View users",    description: "Read-only access to users",    identifier: "view_users"    },
  { id: "dmv2-p-2", displayName: "Manage users",  description: "Create, update and deactivate users", identifier: "manage_users" },
  { id: "dmv2-p-3", displayName: "View audit log",description: "Access audit logs",            identifier: "view_audit"    },
];

// ─── Mock applications ────────────────────────────────────────────────────────

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    type: "federated",
    federatedAppId: "crm-saml",
    entityId: "crm-saml",
    displayName: "CRM",
    description: "",
    externalId: "",
    status: "active",
    permissions: CRM_PERMISSIONS,
  },
  {
    id: "app-2",
    type: "federated",
    federatedAppId: "dmv2-core",
    entityId: "dmv2-core",
    displayName: "DMv2",
    description: "The DMv2 application",
    externalId: "",
    status: "active",
    permissions: DMV2_PERMISSIONS,
  },
  {
    id: "app-3",
    type: "federated",
    federatedAppId: "dmv2-container",
    entityId: "dmv2-container",
    displayName: "dmv2-container",
    description: "My test application",
    externalId: "",
    status: "active",
    permissions: COMMON_PERMISSIONS,
  },
  {
    id: "app-4",
    type: "non-federated",
    displayName: "Document Transfer App",
    description: "",
    externalId: "doc-transfer-ext",
    status: "active",
    permissions: [],
  },
];
