import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, RefreshCw, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  getBulkAccessJobs, JOB_STATUS_LABELS, JOB_STATUS_COLORS, OPERATION_LABELS, OPERATION_COLORS,
  type BulkAccessJob, type BulkJobStatus, type BulkAccessOperation,
} from "@/lib/bulkAccessRoleMockData";

function StatusBadge({ status }: { status: BulkJobStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${JOB_STATUS_COLORS[status]}`}>
      {status === "running" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />}
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

function OperationBadge({ op }: { op: BulkAccessOperation }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${OPERATION_COLORS[op]}`}>
      {OPERATION_LABELS[op]}
    </span>
  );
}

function ProgressBar({ processed, total }: { processed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((processed / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-bluegrey-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-bluegrey-500">{pct}%</span>
    </div>
  );
}

export default function BulkAccessRoleJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<BulkAccessJob[]>(getBulkAccessJobs());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BulkJobStatus | "all">("all");
  const [operationFilter, setOperationFilter] = useState<BulkAccessOperation | "all">("all");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const hasRunning = jobs.some((j) => j.status === "running" || j.status === "queued");
    if (!hasRunning) return;
    const t = setInterval(() => { setJobs(getBulkAccessJobs()); setLastRefresh(new Date()); }, 10_000);
    return () => clearInterval(t);
  }, [jobs]);

  const handleRefresh = () => { setJobs(getBulkAccessJobs()); setLastRefresh(new Date()); };

  const filtered = jobs.filter((j) => {
    if (statusFilter !== "all" && j.status !== statusFilter) return false;
    if (operationFilter !== "all" && j.operation !== operationFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return j.id.toLowerCase().includes(q) || j.organizations.some((o) => o.toLowerCase().includes(q)) || j.createdBy.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString() : "—";

  return (
    <Layout>
      <div className="min-h-screen bg-bluegrey-25">
        <div className="sticky top-16 bg-white border-b border-bluegrey-100 z-20 px-6 lg:px-8 py-4">
          <button type="button" onClick={() => navigate("/access-roles")} className="flex items-center gap-1.5 text-sm text-bluegrey-500 hover:text-bluegrey-900 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />Back to Access Roles
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-bluegrey-900">Bulk Access Assignment Jobs</h1>
              <p className="text-xs text-bluegrey-400 mt-0.5">Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Refresh</Button>
              <Button size="sm" onClick={() => navigate("/bulk-access-role-assignment")} className="gap-1.5"><Plus className="w-3.5 h-3.5" />New assignment</Button>
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-8 py-6 space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400" />
              <input type="text" placeholder="Search jobs…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 border border-bluegrey-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-56" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BulkJobStatus | "all")}
              className="border border-bluegrey-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
              <option value="all">All statuses</option>
              {(Object.keys(JOB_STATUS_LABELS) as BulkJobStatus[]).map((s) => <option key={s} value={s}>{JOB_STATUS_LABELS[s]}</option>)}
            </select>
            <select value={operationFilter} onChange={(e) => setOperationFilter(e.target.value as BulkAccessOperation | "all")}
              className="border border-bluegrey-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
              <option value="all">All operations</option>
              {(Object.keys(OPERATION_LABELS) as BulkAccessOperation[]).map((op) => <option key={op} value={op}>{OPERATION_LABELS[op]}</option>)}
            </select>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-bluegrey-300 bg-white py-16 text-center">
              <p className="text-sm text-bluegrey-400">No jobs found.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-bluegrey-200 overflow-hidden overflow-x-auto bg-white">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-bluegrey-50 border-b border-bluegrey-200">
                    {["Job ID", "Operation", "Status", "Organizations", "Created date", "Total", "Success", "Failed", "Progress", "Completed"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => (
                    <tr key={job.id} onClick={() => navigate(`/bulk-access-role-jobs/${job.id}`)}
                      className="border-b border-bluegrey-100 last:border-0 hover:bg-bluegrey-25 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">{job.id}</td>
                      <td className="px-4 py-3"><OperationBadge op={job.operation} /></td>
                      <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                      <td className="px-4 py-3 text-bluegrey-700 text-xs">{job.organizations.join(", ")}</td>
                      <td className="px-4 py-3 text-bluegrey-500 whitespace-nowrap text-xs">{formatDate(job.createdDate)}</td>
                      <td className="px-4 py-3 text-right text-bluegrey-800">{job.totalUsers}</td>
                      <td className="px-4 py-3 text-right text-green-700 font-medium">{job.successfulUsers}</td>
                      <td className="px-4 py-3 text-right"><span className={job.failedUsers > 0 ? "text-red-600 font-medium" : "text-bluegrey-400"}>{job.failedUsers}</span></td>
                      <td className="px-4 py-3"><ProgressBar processed={job.processedUsers} total={job.totalUsers} /></td>
                      <td className="px-4 py-3 text-bluegrey-500 whitespace-nowrap text-xs">{formatDate(job.completedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-bluegrey-400">{filtered.length} job{filtered.length !== 1 ? "s" : ""} shown</p>
        </div>
      </div>
    </Layout>
  );
}
