import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CleanupJob, DryRunReport, CLEANUP_STATUS_LABELS } from "@/lib/jobsMockData";

interface Props {
  open: boolean;
  job: CleanupJob | null;
  onClose: () => void;
  onApprove: () => void;
  onEdit: () => void;
}

function mockDryRunReport(job: CleanupJob): DryRunReport {
  const total = Math.floor(Math.random() * 30) + 5;
  const byStatus: DryRunReport["byStatus"] = {
    "invitation-expired": 0,
    "invitation-withdrawn": 0,
    "auth-blocked": 0,
    inactive: 0,
  };
  let remaining = total;
  job.statuses.forEach((s, i) => {
    const portion = i === job.statuses.length - 1 ? remaining : Math.floor(remaining / 2);
    byStatus[s] = portion;
    remaining -= portion;
  });
  const userList = Array.from(
    { length: Math.min(total, 6) },
    (_, i) => `user-dry${String(i + 1).padStart(2, "0")}@example.com`
  );
  const warnings: string[] = total > 15 ? ["High number of matched users — review carefully"] : [];
  return { totalMatched: total, byStatus, userList, warnings };
}

export default function DryRunResultsModal({ open, job, onClose, onApprove, onEdit }: Props) {
  if (!job) return null;

  const report = mockDryRunReport(job);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-bluegrey-900">
            Dry-run results — {job.name}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-bluegrey-600 mt-1">
          The following users would be deleted if this job were executed now. Review the results
          before approving.
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg border border-bluegrey-200 p-4 text-center">
            <div className="text-2xl font-bold text-bluegrey-900">{report.totalMatched}</div>
            <div className="text-xs text-bluegrey-500 mt-1">Total matched</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{report.warnings.length}</div>
            <div className="text-xs text-amber-600 mt-1">Warnings</div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{job.statuses.length}</div>
            <div className="text-xs text-blue-600 mt-1">Statuses matched</div>
          </div>
        </div>

        {/* By status breakdown */}
        <div className="mt-4 space-y-1">
          <h4 className="text-sm font-medium text-bluegrey-700">Breakdown by status</h4>
          <div className="rounded-lg border border-bluegrey-200 divide-y divide-bluegrey-100">
            {job.statuses.map((s) => (
              <div key={s} className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-bluegrey-800">{CLEANUP_STATUS_LABELS[s]}</span>
                <span className="text-sm font-medium text-bluegrey-900">{report.byStatus[s]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User list */}
        <div className="mt-4 space-y-1">
          <h4 className="text-sm font-medium text-bluegrey-700">
            Matched users{" "}
            {report.totalMatched > report.userList.length && (
              <span className="font-normal text-bluegrey-400">
                (showing {report.userList.length} of {report.totalMatched})
              </span>
            )}
          </h4>
          <div className="rounded-lg border border-bluegrey-200 max-h-40 overflow-y-auto">
            {report.userList.map((u) => (
              <div key={u} className="px-4 py-2 text-sm text-bluegrey-800 border-b border-bluegrey-100 last:border-0">
                {u}
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {report.warnings.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-1">
            <h4 className="text-sm font-medium text-amber-800">Warnings</h4>
            <ul className="list-disc list-inside space-y-0.5">
              {report.warnings.map((w) => (
                <li key={w} className="text-sm text-amber-700">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-bluegrey-200 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEdit}>
              Modify & retry
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onApprove();
                onClose();
              }}
            >
              Approve & execute
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
