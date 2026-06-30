import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Search, ChevronDown, ChevronRight, Building2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  getBulkAccessJobById, JOB_STATUS_LABELS, JOB_STATUS_COLORS, OPERATION_LABELS, OPERATION_COLORS,
  ACTION_LABELS, ACTION_COLORS, type BulkAccessUser, type UserAction, type UserResult,
} from "@/lib/bulkAccessRoleMockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 py-2.5 border-b border-bluegrey-100 last:border-0">
      <span className="text-sm font-medium text-bluegrey-500">{label}</span>
      <span className="text-sm text-bluegrey-900">{value}</span>
    </div>
  );
}

function formatDate(iso?: string) { return iso ? new Date(iso).toLocaleString() : "—"; }

function StatusBadge({ status }: { status: string }) {
  const colors = JOB_STATUS_COLORS[status as keyof typeof JOB_STATUS_COLORS] ?? "bg-bluegrey-100 text-bluegrey-600";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors}`}>{JOB_STATUS_LABELS[status as keyof typeof JOB_STATUS_LABELS] ?? status}</span>;
}

function OperationBadge({ op }: { op: string }) {
  const colors = OPERATION_COLORS[op as keyof typeof OPERATION_COLORS] ?? "bg-bluegrey-100 text-bluegrey-600";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors}`}>{OPERATION_LABELS[op as keyof typeof OPERATION_LABELS] ?? op}</span>;
}

function ResultBadge({ result, action }: { result: UserResult; action: UserAction }) {
  if (result === "success")   return <span className={`text-xs font-medium ${ACTION_COLORS[action]}`}>{ACTION_LABELS[action]}</span>;
  if (result === "no-change") return <span className="text-xs text-bluegrey-400">No changes</span>;
  if (result === "failed")    return <span className="text-xs text-red-600 font-medium">✗ Failed</span>;
  return <span className="text-xs text-bluegrey-400">Pending</span>;
}

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

// ─── Org user group ────────────────────────────────────────────────────────────

interface OrgGroup { orgId: string; orgName: string; users: BulkAccessUser[]; }

