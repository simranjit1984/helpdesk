import { useState } from "react";
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Mail,
  GitBranch,
  Calendar,
  ChevronDown,
  Loader2,
} from "lucide-react";

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

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (e.g. 25/01/2025)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (e.g. 01/25/2025)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (e.g. 2025-01-25)" },
  { value: "DD-MM-YYYY", label: "DD-MM-YYYY (e.g. 25-01-2025)" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY (e.g. 25 Jan 2025)" },
  { value: "MMM DD, YYYY", label: "MMM DD, YYYY (e.g. Jan 25, 2025)" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeployForm {
  rootOrgName: string;
  idp: string;
  adminEmail: string;
  invitationJourney: string;
  dateFormat: string;
}

interface FieldError {
  rootOrgName?: string;
  idp?: string;
  adminEmail?: string;
  invitationJourney?: string;
  dateFormat?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectField({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-bluegrey-700">
        <Icon className="w-4 h-4 text-bluegrey-400" />
        {label}
        <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-10 pl-3 pr-8 text-sm border rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error
              ? "border-red-400 focus:ring-red-400 focus:border-red-400"
              : "border-bluegrey-200"
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Success banner ───────────────────────────────────────────────────────────

function SuccessBanner({ orgName }: { orgName: string }) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-6 flex gap-4 items-start">
      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-green-800">Tenant deployed successfully</p>
        <p className="text-sm text-green-700">
          The DMv2 tenant for <span className="font-semibold">{orgName}</span> has been deployed and is ready to use.
          The <span className="font-semibold">UI Configuration</span> section is now unlocked — you can configure
          the console experience for your tenant.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DMv2DeployTabProps {
  onDeployed: (orgName: string) => void;
  isDeployed: boolean;
  deployedOrgName?: string;
}

export default function DMv2DeployTab({ onDeployed, isDeployed, deployedOrgName }: DMv2DeployTabProps) {
  const [form, setForm] = useState<DeployForm>({
    rootOrgName: "",
    idp: "",
    adminEmail: "",
    invitationJourney: "",
    dateFormat: "",
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [deploying, setDeploying] = useState(false);

  const update = (field: keyof DeployForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  function validate(): FieldError {
    const errs: FieldError = {};

    if (!form.rootOrgName.trim()) {
      errs.rootOrgName = "Root organisation name is required.";
    } else if (/\s/.test(form.rootOrgName)) {
      errs.rootOrgName = "No spaces are allowed.";
    } else if (form.rootOrgName.length > 8) {
      errs.rootOrgName = "Maximum 8 characters allowed.";
    }

    if (!form.idp) errs.idp = "Please select an Identity Provider.";
    if (!form.invitationJourney) errs.invitationJourney = "Please select an invitation journey.";
    if (!form.dateFormat) errs.dateFormat = "Please select a date format.";

    if (!form.adminEmail.trim()) {
      errs.adminEmail = "Admin email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) {
      errs.adminEmail = "Please enter a valid email address.";
    }

    return errs;
  }

  async function handleDeploy() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setDeploying(true);
    // Simulate async deployment
    await new Promise((res) => setTimeout(res, 2200));
    setDeploying(false);
    onDeployed(form.rootOrgName);
  }

  const isFormComplete =
    form.rootOrgName.trim() &&
    !(/\s/.test(form.rootOrgName)) &&
    form.rootOrgName.length <= 8 &&
    form.idp &&
    form.adminEmail &&
    form.invitationJourney &&
    form.dateFormat;

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-bluegrey-900">DMv2 Deploy</h2>
        </div>
        <p className="text-sm text-bluegrey-500 pl-11">
          Configure and deploy a new DMv2 tenant. Once deployed, the UI Configuration section will
          become available.
        </p>
      </div>

      {/* Success state */}
      {isDeployed && deployedOrgName && (
        <SuccessBanner orgName={deployedOrgName} />
      )}

      {/* Form */}
      <div className={`space-y-5 ${isDeployed ? "opacity-60 pointer-events-none" : ""}`}>
        <div className="rounded-lg border border-bluegrey-100 divide-y divide-bluegrey-100">
          {/* Section: Organisation */}
          <div className="p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-bluegrey-400">
              Organisation
            </p>

            {/* Root org name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-bluegrey-700">
                <Building2 className="w-4 h-4 text-bluegrey-400" />
                Root organisation name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={8}
                value={form.rootOrgName}
                onChange={(e) => {
                  const val = e.target.value.replace(/\s/g, "");
                  update("rootOrgName")(val);
                }}
                placeholder="e.g. insurcar"
                className={`w-full h-10 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.rootOrgName
                    ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                    : "border-bluegrey-200"
                } text-bluegrey-900 placeholder:text-bluegrey-400`}
              />
              <div className="flex items-start justify-between gap-2">
                {errors.rootOrgName ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.rootOrgName}
                  </p>
                ) : (
                  <p className="text-xs text-bluegrey-400">
                    Max 8 characters, no spaces. This becomes the root organisation identifier.
                  </p>
                )}
                <span
                  className={`text-xs shrink-0 font-mono ${
                    form.rootOrgName.length === 8 ? "text-amber-500" : "text-bluegrey-400"
                  }`}
                >
                  {form.rootOrgName.length}/8
                </span>
              </div>
            </div>

            {/* Date format */}
            <SelectField
              label="Date format"
              icon={Calendar}
              value={form.dateFormat}
              onChange={update("dateFormat")}
              options={DATE_FORMATS}
              placeholder="Select a date format…"
              error={errors.dateFormat}
            />
          </div>

          {/* Section: Identity */}
          <div className="p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-bluegrey-400">
              Identity
            </p>

            {/* IDP */}
            <SelectField
              label="Identity Provider (IDP)"
              icon={ShieldCheck}
              value={form.idp}
              onChange={update("idp")}
              options={IDP_OPTIONS}
              placeholder="Select an IDP from Access…"
              error={errors.idp}
            />

            {/* Invitation journey */}
            <SelectField
              label="Invitation journey"
              icon={GitBranch}
              value={form.invitationJourney}
              onChange={update("invitationJourney")}
              options={INVITATION_JOURNEYS}
              placeholder="Select a journey from Core flows…"
              error={errors.invitationJourney}
            />
          </div>

          {/* Section: Super Admin */}
          <div className="p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-bluegrey-400">
              Super Admin
            </p>

            {/* Admin email */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-bluegrey-700">
                <Mail className="w-4 h-4 text-bluegrey-400" />
                First super admin email
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => update("adminEmail")(e.target.value)}
                placeholder="e.g. admin@yourcompany.com"
                className={`w-full h-10 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.adminEmail
                    ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                    : "border-bluegrey-200"
                } text-bluegrey-900 placeholder:text-bluegrey-400`}
              />
              {errors.adminEmail && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.adminEmail}
                </p>
              )}
              <p className="text-xs text-bluegrey-400">
                An invitation will be sent to this address to set up the super admin account.
              </p>
            </div>
          </div>
        </div>

        {/* Deploy button */}
        <button
          onClick={handleDeploy}
          disabled={deploying}
          className="w-full h-11 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-sm"
        >
          {deploying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deploying tenant…
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Deploy tenant
            </>
          )}
        </button>

        {!isFormComplete && !deploying && (
          <p className="text-center text-xs text-bluegrey-400">
            Fill in all required fields to deploy.
          </p>
        )}
      </div>
    </div>
  );
}
