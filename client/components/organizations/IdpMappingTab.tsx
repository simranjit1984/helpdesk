import { useState } from "react";
import { AlertCircle, Plus, Tag, Shield, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { baseOrganizations } from "@/components/OrganizationsTable";
import AddIdpWizard from "./AddIdpWizard";
import type { ConfiguredIdp, ChildOrg } from "./idp/types";
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

// ─── Configured IDP card ──────────────────────────────────────────────────────

function ConfiguredIdpCard({
  idp,
  onRemove,
  disabled,
}: {
  idp: ConfiguredIdp;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const { oidc, postSetup } = idp;
  const filledRoles = postSetup.accessRoleClaims.filter((r) => r.claimName || r.claimValue);
  const filledAdmin = postSetup.adminRoleClaims.filter((r) => r.claimName || r.claimValue);

  return (
    <div className="border border-blue-200 rounded-md overflow-hidden bg-white">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-sm font-semibold text-bluegrey-900">
            {oidc.displayName || "Unnamed IDP"}
          </span>
          <span className="text-xs text-bluegrey-500">OpenID Connect</span>
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
              oidc.active
                ? "bg-green-50 text-green-700"
                : "bg-bluegrey-100 text-bluegrey-500"
            }`}
          >
            {oidc.active ? "active" : "inactive"}
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

      {/* Card body */}
      <div className="px-4 py-4 space-y-4">
        {/* Audience */}
        {postSetup.audienceValue && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
              Audience
            </span>
            <code className="text-sm font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded w-fit">
              {postSetup.audienceValue}
            </code>
          </div>
        )}

        {/* Access role claims summary */}
        {filledRoles.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Access role claims
            </span>
            <div className="space-y-1">
              {filledRoles.map((r) => (
                <div key={r.roleId} className="flex items-center gap-2 text-sm text-bluegrey-700">
                  <span className="font-medium w-40 truncate">{r.roleName}</span>
                  <span className="text-bluegrey-400">·</span>
                  <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                    {r.claimName}
                  </code>
                  <span className="text-bluegrey-400">=</span>
                  <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                    {r.claimValue}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin role claims summary */}
        {filledAdmin.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Admin role claims
            </span>
            <div className="space-y-1">
              {filledAdmin.map((r) => (
                <div key={r.roleId} className="flex items-center gap-2 text-sm text-bluegrey-700 flex-wrap">
                  <span className="font-medium w-32 truncate">{r.roleName}</span>
                  <span className="text-bluegrey-400">·</span>
                  <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                    {r.claimName}
                  </code>
                  <span className="text-bluegrey-400">=</span>
                  <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                    {r.claimValue}
                  </code>
                  {r.scopeName && (
                    <>
                      <span className="text-bluegrey-400">·</span>
                      <span className="text-xs text-bluegrey-500">scope: {r.scopeName}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Child org audiences */}
        {postSetup.sameIdpForChildren &&
          postSetup.childOrgAudiences.some((c) => c.audience) && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
                Child org audiences
              </span>
              <div className="space-y-1">
                {postSetup.childOrgAudiences
                  .filter((c) => c.audience)
                  .map((c) => (
                    <div key={c.orgId} className="flex items-center gap-2 text-sm text-bluegrey-700">
                      <span className="font-medium w-40 truncate">{c.orgName}</span>
                      <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                        {c.audience}
                      </code>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

// ─── Success toast banner ─────────────────────────────────────────────────────

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
            Configure and connect identity providers for <strong>{orgName}</strong>. For each
            provider, define the claim mapping rules that grant access roles and admin roles to
            users authenticating via this IDP.
          </span>
        </div>

        {/* Success banner */}
        {recentlyAdded && (
          <SuccessBanner name={recentlyAdded} onDismiss={() => setRecentlyAdded(null)} />
        )}

        {/* IDP list */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-bluegrey-900">
              Identity Providers
              {configuredIdps.length > 0 && (
                <span className="ml-2 text-xs font-normal text-bluegrey-400">
                  ({configuredIdps.length} configured)
                </span>
              )}
            </h3>

            {!readOnly && (
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
              <p className="text-sm text-bluegrey-500">No identity providers configured yet.</p>
              {!readOnly && (
                <p className="text-xs text-bluegrey-400 mt-1">
                  Click "Add identity provider" to set up a new IDP.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {configuredIdps.map((idp) => (
                <ConfiguredIdpCard
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
