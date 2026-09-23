import { useMemo, useState } from "react";
import { AlertTriangle, Info, Search, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChildInheritanceMode, ChildOrgInheritance } from "../types";
import {
  InheritanceBadge,
  CustomClaimsBadge,
  ClaimValueRequiredBadge,
  MODE_LABELS,
  MODE_SHORT_DESCRIPTIONS,
} from "./InheritanceBadge";

const MODES: ChildInheritanceMode[] = [
  "inherit_all",
  "inherit_idp_custom_claims",
  "own",
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

interface Props {
  parentOrgName: string;
  childOrgs: ChildOrgInheritance[];
  onApplyToAll: (mode: ChildInheritanceMode) => void;
  onApplyToSelected: (orgIds: string[], mode: ChildInheritanceMode) => void;
  onChangeMode: (orgId: string, mode: ChildInheritanceMode) => void;
  onConfigureClaims: (child: ChildOrgInheritance) => void;
  onConfigureOwnIdp: (child: ChildOrgInheritance) => void;
}

function currentConfigLabel(child: ChildOrgInheritance, parentOrgName: string) {
  if (child.mode === "inherit_all")
    return `Inherited from ${parentOrgName}${child.orgClaimValue ? ` · ${child.orgClaimValue}` : ""}`;
  if (child.mode === "inherit_idp_custom_claims")
    return `Uses parent IDP, customized claims mapping${child.orgClaimValue ? ` · ${child.orgClaimValue}` : ""}`;
  return `Own IDP — ${child.ownIdpName ?? "Unknown"}`;
}

export default function ApplyToChildrenStep({
  parentOrgName,
  childOrgs,
  onApplyToAll,
  onApplyToSelected,
  onChangeMode,
  onConfigureClaims,
  onConfigureOwnIdp,
}: Props) {
  const [quickApplyMode, setQuickApplyMode] = useState<ChildInheritanceMode | null>(
    null,
  );
  const [confirmApplyAll, setConfirmApplyAll] = useState<ChildInheritanceMode | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<ChildInheritanceMode | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [bulkMode, setBulkMode] = useState<ChildInheritanceMode>("inherit_all");

  const filtered = useMemo(() => {
    return childOrgs.filter((c) => {
      if (modeFilter !== "all" && c.mode !== modeFilter) return false;
      if (search && !c.orgName.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [childOrgs, search, modeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (clampedPage - 1) * rowsPerPage,
    clampedPage * rowsPerPage,
  );

  const ownCount = childOrgs.filter((c) => c.mode === "own").length;

  function toggleSelectAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = pageRows.every((r) => next.has(r.orgId));
      pageRows.forEach((r) => (allSelected ? next.delete(r.orgId) : next.add(r.orgId)));
      return next;
    });
  }

  function toggleSelect(orgId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(orgId) ? next.delete(orgId) : next.add(orgId);
      return next;
    });
  }

  function handleConfirmApplyAll() {
    if (!confirmApplyAll) return;
    onApplyToAll(confirmApplyAll);
    setConfirmApplyAll(null);
    setQuickApplyMode(null);
  }

  function handleApplyToSelected() {
    onApplyToSelected(Array.from(selected), bulkMode);
    setSelected(new Set());
  }

  return (
    <div className="max-w-5xl space-y-8">
      <section>
        <h2 className="text-base font-semibold text-blue-700">
          Apply to child organizations
        </h2>
        <p className="text-sm text-bluegrey-600 mt-1 leading-relaxed">
          Choose how this IDP and its claims mapping should be applied to
          child organizations.
        </p>

        <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
          <span>
            This organization has {childOrgs.length} child organizations. You
            can apply an inheritance mode to multiple organizations at once
            and configure exceptions individually.
          </span>
        </div>
      </section>

      {/* Quick apply */}
      <section>
        <h3 className="text-sm font-semibold text-bluegrey-900 mb-3">Quick apply</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setQuickApplyMode(mode)}
              className={`text-left p-4 rounded-md border transition-colors ${
                quickApplyMode === mode
                  ? "border-blue-500 bg-blue-50"
                  : "border-bluegrey-200 bg-white hover:border-bluegrey-300"
              }`}
            >
              <div className="text-sm font-semibold text-bluegrey-900 mb-1">
                {MODE_LABELS[mode]}
              </div>
              <div className="text-xs text-bluegrey-600 leading-relaxed">
                {MODE_SHORT_DESCRIPTIONS[mode]}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Button
            variant="outline"
            disabled={!quickApplyMode}
            onClick={() => quickApplyMode && setConfirmApplyAll(quickApplyMode)}
          >
            Apply to all {childOrgs.length} organizations
          </Button>
        </div>
      </section>

      {/* Configure individually */}
      <section>
        <h3 className="text-sm font-semibold text-bluegrey-900 mb-1">
          Or, configure per organization
        </h3>
        <p className="text-xs text-bluegrey-500 mb-3">
          Search, filter, and set exceptions for individual organizations.
        </p>

        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-bluegrey-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search organizations..."
              className="h-9 w-full pl-8 pr-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value as ChildInheritanceMode | "all");
              setPage(1);
            }}
            className="h-9 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Inheritance mode: All</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <span className="text-sm font-medium text-blue-800">
              Selected: {selected.size} organization{selected.size > 1 ? "s" : ""}
            </span>
            <select
              value={bulkMode}
              onChange={(e) => setBulkMode(e.target.value as ChildInheritanceMode)}
              className="h-8 px-2 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {MODE_LABELS[m]}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleApplyToSelected}>
              Apply to selected
            </Button>
            <span className="text-xs text-blue-700 ml-auto">
              {selected.size} organizations will{" "}
              {bulkMode === "inherit_all"
                ? "inherit the IDP and claims mapping"
                : bulkMode === "inherit_idp_custom_claims"
                  ? "inherit the IDP but keep/define their own claims mapping"
                  : "use their own IDP and claims mapping"}{" "}
              from {parentOrgName}.
            </span>
          </div>
        )}

        {/* Table */}
        <div className="border border-bluegrey-200 rounded-md overflow-hidden">
          <div className="grid grid-cols-[32px_1.4fr_1.6fr_1.6fr_1fr] gap-3 px-4 py-2.5 bg-bluegrey-50 border-b border-bluegrey-200 text-xs font-semibold text-bluegrey-500 uppercase tracking-wider items-center">
            <input
              type="checkbox"
              checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.orgId))}
              onChange={toggleSelectAllOnPage}
              className="h-3.5 w-3.5"
            />
            <span>Organization</span>
            <span>Inheritance mode</span>
            <span>Current configuration</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-bluegrey-100">
            {pageRows.map((child) => (
              <div
                key={child.orgId}
                className="grid grid-cols-[32px_1.4fr_1.6fr_1.6fr_1fr] gap-3 px-4 py-3 items-center"
              >
                <input
                  type="checkbox"
                  checked={selected.has(child.orgId)}
                  onChange={() => toggleSelect(child.orgId)}
                  className="h-3.5 w-3.5"
                />
                <div className="min-w-0">
                  <div
                    className="text-sm font-medium text-bluegrey-900 truncate"
                    title={child.orgName}
                  >
                    {child.orgName}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <InheritanceBadge mode={child.mode} />
                    {child.mode === "inherit_idp_custom_claims" && (
                      <CustomClaimsBadge />
                    )}
                    {child.mode !== "own" && !child.orgClaimValue && (
                      <ClaimValueRequiredBadge />
                    )}
                  </div>
                </div>
                <select
                  value={child.mode}
                  onChange={(e) =>
                    onChangeMode(child.orgId, e.target.value as ChildInheritanceMode)
                  }
                  className="h-9 px-2 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900"
                >
                  {MODES.map((m) => (
                    <option key={m} value={m}>
                      {MODE_LABELS[m]}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-bluegrey-600 truncate">
                  {currentConfigLabel(child, parentOrgName)}
                </span>
                <div>
                  {(child.mode === "inherit_idp_custom_claims" ||
                    child.mode === "inherit_all") && (
                    <button
                      type="button"
                      onClick={() => onConfigureClaims(child)}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      {child.mode === "inherit_all"
                        ? "Set claim value"
                        : "Configure claims"}
                    </button>
                  )}
                  {child.mode === "own" && (
                    <button
                      type="button"
                      onClick={() => onConfigureOwnIdp(child)}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      Configure IDP & claims
                    </button>
                  )}
                </div>
              </div>
            ))}
            {pageRows.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-bluegrey-400">
                No organizations match your search/filters.
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-sm text-bluegrey-600">
          <span>
            Showing {(filtered.length === 0 ? 0 : (clampedPage - 1) * rowsPerPage + 1)}–
            {Math.min(clampedPage * rowsPerPage, filtered.length)} of {filtered.length}{" "}
            organizations
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-xs text-bluegrey-500">Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="h-8 px-2 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900"
              >
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={clampedPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 text-sm border border-bluegrey-300 rounded-sm bg-white disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-bluegrey-500 px-2">
                Page {clampedPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={clampedPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 text-sm border border-bluegrey-300 rounded-sm bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Confirm apply-to-all dialog */}
      {confirmApplyAll && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md p-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-bluegrey-900">
                  You are about to change the inheritance mode for{" "}
                  {childOrgs.length} organizations.
                </h3>
                {ownCount > 0 && (
                  <p className="text-sm text-bluegrey-600 mt-2">
                    Organizations with their own IDP configuration may be
                    affected ({ownCount} currently use their own IDP).
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmApplyAll(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmApplyAll}>Continue</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
