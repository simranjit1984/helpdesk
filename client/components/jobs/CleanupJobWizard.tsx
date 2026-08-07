import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  CleanupJob,
  CleanupJobFormState,
  CleanupStatus,
  Frequency,
  JobType,
  OrgMembershipBehavior,
  AccessRoleBehavior,
} from "@/lib/jobsMockData";
import StepJobType from "./wizard/StepJobType";
import Step1StatusSelection from "./wizard/Step1StatusSelection";
import Step2Frequency from "./wizard/Step2Frequency";
import Step3TimeWindow from "./wizard/Step3TimeWindow";
import Step5Review from "./wizard/Step5Review";
import StepOrgScope from "./wizard/StepOrgScope";
import StepGracePeriod from "./wizard/StepGracePeriod";
import StepBehaviorConfig from "./wizard/StepBehaviorConfig";

// Re-export so existing consumers can still import from this module
export type { CleanupJobFormState };

// ─── Step routing ─────────────────────────────────────────────────────────────

type WizardStep =
  | "job-type"
  | "user-status"
  | "org-scope"
  | "grace-period"
  | "frequency"
  | "time-window"
  | "behavior"
  | "review";

function getStepSequence(jobType: JobType | null): WizardStep[] {
  if (!jobType || jobType === "user-status-cleanup") {
    return ["job-type", "user-status", "frequency", "time-window", "review"];
  }
  return [
    "job-type",
    "org-scope",
    "grace-period",
    "frequency",
    "time-window",
    "behavior",
    "review",
  ];
}

const STEP_LABELS: Record<WizardStep, string> = {
  "job-type": "Job type",
  "user-status": "User status",
  "org-scope": "Scope & target",
  "grace-period": "End date & grace period",
  frequency: "Frequency",
  "time-window": "Time window",
  behavior: "Behavior",
  review: "Review & confirm",
};

// ─── Default form state ───────────────────────────────────────────────────────

const DEFAULT_ORG_BEHAVIOR: OrgMembershipBehavior = {
  revokeAccessRoles: true,
  sendNotification: true,
  logAuditTrail: true,
  lastOrgBehavior: "orphan-org",
};

const DEFAULT_ROLE_BEHAVIOR: AccessRoleBehavior = {
  sendNotification: true,
  logAuditTrail: true,
  removeFromEntitlements: true,
  lastRoleBehavior: "keep-in-org",
};

const DEFAULT_FORM: CleanupJobFormState = {
  jobType: null,
  name: "",
  statuses: [],
  organizationIds: [],
  includeAllOrgs: false,
  userStatusFilter: "active",
  gracePeriodDays: 0,
  specificAccessRoles: [],
  includeAllRoles: true,
  excludeRoles: [],
  frequency: "daily",
  frequencyDays: ["Monday"],
  frequencyDayOfMonth: 1,
  executionHour: 23,
  orgBehavior: DEFAULT_ORG_BEHAVIOR,
  roleBehavior: DEFAULT_ROLE_BEHAVIOR,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  editJob?: CleanupJob | null;
  onClose: () => void;
  onSave: (job: Omit<CleanupJob, "id" | "createdBy" | "createdAt" | "nextRun">) => void;
}

