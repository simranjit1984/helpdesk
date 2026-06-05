import { useState } from "react";
import { AlertCircle, Plus, Shield, X, CheckCircle2, Tag, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { baseOrganizations } from "@/components/OrganizationsTable";
import AddIdpWizard from "./AddIdpWizard";
import type { ConfiguredIdp, ChildOrg, OIDCFormData, PostSetupData } from "./idp/types";
import { getDefaultIdpsForOrg } from "@/lib/idpMockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getChildOrgs(orgId: string): ChildOrg[] {
  for (const org of baseOrganizations) {
    if (org.id === orgId) {
      return (org.children ?? []).map((c) => ({ id: c.id, name: c.name }));
    }
  }
  return [];
}

// ─── Field row (read-only display) ────────────────────────────────────────────

function FieldRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 py-2.5 border-b border-bluegrey-100 last:border-0 items-start">
      <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider pt-0.5">
        {label}
      </span>
      <span className={`text-sm text-bluegrey-900 break-all ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 py-2.5 border-b border-bluegrey-100 last:border-0 items-center">
      <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
        value ? "bg-green-50 text-green-700" : "bg-bluegrey-100 text-bluegrey-500"
      }`}>
        {value ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}

// ─── IDP Config tab content ───────────────────────────────────────────────────

