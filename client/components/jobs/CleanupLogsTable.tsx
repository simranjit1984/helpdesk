import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LogEntry,
  LogStatus,
  CleanupJob,
  CLEANUP_STATUS_LABELS,
} from "@/lib/jobsMockData";

interface Props {
  logs: LogEntry[];
  jobs: CleanupJob[];
  filterJobId?: string;
}

const STATUS_LABELS: Record<LogStatus, string> = {
  success: "Success",
  "partial-success": "Partial success",
  failed: "Failed",
};

function StatusBadge({ status }: { status: LogStatus }) {
  const cls =
    status === "success"
      ? "bg-green-100 text-green-800"
      : status === "partial-success"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function ExpandedDetails({ entry }: { entry: LogEntry }) {
  const d = entry.details;
  return (
    <div className="bg-bluegrey-25 border-t border-bluegrey-200 px-6 py-4 space-y-4 text-sm">
      {/* Timing */}
      <div className="flex gap-6 flex-wrap">
        <div>
          <span className="text-xs font-semibold text-bluegrey-500 uppercase">Start</span>
          <div className="text-bluegrey-800">{new Date(d.startTime).toLocaleString()}</div>
        </div>
        <div>
          <span className="text-xs font-semibold text-bluegrey-500 uppercase">End</span>
          <div className="text-bluegrey-800">{new Date(d.endTime).toLocaleString()}</div>
        </div>
        <div>
          <span className="text-xs font-semibold text-bluegrey-500 uppercase">Duration</span>
          <div className="text-bluegrey-800">{d.durationSeconds}s</div>
        </div>
      </div>

      {/* Deleted users */}
      {d.deletedUsers.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-bluegrey-500 uppercase block mb-1">
            Deleted users ({d.deletedUsers.length})
          </span>
          <div className="flex flex-wrap gap-1">
            {d.deletedUsers.map((u) => (
              <span
                key={u}
                className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs"
              >
                {u}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Failed users */}
      {d.failedUsers.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-bluegrey-500 uppercase block mb-1">
            Failed records ({d.failedUsers.length})
          </span>
          <div className="space-y-1">
            {d.failedUsers.map((f) => (
              <div key={f.id} className="flex gap-3 items-center">
                <span className="text-xs text-red-700 font-medium">{f.id}</span>
                <span className="text-xs text-bluegrey-500">— {f.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dry-run report */}
      {d.dryRunReport && (
        <div>
          <span className="text-xs font-semibold text-bluegrey-500 uppercase block mb-1">
            Dry-run report
          </span>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 space-y-1">
            <div className="text-xs text-blue-800">
              Total matched: <strong>{d.dryRunReport.totalMatched}</strong>
            </div>
            {d.dryRunReport.warnings.map((w) => (
              <div key={w} className="text-xs text-amber-700">
                ⚠ {w}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retry log */}
      {d.retryLog.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-bluegrey-500 uppercase block mb-1">
            Retry log ({d.retryLog.length} attempt{d.retryLog.length !== 1 ? "s" : ""})
          </span>
          <div className="space-y-1">
            {d.retryLog.map((r) => (
              <div key={r.attempt} className="flex gap-3 items-center text-xs">
                <span className="text-bluegrey-400">#{r.attempt}</span>
                <span className="text-bluegrey-600">{new Date(r.timestamp).toLocaleString()}</span>
                <span className="text-red-600">{r.error}</span>
                <span className={r.success ? "text-green-600" : "text-red-500"}>
                  {r.success ? "✓ Recovered" : "✗ Failed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CleanupLogsTable({ logs, jobs, filterJobId }: Props) {
  const { toast } = useToast();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<LogStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [jobFilter, setJobFilter] = useState<string>(filterJobId ?? "all");
  const [search, setSearch] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = (entry: LogEntry) => {
    const csv = [
      "id,jobId,executionDate,executionTime,status,usersDeleted,failedRecords,retriesPerformed",
      `${entry.id},${entry.jobId},${entry.executionDate},${entry.executionTime},${entry.status},${entry.usersDeleted},${entry.failedRecords},${entry.retriesPerformed}`,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cleanup-log-${entry.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `Log ${entry.id} exported as CSV.` });
  };

  const filtered = logs.filter((entry) => {
    if (statusFilter !== "all" && entry.status !== statusFilter) return false;
    if (jobFilter !== "all" && entry.jobId !== jobFilter) return false;
    if (search && !entry.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && new Date(entry.executionDate) < dateFrom) return false;
    if (dateTo && new Date(entry.executionDate) > dateTo) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900">Cleanup logs</h2>
        <p className="text-sm text-bluegrey-500">Historical execution log for all cleanup jobs.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-bluegrey-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LogStatus | "all")}
            className="border border-bluegrey-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="partial-success">Partial success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-bluegrey-500">Job</label>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="border border-bluegrey-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">All jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-bluegrey-500">From</label>
          <input
            type="date"
            value={dateFrom ? dateFrom.toISOString().slice(0, 10) : ""}
            onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : undefined)}
            className="border border-bluegrey-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-bluegrey-500">To</label>
          <input
            type="date"
            value={dateTo ? dateTo.toISOString().slice(0, 10) : ""}
            onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : undefined)}
            className="border border-bluegrey-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-bluegrey-500">Search execution ID</label>
          <input
            type="text"
            placeholder="log-001"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-bluegrey-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-40"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-bluegrey-300 bg-bluegrey-50 py-16 text-center">
          <div className="text-bluegrey-400 text-sm">
            No cleanup logs available. Cleanup jobs will appear here after the first execution.
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-bluegrey-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_120px_100px_100px_80px_180px_auto] gap-2 bg-bluegrey-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-bluegrey-500 border-b border-bluegrey-200">
            <span>Execution date</span>
            <span>Time</span>
            <span>Status</span>
            <span>Deleted</span>
            <span>Failed</span>
            <span>Retries</span>
            <span>Statuses</span>
            <span>Actions</span>
          </div>

          {filtered.map((entry) => {
            const isExpanded = expandedIds.has(entry.id);
            const jobName = jobs.find((j) => j.id === entry.jobId)?.name ?? entry.jobId;
            const hasPendingDryRun = entry.details.dryRunReport && entry.status === "success";

            return (
              <div key={entry.id} className="border-b border-bluegrey-100 last:border-0">
                {/* Main row */}
                <div className="grid grid-cols-[1fr_80px_120px_100px_100px_80px_180px_auto] gap-2 px-4 py-3 items-center hover:bg-bluegrey-25 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-bluegrey-900">
                      {entry.executionDate}
                    </div>
                    <div className="text-xs text-bluegrey-400">{jobName}</div>
                    <div className="text-xs text-bluegrey-300">{entry.id}</div>
                  </div>
                  <span className="text-sm text-bluegrey-700">{entry.executionTime}</span>
                  <div>
                    <StatusBadge status={entry.status} />
                  </div>
                  <span className="text-sm text-bluegrey-700">{entry.usersDeleted}</span>
                  <span className="text-sm text-bluegrey-700">{entry.failedRecords}</span>
                  <span className="text-sm text-bluegrey-700">{entry.retriesPerformed}</span>
                  <div className="flex flex-wrap gap-1">
                    {entry.deletedStatuses.map((s) => (
                      <span
                        key={s}
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700"
                      >
                        {CLEANUP_STATUS_LABELS[s]}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs px-2"
                      onClick={() => toggleExpand(entry.id)}
                    >
                      {isExpanded ? "Collapse" : "Details"}
                    </Button>
                    {hasPendingDryRun && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() =>
                          toast({
                            title: "Dry-run approved",
                            description: "Execution has been approved.",
                          })
                        }
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs px-2"
                      onClick={() => handleExport(entry)}
                    >
                      Export
                    </Button>
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isExpanded && <ExpandedDetails entry={entry} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
