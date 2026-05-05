import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Fieldset,
  InputWrapper,
  SelectWrapper,
  Option,
  Button,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeployForm {
  rootOrgName: string;
  idp: string;
  adminEmail: string;
  invitationJourney: string;
}

interface FieldError {
  rootOrgName?: string;
  idp?: string;
  adminEmail?: string;
  invitationJourney?: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DMv2DeployTabProps {
  onDeployed: (orgName: string) => void;
  isDeployed: boolean;
  deployedOrgName?: string;
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
  const [form, setForm] = useState<DeployForm>({
    rootOrgName: "",
    idp: "",
    adminEmail: "",
    invitationJourney: "",
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
    if (!form.invitationJourney)
      errs.invitationJourney = "Please select an invitation journey.";

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
    await new Promise((res) => setTimeout(res, 2200));
    setDeploying(false);
    onDeployed(form.rootOrgName);
  }

  return (
    <div className="px-6 py-8 max-w-2xl">
      {/* Success banner */}
      {isDeployed && deployedOrgName && (
        <DeploySuccessBanner orgName={deployedOrgName} />
      )}

      <div className={`dmv2-form ${isDeployed ? "opacity-60 pointer-events-none" : ""}`}>
        {/* Section: Organisation */}
        <Fieldset legend="Organisation" legendStyle="h2" background="transparent">
          <InputWrapper
            label="Root organisation name"
            type="text"
            name="rootOrgName"
            value={form.rootOrgName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update("rootOrgName")(e.target.value.replace(/\s/g, ""))
            }
            required
            error={!!errors.rootOrgName}
            errorMessage={errors.rootOrgName}
            helperText={`${form.rootOrgName.length}/8 characters — no spaces. This becomes the root organisation identifier.`}
            inputProps={{ maxLength: 8 }}
          />
        </Fieldset>

        {/* Section: Identity */}
        <Fieldset legend="Identity" legendStyle="h2" background="transparent">
          <SelectWrapper
            label="Identity Provider (IDP)"
            name="idp"
            value={form.idp}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              update("idp")(e.target.value)
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
            value={form.invitationJourney}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              update("invitationJourney")(e.target.value)
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

        {/* Section: Super Admin */}
        <Fieldset legend="Super Admin" legendStyle="h2" background="transparent">
          <InputWrapper
            label="First super admin email"
            type="email"
            name="adminEmail"
            value={form.adminEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update("adminEmail")(e.target.value)
            }
            required
            error={!!errors.adminEmail}
            errorMessage={errors.adminEmail}
            helperText="An invitation will be sent to this address to set up the super admin account."
          />
        </Fieldset>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", paddingTop: "16px" }}>
          <Button
            variant="fill"
            color="primary"
            loading={deploying}
            onClick={handleDeploy}
          >
            Update DMv2 config
          </Button>
          <Button
            variant="outline"
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
