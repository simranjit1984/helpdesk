import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ExternalLink, ChevronRight, Building2, Layers } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createBulkJob } from "@/lib/bulkInviteMockData";
import { MOCK_ADMIN_ROLES, MOCK_SCOPES } from "@/components/administrators/mockData";
import { getAvailableRolesForOrg } from "@/components/organizations/accessRolesMockData";
import { baseOrganizations } from "@/components/OrganizationsTable";
import Step1Upload, { type ParsedUser, type UserValidationError } from "@/components/bulkInvite/Step1Upload";
import StepConfigureOrgs, { type OrgConfig, type AdminRoleAssignment } from "@/components/bulkInvite/StepConfigureOrgs";
import StepSingleOrgRoles from "@/components/bulkInvite/StepSingleOrgRoles";
import StepReview from "@/components/bulkInvite/StepReview";

// ─── Types ────────────────────────────────────────────────────────────────────

type InviteMode = "single-org" | "multi-org";

interface WizardState {
  fileName: string;
  validUsers: ParsedUser[];
  invalidUsers: UserValidationError[];
  // multi-org
  orgConfigs: Record<string, OrgConfig>;
  // single-org
  orgId: string;
  orgName: string;
  accessRoleIds: string[];
  adminRoleAssignments: AdminRoleAssignment[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getParentId(orgId: string): string | undefined {
  for (const org of baseOrganizations) {
    if (org.children?.some((c) => c.id === orgId)) return org.id;
  }
  return undefined;
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Upload users" },
  { label: "Role assignment" },
  { label: "Review" },
];

// ─── Progress indicator ───────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const num = i + 1;
        const isActive = num === current;
        const isDone = num < current;
        return (
          <div key={num} className="flex items-center gap-1 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isDone
                  ? "bg-green-500 text-white"
                  : "bg-bluegrey-200 text-bluegrey-500"
              }`}
            >
              {isDone ? "✓" : num}
            </div>
            <span
              className={`text-xs hidden sm:block truncate ${
                isActive ? "text-blue-600 font-medium" : isDone ? "text-green-600" : "text-bluegrey-400"
              }`}
            >
              {STEPS[i].label}
            </span>
            {i < total - 1 && (
              <div className={`h-0.5 flex-1 mx-1 ${isDone ? "bg-green-400" : "bg-bluegrey-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Mode pre-screen ──────────────────────────────────────────────────────────

interface ModeCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  bullets: string[];
  onClick: () => void;
}

function ModeCard({ icon: Icon, title, description, bullets, onClick }: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border-2 border-bluegrey-200 bg-white hover:border-blue-400 hover:shadow-md transition-all p-6 group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-bluegrey-900 mb-1">{title}</p>
          <p className="text-sm text-bluegrey-500 mb-3">{description}</p>
          <ul className="space-y-1">
            {bullets.map((b) => (
              <li key={b} className="text-xs text-bluegrey-600 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <ChevronRight className="w-5 h-5 text-bluegrey-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

function ModePreScreen({ onSelect }: { onSelect: (mode: InviteMode) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Select invitation type</h2>
        <p className="text-sm text-bluegrey-500 mt-1">
          Choose the type that matches your administrator scope. This determines how users are
          mapped to organizations in your CSV.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ModeCard
          icon={Building2}
          title="Single Organization"
          description="You manage one organization and want to invite users into it."
          bullets={[
            "Upload CSV with Email, First Name, Last Name",
            "No Organization ID required",
            "Assign access & admin roles in next step",
          ]}
          onClick={() => onSelect("single-org")}
        />
        <ModeCard
          icon={Layers}
          title="Multiple Organizations"
          description="You manage multiple organizations and users belong to different ones."
          bullets={[
            "Upload CSV including Organization ID column",
            "Download the organizations reference CSV",
            "Configure roles per organization independently",
          ]}
          onClick={() => onSelect("multi-org")}
        />
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ jobId }: { jobId: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9 text-green-600" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-bluegrey-900 mb-1">Bulk invitation queued</h2>
        <p className="text-sm text-bluegrey-500">
          Your bulk invitation job has been queued and will be processed in the background.
        </p>
      </div>
      <div className="rounded-md bg-bluegrey-50 border border-bluegrey-200 px-6 py-3 text-center">
        <p className="text-xs text-bluegrey-500 mb-1">Job ID</p>
        <p className="text-lg font-bold text-bluegrey-900 font-mono">{jobId}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/users")}>
          Back to Users
        </Button>
        <Button onClick={() => navigate(`/bulk-invite-jobs/${jobId}`)} className="gap-2">
          <ExternalLink className="w-4 h-4" />
          View job progress
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BulkInvite() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<InviteMode | null>(null);
  const [step, setStep] = useState(1);
  const [submittedJobId, setSubmittedJobId] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const [form, setForm] = useState<WizardState>({
    fileName: "",
    validUsers: [],
    invalidUsers: [],
    orgConfigs: {},
    orgId: "",
    orgName: "",
    accessRoleIds: [],
    adminRoleAssignments: [],
  });

  const patch = (updates: Partial<WizardState>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const SINGLE_ORG = { id: "1", name: "Acme Corp" };

  const handleSelectMode = (selected: InviteMode) => {
    setMode(selected);
    setStep(1);
    if (selected === "single-org") {
      patch({ orgId: SINGLE_ORG.id, orgName: SINGLE_ORG.name });
    }
  };

  // ── Validation per step ────────────────────────────────────────────────────
  const canAdvance = (): boolean => {
    if (step === 1) return form.validUsers.length > 0;
    if (step === 2) {
      if (mode === "single-org") {
        const missingScopeCount = form.adminRoleAssignments.filter((a) => !a.scopeId).length;
        return !!form.orgId && missingScopeCount === 0;
      }
      // multi-org
      const orgIds = [...new Set(form.validUsers.map((u) => u.organizationId))];
      return orgIds.length > 0 && orgIds.every((id) => form.orgConfigs[id]?.configured);
    }
    return true;
  };

  const stepError = (): string | null => {
    if (step === 1 && form.validUsers.length === 0)
      return "Please upload a CSV file with at least one valid user.";
    if (step === 2) {
      if (mode === "single-org") {
        if (!form.orgId) return "Please select an organization.";
        const missingScopeCount = form.adminRoleAssignments.filter((a) => !a.scopeId).length;
        if (missingScopeCount > 0)
          return `${missingScopeCount} admin role${missingScopeCount !== 1 ? "s" : ""} missing a scope.`;
      } else {
        const orgIds = [...new Set(form.validUsers.map((u) => u.organizationId))];
        const unconfigured = orgIds.filter((id) => !form.orgConfigs[id]?.configured);
        if (unconfigured.length > 0)
          return `${unconfigured.length} organization${unconfigured.length !== 1 ? "s" : ""} still require role assignment.`;
      }
    }
    return null;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setShowErrors(false);
    setStep((s) => s - 1);
  };

  const handleBackToModeSelect = () => {
    setMode(null);
    setStep(1);
    setShowErrors(false);
  };

  const handleSubmit = () => {
    if (mode === "single-org") {
      const parentId = getParentId(form.orgId);
      const availableRoles = getAvailableRolesForOrg(form.orgId, parentId);
      const accessRoles = availableRoles
        .filter((r) => form.accessRoleIds.includes(r.id))
        .map((r) => r.name);
      const adminRoles = form.adminRoleAssignments.map((a) => {
        const role = MOCK_ADMIN_ROLES.find((r) => r.id === a.roleId);
        const scope = MOCK_SCOPES.find((s) => s.id === a.scopeId);
        return { name: role?.name ?? a.roleId, scopeName: scope?.name ?? "", cascadable: a.cascadable };
      });
      const orgConfigs = [{ orgId: form.orgId, orgName: form.orgName, accessRoles, adminRoles }];
      const users = form.validUsers.map((u) => ({
        ...u,
        organizationId: form.orgId,
        organizationName: form.orgName,
      }));
      const job = createBulkJob({ orgConfigs, users });
      toast({ title: "Job queued", description: `Bulk invitation job ${job.id} has been created.` });
      setSubmittedJobId(job.id);
    } else {
      const orgConfigs = Object.values(form.orgConfigs).map((cfg) => {
        const parentId = getParentId(cfg.orgId);
        const availableRoles = getAvailableRolesForOrg(cfg.orgId, parentId);
        const accessRoles = availableRoles
          .filter((r) => cfg.accessRoleIds.includes(r.id))
          .map((r) => r.name);
        const adminRoles = cfg.adminRoleAssignments.map((a) => {
          const role = MOCK_ADMIN_ROLES.find((r) => r.id === a.roleId);
          const scope = MOCK_SCOPES.find((s) => s.id === a.scopeId);
          return { name: role?.name ?? a.roleId, scopeName: scope?.name ?? "", cascadable: a.cascadable };
        });
        return { orgId: cfg.orgId, orgName: cfg.orgName, accessRoles, adminRoles };
      });
      const job = createBulkJob({ orgConfigs, users: form.validUsers });
      toast({ title: "Job queued", description: `Bulk invitation job ${job.id} has been created.` });
      setSubmittedJobId(job.id);
    }
  };

  // Build single-org orgConfigs for the Review step
  const singleOrgConfigsForReview: Record<string, OrgConfig> = mode === "single-org" && form.orgId
    ? {
        [form.orgId]: {
          orgId: form.orgId,
          orgName: form.orgName,
          userCount: form.validUsers.length,
          accessRoleIds: form.accessRoleIds,
          adminRoleAssignments: form.adminRoleAssignments,
          configured: true,
        },
      }
    : {};

  const singleOrgValidUsersForReview: ParsedUser[] = form.validUsers.map((u) => ({
    ...u,
    organizationId: form.orgId,
    organizationName: form.orgName,
  }));

  const error = showErrors ? stepError() : null;

  return (
    <Layout>
      <div className="min-h-screen bg-bluegrey-25">
        {/* Header */}
        <div className="sticky top-16 bg-white border-b border-bluegrey-100 z-20 px-6 lg:px-8 py-4">
          <button
            type="button"
            onClick={mode ? handleBackToModeSelect : () => navigate("/users")}
            className="flex items-center gap-1.5 text-sm text-bluegrey-500 hover:text-bluegrey-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            {mode ? "Change invitation type" : "Back to Users"}
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-bluegrey-900">Bulk Invite Users</h1>
              {mode && !submittedJobId && (
                <p className="text-sm text-bluegrey-500 mt-0.5">
                  Step {step} of {STEPS.length} — {STEPS[step - 1].label}
                  <span className="ml-2 text-xs text-bluegrey-400">
                    ({mode === "single-org" ? "Single organization" : "Multiple organizations"})
                  </span>
                </p>
              )}
              {!mode && (
                <p className="text-sm text-bluegrey-500 mt-0.5">Select an invitation type to get started</p>
              )}
            </div>
            {mode && !submittedJobId && (
              <button
                type="button"
                onClick={() => navigate("/users?tab=bulk-invitation")}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View all jobs
              </button>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          {submittedJobId ? (
            <SuccessScreen jobId={submittedJobId} />
          ) : !mode ? (
            /* Pre-screen: mode selection */
            <div className="bg-white rounded-lg border border-bluegrey-200 p-6">
              <ModePreScreen onSelect={handleSelectMode} />
            </div>
          ) : (
            <>
              {/* Progress */}
              <StepIndicator current={step} total={STEPS.length} />

              {/* Step content */}
              <div className="bg-white rounded-lg border border-bluegrey-200 p-6 min-h-[320px]">
                {step === 1 && (
                  <Step1Upload
                    mode={mode}
                    onValidated={(valid, invalid, fileName) =>
                      patch({ validUsers: valid, invalidUsers: invalid, fileName })
                    }
                    initialValid={form.validUsers}
                    initialInvalid={form.invalidUsers}
                    initialFileName={form.fileName}
                  />
                )}
                {step === 2 && mode === "single-org" && (
                  <StepSingleOrgRoles
                    orgId={form.orgId}
                    orgName={form.orgName}
                    accessRoleIds={form.accessRoleIds}
                    adminRoleAssignments={form.adminRoleAssignments}
                    onChange={(p) => patch(p as Partial<WizardState>)}
                    showErrors={showErrors}
                  />
                )}
                {step === 2 && mode === "multi-org" && (
                  <StepConfigureOrgs
                    validUsers={form.validUsers}
                    orgConfigs={form.orgConfigs}
                    onChange={(configs) => patch({ orgConfigs: configs })}
                    showErrors={showErrors}
                  />
                )}
                {step === 3 && (
                  <StepReview
                    validUsers={mode === "single-org" ? singleOrgValidUsersForReview : form.validUsers}
                    orgConfigs={mode === "single-org" ? singleOrgConfigsForReview : form.orgConfigs}
                    fileName={form.fileName}
                  />
                )}
              </div>

              {/* Validation error */}
              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span className="font-medium">⚠</span> {error}
                </p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-bluegrey-200">
                <Button variant="ghost" onClick={() => navigate("/users")}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  {step > 1 && (
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  {step < STEPS.length ? (
                    <Button onClick={handleNext} className="gap-1.5">
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="gap-2 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      Start bulk invitation
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
