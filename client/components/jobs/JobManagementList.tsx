import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  JOB_TYPE_LABELS,
  MOCK_ACCESS_ROLE_OPTIONS,
  MOCK_ORGANIZATIONS,
  formatHour,
} from "@/lib/jobsMockData";
import CleanupJobWizard from "./CleanupJobWizard";

interface Props {
  jobs: CleanupJob[];
  onJobsChange: (jobs: CleanupJob[]) => void;
}

function JobStatusBadge({ status }: { status: CleanupJob["status"] }) {
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

function JobTypeBadge({ jobType }: { jobType: string }) {
  const cls =
    jobType === "org-membership-cleanup"
      ? "bg-purple-100 text-purple-800"
      : jobType === "access-role-cleanup"
      ? "bg-teal-100 text-teal-800"
      : "bg-blue-100 text-blue-800";
  const label = JOB_TYPE_LABELS[jobType as keyof typeof JOB_TYPE_LABELS] ?? jobType;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

function JobScopeTags({ job }: { job: CleanupJob }) {
  const jobType = job.jobType ?? "user-status-cleanup";

  if (jobType === "user-status-cleanup") {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {job.statuses.map((s) => (
          <span
            key={s}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 whitespace-nowrap"
          >
            {CLEANUP_STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    );
  }

  if (jobType === "org-membership-cleanup") {
    const orgIds = job.organizationIds ?? [];
    if (job.includeAllOrgs) {
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 whitespace-nowrap">
            All organizations
          </span>
        </div>
      );
    }
    const orgNames = MOCK_ORGANIZATIONS.filter((o) => orgIds.includes(o.id)).map((o) => o.name);
    const shown = orgNames.slice(0, 2);
    const remaining = orgNames.length - shown.length;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {shown.map((name) => (
          <span
            key={name}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 whitespace-nowrap"
          >
            {name}
          </span>
        ))}
        {remaining > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-500">
            +{remaining} more
          </span>
        )}
      </div>
    );
  }

  if (jobType === "access-role-cleanup") {
    if (job.includeAllRoles) {
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 whitespace-nowrap">
            All roles
          </span>
        </div>
      );
    }
    const roleIds = job.specificAccessRoles ?? [];
    const roleNames = MOCK_ACCESS_ROLE_OPTIONS.filter((r) => roleIds.includes(r.id)).map(
      (r) => r.name
    );
    const shown = roleNames.slice(0, 2);
    const remaining = roleNames.length - shown.length;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {shown.map((name) => (
          <span
            key={name}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 whitespace-nowrap"
          >
            {name}
          </span>
        ))}
        {remaining > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-500">
            +{remaining} more
          </span>
        )}
      </div>
    );
  }

  return null;
}

export default function JobManagementList({ jobs, onJobsChange }: Props) {
  const { toast } = useToast();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editJob, setEditJob] = useState<CleanupJob | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CleanupJob | null>(null);

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
          j.id === editJob.id ? { ...editJob, ...jobData, nextRun: nextRun.toISOString() } : j
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
      description: `"${job.name}" has been ${
        job.status === "active" ? "disabled" : "re-enabled"
      }.`,
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
        <div className="rounded-lg border border-bluegrey-200 overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bluegrey-50 border-b border-bluegrey-200">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500">
                  Job name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 whitespace-nowrap">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 whitespace-nowrap">
                  Frequency
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 whitespace-nowrap">
                  Time (CET)
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 whitespace-nowrap">
                  Last run
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 whitespace-nowrap">
                  Next run
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-bluegrey-100 last:border-0 hover:bg-bluegrey-25 transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="text-sm font-medium text-bluegrey-900 leading-tight">
                      {job.name}
                    </div>
                    <JobScopeTags job={job} />
                    <div className="mt-1">
                      <JobStatusBadge status={job.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <JobTypeBadge jobType={job.jobType ?? "user-status-cleanup"} />
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-bluegrey-700 whitespace-nowrap">
                    {FREQUENCY_LABELS[job.frequency]}
                    {job.frequencyDays && job.frequencyDays.length > 0 && (
                      <div className="text-xs text-bluegrey-400">
                        {job.frequencyDays.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-bluegrey-700 whitespace-nowrap">
                    {formatHour(job.executionHour)}
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-bluegrey-500 whitespace-nowrap">
                    {formatDate(job.lastRun)}
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-bluegrey-500 whitespace-nowrap">
                    {formatDate(job.nextRun)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 h-7"
                        onClick={() => handleEdit(job)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 h-7"
                        onClick={() => handleToggleStatus(job)}
                      >
                        {job.status === "active" ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteTarget(job)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}
