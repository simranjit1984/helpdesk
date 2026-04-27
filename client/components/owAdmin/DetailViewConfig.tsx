import { useState } from "react";
import { GripVertical, RotateCcw, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export interface DetailAttribute {
  id: string;
  label: string;
  category: string;
  visible: boolean;
}

// Colour map for category badges — matches AttributeGlobalConfig
const CATEGORY_COLORS: Record<string, string> = {
  "Basic Info":        "bg-blue-50 text-blue-700 border-blue-200",
  "Contact Info":      "bg-teal-50 text-teal-700 border-teal-200",
  "Access Info":       "bg-purple-50 text-purple-700 border-purple-200",
  "Organization Info": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "System":            "bg-bluegrey-100 text-bluegrey-600 border-bluegrey-200",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-bluegrey-100 text-bluegrey-600 border-bluegrey-200";
}

interface DetailViewConfigProps {
  attributes: DetailAttribute[];
  onSave: (attrs: DetailAttribute[]) => void;
  onReset: () => DetailAttribute[];
}

// ─── Live preview ─────────────────────────────────────────────────────────────

function LivePreviewPanel({ attributes }: { attributes: DetailAttribute[] }) {
  // Group by category, preserving encounter order — only visible attributes
  const groups: { category: string; attrs: DetailAttribute[] }[] = [];
  const seen = new Set<string>();
  for (const attr of attributes.filter((a) => a.visible)) {
    if (!seen.has(attr.category)) {
      seen.add(attr.category);
      groups.push({ category: attr.category, attrs: [] });
    }
    groups.find((g) => g.category === attr.category)!.attrs.push(attr);
  }

  return (
    <div className="bg-white border border-bluegrey-200 rounded-lg overflow-hidden">
      {/* Mock user header */}
      <div className="bg-bluegrey-50 border-b border-bluegrey-200 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-base">A</div>
        <div>
          <p className="text-sm font-semibold text-bluegrey-900">Alice Anderson</p>
          <p className="text-xs text-bluegrey-500">alice.anderson@example.com</p>
        </div>
      </div>

      <div className="divide-y divide-bluegrey-100">
        {groups.map(({ category, attrs }) => (
          <div key={category} className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-bluegrey-500 mb-3">{category}</p>
            <div className="space-y-2.5">
              {attrs.map((attr) => (
                <div key={attr.id} className="flex items-center gap-3">
                  <span className="text-xs text-bluegrey-500 w-28 shrink-0">{attr.label}</span>
                  <div className="flex-1 h-7 rounded border border-bluegrey-200 bg-white px-2 flex items-center text-xs text-bluegrey-400 italic">
                    {attr.label}…
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-bluegrey-400">No visible attributes configured.</div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DetailViewConfig({ attributes, onSave, onReset }: DetailViewConfigProps) {
  const [rows, setRows] = useState<DetailAttribute[]>(attributes);

  const toggleVisible = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, visible: !r.visible } : r));
    setIsDirty(true);
  };
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

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
          Drag attributes to reorder. The category shown is sourced from <span className="font-medium text-bluegrey-800">Attribute Settings</span>.
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

      <div className={`grid gap-6 ${showPreview ? "grid-cols-[1fr_300px]" : "grid-cols-1"}`}>
        {/* Attribute list */}
        <div className="border border-bluegrey-200 rounded-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_150px_100px] bg-bluegrey-50 border-b border-bluegrey-200">
            <div className="px-3 py-3" />
            <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
              Attribute
            </div>
            <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">
              Category
            </div>
            <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide text-center">
              Visible
            </div>
          </div>

          {rows.map((row) => {
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
                className={`grid grid-cols-[40px_1fr_150px_100px] border-b border-bluegrey-100 last:border-b-0 transition-colors ${
                  isDragging
                    ? "opacity-40 bg-bluegrey-50"
                    : isOver
                    ? "bg-blue-50 border-l-2 border-l-blue-400"
                    : "bg-white hover:bg-bluegrey-25"
                }`}
              >
                {/* Drag handle */}
                <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-bluegrey-300 hover:text-bluegrey-500 transition-colors">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Label */}
                <div className="px-4 py-3 flex items-center">
                  <span className="text-sm font-medium text-bluegrey-900">{row.label}</span>
                </div>

                {/* Category badge */}
                <div className="px-4 py-3 flex items-center">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${categoryColor(row.category)}`}>
                    {row.category}
                  </span>
                </div>

                {/* Visible toggle */}
                <div className="px-4 py-3 flex items-center justify-center">
                  <Switch
                    checked={row.visible}
                    onCheckedChange={() => toggleVisible(row.id)}
                    aria-label={`${row.label} visible`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Live Preview</p>
            <LivePreviewPanel attributes={rows} />
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
