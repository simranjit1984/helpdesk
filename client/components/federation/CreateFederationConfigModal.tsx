import { useState } from "react";
import { X, ChevronDown, Building2, ShieldCheck, Shield, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ID_BROKER_IDPS, ORG_IDP_MAP, getScopesForOrg, getClaimConfig, type OrgScope, type FederationConfig } from "@/lib/federationMockData";
import { MOCK_ADMIN_ROLES } from "@/components/administrators/mockData";
import { baseOrganizations } from "@/components/OrganizationsTable";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenOrgs(
  orgs: { id: string; name: string; children?: { id: string; name: string }[] }[]
): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];
  for (const org of orgs) {
    result.push({ id: org.id, name: org.name });
    if (org.children) {
      for (const child of org.children) {
        result.push({ id: child.id, name: `  └ ${child.name}` });
      }
    }
  }
  return result;
}

// ─── Styled select ────────────────────────────────────────────────────────────

function StyledSelect({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  required,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-bluegrey-700">
        <Icon className="w-4 h-4 text-bluegrey-400" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full h-10 pl-3 pr-8 text-sm border rounded-[2px] bg-white appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-red-400" : "border-bluegrey-400"
          } ${!value ? "text-bluegrey-400" : "text-bluegrey-900"}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}


// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  organizationId: string;
  idpId: string;
  claimValue: string;   // single claim value selected from the org's IdP claim config
  adminRoleId: string;
  scopeId: string;
}

interface FormErrors {
  organizationId?: string;
  idpId?: string;
  claimValue?: string;
  adminRoleId?: string;
  scopeId?: string;
}

