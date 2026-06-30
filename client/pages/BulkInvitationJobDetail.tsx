import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Search } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  getBulkJobById,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  type BulkInvitedUser,
} from "@/lib/bulkInviteMockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 py-2.5 border-b border-bluegrey-100 last:border-0">
      <span className="text-sm font-medium text-bluegrey-500">{label}</span>
      <span className="text-sm text-bluegrey-900">{value}</span>
    </div>
  );
}

function formatDate(iso?: string) {
  return iso ? new Date(iso).toLocaleString() : "—";
}

function downloadFailedUsers(users: BulkInvitedUser[], jobId: string) {
  const failed = users.filter((u) => u.processingResult === "failed");
  if (failed.length === 0) return;
  const header = "Email,First Name,Last Name,Error Message\n";
  const rows = failed
    .map((u) => `"${u.email}","${u.firstName}","${u.lastName}","${u.errorMessage ?? ""}"`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${jobId}-failed-users.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Status badges ────────────────────────────────────────────────────────────

function JobStatusBadge({ status }: { status: string }) {
  const colors = JOB_STATUS_COLORS[status as keyof typeof JOB_STATUS_COLORS] ?? "bg-bluegrey-100 text-bluegrey-600";
  const label = JOB_STATUS_LABELS[status as keyof typeof JOB_STATUS_LABELS] ?? status;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors}`}>
      {label}
    </span>
  );
}

function ResultBadge({ result }: { result: string }) {
  if (result === "success") return <span className="text-green-700 text-xs font-medium">✓ Success</span>;
  if (result === "failed")  return <span className="text-red-600 text-xs font-medium">✗ Failed</span>;
  return <span className="text-bluegrey-400 text-xs">Pending</span>;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ processed, total }: { processed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((processed / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-bluegrey-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-bluegrey-600 whitespace-nowrap">{processed}/{total} ({pct}%)</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BulkInvitationJobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const job = getBulkJobById(jobId ?? "");
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<"all" | "success" | "failed" | "pending">("all");

  if (!job) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-bluegrey-500">Job not found.</p>
        </div>
      </Layout>
    );
  }

  const filteredUsers = job.users.filter((u) => {
    if (resultFilter !== "all" && u.processingResult !== resultFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.email.toLowerCase().includes(q) || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q);
    }
    return true;
  });

  const failedCount = job.users.filter((u) => u.processingResult === "failed").length;

  return (
    <Layout>
      <div className="min-h-screen bg-bluegrey-25">
        {/* Header */}
        <div className="sticky top-16 bg-white border-b border-bluegrey-100 z-20 px-6 lg:px-8 py-4">
          <button
            type="button"
            onClick={() => navigate("/bulk-invite-jobs")}
            className="flex items-center gap-1.5 text-sm text-bluegrey-500 hover:text-bluegrey-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bulk Invitation Jobs
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-bluegrey-900 font-mono">{job.id}</h1>
              <div className="flex items-center gap-2 mt-1">
                <JobStatusBadge status={job.status} />
                <span className="text-xs text-bluegrey-400">{job.organization}</span>
              </div>
            </div>
            {failedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadFailedUsers(job.users, job.id)}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download failed users ({failedCount})
              </Button>
            )}
          </div>
        </div>

        <div className="px-6 lg:px-8 py-8 space-y-8">
          {/* Job information */}
          <div className="bg-white rounded-lg border border-bluegrey-200">
            <div className="px-5 py-3 bg-bluegrey-50 border-b border-bluegrey-200 rounded-t-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-bluegrey-500">Job information</p>
            </div>
            <div className="px-5">
              <InfoRow label="Job ID"          value={<span className="font-mono">{job.id}</span>} />
              <InfoRow label="Status"          value={<JobStatusBadge status={job.status} />} />
              <InfoRow label="Organization"    value={job.organization} />
              <InfoRow label="Created by"      value={job.createdBy} />
              <InfoRow label="Created"         value={formatDate(job.createdDate)} />
              <InfoRow label="Started"         value={formatDate(job.startedDate)} />
              <InfoRow label="Completed"       value={formatDate(job.completedDate)} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total users",      value: job.totalUsers,      color: "text-bluegrey-900" },
              { label: "Processed",        value: job.processedUsers,  color: "text-blue-700"     },
              { label: "Successful",       value: job.successfulUsers, color: "text-green-700"    },
              { label: "Failed",           value: job.failedUsers,     color: job.failedUsers > 0 ? "text-red-600" : "text-bluegrey-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-lg border border-bluegrey-200 px-4 py-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-bluegrey-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="bg-white rounded-lg border border-bluegrey-200 px-5 py-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-bluegrey-500">Progress</p>
            <ProgressBar processed={job.processedUsers} total={job.totalUsers} />
          </div>

          {/* Roles */}
          {(job.selectedAccessRoles.length > 0 || job.selectedAdminRoles.length > 0) && (
            <div className="bg-white rounded-lg border border-bluegrey-200 px-5 py-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-bluegrey-500 mb-1">Assigned roles</p>
              {job.selectedAccessRoles.length > 0 && (
                <div>
                  <p className="text-xs text-bluegrey-500 mb-1">Access roles</p>
                  <div className="flex flex-wrap gap-1">
                    {job.selectedAccessRoles.map((r) => (
                      <span key={r} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {job.selectedAdminRoles.length > 0 && (
                <div>
                  <p className="text-xs text-bluegrey-500 mb-1">Admin roles</p>
                  <div className="flex flex-wrap gap-1">
                    {job.selectedAdminRoles.map((r) => (
                      <span key={r} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users table */}
          {job.users.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-bluegrey-900">Invited users</h2>
              </div>
              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
                  <input
                    type="text"
                    placeholder="Search users…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-52"
                  />
                </div>
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value as typeof resultFilter)}
                  className="border border-bluegrey-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                >
                  <option value="all">All results</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              {/* Table */}
              <div className="rounded-lg border border-bluegrey-200 overflow-hidden overflow-x-auto bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-bluegrey-50 border-b border-bluegrey-200">
                      {["Email", "First name", "Last name", "Result", "Error"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-bluegrey-400 italic">
                          No users match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, i) => (
                        <tr key={i} className="border-b border-bluegrey-100 last:border-0 hover:bg-bluegrey-25 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-bluegrey-800">{u.email}</td>
                          <td className="px-4 py-3 text-bluegrey-700">{u.firstName || "—"}</td>
                          <td className="px-4 py-3 text-bluegrey-700">{u.lastName || "—"}</td>
                          <td className="px-4 py-3"><ResultBadge result={u.processingResult} /></td>
                          <td className="px-4 py-3 text-xs text-red-600">{u.errorMessage ?? "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-bluegrey-400">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} shown</p>
            </div>
          )}

          {job.users.length === 0 && (
            <div className="bg-white rounded-lg border border-dashed border-bluegrey-300 py-10 text-center">
              <p className="text-sm text-bluegrey-400">User-level data will appear once the job starts processing.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
