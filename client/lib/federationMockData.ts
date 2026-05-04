// ─── IdPs from ID Broker ──────────────────────────────────────────────────────

export interface IdpFromBroker {
  id: string;
  name: string;
  protocol: string;
  status: "active" | "inactive";
}

export const ID_BROKER_IDPS: IdpFromBroker[] = [
  { id: "idp-ow",    name: "OneWelcome IDP",      protocol: "OpenID Connect", status: "active" },
  { id: "idp-okta",  name: "Okta Production",     protocol: "SAML 2.0",       status: "active" },
  { id: "idp-azure", name: "Azure AD Enterprise", protocol: "OpenID Connect", status: "active" },
  { id: "idp-ping",  name: "PingFederate",        protocol: "SAML 2.0",       status: "active" },
  { id: "idp-auth0", name: "Auth0 Development",   protocol: "OAuth 2.0",      status: "inactive" },
  { id: "idp-google", name: "Google Workspace",   protocol: "OpenID Connect", status: "active" },
];

// ─── Per-org IdP mappings (which org has which IdPs selected) ─────────────────

export const ORG_IDP_MAP: Record<string, string[]> = {
  "1":  ["idp-ow", "idp-okta"],
  "2":  ["idp-azure"],
  "3":  ["idp-ow"],
  "4":  [],
  "1-1": ["idp-okta", "idp-ping"],
  "1-2": ["idp-ow"],
};

// ─── Per-org IdP claim configuration ─────────────────────────────────────────
// Mirrors the claim name + values set in the IdP Mapping tab per org

export interface IdpClaimConfig {
  claimName: string;
  claimValues: string[];
}

/** org ID → idp ID → claim config */
export const ORG_IDP_CLAIM_MAP: Record<string, Record<string, IdpClaimConfig>> = {
  "1": {
    "idp-ow":   { claimName: "role",       claimValues: ["owread", "owwrite", "owadmin"] },
    "idp-okta": { claimName: "groups",     claimValues: ["okta-viewer", "okta-editor"] },
  },
  "2": {
    "idp-azure": { claimName: "role",      claimValues: ["entraread", "entrawrite", "entraadmin"] },
  },
  "3": {
    "idp-ow":   { claimName: "department", claimValues: ["engineering", "finance", "hr"] },
  },
  "1-1": {
    "idp-okta": { claimName: "role",       claimValues: ["partner-basic", "partner-admin"] },
    "idp-ping": { claimName: "memberOf",   claimValues: ["ping-users", "ping-admins"] },
  },
  "1-2": {
    "idp-ow":   { claimName: "role",       claimValues: ["p2-viewer", "p2-editor"] },
  },
};

/** Returns the claim config for a given org + IdP combo, or null if not configured */
export function getClaimConfig(orgId: string, idpId: string): IdpClaimConfig | null {
  return ORG_IDP_CLAIM_MAP[orgId]?.[idpId] ?? null;
}

// ─── Scopes (per org + global) ────────────────────────────────────────────────

export interface OrgScope {
  id: string;
  name: string;
  type: "Global" | "Organization";
  description: string;
}

/** Org-specific scopes keyed by org ID */
export const ORG_SCOPE_MAP: Record<string, OrgScope[]> = {
  "1": [
    { id: "scope-1-a", name: "Acme Corp — Full Access", type: "Organization", description: "Full admin scope for Acme Corp" },
    { id: "scope-1-b", name: "Acme Corp — Helpdesk", type: "Organization", description: "Helpdesk scope restricted to Acme Corp" },
  ],
  "2": [
    { id: "scope-2-a", name: "Beta Ltd — Full Access", type: "Organization", description: "Full admin scope for Beta Ltd" },
    { id: "scope-2-b", name: "Beta Ltd — Read Only", type: "Organization", description: "Read-only scope for Beta Ltd" },
  ],
  "3": [
    { id: "scope-3-a", name: "Gamma Inc — Org Admin", type: "Organization", description: "Org admin scope for Gamma Inc" },
  ],
  "1-1": [
    { id: "scope-1-1-a", name: "Partner1 — Limited", type: "Organization", description: "Limited scope for Partner1 sub-org" },
  ],
  "1-2": [
    { id: "scope-1-2-a", name: "Partner2 — Standard", type: "Organization", description: "Standard scope for Partner2 sub-org" },
  ],
};

/** Returns scopes specific to the given org */
export function getScopesForOrg(orgId: string): OrgScope[] {
  return ORG_SCOPE_MAP[orgId] ?? [];
}

// ─── Federation Config record ─────────────────────────────────────────────────

export interface FederationConfig {
  id: string;
  organization_id: string;
  organization_name: string;
  idp_id: string;
  idp_name: string;
  claim_name: string;
  claim_values: string[];
  admin_role_id: string;
  admin_role_name: string;
  scope_ids: string[];
  scope_names: string[];
}

export const MOCK_FEDERATION_CONFIGS: FederationConfig[] = [
  {
    id: "fc-1",
    organization_id: "1",
    organization_name: "Acme Corp",
    idp_id: "idp-ow",
    idp_name: "OneWelcome IDP",
    claim_name: "role",
    claim_values: ["owread"],
    admin_role_id: "role-1",
    admin_role_name: "User Admin",
    scope_ids: ["scope-1-a"],
    scope_names: ["Acme Corp — Full Access"],
  },
  {
    id: "fc-2",
    organization_id: "2",
    organization_name: "Beta Ltd",
    idp_id: "idp-azure",
    idp_name: "Azure AD Enterprise",
    claim_name: "role",
    claim_values: ["entraread"],
    admin_role_id: "role-4",
    admin_role_name: "Org Admin",
    scope_ids: ["scope-2-a"],
    scope_names: ["Beta Ltd — Full Access"],
  },
];
