import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface OrgTreeNode {
  id: string;
  name: string;
  referenceId: string;
  children?: OrgTreeNode[];
}

interface Props {
  tree: OrgTreeNode[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectIds(node: OrgTreeNode): string[] {
  return [node.id, ...(node.children ?? []).flatMap(collectIds)];
}

function countTotal(nodes: OrgTreeNode[]): number {
  return nodes.reduce((sum, n) => sum + collectIds(n).length, 0);
}

// ─── Node row ─────────────────────────────────────────────────────────────────

function OrgTreeRow({
  node,
  depth,
  selectedIds,
  onChange,
}: {
  node: OrgTreeNode;
  depth: number;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const allIds = collectIds(node);
  const descendantIds = allIds.filter((id) => id !== node.id);

  const isSelected = selectedIds.includes(node.id);
  const selectedDescendants = descendantIds.filter((id) => selectedIds.includes(id));
  const isIndeterminate =
    !isSelected && selectedDescendants.length > 0 && selectedDescendants.length < descendantIds.length;
  const checkedState: boolean | "indeterminate" = isSelected
    ? true
    : isIndeterminate
      ? "indeterminate"
      : false;

  const toggle = () => {
    if (isSelected) {
      // Deselect this org and all its descendants
      onChange(selectedIds.filter((id) => !allIds.includes(id)));
    } else {
      // Select this org and all its descendants
      const next = new Set(selectedIds);
      allIds.forEach((id) => next.add(id));
      onChange(Array.from(next));
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-2 hover:bg-white transition-colors"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-bluegrey-400 hover:text-bluegrey-600 flex-shrink-0"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-3.5 h-3.5 flex-shrink-0" />
        )}
        <Checkbox
          id={`org-tree-${node.id}`}
          checked={checkedState}
          onCheckedChange={toggle}
        />
        <label htmlFor={`org-tree-${node.id}`} className="min-w-0 flex-1 cursor-pointer" onClick={toggle}>
          <span className="text-sm text-bluegrey-900 block leading-tight">{node.name}</span>
          <span className="text-[10px] text-bluegrey-400">{node.referenceId}</span>
        </label>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <OrgTreeRow key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function OrgTreeSelect({ tree, selectedIds, onChange }: Props) {
  const total = countTotal(tree);

  const selectAll = () => {
    const allIds = tree.flatMap(collectIds);
    onChange(allIds);
  };
  const clearAll = () => onChange([]);

  if (tree.length === 0) {
    return (
      <p className="text-xs text-bluegrey-400 italic px-3 py-3">
        No child organizations available.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-bluegrey-200 bg-bluegrey-25 overflow-hidden">
      <div className="px-3 py-2 border-b border-bluegrey-200 bg-white flex items-center justify-between">
        <span className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
          Select organizations
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-bluegrey-400">
            {selectedIds.length} of {total} selected
          </span>
          <button type="button" onClick={selectAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            Select all
          </button>
          <button type="button" onClick={clearAll} className="text-xs text-bluegrey-500 hover:text-bluegrey-700 font-medium">
            Clear
          </button>
        </div>
      </div>
      <div className="divide-y divide-bluegrey-100 max-h-72 overflow-y-auto">
        {tree.map((node) => (
          <OrgTreeRow key={node.id} node={node} depth={0} selectedIds={selectedIds} onChange={onChange} />
        ))}
      </div>
    </div>
  );
}
