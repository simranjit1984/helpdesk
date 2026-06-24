import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import {
  Fieldset,
  InputWrapper,
  SelectWrapper,
  Option,
  Button,
  Toggle,
} from "@onewelcome/react-lib-components";

// ─── Mock data ────────────────────────────────────────────────────────────────

const IDP_OPTIONS = [
  { value: "ow-idp-saml", label: "OneWelcome SAML IDP" },
  { value: "ow-idp-oidc", label: "OneWelcome OIDC IDP" },
  { value: "azure-ad", label: "Azure Active Directory" },
  { value: "okta", label: "Okta" },
  { value: "ping", label: "PingFederate" },
  { value: "google", label: "Google Workspace" },
];

const INVITATION_JOURNEYS = [
  { value: "standard-invite", label: "Standard Invitation" },
  { value: "self-reg", label: "Self Registration" },
  { value: "magic-link", label: "Magic Link" },
  { value: "admin-created", label: "Admin Created Account" },
  { value: "sso-provisioned", label: "SSO Auto-provisioned" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY — Day first (European)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY — Month first (US)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD — ISO 8601 (international)" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface BasicForm {
  rootOrgName: string;
  idp: string;
  adminEmail: string;
  invitationJourney: string;
}

interface AdvancedForm {
  dateFormat: string;
  allowDuplicateInvitation: boolean;
}

interface FieldError {
  rootOrgName?: string;
  idp?: string;
  adminEmail?: string;
  invitationJourney?: string;
  dateFormat?: string;
}

interface DMv2DeployTabProps {
  onDeployed: (orgName: string) => void;
  isDeployed: boolean;
  deployedOrgName?: string;
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  description,
  expanded,
  onToggle,
}: {
  title: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-3 text-left group"
    >
      <div>
        <p className="text-base font-semibold text-bluegrey-900 group-hover:text-blue-600 transition-colors">
          {title}
        </p>
        <p className="text-sm text-bluegrey-500 mt-0.5">{description}</p>
      </div>
      <span className="mt-0.5 text-bluegrey-400 group-hover:text-blue-500 transition-colors flex-shrink-0">
        {expanded ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </span>
    </button>
  );
}

// ─── Success banner ───────────────────────────────────────────────────────────

function DeploySuccessBanner({ orgName }: { orgName: string }) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-6 flex gap-4 items-start mb-6">
      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-green-800">Tenant deployed successfully</p>
        <p className="text-sm text-green-700">
          The DMv2 tenant for <span className="font-semibold">{orgName}</span> has been deployed
          and is ready to use. The{" "}
          <span className="font-semibold">UI Configuration</span> section is now unlocked.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DMv2DeployTab({
  onDeployed,
  isDeployed,
  deployedOrgName,
}: DMv2DeployTabProps) {
  // Basic form
  const [basic, setBasic] = useState<BasicForm>({
    rootOrgName: "",
    idp: "",
    adminEmail: "",
    invitationJourney: "",
  });

  // Advanced form
  const [advanced, setAdvanced] = useState<AdvancedForm>({
    dateFormat: "DD/MM/YYYY",
    allowDuplicateInvitation: false,
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [deploying, setDeploying] = useState(false);
  const [orgNameSaved, setOrgNameSaved] = useState(false);

  // Section expand state
  const [basicExpanded, setBasicExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  // ── Basic helpers ────────────────────────────────────────────────────────────

  function handleSaveOrgName() {
    const errs: FieldError = {};
    if (!basic.rootOrgName.trim()) {
      errs.rootOrgName = "Root organisation name is required.";
    } else if (/\s/.test(basic.rootOrgName)) {
      errs.rootOrgName = "No spaces are allowed.";
    } else if (basic.rootOrgName.length > 8) {
      errs.rootOrgName = "Maximum 8 characters allowed.";
    }
    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
      return;
    }
    setOrgNameSaved(true);
  }

  const updateBasic =
    (field: keyof BasicForm) => (value: string) => {
      setBasic((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FieldError])
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const updateAdvanced =
    <K extends keyof AdvancedForm>(field: K) =>
    (value: AdvancedForm[K]) => {
      setAdvanced((prev) => ({ ...prev, [field]: value }));
    };

  function validate(): FieldError {
    const errs: FieldError = {};

    if (!basic.rootOrgName.trim()) {
      errs.rootOrgName = "Root organisation name is required.";
    } else if (/\s/.test(basic.rootOrgName)) {
      errs.rootOrgName = "No spaces are allowed.";
    } else if (basic.rootOrgName.length > 8) {
      errs.rootOrgName = "Maximum 8 characters allowed.";
    }

    if (!basic.idp) errs.idp = "Please select an Identity Provider.";
    if (!basic.invitationJourney)
      errs.invitationJourney = "Please select an invitation journey.";

    if (!basic.adminEmail.trim()) {
      errs.adminEmail = "Admin email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basic.adminEmail)) {
      errs.adminEmail = "Please enter a valid email address.";
    }

    return errs;
  }

  async function handleDeploy() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Open basic section if there are basic errors
      setBasicExpanded(true);
      return;
    }

    setDeploying(true);
    await new Promise((res) => setTimeout(res, 2200));
    setDeploying(false);
    onDeployed(basic.rootOrgName);
  }

  const formDisabled = isDeployed;

  return (
    <div className="px-6 py-8 max-w-2xl">
      {/* Success banner */}
      {isDeployed && deployedOrgName && (
        <DeploySuccessBanner orgName={deployedOrgName} />
      )}

      <div className={formDisabled ? "opacity-60 pointer-events-none" : ""}>
        <div className="space-y-4">

          {/* ── Basic Configuration ─────────────────────────────────────────── */}
          <div className="rounded-lg border border-bluegrey-200 overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-bluegrey-100">
              <SectionHeader
                title="Basic configuration"
                description="Core tenant identity, IDP connection, and super admin setup."
                expanded={basicExpanded}
                onToggle={() => setBasicExpanded((v) => !v)}
              />
            </div>

            {basicExpanded && (
              <div className="px-5 pb-6 pt-2">
                {/* Organisation */}
                <Fieldset legend="Organisation" legendStyle="h3" background="transparent">
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <InputWrapper
                        label="Root organisation name"
                        type="text"
                        name="rootOrgName"
                        value={basic.rootOrgName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateBasic("rootOrgName")(e.target.value.replace(/\s/g, ""));
                          setOrgNameSaved(false);
                        }}
                        required
                        error={!!errors.rootOrgName}
                        errorMessage={errors.rootOrgName}
                        helperText={`${basic.rootOrgName.length}/8 characters — no spaces. This becomes the root organisation identifier.`}
                        inputProps={{ maxLength: 8 }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      color="primary"
                      onClick={handleSaveOrgName}
                      disabled={!basic.rootOrgName.trim()}
                      style={{ marginTop: "1.75rem", flexShrink: 0 }}
                    >
                      {orgNameSaved ? "Saved ✓" : "Save to continue"}
                    </Button>
                  </div>
                </Fieldset>

                {/* Identity */}
                <Fieldset legend="Identity" legendStyle="h3" background="transparent">
                  <SelectWrapper
                    label="Identity Provider (IDP)"
                    name="idp"
                    value={basic.idp}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateBasic("idp")(e.target.value)
                    }
                    placeholder="Select an IDP from Access…"
                    required
                    error={!!errors.idp}
                    errorMessage={errors.idp}
                  >
                    {IDP_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </SelectWrapper>

                  <SelectWrapper
                    label="Invitation journey"
                    name="invitationJourney"
                    value={basic.invitationJourney}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateBasic("invitationJourney")(e.target.value)
                    }
                    placeholder="Select a journey from Core flows…"
                    required
                    error={!!errors.invitationJourney}
                    errorMessage={errors.invitationJourney}
                  >
                    {INVITATION_JOURNEYS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </SelectWrapper>
                </Fieldset>

                {/* Super Admin */}
                <Fieldset legend="Super Admin" legendStyle="h3" background="transparent">
                  <InputWrapper
                    label="First super admin email"
                    type="email"
                    name="adminEmail"
                    value={basic.adminEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateBasic("adminEmail")(e.target.value)
                    }
                    required
                    error={!!errors.adminEmail}
                    errorMessage={errors.adminEmail}
                    helperText="An invitation will be sent to this address to set up the super admin account."
                  />
                </Fieldset>
              </div>
            )}
          </div>

          {/* ── Advanced Configuration ──────────────────────────────────────── */}
          <div className="rounded-lg border border-bluegrey-200 overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-bluegrey-100">
              <SectionHeader
                title="Advanced configuration"
                description="Date formatting and invitation policy settings."
                expanded={advancedExpanded}
                onToggle={() => setAdvancedExpanded((v) => !v)}
              />
            </div>

            {advancedExpanded && (
              <div className="px-5 pb-6 pt-2">

                {/* Date format */}
                <Fieldset legend="Date format" legendStyle="h3" background="transparent">
                  <SelectWrapper
                    label="Display date format"
                    name="dateFormat"
                    value={advanced.dateFormat}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateAdvanced("dateFormat")(e.target.value)
                    }
                    helperText="Applies to all date fields displayed across the DM tenant UI."
                  >
                    {DATE_FORMAT_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </SelectWrapper>

                  {/* Preview */}
                  <div className="mt-1 mb-4 flex items-center gap-2">
                    <span className="text-xs text-bluegrey-500">Preview:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-bluegrey-100 text-xs font-mono text-bluegrey-700">
                      {formatDatePreview(advanced.dateFormat)}
                    </span>
                  </div>
                </Fieldset>

                {/* Duplicate invitation */}
                <Fieldset legend="Invitation policy" legendStyle="h3" background="transparent">
                  <div className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-dark)" }}>
                        Allow duplicate invitations
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-medium)" }}>
                        When enabled, a user can receive more than one pending invitation to
                        the same organization. When disabled, the system blocks duplicate
                        invitations and shows an error to the administrator.
                      </p>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <Toggle
                        checked={advanced.allowDuplicateInvitation}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateAdvanced("allowDuplicateInvitation")(e.target.checked)
                        }
                        label={advanced.allowDuplicateInvitation ? "Allowed" : "Not allowed"}
                        labelPosition="right"
                      />
                    </div>
                  </div>

                  {/* Contextual note */}
                  {advanced.allowDuplicateInvitation && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 mt-2">
                      <p className="text-xs text-amber-700">
                        <span className="font-semibold">Note: </span>
                        Allowing duplicates may cause confusion if users receive multiple
                        invitation emails. Ensure your invitation journey handles this gracefully.
                      </p>
                    </div>
                  )}
                </Fieldset>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "8px", paddingTop: "24px" }}>
          <Button
            variant="fill"
            color="primary"
            loading={deploying}
            onClick={handleDeploy}
          >
            Update tenant settings
          </Button>
          <Button
            variant="text"
            color="default"
            disabled={deploying}
            onClick={() => {}}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Date preview helper ──────────────────────────────────────────────────────

function formatDatePreview(format: string): string {
  const d = new Date(2025, 5, 24); // fixed example date: 24 June 2025
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  switch (format) {
    case "DD/MM/YYYY":
      return `${dd}/${mm}/${yyyy}`;
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "YYYY-MM-DD":
      return `${yyyy}-${mm}-${dd}`;
    default:
      return `${dd}/${mm}/${yyyy}`;
  }
}