function IdpConfigPanel({ oidc }: { oidc: OIDCFormData }) {
  const authMethodLabel: Record<string, string> = {
    none: "No Authentication",
    client_secret_basic: "Client secret basic",
    client_secret_post: "Client secret post",
    client_secret_jwt: "Client secret JWT",
    private_key_jwt: "Private key JWT",
    client_tls: "Client TLS",
  };
  const certSourceLabel: Record<string, string> = {
    dynamic_jwks: "Dynamic via JWKs URI",
    manual: "Manual file upload",
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
          Basic information
        </h4>
        <div className="bg-white border border-bluegrey-200 rounded-md px-4">
          <FieldRow label="Display name" value={oidc.displayName} />
          <FieldRow label="Description" value={oidc.description || "—"} />
          <FieldRow
            label="Domain aliases"
            value={oidc.domainAliases.length > 0 ? oidc.domainAliases.join(", ") : "None"}
          />
          <BoolRow label="Active" value={oidc.active} />
        </div>
      </div>

      {/* Connection Details */}
      <div>
        <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
          Connection details
        </h4>
        <div className="bg-white border border-bluegrey-200 rounded-md px-4">
          <FieldRow label="Client ID" value={oidc.clientId} mono />
          <FieldRow label="Authentication method" value={authMethodLabel[oidc.authMethod]} />
          <FieldRow label="Client secret" value="••••••••••••••••" mono />
          <BoolRow label="PKCE" value={oidc.pkce} />
          <FieldRow label="Issuer" value={oidc.issuer} mono />
          <FieldRow label="Authorization endpoint" value={oidc.authorizationEndpoint} mono />
          <FieldRow label="Token endpoint" value={oidc.tokenEndpoint} mono />
          <FieldRow label="User info endpoint" value={oidc.userInfoEndpoint} mono />
          <FieldRow label="Signature type" value={oidc.signatureType} mono />
          <FieldRow
            label="Certificate source"
            value={certSourceLabel[oidc.certSource]}
          />
          {oidc.certSource === "dynamic_jwks" && (
            <FieldRow label="JWKs URI" value={oidc.jwksUri} mono />
          )}
          <BoolRow label="Encrypted JWT" value={oidc.encryptedJwt} />
          <BoolRow label="JWT-Secured Auth Request" value={oidc.jwtSecuredAuthRequest} />
          <BoolRow label="Single logout" value={oidc.singleLogout} />
        </div>
      </div>

      {/* Variants */}
      {oidc.variants.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
            Variants
          </h4>
          <div className="space-y-2">
            {oidc.variants.map((v, i) => (
              <div key={v.id} className="bg-white border border-bluegrey-200 rounded-md px-4">
                <FieldRow label="Variant name" value={v.variantName || `variant-${i + 1}`} mono />
                {v.scopeNames.length > 0 && (
                  <FieldRow label="Scope names" value={v.scopeNames.join(", ")} mono />
                )}
                {v.claims.length > 0 && (
                  <FieldRow label="Claims" value={v.claims.join(", ")} mono />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attribute Mappings */}
      {(oidc.attributeMappings.length > 0 || oidc.userIdentifier) && (
        <div>
          <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
            Attribute mappings
          </h4>
          <div className="bg-white border border-bluegrey-200 rounded-md px-4">
            <FieldRow label="User identifier" value={oidc.userIdentifier} mono />
            {oidc.attributeMappings.map((am) => (
              <div
                key={am.id}
                className="grid grid-cols-[200px_1fr] gap-4 py-2.5 border-b border-bluegrey-100 last:border-0 items-center"
              >
                <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
                  {am.source}
                </span>
                <span className="text-sm font-mono text-bluegrey-900">→ {am.target}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Login Config tab content ─────────────────────────────────────────────────

function LoginConfigPanel({ postSetup }: { postSetup: PostSetupData }) {
  const hasAccessRoles = postSetup.accessRoleClaims.some((r) => r.claimName || r.claimValue);
  const hasAdminRoles  = postSetup.adminRoleClaims.some((r) => r.claimName || r.claimValue);
  const hasChildAudiences =
    postSetup.sameIdpForChildren &&
    postSetup.childOrgAudiences.some((c) => c.audience);

  return (
    <div className="space-y-6">
      {/* Audience */}
      <div>
        <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
          Audience
        </h4>
        <div className="bg-white border border-bluegrey-200 rounded-md px-4">
          <FieldRow label="Audience value" value={postSetup.audienceValue || "—"} mono />
        </div>
      </div>

      {/* Child org audiences */}
      {hasChildAudiences && (
        <div>
          <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
            Child org audiences
          </h4>
          <div className="bg-white border border-bluegrey-200 rounded-md px-4">
            {postSetup.childOrgAudiences
              .filter((c) => c.audience)
              .map((c) => (
                <FieldRow key={c.orgId} label={c.orgName} value={c.audience} mono />
              ))}
          </div>
        </div>
      )}

      {/* Access role claim mapping */}
      {hasAccessRoles && (
        <div>
          <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Access role claims
          </h4>
          <div className="border border-bluegrey-200 rounded-md overflow-hidden">
            <div className="grid grid-cols-3 gap-3 px-4 py-2.5 bg-bluegrey-50 border-b border-bluegrey-200 text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
              <span>Access role</span>
              <span>Claim name</span>
              <span>Claim value</span>
            </div>
            <div className="divide-y divide-bluegrey-100">
              {postSetup.accessRoleClaims.map((r) => (
                <div key={r.roleId} className="grid grid-cols-3 gap-3 px-4 py-2.5 items-center">
                  <span className="text-sm font-medium text-bluegrey-900">{r.roleName}</span>
                  <code className="text-sm font-mono text-blue-700">{r.claimName || <span className="text-bluegrey-300 not-italic">—</span>}</code>
                  <code className="text-sm font-mono text-blue-700">{r.claimValue || <span className="text-bluegrey-300 not-italic">—</span>}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin role claim mapping */}
      {hasAdminRoles && (
        <div>
          <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Admin role & scope claims
          </h4>
          <div className="border border-bluegrey-200 rounded-md overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-3 px-4 py-2.5 bg-bluegrey-50 border-b border-bluegrey-200 text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
              <span>Admin role</span>
              <span>Claim name</span>
              <span>Claim value</span>
              <span>Scope</span>
            </div>
            <div className="divide-y divide-bluegrey-100">
              {postSetup.adminRoleClaims.map((r) => (
                <div key={r.roleId} className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-3 px-4 py-2.5 items-center">
                  <span className="text-sm font-medium text-bluegrey-900">{r.roleName}</span>
                  <code className="text-sm font-mono text-blue-700">{r.claimName || <span className="text-bluegrey-300 not-italic">—</span>}</code>
                  <code className="text-sm font-mono text-blue-700">{r.claimValue || <span className="text-bluegrey-300 not-italic">—</span>}</code>
                  <span className="text-sm text-bluegrey-600 truncate">{r.scopeName || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!hasAccessRoles && !hasAdminRoles && (
        <p className="text-sm text-bluegrey-400 italic">No claim mappings configured.</p>
      )}
    </div>
  );
}

// ─── Single IDP detail view (with 2 sub-tabs) ─────────────────────────────────

function IdpDetailView({
  idp,
  onRemove,
  disabled,
}: {
  idp: ConfiguredIdp;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="border border-bluegrey-200 rounded-md overflow-hidden">
      {/* IDP header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-bluegrey-25 border-b border-bluegrey-200">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-sm font-semibold text-bluegrey-900">
            {idp.oidc.displayName || "Unnamed IDP"}
          </span>
          <span className="text-xs text-bluegrey-500">OpenID Connect</span>
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
              idp.oidc.active
                ? "bg-green-50 text-green-700"
                : "bg-bluegrey-100 text-bluegrey-500"
            }`}
          >
            {idp.oidc.active ? "active" : "inactive"}
          </span>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 rounded-md flex items-center justify-center text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Remove IDP"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="px-4 pt-3 pb-4">
        <Tabs defaultValue="idp-config">
          <TabsList className="mb-4 h-9 bg-bluegrey-50 border border-bluegrey-200 rounded-md p-0.5 gap-0.5">
            <TabsTrigger
              value="idp-config"
              className="h-8 px-4 text-xs rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 data-[state=active]:font-semibold text-bluegrey-600"
            >
              IDP Config
            </TabsTrigger>
            <TabsTrigger
              value="login-config"
              className="h-8 px-4 text-xs rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 data-[state=active]:font-semibold text-bluegrey-600"
            >
              Login Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="idp-config" className="mt-0">
            <IdpConfigPanel oidc={idp.oidc} />
          </TabsContent>

          <TabsContent value="login-config" className="mt-0">
            <LoginConfigPanel postSetup={idp.postSetup} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Success banner ───────────────────────────────────────────────────────────

function SuccessBanner({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-md bg-green-50 border border-green-200 text-sm text-green-800">
      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
      <span className="flex-1">
        Identity provider <strong>{name}</strong> has been configured and added to this organization.
      </span>
      <button onClick={onDismiss} className="text-green-600 hover:text-green-800 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface IdpMappingTabProps {
  orgId: string;
  orgName: string;
  readOnly?: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IdpMappingTab({ orgId, orgName, readOnly }: IdpMappingTabProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [configuredIdps, setConfiguredIdps] = useState<ConfiguredIdp[]>(() =>
    getDefaultIdpsForOrg(orgId)
  );
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const childOrgs = getChildOrgs(orgId);

  // Max 1 IDP per organisation
  const canAddIdp = !readOnly && configuredIdps.length === 0;

  function handleWizardComplete(idp: ConfiguredIdp) {
    setConfiguredIdps((prev) => [...prev, idp]);
    setRecentlyAdded(idp.oidc.displayName || "IDP");
    setWizardOpen(false);
    toast({
      title: "IDP configured",
      description: `"${idp.oidc.displayName}" has been added to ${orgName}.`,
    });
  }

  function removeIdp(id: string) {
    setConfiguredIdps((prev) => prev.filter((idp) => idp.id !== id));
  }

  async function handleSave() {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast({ title: "Saved", description: "IDP configuration saved successfully." });
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-3xl">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-md bg-blue-50 border border-blue-100 text-sm text-blue-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
          <span>
            Configure and connect the identity provider for <strong>{orgName}</strong>. Use the{" "}
            <strong>IDP Config</strong> tab to manage provider settings and{" "}
            <strong>Login Config</strong> to define audience and claim mappings for roles.
          </span>
        </div>

        {/* Success banner */}
        {recentlyAdded && (
          <SuccessBanner name={recentlyAdded} onDismiss={() => setRecentlyAdded(null)} />
        )}

        {/* IDP section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-bluegrey-900">
              Identity Provider
              {configuredIdps.length > 0 && (
                <span className="ml-2 text-xs font-normal text-bluegrey-400">
                  (1 configured)
                </span>
              )}
            </h3>

            {/* Only show button when no IDP is configured yet */}
            {canAddIdp && (
              <button
                type="button"
                onClick={() => setWizardOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3 border border-dashed border-bluegrey-400 rounded-md text-sm text-bluegrey-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add identity provider
              </button>
            )}
          </div>

          {configuredIdps.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-bluegrey-200 rounded-md">
              <Shield className="w-8 h-8 text-bluegrey-300 mx-auto mb-2" />
              <p className="text-sm text-bluegrey-500">No identity provider configured yet.</p>
              {!readOnly && (
                <p className="text-xs text-bluegrey-400 mt-1">
                  Click "Add identity provider" to set up a new IDP for this organisation.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {configuredIdps.map((idp) => (
                <IdpDetailView
                  key={idp.id}
                  idp={idp}
                  onRemove={() => removeIdp(idp.id)}
                  disabled={readOnly || isSaving}
                />
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        {!readOnly && configuredIdps.length > 0 && (
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-[2px]"
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* Wizard overlay */}
      {wizardOpen && (
        <AddIdpWizard
          orgId={orgId}
          orgName={orgName}
          childOrgs={childOrgs}
          onClose={() => setWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      )}
    </>
  );
}
