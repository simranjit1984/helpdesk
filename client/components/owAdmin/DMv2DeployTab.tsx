import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import LoginWorkflowConfig from "./LoginWorkflowConfig";
import {
  Fieldset,
  InputWrapper,
  SelectWrapper,
  Option,
  Button,
  Tabs,
  Tab,
} from "@onewelcome/react-lib-components";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EXISTING_USERS = [
  "admin@tgs-root.com",
  "jane.doe@tgs-root.com",
  "john.smith@tgs-root.com",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Types ────────────────────────────────────────────────────────────────────

interface BasicForm {
  rootOrgName: string;
}

type LastOrgBehavior = "hard-delete" | "orphan-org";

interface AdvancedForm {
  allowDuplicateInvitation: boolean;
  lastOrgBehavior: LastOrgBehavior;
}

interface FieldError {
  rootOrgName?: string;
}

interface CreateUserForm {
  email: string;
  setPassword: boolean;
  password: string;
}

interface CreateUserErrors {
  email?: string;
  password?: string;
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
    rootOrgName: "tgs-root",
  });

  // Advanced form
  const [advanced, setAdvanced] = useState<AdvancedForm>({
    allowDuplicateInvitation: false,
    lastOrgBehavior: "orphan-org",
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [deploying, setDeploying] = useState(false);
  const [orgNameSaved, setOrgNameSaved] = useState(false);

  // Section expand state
  const [basicExpanded, setBasicExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [workflowExpanded, setWorkflowExpanded] = useState(false);
  const [usersExpanded, setUsersExpanded] = useState(false);
  const [userTab, setUserTab] = useState(0);

  // Create user (with superadmin) form
  const [createUser, setCreateUser] = useState<CreateUserForm>({
    email: "",
    setPassword: false,
    password: "",
  });
  const [createUserErrors, setCreateUserErrors] = useState<CreateUserErrors>({});
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(null);

  // Assign superadmin to existing user form
  const [assignEmail, setAssignEmail] = useState("");
  const [assignEmailError, setAssignEmailError] = useState<string | undefined>();
  const [assigningUser, setAssigningUser] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

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

  const updateAdvanced = (patch: Partial<AdvancedForm>) => {
    setAdvanced((prev) => ({ ...prev, ...patch }));
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

  async function handleCreateUser() {
    const userErrs: CreateUserErrors = {};
    if (!createUser.email.trim()) {
      userErrs.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(createUser.email.trim())) {
      userErrs.email = "Enter a valid email address.";
    }
    if (createUser.setPassword && createUser.password.length < 8) {
      userErrs.password = "Password must be at least 8 characters.";
    }
    if (Object.keys(userErrs).length > 0) {
      setCreateUserErrors(userErrs);
      setCreateUserSuccess(null);
      return;
    }

    setCreateUserErrors({});
    setCreatingUser(true);
    await new Promise((res) => setTimeout(res, 1200));
    setCreatingUser(false);

    let suffix = " and an activation email was sent.";
    if (createUser.setPassword) {
      suffix = ".";
    }
    setCreateUserSuccess("User " + createUser.email + " was created with the superadmin role" + suffix);
    setCreateUser({ email: "", setPassword: false, password: "" });
  }

  async function handleAssignSuperadmin() {
    const email = assignEmail.trim();
    if (!email) {
      setAssignEmailError("Email address is required.");
      setAssignSuccess(null);
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setAssignEmailError("Enter a valid email address.");
      setAssignSuccess(null);
      return;
    }

    setAssignEmailError(undefined);
    setAssigningUser(true);
    await new Promise((res) => setTimeout(res, 1000));
    setAssigningUser(false);

    if (!MOCK_EXISTING_USERS.includes(email.toLowerCase())) {
      setAssignEmailError("No user was found with this email address.");
      setAssignSuccess(null);
      return;
    }

    setAssignSuccess("Superadmin role granted to " + email + ".");
    setAssignEmail("");
  }

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
                description="Core tenant root organisation identifier."
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

              </div>
            )}
          </div>

          {/* ── Advanced Configuration ──────────────────────────────────────── */}
          <div className="rounded-lg border border-bluegrey-200 overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-bluegrey-100">
              <SectionHeader
                title="Advanced configuration"
                description="Invitation policy and user lifecycle behaviour settings."
                expanded={advancedExpanded}
                onToggle={() => setAdvancedExpanded((v) => !v)}
              />
            </div>

            {advancedExpanded && (
              <div className="px-5 pb-6 pt-4 space-y-6">

                {/* Last organization behavior */}
                <div>
                  <p className="text-sm font-semibold text-bluegrey-800 mb-0.5">
                    Last organization removal behavior
                  </p>
                  <p className="text-xs text-bluegrey-500 mb-3">
                    When a user is removed from their last organization (either by admin
                    action or because the organization is deleted), define what happens
                    to that user's account.
                  </p>
                  <div className="space-y-2">
                    {([
                      {
                        value: "hard-delete" as const,
                        label: "User hard delete",
                        description:
                          "User and all remaining relationships are permanently removed. This action is irreversible.",
                        badge: "Destructive",
                        badgeCls: "bg-red-100 text-red-700",
                      },
                      {
                        value: "orphan-org" as const,
                        label: "Move user to orphan organization",
                        description:
                          "User is moved to an orphan organization. All his access and relationships will still be removed but the account will be retained.",
                        badge: "Recoverable",
                        badgeCls: "bg-green-100 text-green-700",
                      },
                    ] as const).map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                          advanced.lastOrgBehavior === opt.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-bluegrey-200 hover:border-blue-300 hover:bg-blue-50/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="lastOrgBehavior"
                          value={opt.value}
                          checked={advanced.lastOrgBehavior === opt.value}
                          onChange={() => updateAdvanced({ lastOrgBehavior: opt.value })}
                          className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-bluegrey-900">
                              {opt.label}
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                opt.badgeCls
                              }`}
                            >
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-xs text-bluegrey-500 mt-0.5">
                            {opt.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {advanced.lastOrgBehavior === "hard-delete" && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 mt-2">
                      <p className="text-xs text-red-700">
                        <span className="font-semibold">Warning: </span>
                        Hard delete is permanent. Ensure audit logs are exported before
                        enabling this option in production.
                      </p>
                    </div>
                  )}
                </div>

                {/* Duplicate invitation */}
                <div className="pt-2 border-t border-bluegrey-100">
                  <p className="text-base font-semibold text-bluegrey-800 mb-3">Invitation policy</p>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-bluegrey-800">
                        Allow duplicate invitations
                      </p>
                      <p className="text-xs text-bluegrey-500 mt-1">
                        When enabled, a user can receive more than one pending invitation
                        to the same organization. When disabled, the system blocks
                        duplicate invitations and shows an error to the administrator.
                      </p>
                    </div>
                    {/* Native toggle */}
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={advanced.allowDuplicateInvitation}
                        onChange={(e) =>
                          updateAdvanced({ allowDuplicateInvitation: e.target.checked })
                        }
                      />
                      <div className="w-11 h-6 bg-bluegrey-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-bluegrey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                      <span className="ml-2 text-sm font-medium text-bluegrey-700">
                        {advanced.allowDuplicateInvitation ? "Allowed" : "Not allowed"}
                      </span>
                    </label>
                  </div>

                  {advanced.allowDuplicateInvitation && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 mt-3">
                      <p className="text-xs text-amber-700">
                        <span className="font-semibold">Note: </span>
                        Allowing duplicates may cause confusion if users receive multiple
                        invitation emails. Ensure your invitation journey handles this gracefully.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Login & Workflow Configuration ─────────────────── */}
          <div className="rounded-lg border border-bluegrey-200 overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-bluegrey-100">
              <SectionHeader
                title="Login & workflow configuration"
                description="OIDC authentication, invitation webhook, and password reset webhook."
                expanded={workflowExpanded}
                onToggle={() => setWorkflowExpanded((v) => !v)}
              />
            </div>
            {workflowExpanded && (
              <div className="px-5 pb-6 pt-4">
                <LoginWorkflowConfig />
              </div>
            )}
          </div>

          {/* ── User & Superadmin Management ───────────────────── */}
          <div className="rounded-lg border border-bluegrey-200 overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-bluegrey-100">
              <SectionHeader
                title="User & superadmin management"
                description="Create a new superadmin user or grant the superadmin role to an existing user."
                expanded={usersExpanded}
                onToggle={() => setUsersExpanded((v) => !v)}
              />
            </div>

            {usersExpanded && (
              <div className="px-5 pb-6 pt-4">
                <Tabs
                  selected={userTab}
                  onTabChange={(index) => {
                    setUserTab(index);
                    setCreateUserSuccess(null);
                    setAssignSuccess(null);
                  }}
                >
                  <Tab title="Create user">
                    <div className="pt-4 space-y-4">
                      <InputWrapper
                        label="Email address"
                        type="email"
                        name="createUserEmail"
                        value={createUser.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setCreateUser((prev) => ({ ...prev, email: e.target.value }));
                          setCreateUserErrors((prev) => ({ ...prev, email: undefined }));
                          setCreateUserSuccess(null);
                        }}
                        required
                        error={!!createUserErrors.email}
                        errorMessage={createUserErrors.email}
                      />

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-bluegrey-800">
                            Set a password now
                          </p>
                          <p className="text-xs text-bluegrey-500 mt-1">
                            When disabled, the user is created without a password and
                            receives an activation email instead.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={createUser.setPassword}
                            onChange={(e) => {
                              setCreateUser((prev) => ({
                                ...prev,
                                setPassword: e.target.checked,
                              }));
                              setCreateUserErrors((prev) => ({ ...prev, password: undefined }));
                            }}
                          />
                          <div className="w-11 h-6 bg-bluegrey-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-bluegrey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                          <span className="ml-2 text-sm font-medium text-bluegrey-700">
                            {createUser.setPassword ? "Yes" : "No"}
                          </span>
                        </label>
                      </div>

                      {createUser.setPassword && (
                        <InputWrapper
                          label="Password"
                          type="password"
                          name="createUserPassword"
                          value={createUser.password}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setCreateUser((prev) => ({ ...prev, password: e.target.value }));
                            setCreateUserErrors((prev) => ({ ...prev, password: undefined }));
                          }}
                          required
                          error={!!createUserErrors.password}
                          errorMessage={createUserErrors.password}
                          helperText="Minimum 8 characters."
                        />
                      )}

                      {createUserSuccess && (
                        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 flex gap-2 items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-green-700">{createUserSuccess}</p>
                        </div>
                      )}

                      <Button
                        variant="fill"
                        color="primary"
                        loading={creatingUser}
                        disabled={!createUser.email.trim()}
                        onClick={handleCreateUser}
                      >
                        Create superadmin user
                      </Button>
                    </div>
                  </Tab>

                  <Tab title="Assign to existing user">
                    <div className="pt-4 space-y-4">
                      <InputWrapper
                        label="Email address"
                        type="email"
                        name="assignUserEmail"
                        value={assignEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setAssignEmail(e.target.value);
                          setAssignEmailError(undefined);
                          setAssignSuccess(null);
                        }}
                        required
                        error={!!assignEmailError}
                        errorMessage={assignEmailError}
                        helperText="The user must already exist. Only the superadmin role will be granted."
                      />

                      {assignSuccess && (
                        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 flex gap-2 items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-green-700">{assignSuccess}</p>
                        </div>
                      )}

                      <Button
                        variant="fill"
                        color="primary"
                        loading={assigningUser}
                        disabled={!assignEmail.trim()}
                        onClick={handleAssignSuperadmin}
                      >
                        Grant superadmin role
                      </Button>
                    </div>
                  </Tab>
                </Tabs>
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
