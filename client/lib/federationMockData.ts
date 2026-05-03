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

// ─── Federation Config record ─────────────────────────────────────────────────

export interface FederationConfig {
  id: string;
  organization_id: string;
  organization_name: string;
  idp_id: string;
  idp_name: string;
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
    admin_role_id: "role-1",
    admin_role_name: "User Admin",
    scope_ids: ["scope-1"],
    scope_names: ["Global Scope"],
  },
  {
    id: "fc-2",
    organization_id: "2",
    organization_name: "Beta Ltd",
    idp_id: "idp-azure",
    idp_name: "Azure AD Enterprise",
    admin_role_id: "role-4",
    admin_role_name: "Org Admin",
    scope_ids: ["scope-2", "scope-3"],
    scope_names: ["Acme Corp Scope", "Beta Ltd Scope"],
  },
];
