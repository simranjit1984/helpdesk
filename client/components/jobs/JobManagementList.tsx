import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  CleanupJob,
  CLEANUP_STATUS_LABELS,
  FREQUENCY_LABELS,
  formatHour,
} from "@/lib/jobsMockData";
import CleanupJobWizard from "./CleanupJobWizard";
import DryRunResultsModal from "./DryRunResultsModal";

interface Props {
  jobs: CleanupJob[];
  onJobsChange: (jobs: CleanupJob[]) => void;
  onViewLogs: (jobId: string) => void;
}

function StatusBadge({ status }: { status: CleanupJob["status"] }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        status === "active"
          ? "bg-green-100 text-green-800"
          : "bg-bluegrey-100 text-bluegrey-600"
      }`}
    >
      {status === "active" ? "Active" : "Disabled"}
    </span>
  );
}

export default function JobManagementList({ jobs, onJobsChange, onViewLogs }: Props) {
  const { toast } = useToast();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editJob, setEditJob] = useState<CleanupJob | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CleanupJob | null>(null);
  const [dryRunJob, setDryRunJob] = useState<CleanupJob | null>(null);

  const handleCreate = () => {
    setEditJob(null);
    setWizardOpen(true);
  };

  const handleEdit = (job: CleanupJob) => {
    setEditJob(job);
    setWizardOpen(true);
  };

  const handleWizardSave = (
    jobData: Omit<CleanupJob, "id" | "createdBy" | "createdAt" | "nextRun">
  ) => {
    const nextRun = new Date();
    nextRun.setHours(jobData.executionHour, 0, 0, 0);
    if (nextRun <= new Date()) nextRun.setDate(nextRun.getDate() + 1);

    if (editJob) {
      onJobsChange(
        jobs.map((j) =>
          j.id === editJob.id
            ? {
                ...editJob,
                ...jobData,
                nextRun: nextRun.toISOString(),
              }
            : j
        )
      );
    } else {
      const newJob: CleanupJob = {
        ...jobData,
        id: `job-${Date.now()}`,
        createdBy: "admin@example.com",
        createdAt: new Date().toISOString(),
        nextRun: nextRun.toISOString(),
      };
      onJobsChange([...jobs, newJob]);
    }
  };

  const handleToggleStatus = (job: CleanupJob) => {
    onJobsChange(
      jobs.map((j) =>
        j.id === job.id ? { ...j, status: j.status === "active" ? "disabled" : "active" } : j
      )
    );
    toast({
      title: `Job ${job.status === "active" ? "disabled" : "enabled"}`,
      description: `"${job.name}" has been ${job.status === "active" ? "disabled" : "re-enabled"}.`,
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    onJobsChange(jobs.filter((j) => j.id !== deleteTarget.id));
    toast({ title: "Job deleted", description: `"${deleteTarget.name}" has been removed.` });
    setDeleteTarget(null);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-bluegrey-900">Active cleanup jobs</h2>
          <p className="text-sm text-bluegrey-500">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <Button onClick={handleCreate}>+ New job</Button>
      </div>

      {/* Table */}
      {jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-bluegrey-300 bg-bluegrey-50 py-16 text-center">
          <div className="text-bluegrey-400 text-sm mb-3">No cleanup jobs configured yet.</div>
          <Button onClick={handleCreate}>Create your first cleanup job</Button>
        </div>
      ) : (
        <div className="rounded-lg border border-bluegrey-200 overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[2fr_1fr_80px_80px_80px_1fr_1fr_auto] gap-2 bg-bluegrey-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 border-b border-bluegrey-200">
            <span>Job name</span>
            <span>Frequency</span>
            <span>Time</span>
            <span>Dry-run</span>
            <span>Retry</span>
            <span>Last run</span>
            <span>Next run</span>
            <span>Actions</span>
          </div>

          {/* Data rows */}
          {jobs.map((job) => (
            <div
              key={job.id}
              className="grid grid-cols-[2fr_1fr_80px_80px_80px_1fr_1fr_auto] gap-2 px-4 py-3 border-b border-bluegrey-100 last:border-0 items-center hover:bg-bluegrey-25 transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-bluegrey-900 leading-tight">
                  {job.name}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.statuses.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700"
                    >
                      {CLEANUP_STATUS_LABELS[s]}
                    </span>
                  ))}
                  {job.statuses.length > 2 && (
                    <span className="text-[10px] text-bluegrey-400">
                      +{job.statuses.length - 2} more
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <StatusBadge status={job.status} />
                </div>
              </div>

              <span className="text-sm text-bluegrey-700">{FREQUENCY_LABELS[job.frequency]}</span>
              <span className="text-sm text-bluegrey-700">{formatHour(job.executionHour)} CET</span>
              <span className="text-sm text-bluegrey-700">{job.dryRunEnabled ? "On" : "Off"}</span>
              <span className="text-sm text-bluegrey-700">{job.retry.maxAttempts}x</span>
              <span className="text-sm text-bluegrey-500">{formatDate(job.lastRun)}</span>
              <span className="text-sm text-bluegrey-500">{formatDate(job.nextRun)}</span>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs px-2"
                  onClick={() => handleEdit(job)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs px-2"
                  onClick={() => handleToggleStatus(job)}
                >
                  {job.status === "active" ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs px-2"
                  onClick={() => onViewLogs(job.id)}
                >
                  Logs
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs px-2"
                  onClick={() => setDryRunJob(job)}
                >
                  Dry-run
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteTarget(job)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wizard */}
      <CleanupJobWizard
        open={wizardOpen}
        editJob={editJob}
        onClose={() => setWizardOpen(false)}
        onSave={handleWizardSave}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete cleanup job</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-bluegrey-600">
            Are you sure you want to delete{" "}
            <span className="font-medium text-bluegrey-900">"{deleteTarget?.name}"</span>? This
            action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dry-run results modal */}
      <DryRunResultsModal
        open={!!dryRunJob}
        job={dryRunJob}
        onClose={() => setDryRunJob(null)}
        onApprove={() => {
          toast({ title: "Dry-run approved", description: "Job execution has been approved." });
        }}
        onEdit={() => {
          if (dryRunJob) {
            setEditJob(dryRunJob);
            setWizardOpen(true);
          }
          setDryRunJob(null);
        }}
      />
    </div>
  );
}
