// ─── IDP Type ─────────────────────────────────────────────────────────────────

export type IdpType =
  | "oidc"
  | "saml"
  | "digid"
  | "eherkenning"
  | "apple"
  | "prosante"
  | "facebook"
  | "oauth";

// ─── OIDC Form ────────────────────────────────────────────────────────────────

export type AuthMethod =
  | "none"
  | "client_secret_basic"
  | "client_secret_post"
  | "client_secret_jwt"
  | "private_key_jwt"
  | "client_tls";

export type CertSource = "dynamic_jwks" | "manual";

export interface OIDCVariant {
  id: string;
  variantName: string;
  scopeNames: string[];
  claims: string[];
  acrValues: string[];
}

export interface AttributeMapping {
  id: string;
  source: string;
  target: string;
}

export interface OIDCFormData {
  // Basic Information
  displayName: string;
  domainAliases: string[];
  description: string;
  active: boolean;

  // Connection Details
  clientId: string;
  authMethod: AuthMethod;
  clientSecret: string;
  pkce: boolean;
  wellKnownEndpoint: string;
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  signatureType: string;
  certSource: CertSource;
  jwksUri: string;
  encryptedJwt: boolean;
  jwtSecuredAuthRequest: boolean;
  singleLogout: boolean;

  // Variants
  variants: OIDCVariant[];

  // Attribute Mappings
  returnOriginalAssertion: boolean;
  userIdentifier: string;
  attributeMappings: AttributeMapping[];
}

export const DEFAULT_OIDC_DATA: OIDCFormData = {
  displayName: "",
  domainAliases: [],
  description: "",
  active: true,
  clientId: "",
  authMethod: "client_secret_basic",
  clientSecret: "",
  pkce: false,
  wellKnownEndpoint: "",
  issuer: "",
  authorizationEndpoint: "",
  tokenEndpoint: "",
  userInfoEndpoint: "",
  signatureType: "RS256",
  certSource: "dynamic_jwks",
  jwksUri: "",
  encryptedJwt: false,
  jwtSecuredAuthRequest: false,
  singleLogout: false,
  variants: [{ id: "v1", variantName: "", scopeNames: [], claims: [], acrValues: [] }],
  returnOriginalAssertion: false,
  userIdentifier: "",
  attributeMappings: [],
};

// ─── Post-Setup ───────────────────────────────────────────────────────────────

export interface ChildOrg {
  id: string;
  name: string;
}

export interface AccessRoleClaim {
  roleId: string;
  roleName: string;
  claimName: string;
  claimValue: string;
}

export interface AdminRoleClaim {
  roleId: string;
  roleName: string;
  claimName: string;
  claimValue: string;
  scopeId: string;
  scopeName: string;
}

export interface PostSetupData {
  audienceValue: string;
  sameIdpForChildren: boolean | null;
  childOrgAudiences: Array<{ orgId: string; orgName: string; audience: string }>;
  accessRoleClaims: AccessRoleClaim[];
  adminRoleClaims: AdminRoleClaim[];
}

// ─── Completed IDP config (stored after wizard) ───────────────────────────────

export interface ConfiguredIdp {
  id: string;
  type: IdpType;
  oidc: OIDCFormData;
  postSetup: PostSetupData;
}