function OrgUserGroup({ group }: { group: OrgGroup }) {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = group.users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q);
  });

  const successCount = group.users.filter((u) => u.result === "success").length;
  const failedCount  = group.users.filter((u) => u.result === "failed").length;

  return (
    <div className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
      <button type="button" onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-bluegrey-50 border-b border-bluegrey-200 hover:bg-bluegrey-100 transition-colors">
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-bluegrey-500" />
          <span className="font-semibold text-bluegrey-900">{group.orgName}</span>
          <span className="text-xs text-bluegrey-400">{group.users.length} user{group.users.length !== 1 ? "s" : ""}</span>
          {successCount > 0 && <span className="text-xs text-green-700 font-medium">{successCount} ✓</span>}
          {failedCount > 0 && <span className="text-xs text-red-600 font-medium">{failedCount} ✗</span>}
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-bluegrey-400" /> : <ChevronRight className="w-4 h-4 text-bluegrey-400" />}
      </button>
      {expanded && (
        <div>
          <div className="px-4 py-3 border-b border-bluegrey-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bluegrey-400" />
              <input type="text" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-bluegrey-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 w-44" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-bluegrey-100">
                  {["Display name", "Email", "Action", "Assigned roles", "Error"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-bluegrey-400 italic">No users match.</td></tr>
                ) : (
                  filtered.map((u, i) => (
                    <tr key={i} className="border-b border-bluegrey-100 last:border-0 hover:bg-bluegrey-25 transition-colors">
                      <td className="px-4 py-3 font-medium text-bluegrey-900 whitespace-nowrap">{u.displayName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-bluegrey-600">{u.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><ResultBadge result={u.result} action={u.action} /></td>
                      <td className="px-4 py-3">
                        {u.assignedRoles.length > 0
                          ? <div className="flex flex-wrap gap-1">{u.assignedRoles.map((r) => <span key={r} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{r}</span>)}</div>
                          : <span className="text-xs text-bluegrey-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-red-600">{u.errorMessage ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-bluegrey-100"><p className="text-xs text-bluegrey-400">{filtered.length} user{filtered.length !== 1 ? "s" : ""} shown</p></div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BulkAccessRoleJobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const job = getBulkAccessJobById(jobId ?? "");

  if (!job) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-bluegrey-500">Job not found.</p>
      </div>
    </Layout>
  );

  const failedUsers = job.users.filter((u) => u.result === "failed");
  const downloadFailed = () => {
    if (!failedUsers.length) return;
    const csv = "Email,Display Name,Organization,Error\n" + failedUsers.map((u) => `"${u.email}","${u.displayName}","${u.organizationName}","${u.errorMessage ?? ""}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${job.id}-errors.csv`; a.click();
  };

  // Group users by org
  const orgGroupMap = new Map<string, OrgGroup>();
  job.users.forEach((u) => {
    const key = u.organizationId;
    if (!orgGroupMap.has(key)) orgGroupMap.set(key, { orgId: key, orgName: u.organizationName, users: [] });
    orgGroupMap.get(key)!.users.push(u);
  });
  const orgGroups = Array.from(orgGroupMap.values());
  const isMultiOrg = orgGroups.length > 1;

  return (
    <Layout>
      <div className="min-h-screen bg-bluegrey-25">
        <div className="sticky top-16 bg-white border-b border-bluegrey-100 z-20 px-6 lg:px-8 py-4">
          <button type="button" onClick={() => navigate("/bulk-access-role-jobs")} className="flex items-center gap-1.5 text-sm text-bluegrey-500 hover:text-bluegrey-900 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />Back to Bulk Access Assignment Jobs
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-bluegrey-900 font-mono">{job.id}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={job.status} />
                <OperationBadge op={job.operation} />
                <span className="text-xs text-bluegrey-400">{job.organizations.join(", ")}</span>
              </div>
            </div>
            {failedUsers.length > 0 && (
              <Button variant="outline" size="sm" onClick={downloadFailed} className="gap-1.5">
                <Download className="w-3.5 h-3.5" />Download errors ({failedUsers.length})
              </Button>
            )}
          </div>
        </div>

        <div className="px-6 lg:px-8 py-8 space-y-8">
          {/* Job info */}
          <div className="bg-white rounded-lg border border-bluegrey-200">
            <div className="px-5 py-3 bg-bluegrey-50 border-b border-bluegrey-200 rounded-t-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-bluegrey-500">Job information</p>
            </div>
            <div className="px-5">
              <InfoRow label="Job ID" value={<span className="font-mono">{job.id}</span>} />
              <InfoRow label="Operation" value={<OperationBadge op={job.operation} />} />
              <InfoRow label="Status" value={<StatusBadge status={job.status} />} />
              <InfoRow label="Scope" value={job.scope === "single-org" ? "Single Organization" : "Multiple Organizations"} />
              <InfoRow label="Organizations" value={
                <div className="flex flex-wrap gap-1">{job.organizations.map((o) => <span key={o} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-bluegrey-100 text-bluegrey-700">{o}</span>)}</div>
              } />
              <InfoRow label="Created" value={formatDate(job.createdDate)} />
              <InfoRow label="Started" value={formatDate(job.startedDate)} />
              <InfoRow label="Completed" value={formatDate(job.completedDate)} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",      value: job.totalUsers,       color: "text-bluegrey-900" },
              { label: "Successful", value: job.successfulUsers,  color: "text-green-700" },
              { label: "Failed",     value: job.failedUsers,      color: job.failedUsers > 0 ? "text-red-600" : "text-bluegrey-400" },
              { label: "No change",  value: job.noChangeUsers,    color: "text-bluegrey-400" },
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

          {/* Org configs */}
          {job.orgConfigs && job.orgConfigs.length > 0 && (
            <div className="bg-white rounded-lg border border-bluegrey-200 overflow-hidden">
              <div className="px-5 py-3 bg-bluegrey-50 border-b border-bluegrey-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-bluegrey-500">Role configuration</p>
              </div>
              <div className="divide-y divide-bluegrey-100">
                {job.orgConfigs.map((cfg) => (
                  <div key={cfg.orgId} className="px-5 py-3">
                    <p className="text-sm font-semibold text-bluegrey-800 mb-1">{cfg.orgName}</p>
                    <div className="flex flex-wrap gap-1">{cfg.accessRoles.map((r) => <span key={r} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{r}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users grouped by org */}
          {job.users.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-bluegrey-900">
                Processed users{isMultiOrg && <span className="ml-2 text-xs font-normal text-bluegrey-400">— grouped by organization</span>}
              </h2>
              <div className="space-y-4">
                {orgGroups.map((group) => <OrgUserGroup key={group.orgId} group={group} />)}
              </div>
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
