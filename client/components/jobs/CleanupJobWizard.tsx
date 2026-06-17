import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  CleanupJob,
  CleanupStatus,
  Frequency,
  RetryConfig,
  ALLOWED_HOURS,
} from "@/lib/jobsMockData";
import Step1StatusSelection from "./wizard/Step1StatusSelection";
import Step2Frequency from "./wizard/Step2Frequency";
import Step3TimeWindow from "./wizard/Step3TimeWindow";
import Step4DryRunRetry from "./wizard/Step4DryRunRetry";
import Step5Review from "./wizard/Step5Review";

export interface CleanupJobFormState {
  name: string;
  statuses: CleanupStatus[];
  frequency: Frequency;
  frequencyDays: string[];
  frequencyDayOfMonth: number;
  executionHour: number;
  dryRunEnabled: boolean;
  retry: RetryConfig;
}

const DEFAULT_FORM: CleanupJobFormState = {
  name: "",
  statuses: [],
  frequency: "daily",
  frequencyDays: ["Monday"],
  frequencyDayOfMonth: 1,
  executionHour: 23,
  dryRunEnabled: true,
  retry: {
    maxAttempts: 3,
    delaySeconds: 300,
    retryOn: ["network", "db-timeout", "transient"],
  },
};

const STEP_TITLES = [
  "Step 1 — User statuses",
  "Step 2 — Execution frequency",
  "Step 3 — Time window",
  "Step 4 — Dry-run & retry",
  "Step 5 — Review & confirm",
];

interface Props {
  open: boolean;
  editJob?: CleanupJob | null;
  onClose: () => void;
  onSave: (job: Omit<CleanupJob, "id" | "createdBy" | "createdAt" | "nextRun">) => void;
}

export default function CleanupJobWizard({ open, editJob, onClose, onSave }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const buildInitialForm = (): CleanupJobFormState => {
    if (!editJob) return DEFAULT_FORM;
    return {
      name: editJob.name,
      statuses: editJob.statuses,
      frequency: editJob.frequency,
      frequencyDays: editJob.frequencyDays ?? ["Monday"],
      frequencyDayOfMonth: editJob.frequencyDayOfMonth ?? 1,
      executionHour: editJob.executionHour,
      dryRunEnabled: editJob.dryRunEnabled,
      retry: { ...editJob.retry },
    };
  };

  const [form, setForm] = useState<CleanupJobFormState>(buildInitialForm);

  const patch = (updates: Partial<CleanupJobFormState>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  // ── Validation ──────────────────────────────────────────────────────────────
  const step2Errors = (() => {
    const errs: { twiceWeekly?: string; monthly?: string } = {};
    if (
      form.frequency === "twice-weekly" &&
      form.frequencyDays[0] === form.frequencyDays[1]
    ) {
      errs.twiceWeekly = "The two days must be different.";
    }
    return errs;
  })();

  const canAdvance = (): boolean => {
    if (step === 1) return form.statuses.length > 0;
    if (step === 2) return Object.keys(step2Errors).length === 0;
    if (step === 4)
      return form.retry.maxAttempts >= 1 && form.retry.maxAttempts <= 5;
    if (step === 5) return confirmed;
    return true;
  };

  const handleNext = () => {
    setShowErrors(true);
    if (!canAdvance()) return;
    setShowErrors(false);
    if (step < 5) setStep((s) => s + 1);
    else handleSave();
  };

  const handleBack = () => {
    setShowErrors(false);
    setStep((s) => s - 1);
  };

  const handleSave = () => {
    const nextRun = new Date();
    nextRun.setHours(form.executionHour, 0, 0, 0);
    if (nextRun <= new Date()) nextRun.setDate(nextRun.getDate() + 1);

    onSave({
      name: form.name || "Unnamed cleanup job",
      statuses: form.statuses,
      frequency: form.frequency,
      frequencyDays: form.frequencyDays,
      frequencyDayOfMonth: form.frequencyDayOfMonth,
      executionHour: form.executionHour,
      dryRunEnabled: form.dryRunEnabled,
      retry: form.retry,
      status: "active",
      lastRun: undefined,
    });

    toast({
      title: editJob ? "Job updated" : "Job created",
      description: `"${form.name || "Unnamed cleanup job"}" has been ${editJob ? "updated" : "created"} successfully.`,
    });

    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setShowErrors(false);
    setConfirmed(false);
    setForm(DEFAULT_FORM);
    onClose();
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
        <div className="flex items-center gap-1 mb-6">
          {STEP_TITLES.map((_, i) => {
            const num = i + 1;
            const isActive = num === step;
            const isDone = num < step;
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
                {i < STEP_TITLES.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${isDone ? "bg-green-400" : "bg-bluegrey-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs font-medium text-bluegrey-500 uppercase tracking-wide mb-4">
          {STEP_TITLES[step - 1]}
        </p>

        {/* Job name (visible on all steps) */}
        {step === 1 && (
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
        <div className="min-h-[260px]">
          {step === 1 && (
            <Step1StatusSelection
              selected={form.statuses}
              onChange={(statuses) => patch({ statuses })}
              showError={showErrors}
            />
          )}
          {step === 2 && (
            <Step2Frequency
              frequency={form.frequency}
              frequencyDays={form.frequencyDays}
              frequencyDayOfMonth={form.frequencyDayOfMonth}
              onChange={(p) => patch(p)}
              errors={step2Errors}
              showErrors={showErrors}
            />
          )}
          {step === 3 && (
            <Step3TimeWindow
              executionHour={form.executionHour}
              onChange={(hour) => patch({ executionHour: hour })}
            />
          )}
          {step === 4 && (
            <Step4DryRunRetry
              dryRunEnabled={form.dryRunEnabled}
              retry={form.retry}
              onDryRunChange={(enabled) => patch({ dryRunEnabled: enabled })}
              onRetryChange={(p) => patch({ retry: { ...form.retry, ...p } })}
              showErrors={showErrors}
            />
          )}
          {step === 5 && (
            <Step5Review
              name={form.name}
              statuses={form.statuses}
              frequency={form.frequency}
              frequencyDays={form.frequencyDays}
              frequencyDayOfMonth={form.frequencyDayOfMonth}
              executionHour={form.executionHour}
              dryRunEnabled={form.dryRunEnabled}
              retry={form.retry}
              confirmed={confirmed}
              onConfirmChange={setConfirmed}
              showError={showErrors}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-bluegrey-200 mt-6">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {step === 5 ? (editJob ? "Save changes" : "Create job") : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
