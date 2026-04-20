import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type PermissionNode, collectLeafIds } from "./permissionTree";

interface PermissionTreeTableProps {
  tree: PermissionNode[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

// Determine if a node is checked / indeterminate based on leaf selection
function nodeState(
  node: PermissionNode,
  selectedIds: string[],
): "checked" | "indeterminate" | "unchecked" {
  const leaves = collectLeafIds([node]);
  if (leaves.length === 0) return "unchecked";
  const selectedCount = leaves.filter((id) => selectedIds.includes(id)).length;
  if (selectedCount === 0) return "unchecked";
  if (selectedCount === leaves.length) return "checked";
  return "indeterminate";
}

function toggleNode(
  node: PermissionNode,
  selectedIds: string[],
): string[] {
  const leaves = collectLeafIds([node]);
  const state = nodeState(node, selectedIds);
  if (state === "checked") {
    // Deselect all leaves under this node
    return selectedIds.filter((id) => !leaves.includes(id));
  } else {
    // Select all leaves under this node
    const newIds = [...selectedIds];
    leaves.forEach((id) => {
      if (!newIds.includes(id)) newIds.push(id);
    });
    return newIds;
  }
}

// Filter tree: keep only nodes whose label (or descendants' labels) match the query
function filterTree(nodes: PermissionNode[], query: string): PermissionNode[] {
  if (!query) return nodes;
  const q = query.toLowerCase();
  return nodes.reduce<PermissionNode[]>((acc, node) => {
    if (node.label.toLowerCase().includes(q)) {
      acc.push(node);
    } else if (node.children) {
      const filtered = filterTree(node.children, query);
      if (filtered.length > 0) {
        acc.push({ ...node, children: filtered });
      }
    }
    return acc;
  }, []);
}

// ─── Row renderer ─────────────────────────────────────────────────────────────

interface RowProps {
  node: PermissionNode;
  depth: number;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  forceExpand?: boolean;
}

function PermissionRow({
  node,
  depth,
  selectedIds,
  onChange,
  expandedIds,
  onToggleExpand,
  forceExpand,
}: RowProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = forceExpand || expandedIds.has(node.id);
  const state = hasChildren ? nodeState(node, selectedIds) : undefined;
  const isChecked = !hasChildren
    ? selectedIds.includes(node.id)
    : state === "checked";
  const isIndeterminate = state === "indeterminate";

  const handleCheck = () => {
    if (hasChildren) {
      onChange(toggleNode(node, selectedIds));
    } else {
      if (selectedIds.includes(node.id)) {
        onChange(selectedIds.filter((id) => id !== node.id));
      } else {
        onChange([...selectedIds, node.id]);
      }
    }
  };

  const isCategory = depth === 0;
  const isSubCategory = depth === 1 && hasChildren;

  return (
    <>
      <tr
        className={cn(
          "border-b border-bluegrey-100",
          isCategory && "bg-white",
          !isCategory && "bg-white",
        )}
      >
        {/* Expand / collapse column */}
        <td className="w-8 pl-3 py-2.5">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(node.id)}
              className="p-0.5 text-bluegrey-500 hover:text-bluegrey-900 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </td>

        {/* Checkbox column */}
        <td className="w-10 py-2.5">
          <Checkbox
            checked={isChecked}
            data-state={isIndeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked"}
            onCheckedChange={handleCheck}
            className={cn(
              isIndeterminate &&
                "data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600",
            )}
          />
        </td>

        {/* Permission label */}
        <td
          className="py-2.5 pr-4"
          style={{ paddingLeft: `${depth * 24}px` }}
        >
          <span
            className={cn(
              "text-sm text-bluegrey-900",
              isCategory && "font-semibold",
              isSubCategory && "font-medium",
            )}
          >
            {node.label}
          </span>
        </td>

        {/* Description */}
        <td className="py-2.5 pr-6">
          {node.description && (
            <span className="text-sm text-bluegrey-500">{node.description}</span>
          )}
        </td>
      </tr>

      {/* Children */}
      {hasChildren && isExpanded &&
        node.children!.map((child) => (
          <PermissionRow
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedIds={selectedIds}
            onChange={onChange}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            forceExpand={forceExpand}
          />
        ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PermissionTreeTable({
  tree,
  selectedIds,
  onChange,
}: PermissionTreeTableProps) {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(tree.map((n) => n.id)),
  );

  const forceExpand = search.length > 0;
  const filteredTree = filterTree(tree, search);

  const allLeaves = collectLeafIds(tree);
  const allSelected = allLeaves.every((id) => selectedIds.includes(id));
  const someSelected = allLeaves.some((id) => selectedIds.includes(id));
  const headerState = allSelected ? "checked" : someSelected ? "indeterminate" : "unchecked";

  const handleSelectAll = () => {
    if (allSelected) {
      onChange(selectedIds.filter((id) => !allLeaves.includes(id)));
    } else {
      const newIds = [...selectedIds];
      allLeaves.forEach((id) => {
        if (!newIds.includes(id)) newIds.push(id);
      });
      onChange(newIds);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="border border-bluegrey-200 rounded">
      {/* Search */}
      <div className="px-3 py-2 border-b border-bluegrey-200">
        <div className="relative max-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-bluegrey-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-bluegrey-200 bg-white">
              {/* Header expand col */}
              <th className="w-8" />
              {/* Header select-all */}
              <th className="w-10 py-2.5">
                <Checkbox
                  checked={allSelected}
                  data-state={headerState}
                  onCheckedChange={handleSelectAll}
                  className={cn(
                    headerState === "indeterminate" &&
                      "data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600",
                  )}
                />
              </th>
              <th className="py-2.5 pr-4 text-left">
                <span className="text-xs font-semibold text-bluegrey-700 uppercase tracking-wide">
                  Permission
                </span>
              </th>
              <th className="py-2.5 pr-6 text-left">
                <span className="text-xs font-semibold text-bluegrey-700 uppercase tracking-wide">
                  Description
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTree.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-bluegrey-500">
                  No permissions match your search.
                </td>
              </tr>
            ) : (
              filteredTree.map((node) => (
                <PermissionRow
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedIds={selectedIds}
                  onChange={onChange}
                  expandedIds={expandedIds}
                  onToggleExpand={toggleExpand}
                  forceExpand={forceExpand}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
