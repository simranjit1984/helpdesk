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
}

export interface ScopeClaim {
  scopeId: string;
  scopeName: string;
  claimName: string;
  claimValue: string;
}

export interface PostSetupData {
  claimName: string;
  claimValue: string;
  sameIdpForChildren: boolean | null;
  childOrgClaims: Array<{ orgId: string; orgName: string; claimValue: string }>;
  accessRoleClaims: AccessRoleClaim[];
  adminRoleClaims: AdminRoleClaim[];
  scopeClaims: ScopeClaim[];
}

// ─── Completed IDP config (stored after wizard) ───────────────────────────────

export interface ConfiguredIdp {
  id: string;
  type: IdpType;
  oidc: OIDCFormData;
  postSetup: PostSetupData;
}

// ─── IDP & claims inheritance (child organization) ────────────────────────────

export type ChildInheritanceMode =
  | "inherit_all" // Inherit IDP & claims mapping
  | "inherit_idp_custom_claims" // Inherit IDP, customize claims mapping
  | "own"; // Use own IDP & claims mapping

export interface ChildOrgInheritance {
  orgId: string;
  orgName: string;
  mode: ChildInheritanceMode;
  /** Only meaningful when mode === "own" */
  ownIdpName?: string;
  /**
   * The organization claim value that identifies this child organization.
   * Required for "inherit_all" and "inherit_idp_custom_claims" — even when
   * the IDP and full claims mapping are inherited, each organization still
   * needs its own organization claim value defined. Not used for "own".
   */
  orgClaimValue?: string;
}
