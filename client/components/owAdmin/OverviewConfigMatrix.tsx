import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GripVertical, RotateCcw, Save } from "lucide-react";

export interface AttributeCapability {
  id: string;
  label: string;
  visible: boolean;
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
  disabledCaps?: Array<"searchable" | "filterable" | "sortable">;
}

interface OverviewConfigMatrixProps {
  attributes: AttributeCapability[];
  onSave: (attrs: AttributeCapability[]) => void;
  onReset: () => AttributeCapability[];
}

const CAPABILITIES: Array<{ key: keyof AttributeCapability; label: string }> = [
  { key: "visible", label: "Visible" },
  { key: "searchable", label: "Searchable" },
  { key: "filterable", label: "Filterable" },
  { key: "sortable", label: "Sortable" },
];

export default function OverviewConfigMatrix({ attributes, onSave, onReset }: OverviewConfigMatrixProps) {
  const [rows, setRows] = useState<AttributeCapability[]>(attributes);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const toggleCap = (id: string, cap: keyof AttributeCapability) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return { ...row, [cap]: !row[cap as string] };
      })
    );
    setIsDirty(true);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  const bulkToggleCap = (cap: keyof AttributeCapability, value: boolean) => {
    setRows((prev) =>
      prev.map((row) => {
        if (!selectedIds.has(row.id)) return row;
        if (row.disabledCaps?.includes(cap as any)) return row;
        return { ...row, [cap]: value };
      })
    );
    setIsDirty(true);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDragOverId(null);
      setDraggingId(null);
      return;
    }
    setRows((prev) => {
      const from = prev.findIndex((r) => r.id === draggingId);
      const to = prev.findIndex((r) => r.id === targetId);
      const reordered = [...prev];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      return reordered;
    });
    setDragOverId(null);
    setDraggingId(null);
    setIsDirty(true);
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    setDraggingId(null);
  };

  const handleReset = () => {
    const defaults = onReset();
    setRows(defaults);
    setSelectedIds(new Set());
    setIsDirty(false);
  };

  const handleSave = () => {
    onSave(rows);
    setIsDirty(false);
  };

  const allSelected = rows.length > 0 && selectedIds.size === rows.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {hasSelection && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
          <span className="font-medium">{selectedIds.size} selected</span>
          <span className="text-blue-400">|</span>
          <span className="text-bluegrey-600">Bulk toggle:</span>
          {CAPABILITIES.filter((c) => c.key !== "visible").map((cap) => (
            <div key={cap.key} className="flex items-center gap-1.5">
              <button
                onClick={() => bulkToggleCap(cap.key, true)}
                className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors text-xs font-medium"
              >
                {cap.label} ON
              </button>
              <button
                onClick={() => bulkToggleCap(cap.key, false)}
                className="px-2 py-0.5 rounded bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 transition-colors text-xs font-medium"
              >
                OFF
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Matrix table */}
      <div className="border border-bluegrey-200 rounded-md overflow-hidden">
        {/* Header — extra leading column for the drag handle */}
        <div className="grid grid-cols-[36px_44px_1fr_repeat(4,120px)] bg-bluegrey-50 border-b border-bluegrey-200">
          {/* Drag-handle header (empty, just a spacer) */}
          <div className="px-2 py-3" />
          {/* Select-all checkbox */}
          <div className="flex items-center justify-center px-3 py-3">
            <Checkbox
              checked={allSelected}
              data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all"
              className={someSelected ? "data-[state=indeterminate]:bg-blue-100 border-blue-400" : ""}
            />
          </div>
          <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
            Attribute
          </div>
          {CAPABILITIES.map((cap) => (
            <div key={cap.key} className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide text-center">
              {cap.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row) => {
          const isSelected = selectedIds.has(row.id);
          const isDragging = draggingId === row.id;
          const isOver = dragOverId === row.id && !isDragging;

          return (
            <div
              key={row.id}
              draggable
              onDragStart={(e) => handleDragStart(e, row.id)}
              onDragOver={(e) => handleDragOver(e, row.id)}
              onDrop={(e) => handleDrop(e, row.id)}
              onDragEnd={handleDragEnd}
              className={`grid grid-cols-[36px_44px_1fr_repeat(4,120px)] border-b border-bluegrey-100 last:border-b-0 transition-colors ${
                isDragging
                  ? "opacity-40 bg-bluegrey-50"
                  : isOver
                  ? "bg-blue-50 border-l-2 border-l-blue-400"
                  : isSelected
                  ? "bg-blue-50"
                  : "bg-white hover:bg-bluegrey-25"
              }`}
            >
              {/* Drag handle */}
              <div className="flex items-center justify-center px-2 py-4 cursor-grab active:cursor-grabbing text-bluegrey-300 hover:text-bluegrey-500 transition-colors">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Checkbox */}
              <div className="flex items-center justify-center px-3 py-4">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleRowSelection(row.id)}
                  aria-label={`Select ${row.label}`}
                />
              </div>

              {/* Attribute name */}
              <div className="px-4 py-4 flex items-center gap-2">
                <span className="text-sm font-medium text-bluegrey-900">{row.label}</span>
              </div>

              {/* Capability toggles */}
              {CAPABILITIES.map((cap) => {
                const isDisabled = row.disabledCaps?.includes(cap.key as any);
                const value = row[cap.key] as boolean;
                return (
                  <div key={cap.key} className="flex items-center justify-center px-4 py-4">
                    {isDisabled ? (
                      <div className="flex flex-col items-center gap-1">
                        <Switch disabled checked={false} />
                        <span className="text-[10px] text-bluegrey-400">N/A</span>
                      </div>
                    ) : (
                      <Switch
                        checked={value}
                        onCheckedChange={() => toggleCap(row.id, cap.key)}
                        aria-label={`${row.label} ${cap.label}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={!isDirty} className="gap-2">
          <Save className="w-4 h-4" />
          Save configuration
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2 text-bluegrey-600">
          <RotateCcw className="w-4 h-4" />
          Reset to default
        </Button>
      </div>
    </div>
  );
}