interface CreateFederationConfigModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (config: Omit<FederationConfig, "id">) => void;
  existingConfigs: FederationConfig[];
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function CreateFederationConfigModal({
  open,
  onClose,
  onCreated,
  existingConfigs,
}: CreateFederationConfigModalProps) {
  const allOrgs = flattenOrgs(baseOrganizations as any);
  const allRoles = MOCK_ADMIN_ROLES;
  const allIdps = ID_BROKER_IDPS;

  const [form, setForm] = useState<FormState>({
    organizationId: "",
    idpId: "",
    claimValue: "",
    adminRoleId: "",
    scopeId: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const selectedOrg = allOrgs.find((o) => o.id === form.organizationId);
  const orgIdps = form.organizationId
    ? allIdps.filter((idp) => (ORG_IDP_MAP[form.organizationId] ?? []).includes(idp.id))
    : [];
  const noIdpsForOrg = form.organizationId && orgIdps.length === 0;

  // Scopes available for the currently selected org
  const currentScopes = form.organizationId ? getScopesForOrg(form.organizationId) : [];

  // Claim config for the currently selected org + IdP
  const claimConfig =
    form.organizationId && form.idpId
      ? getClaimConfig(form.organizationId, form.idpId)
      : null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Reset dependent fields when org changes
      if (key === "organizationId") {
        next.idpId = "";
        next.claimValue = "";
        next.scopeId = "";
      }
      // Reset claim value when IdP changes
      if (key === "idpId") {
        next.claimValue = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }


  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.organizationId) e.organizationId = "Organization is required.";
    if (!form.idpId) e.idpId = "Identity Provider is required.";
    if (claimConfig && !form.claimValue)
      e.claimValue = "Claim value is required.";
    if (!form.adminRoleId) e.adminRoleId = "Admin role is required.";
    if (!form.scopeId) e.scopeId = "Scope is required.";

    // Duplicate check
    const duplicate = existingConfigs.find(
      (c) =>
        c.organization_id === form.organizationId &&
        c.idp_id === form.idpId &&
        c.admin_role_id === form.adminRoleId &&
        c.scope_ids.includes(form.scopeId)
    );
    if (duplicate) {
      e.scopeId = "This exact combination already exists.";
    }

    return e;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));

    const org = allOrgs.find((o) => o.id === form.organizationId);
    const idp = allIdps.find((i) => i.id === form.idpId);
    const role = allRoles.find((r) => r.id === form.adminRoleId);
    const selectedScope = currentScopes.find((s) => s.id === form.scopeId);
    const scopeNames = selectedScope ? [selectedScope.name] : [];

    onCreated({
      organization_id: form.organizationId,
      organization_name: org?.name.trim() ?? "",
      idp_id: form.idpId,
      idp_name: idp?.name ?? "",
      claim_name: claimConfig?.claimName ?? "",
      claim_values: form.claimValue ? [form.claimValue] : [],
      admin_role_id: form.adminRoleId,
      admin_role_name: role?.name ?? "",
      scope_ids: form.scopeId ? [form.scopeId] : [],
      scope_names: scopeNames,
    });

    setSaving(false);
    setSuccess(true);
  }

  function handleClose() {
    setForm({ organizationId: "", idpId: "", claimValue: "", adminRoleId: "", scopeId: "" });
    setErrors({});
    setSaving(false);
    setSuccess(false);
    onClose();
  }

  const formDisabled = saving || !!noIdpsForOrg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bluegrey-100">
          <h2 className="text-lg font-semibold text-bluegrey-900">Create Federation Config</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-bluegrey-50 transition-colors text-bluegrey-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <div>
                <p className="text-base font-semibold text-bluegrey-900">
                  Federation config created!
                </p>
                <p className="text-sm text-bluegrey-500 mt-1">
                  The configuration has been added to the list.
                </p>
              </div>
              <Button onClick={handleClose} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white h-10 px-6 rounded-[2px]">
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Step 1: Organization */}
              <StyledSelect
                label="Organization"
                icon={Building2}
                value={form.organizationId}
                onChange={(v) => update("organizationId", v)}
                options={allOrgs.map((o) => ({ value: o.id, label: o.name }))}
                placeholder="Select an organization…"
                required
                error={errors.organizationId}
              />

              {/* Step 2: IdP — depends on org */}
              <div className="flex flex-col gap-1.5">
                <StyledSelect
                  label="Identity Provider"
                  icon={ShieldCheck}
                  value={form.idpId}
                  onChange={(v) => update("idpId", v)}
                  options={orgIdps.map((i) => ({ value: i.id, label: i.name }))}
                  placeholder={
                    !form.organizationId
                      ? "Select an organization first…"
                      : noIdpsForOrg
                      ? "No IdPs configured for this organization"
                      : "Select an Identity Provider…"
                  }
                  disabled={!form.organizationId || !!noIdpsForOrg}
                  required
                  error={errors.idpId}
                />
                {noIdpsForOrg && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    No Identity Providers configured for this organization. Please map IdPs from
                    the Organization's IdP Mapping tab first.
                  </p>
                )}
              </div>

              {/* Step 3: Claim values — depends on org + IdP */}
              {form.idpId && (
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-bluegrey-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-bluegrey-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    Claim value
                    {claimConfig && <span className="text-red-500">*</span>}
                  </label>

                  {!claimConfig ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-amber-200 bg-amber-50">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-700">
                        No claim configuration found for this IdP. Please configure claim
                        name and values in the Organization's IdP Mapping tab first.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {/* Claim name context pill */}
                      <div className="flex items-center gap-1.5 text-xs text-bluegrey-500">
                        <span>Claim name:</span>
                        <code className="font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{claimConfig.claimName}</code>
                      </div>

                      {/* Single dropdown for claim value */}
                      <div className="relative">
                        <select
                          value={form.claimValue}
                          onChange={(e) => update("claimValue", e.target.value)}
                          className={`w-full h-10 pl-3 pr-8 text-sm border rounded-[2px] bg-white appearance-none font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.claimValue ? "border-red-400" : "border-bluegrey-400"
                          } ${!form.claimValue ? "text-bluegrey-400" : "text-bluegrey-900"}`}
                        >
                          <option value="" disabled>Select a claim value…</option>
                          {claimConfig.claimValues.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
                      </div>

                      {errors.claimValue && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.claimValue}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Admin Role */}
              <StyledSelect
                label="Admin Role"
                icon={Shield}
                value={form.adminRoleId}
                onChange={(v) => update("adminRoleId", v)}
                options={allRoles.map((r) => ({ value: r.id, label: r.name }))}
                placeholder="Select an admin role…"
                disabled={!!noIdpsForOrg || !form.organizationId}
                required
                error={errors.adminRoleId}
              />

              {/* Step 5: Scope — single selection */}
              <StyledSelect
                label="Scope"
                icon={Layers}
                value={form.scopeId}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, scopeId: v }));
                  setErrors((prev) => ({ ...prev, scopeId: undefined }));
                }}
                options={currentScopes.map((s) => ({ value: s.id, label: s.name }))}
                placeholder={
                  !form.organizationId
                    ? "Select an organization first…"
                    : currentScopes.length === 0
                    ? "No scopes available for this organization"
                    : "Select a scope…"
                }
                disabled={!!noIdpsForOrg || !form.organizationId || currentScopes.length === 0}
                required
                error={errors.scopeId}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-bluegrey-100">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={saving}
              className="h-10 px-4 rounded-[2px] text-bluegrey-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !!noIdpsForOrg}
              className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-[2px] disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create config"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
