import { useState } from "react";
import { GripVertical, RotateCcw, Save, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export interface DetailAttribute {
  id: string;
  label: string;
  visible: boolean;
  editable: boolean;
  section: "basic" | "access" | "organization";
}

const SECTIONS = [
  { value: "basic", label: "Basic Info" },
  { value: "access", label: "Access Info" },
  { value: "organization", label: "Organization Info" },
] as const;

const SECTION_COLORS: Record<string, string> = {
  basic: "bg-blue-50 text-blue-700 border-blue-200",
  access: "bg-purple-50 text-purple-700 border-purple-200",
  organization: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface DetailViewConfigProps {
  attributes: DetailAttribute[];
  onSave: (attrs: DetailAttribute[]) => void;
  onReset: () => DetailAttribute[];
}

function LivePreviewPanel({ attributes }: { attributes: DetailAttribute[] }) {
  const visibleAttrs = attributes.filter((a) => a.visible);

  const grouped = SECTIONS.reduce<Record<string, DetailAttribute[]>>((acc, sec) => {
    acc[sec.value] = visibleAttrs.filter((a) => a.section === sec.value);
    return acc;
  }, {});

  return (
    <div className="bg-white border border-bluegrey-200 rounded-lg overflow-hidden">
      {/* Mock user header */}
      <div className="bg-bluegrey-50 border-b border-bluegrey-200 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-base">
          A
        </div>
        <div>
          <p className="text-sm font-semibold text-bluegrey-900">Alice Anderson</p>
          <p className="text-xs text-bluegrey-500">alice.anderson@example.com</p>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-bluegrey-100">
        {SECTIONS.map((sec) => {
          const fields = grouped[sec.value];
          if (!fields || fields.length === 0) return null;
          return (
            <div key={sec.value} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-bluegrey-500 mb-3">
                {sec.label}
              </p>
              <div className="space-y-2.5">
                {fields.map((attr) => (
                  <div key={attr.id} className="flex items-center gap-3">
                    <span className="text-xs text-bluegrey-500 w-28 shrink-0">{attr.label}</span>
                    <div
                      className={`flex-1 h-7 rounded border px-2 flex items-center text-xs ${
                        attr.editable
                          ? "border-bluegrey-300 bg-white text-bluegrey-900"
                          : "border-bluegrey-100 bg-bluegrey-50 text-bluegrey-500 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-bluegrey-400 italic">
                        {attr.editable ? `Enter ${attr.label.toLowerCase()}…` : "Read only"}
                      </span>
                    </div>
                    {attr.editable && (
                      <span className="text-[10px] text-blue-500 shrink-0">editable</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {visibleAttrs.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-bluegrey-400">
            No visible attributes configured.
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetailViewConfig({ attributes, onSave, onReset }: DetailViewConfigProps) {
  const [rows, setRows] = useState<DetailAttribute[]>(attributes);
  const [selectedId, setSelectedId] = useState<string>(attributes[0]?.id ?? "");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  const updateSelected = (patch: Partial<DetailAttribute>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === selectedId ? { ...r, ...patch } : r))
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
    setSelectedId(defaults[0]?.id ?? "");
    setIsDirty(false);
  };

  const handleSave = () => {
    onSave(rows);
    setIsDirty(false);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-bluegrey-600">
          Drag attributes to reorder. Click an attribute to configure it.
        </p>
        <Button
          variant={showPreview ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPreview((v) => !v)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Hide preview" : "Preview"}
        </Button>
      </div>

      <div className={`grid gap-6 ${showPreview ? "grid-cols-[1fr_340px]" : "grid-cols-[1fr_300px]"}`}>
        {/* Left: Attribute list */}
        <div className="border border-bluegrey-200 rounded-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_90px] bg-bluegrey-50 border-b border-bluegrey-200">
            <div className="px-3 py-3" />
            <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
              Attribute
            </div>
            <div className="px-3 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide text-center">
              Section
            </div>
          </div>

          {rows.map((row) => {
            const isActive = row.id === selectedId;
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
                onClick={() => setSelectedId(row.id)}
                className={`grid grid-cols-[40px_1fr_90px] border-b border-bluegrey-100 last:border-b-0 cursor-pointer transition-colors ${
                  isDragging
                    ? "opacity-40 bg-bluegrey-50"
                    : isOver
                    ? "bg-blue-50 border-l-2 border-l-blue-400"
                    : isActive
                    ? "bg-blue-50"
                    : "bg-white hover:bg-bluegrey-25"
                }`}
              >
                {/* Drag handle */}
                <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-bluegrey-300 hover:text-bluegrey-500">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Label */}
                <div className="px-4 py-3 flex items-center gap-2">
                  <span className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-bluegrey-900"}`}>
                    {row.label}
                  </span>
                  {!row.visible && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-bluegrey-100 text-bluegrey-500">
                      hidden
                    </span>
                  )}
                </div>

                {/* Section badge */}
                <div className="px-3 py-3 flex items-center justify-center">
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                      SECTION_COLORS[row.section]
                    }`}
                  >
                    {SECTIONS.find((s) => s.value === row.section)?.label.split(" ")[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Config panel or Preview */}
        {showPreview ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Live Preview</p>
            <LivePreviewPanel attributes={rows} />
          </div>
        ) : (
          <div>
            {selected ? (
              <div className="border border-bluegrey-200 rounded-md">
                {/* Panel header */}
                <div className="px-4 py-3 bg-bluegrey-50 border-b border-bluegrey-200">
                  <p className="text-sm font-semibold text-bluegrey-900">{selected.label}</p>
                  <p className="text-xs text-bluegrey-500 mt-0.5">Field configuration</p>
                </div>

                <div className="px-4 py-4 space-y-5">
                  {/* Visible */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-bluegrey-900">Visible</p>
                      <p className="text-xs text-bluegrey-500 mt-0.5">Show this field in the detail view</p>
                    </div>
                    <Switch
                      checked={selected.visible}
                      onCheckedChange={(v) => updateSelected({ visible: v })}
                    />
                  </div>

                  <div className="border-t border-bluegrey-100" />

                  {/* Editable */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-bluegrey-900">Editable</p>
                      <p className="text-xs text-bluegrey-500 mt-0.5">Allow administrators to edit this field</p>
                    </div>
                    <Switch
                      checked={selected.editable}
                      onCheckedChange={(v) => updateSelected({ editable: v })}
                      disabled={!selected.visible}
                    />
                  </div>

                </div>
              </div>
            ) : (
              <div className="border border-bluegrey-200 rounded-md px-4 py-8 text-center text-sm text-bluegrey-400">
                Select an attribute to configure it.
              </div>
            )}
          </div>
        )}
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
