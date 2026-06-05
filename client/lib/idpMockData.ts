import type { ConfiguredIdp } from "@/components/organizations/idp/types";

// ─── Shared OIDC base config (Acme Corporate SSO) ─────────────────────────────

const ACME_SSO_BASE = {
  type: "oidc" as const,
  oidc: {
    displayName: "Acme Corporate SSO",
    domainAliases: ["acme-corp.com", "acme.eu"],
    description: "Corporate OpenID Connect provider shared across all Acme entities.",
    active: true,
    clientId: "acme-corp-client-001",
    authMethod: "client_secret_basic" as const,
    clientSecret: "••••••••••••••••",
    pkce: true,
    wellKnownEndpoint: "https://sso.acme-corp.com/.well-known/openid-configuration",
    issuer: "https://sso.acme-corp.com",
    authorizationEndpoint: "https://sso.acme-corp.com/oauth2/authorize",
    tokenEndpoint: "https://sso.acme-corp.com/oauth2/token",
    userInfoEndpoint: "https://sso.acme-corp.com/oauth2/userinfo",
    signatureType: "RS256",
    certSource: "dynamic_jwks" as const,
    jwksUri: "https://sso.acme-corp.com/.well-known/jwks.json",
    encryptedJwt: false,
    jwtSecuredAuthRequest: false,
    singleLogout: true,
    variants: [
      {
        id: "v-default",
        variantName: "default",
        scopeNames: ["openid", "profile", "email"],
        claims: ["sub", "name", "email", "email_verified"],
        acrValues: [],
      },
    ],
    returnOriginalAssertion: false,
    userIdentifier: "sub",
    attributeMappings: [
      { id: "am-1", source: "given_name",  target: "firstName" },
      { id: "am-2", source: "family_name", target: "lastName"  },
      { id: "am-3", source: "email",       target: "email"     },
    ],
  },
};

// ─── Acme Corp (org "1") ──────────────────────────────────────────────────────

export const ACME_CORP_DEFAULT_IDP: ConfiguredIdp = {
  id: "idp-acme-corp-oidc",
  ...ACME_SSO_BASE,
  postSetup: {
    audienceValue: "https://api.acme-corp.com",
    sameIdpForChildren: true,
    childOrgAudiences: [
      { orgId: "1-1", orgName: "Acme Europe",   audience: "https://api.acme-europe.com"   },
      { orgId: "1-2", orgName: "Acme Americas", audience: "https://api.acme-americas.com" },
    ],
    // Access roles assigned to org "1": ar-3 (Sales general), ar-5 (Normal_User_K)
    accessRoleClaims: [
      { roleId: "ar-3", roleName: "Sales general", claimName: "role", claimValue: "sales-general" },
      { roleId: "ar-5", roleName: "Normal_User_K", claimName: "role", claimValue: "normal-user"   },
    ],
    // Admin roles — each has its own independent claim
    adminRoleClaims: [
      { roleId: "role-1", roleName: "User Admin",     claimName: "admin_role", claimValue: "user-admin"  },
      { roleId: "role-2", roleName: "Helpdesk Admin", claimName: "admin_role", claimValue: "helpdesk"    },
      { roleId: "role-3", roleName: "Viewer",         claimName: "admin_role", claimValue: "viewer"      },
      { roleId: "role-4", roleName: "Org Admin",      claimName: "admin_role", claimValue: "org-admin"   },
    ],
    // Scopes — each scope has its own independent claim
    scopeClaims: [
      { scopeId: "scope-1-a", scopeName: "Acme Corp — Full Access", claimName: "scope", claimValue: "full-access" },
      { scopeId: "scope-1-b", scopeName: "Acme Corp — Helpdesk",    claimName: "scope", claimValue: "helpdesk"    },
    ],
  },
};

// ─── Acme Europe (org "1-1") — derived from parent ────────────────────────────

export const ACME_EUROPE_DEFAULT_IDP: ConfiguredIdp = {
  id: "idp-acme-europe-oidc",
  ...ACME_SSO_BASE,
  oidc: {
    ...ACME_SSO_BASE.oidc,
    displayName: "Acme Corporate SSO (Europe)",
    description: "Derived from Acme Corp corporate provider — Europe region.",
    domainAliases: ["acme.eu"],
    clientId: "acme-europe-client-001",
  },
  postSetup: {
    audienceValue: "https://api.acme-europe.com",
    sameIdpForChildren: false,
    childOrgAudiences: [],
    accessRoleClaims: [],
    adminRoleClaims: [
      { roleId: "role-1", roleName: "User Admin",     claimName: "admin_role", claimValue: "user-admin" },
      { roleId: "role-2", roleName: "Helpdesk Admin", claimName: "admin_role", claimValue: "helpdesk"   },
      { roleId: "role-3", roleName: "Viewer",         claimName: "admin_role", claimValue: "viewer"     },
      { roleId: "role-4", roleName: "Org Admin",      claimName: "admin_role", claimValue: "org-admin"  },
    ],
    scopeClaims: [
      { scopeId: "scope-1-1-a", scopeName: "Partner1 — Limited", claimName: "scope", claimValue: "partner1-limited" },
    ],
  },
};

// ─── Acme Americas (org "1-2") — derived from parent ─────────────────────────

export const ACME_AMERICAS_DEFAULT_IDP: ConfiguredIdp = {
  id: "idp-acme-americas-oidc",
  ...ACME_SSO_BASE,
  oidc: {
    ...ACME_SSO_BASE.oidc,
    displayName: "Acme Corporate SSO (Americas)",
    description: "Derived from Acme Corp corporate provider — Americas region.",
    domainAliases: ["acme-americas.com"],
    clientId: "acme-americas-client-001",
  },
  postSetup: {
    audienceValue: "https://api.acme-americas.com",
    sameIdpForChildren: false,
    childOrgAudiences: [],
    accessRoleClaims: [],
    adminRoleClaims: [
      { roleId: "role-1", roleName: "User Admin",     claimName: "admin_role", claimValue: "user-admin" },
      { roleId: "role-2", roleName: "Helpdesk Admin", claimName: "admin_role", claimValue: "helpdesk"   },
      { roleId: "role-3", roleName: "Viewer",         claimName: "admin_role", claimValue: "viewer"     },
      { roleId: "role-4", roleName: "Org Admin",      claimName: "admin_role", claimValue: "org-admin"  },
    ],
    scopeClaims: [
      { scopeId: "scope-1-2-a", scopeName: "Partner2 — Standard", claimName: "scope", claimValue: "partner2-standard" },
    ],
  },
};

// ─── Lookup helper ────────────────────────────────────────────────────────────

const DEFAULT_IDP_MAP: Record<string, ConfiguredIdp[]> = {
  "1":   [ACME_CORP_DEFAULT_IDP],
  "1-1": [ACME_EUROPE_DEFAULT_IDP],
  "1-2": [ACME_AMERICAS_DEFAULT_IDP],
};

export function getDefaultIdpsForOrg(orgId: string): ConfiguredIdp[] {
  return DEFAULT_IDP_MAP[orgId] ?? [];
}
