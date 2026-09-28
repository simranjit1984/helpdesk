import { useEffect, useMemo, useState } from "react";
import {
  Home,
  ChevronRight,
  ArrowUpDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
  Search,
} from "lucide-react";
import type { OrgTreeNode } from "./OrgTreeSelect";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Finds the breadcrumb trail (root → …→ node) leading to the given org id. */
export function findOrgPath(
  nodes: OrgTreeNode[],
  id: string,
  trail: OrgTreeNode[] = [],
): OrgTreeNode[] | null {
  for (const node of nodes) {
    if (node.id === id) return [...trail, node];
    if (node.children?.length) {
      const found = findOrgPath(node.children, id, [...trail, node]);
      if (found) return found;
    }
  }
  return null;
}

/** All descendant ids (children, grandchildren, …) of a node, excluding itself. */
export function collectDescendantIds(node: OrgTreeNode): string[] {
  return (node.children ?? []).flatMap((c) => [c.id, ...collectDescendantIds(c)]);
}

/** All org ids in a tree, at every depth. */
export function collectAllOrgIds(tree: OrgTreeNode[]): string[] {
  return tree.flatMap((n) => [n.id, ...collectDescendantIds(n)]);
}

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];

interface Props {
  /** Label shown as the top-level ("home") breadcrumb — the org being configured. */
  rootLabel: string;
  /** Direct children of the root org. */
  tree: OrgTreeNode[];
  /** Currently selected org id — null means the root org itself is selected. */
  value: string | null;
  onChange: (id: string | null) => void;
}

export default function OrgDrillDownSelect({ rootLabel, tree, value, onChange }: Props) {
  const [path, setPath] = useState<OrgTreeNode[]>(() => findOrgPath(tree, value ?? "") ?? []);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"name" | "referenceId">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  useEffect(() => {
    setPath(findOrgPath(tree, value ?? "") ?? []);
  }, [value, tree]);

  const currentNode = path[path.length - 1] ?? null;
  const children = currentNode ? currentNode.children ?? [] : tree;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? children.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.referenceId ?? "").toLowerCase().includes(q),
        )
      : children;
    return [...base].sort((a, b) => {
      const av = (a[sortField] ?? "").toLowerCase();
      const bv = (b[sortField] ?? "").toLowerCase();
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [children, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const drillInto = (node: OrgTreeNode) => {
    setPath((prev) => [...prev, node]);
    onChange(node.id);
    setSearch("");
    setPage(1);
  };

  const goToBreadcrumb = (index: number) => {
    if (index < 0) {
      setPath([]);
      onChange(null);
    } else {
      const nextPath = path.slice(0, index + 1);
      setPath(nextPath);
      onChange(nextPath[nextPath.length - 1].id);
    }
    setSearch("");
    setPage(1);
  };

  const toggleSort = (field: "name" | "referenceId") => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const selectedLabel = currentNode ? currentNode.name : rootLabel;
  // Full descendant count (all levels), not just the directly-visible children —
  // selecting an org always implicitly includes everything underneath it.
  const descendantCount = currentNode
    ? collectDescendantIds(currentNode).length
    : collectAllOrgIds(tree).length;

  return (
    <div className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
      {/* Search bar */}
      <div className="flex items-center gap-2 p-3 border-b border-bluegrey-200">
        <select
          disabled
          className="border border-bluegrey-300 rounded-md text-xs px-2 py-1.5 text-bluegrey-600 bg-white focus:outline-none shrink-0"
        >
          <option>All fields</option>
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-bluegrey-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by organization name or ID"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-bluegrey-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-bluegrey-200 flex-wrap">
        <button
          type="button"
          onClick={() => goToBreadcrumb(-1)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            path.length === 0
              ? "bg-blue-100 text-blue-700"
              : "text-bluegrey-500 hover:text-bluegrey-800"
          }`}
        >
          <Home className="h-3 w-3" />
          {rootLabel}
        </button>
        {path.map((node, i) => (
          <span key={node.id} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-bluegrey-300" />
            <button
              type="button"
              onClick={() => goToBreadcrumb(i)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                i === path.length - 1
                  ? "bg-blue-100 text-blue-700"
                  : "text-bluegrey-500 hover:text-bluegrey-800"
              }`}
            >
              {node.name}
            </button>
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bluegrey-50 border-b border-bluegrey-200 sticky top-0">
              <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-bluegrey-500">
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="inline-flex items-center gap-1 hover:text-bluegrey-800"
                >
                  Organization <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-bluegrey-500">
                <button
                  type="button"
                  onClick={() => toggleSort("referenceId")}
                  className="inline-flex items-center gap-1 hover:text-bluegrey-800"
                >
                  Org ID <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-3 py-8 text-center text-xs text-bluegrey-400">
                  {search ? "No organizations match your search." : "No child organizations."}
                </td>
              </tr>
            ) : (
              pagedRows.map((node) => (
                <tr
                  key={node.id}
                  onClick={() => drillInto(node)}
                  className="border-b border-bluegrey-100 last:border-0 hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2 text-sm text-bluegrey-900">{node.name}</td>
                  <td className="px-3 py-2 text-sm text-bluegrey-500">{node.referenceId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — only when needed */}
      {filtered.length > PAGE_SIZE_OPTIONS[0] && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-bluegrey-200 text-xs text-bluegrey-500">
          <div className="flex items-center gap-2">
            <span>Per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-bluegrey-300 rounded-md px-1.5 py-1 text-xs"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>{filtered.length} items in total</span>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              className="border border-bluegrey-300 rounded-md px-1.5 py-1 text-xs"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span>of {totalPages} page{totalPages !== 1 ? "s" : ""}</span>
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1 disabled:opacity-30"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 disabled:opacity-30"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1 disabled:opacity-30"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Selection summary */}
      <div className="flex flex-col gap-1 px-3 py-2.5 bg-bluegrey-25 border-t border-bluegrey-200">
        <span className="text-xs text-bluegrey-600">
          Selected: <strong className="text-bluegrey-900">{selectedLabel}</strong>
          {descendantCount > 0 && (
            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-bluegrey-100 text-bluegrey-600">
              +{descendantCount} {descendantCount === 1 ? "organization" : "organizations"} underneath
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