export default function CleanupJobWizard({ open, editJob, onClose, onSave }: Props) {
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const buildInitialForm = (): CleanupJobFormState => {
    if (!editJob) return DEFAULT_FORM;
    const jobType = editJob.jobType ?? "user-status-cleanup";
    return {
      jobType,
      name: editJob.name,
      statuses: editJob.statuses ?? [],
      organizationIds: editJob.organizationIds ?? [],
      includeAllOrgs: editJob.includeAllOrgs ?? false,
      userStatusFilter: editJob.userStatusFilter ?? "active",
      gracePeriodDays: editJob.gracePeriodDays ?? 0,
      specificAccessRoles: editJob.specificAccessRoles ?? [],
      includeAllRoles: editJob.includeAllRoles ?? true,
      excludeRoles: editJob.excludeRoles ?? [],
      frequency: editJob.frequency,
      frequencyDays: editJob.frequencyDays ?? ["Monday"],
      frequencyDayOfMonth: editJob.frequencyDayOfMonth ?? 1,
      executionHour: editJob.executionHour,
      orgBehavior: editJob.orgMembershipBehavior ?? DEFAULT_ORG_BEHAVIOR,
      roleBehavior: editJob.accessRoleBehavior ?? DEFAULT_ROLE_BEHAVIOR,
    };
  };

  const [form, setForm] = useState<CleanupJobFormState>(buildInitialForm);

  const patch = (updates: Partial<CleanupJobFormState>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      // If jobType changes, reset step to 0 to avoid out-of-bounds on sequence change
      if ("jobType" in updates && updates.jobType !== prev.jobType) {
        setStepIndex(0);
      }
      return next;
    });
  };

  const sequence = getStepSequence(form.jobType);
  const currentStep = sequence[stepIndex];
  const isLastStep = stepIndex === sequence.length - 1;

  // ── Validation ──────────────────────────────────────────────────────────────

  const frequencyErrors = (() => {
    const errs: { twiceWeekly?: string } = {};
    if (
      form.frequency === "twice-weekly" &&
      form.frequencyDays[0] === form.frequencyDays[1]
    ) {
      errs.twiceWeekly = "The two days must be different.";
    }
    return errs;
  })();

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case "job-type":
        return form.jobType !== null;
      case "user-status":
        return form.statuses.length > 0;
      case "org-scope":
        return form.includeAllOrgs || form.organizationIds.length > 0;
      case "grace-period":
        return form.gracePeriodDays >= 0 && form.gracePeriodDays <= 30;
      case "frequency":
        return Object.keys(frequencyErrors).length === 0;
      case "review":
        return confirmed;
      default:
        return true;
    }
  };

  const handleNext = () => {
    setShowErrors(true);
    if (!canAdvance()) return;
    setShowErrors(false);
    if (isLastStep) {
      handleSave();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    setShowErrors(false);
    setStepIndex((i) => i - 1);
  };

  const handleSave = () => {
    const nextRun = new Date();
    nextRun.setHours(form.executionHour, 0, 0, 0);
    if (nextRun <= new Date()) nextRun.setDate(nextRun.getDate() + 1);

    const jobType = form.jobType ?? "user-status-cleanup";

    const base = {
      name: form.name || "Unnamed cleanup job",
      statuses: jobType === "user-status-cleanup" ? form.statuses : ([] as CleanupStatus[]),
      jobType,
      frequency: form.frequency as Frequency,
      frequencyDays: form.frequencyDays,
      frequencyDayOfMonth: form.frequencyDayOfMonth,
      executionHour: form.executionHour,
      dryRunEnabled: false as const,
      status: "active" as const,
      lastRun: undefined,
    };

    if (jobType === "org-membership-cleanup") {
      onSave({
        ...base,
        organizationIds: form.organizationIds,
        includeAllOrgs: form.includeAllOrgs,
        userStatusFilter: form.userStatusFilter,
        gracePeriodDays: form.gracePeriodDays,
        orgMembershipBehavior: form.orgBehavior,
      });
    } else if (jobType === "access-role-cleanup") {
      onSave({
        ...base,
        organizationIds: form.organizationIds,
        includeAllOrgs: form.includeAllOrgs,
        userStatusFilter: form.userStatusFilter,
        gracePeriodDays: form.gracePeriodDays,
        specificAccessRoles: form.specificAccessRoles,
        includeAllRoles: form.includeAllRoles,
        excludeRoles: form.excludeRoles,
        accessRoleBehavior: form.roleBehavior,
      });
    } else {
      onSave(base);
    }

    toast({
      title: editJob ? "Job updated" : "Job created",
      description: `"${form.name || "Unnamed cleanup job"}" has been ${
        editJob ? "updated" : "created"
      } successfully.`,
    });

    handleClose();
  };

  const handleClose = () => {
    setStepIndex(0);
    setShowErrors(false);
    setConfirmed(false);
    setForm(DEFAULT_FORM);
    onClose();
  };

  // ── Step content ────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (currentStep) {
      case "job-type":
        return (
          <StepJobType
            selected={form.jobType}
            onChange={(type) => patch({ jobType: type })}
            showError={showErrors}
          />
        );
      case "user-status":
        return (
          <Step1StatusSelection
            selected={form.statuses}
            onChange={(statuses) => patch({ statuses })}
            showError={showErrors}
          />
        );
      case "org-scope":
        return (
          <StepOrgScope
            jobType={form.jobType as JobType}
            organizationIds={form.organizationIds}
            includeAllOrgs={form.includeAllOrgs}
            userStatusFilter={form.userStatusFilter}
            specificAccessRoles={form.specificAccessRoles}
            includeAllRoles={form.includeAllRoles}
            excludeRoles={form.excludeRoles}
            onChange={patch}
            showErrors={showErrors}
          />
        );
      case "grace-period":
        return (
          <StepGracePeriod
            gracePeriodDays={form.gracePeriodDays}
            onChange={(days) => patch({ gracePeriodDays: days })}
            showErrors={showErrors}
          />
        );
      case "frequency":
        return (
          <Step2Frequency
            frequency={form.frequency}
            frequencyDays={form.frequencyDays}
            frequencyDayOfMonth={form.frequencyDayOfMonth}
            onChange={(p) => patch(p)}
            errors={frequencyErrors}
            showErrors={showErrors}
          />
        );
      case "time-window":
        return (
          <Step3TimeWindow
            executionHour={form.executionHour}
            onChange={(hour) => patch({ executionHour: hour })}
          />
        );
      case "behavior":
        return (
          <StepBehaviorConfig
            jobType={form.jobType as "org-membership-cleanup" | "access-role-cleanup"}
            orgBehavior={form.orgBehavior}
            roleBehavior={form.roleBehavior}
            onChange={patch}
          />
        );
      case "review":
        return (
          <Step5Review
            form={form}
            confirmed={confirmed}
            onConfirmChange={setConfirmed}
            showError={showErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-bluegrey-900">
            {editJob ? "Edit cleanup job" : "Create cleanup job"}
          </DialogTitle>
        </DialogHeader>

        {/* Step progress indicator */}
        <div className="flex items-center gap-1 mb-4">
          {sequence.map((step, i) => {
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isDone
                      ? "bg-green-500 text-white"
                      : "bg-bluegrey-200 text-bluegrey-500"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                {i < sequence.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${isDone ? "bg-green-400" : "bg-bluegrey-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs font-medium text-bluegrey-500 uppercase tracking-wide mb-4">
          Step {stepIndex + 1} — {STEP_LABELS[currentStep]}
        </p>

        {/* Job name field — shown only on first step */}
        {stepIndex === 0 && (
          <div className="mb-4 space-y-1">
            <label className="block text-sm font-medium text-bluegrey-700">Job name</label>
            <input
              type="text"
              placeholder="e.g. Nightly Expired Invitation Cleanup"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="w-full border border-bluegrey-300 rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        )}

        {/* Step content */}
        <div className="min-h-[260px]">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-bluegrey-200 mt-6">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {isLastStep ? (editJob ? "Save changes" : "Create job") : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
