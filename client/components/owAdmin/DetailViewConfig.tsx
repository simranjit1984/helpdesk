import { useState } from "react";
import { GripVertical, RotateCcw, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export interface DetailAttribute {
  id: string;
  label: string;
  category: string;
  create: boolean;  // visible when creating / inviting
  view: boolean;    // visible when viewing the record
  createDisabled?: boolean; // system-generated attribute — Create toggle is locked off
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
  showCreateColumn?: boolean;
  showCategoryColumn?: boolean;
  showMandatoryColumn?: boolean;
  // When true, Create and View render as two fully independent columns —
  // toggling one never affects the other (unlike the coupled Create/View mode).
  independentCreateView?: boolean;
}

function gridColsClass(showCategoryColumn: boolean, showCreateColumn: boolean, showLastColumn: boolean, independentCreateView = false) {
  if (independentCreateView) return showCategoryColumn ? "grid-cols-[40px_1fr_150px_100px_100px]" : "grid-cols-[40px_1fr_100px_100px]";
  if (showCategoryColumn && showCreateColumn && showLastColumn) return "grid-cols-[40px_1fr_150px_100px_100px]";
  if (showCategoryColumn) return "grid-cols-[40px_1fr_150px_100px]";
  if (showCreateColumn && showLastColumn) return "grid-cols-[40px_1fr_100px_100px]";
  return "grid-cols-[40px_1fr_100px]";
}

// ─── Live preview ─────────────────────────────────────────────────────────────

function LivePreviewPanel({ attributes }: { attributes: DetailAttribute[] }) {
  const [mode, setMode] = useState<"view" | "create">("view");
  const visible = attributes.filter((a) => mode === "view" ? a.view : a.create);

  // Group by category, preserving encounter order
  const groups: { category: string; attrs: DetailAttribute[] }[] = [];
  const seen = new Set<string>();
  for (const attr of visible) {
    if (!seen.has(attr.category)) {
      seen.add(attr.category);
      groups.push({ category: attr.category, attrs: [] });
    }
    groups.find((g) => g.category === attr.category)!.attrs.push(attr);
  }

  return (
    <div className="bg-white border border-bluegrey-200 rounded-lg overflow-hidden">
      {/* Mock header */}
      <div className="bg-bluegrey-50 border-b border-bluegrey-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">A</div>
          <div>
            <p className="text-xs font-semibold text-bluegrey-900">Alice Anderson</p>
            <p className="text-[10px] text-bluegrey-500">alice.anderson@example.com</p>
          </div>
        </div>
        {/* Mode toggle */}
        <div className="flex rounded-md border border-bluegrey-200 overflow-hidden text-[10px] font-medium">
          <button
            type="button"
            onClick={() => setMode("view")}
            className={`px-2.5 py-1 transition-colors ${mode === "view" ? "bg-blue-600 text-white" : "bg-white text-bluegrey-600 hover:bg-bluegrey-50"}`}
          >View</button>
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`px-2.5 py-1 transition-colors border-l border-bluegrey-200 ${mode === "create" ? "bg-blue-600 text-white" : "bg-white text-bluegrey-600 hover:bg-bluegrey-50"}`}
          >Create</button>
        </div>
      </div>

      <div className="divide-y divide-bluegrey-100">
        {groups.map(({ category, attrs }) => (
          <div key={category} className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-bluegrey-500 mb-2">{category}</p>
            <div className="space-y-2">
              {attrs.map((attr) => (
                <div key={attr.id} className="flex items-center gap-2">
                  <span className="text-xs text-bluegrey-500 w-24 shrink-0">{attr.label}</span>
                  <div className="flex-1 h-6 rounded border border-bluegrey-200 bg-white px-2 flex items-center text-[10px] text-bluegrey-400 italic">
                    {attr.label}…
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-bluegrey-400">
            No attributes visible in {mode} mode.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DetailViewConfig({ attributes, onSave, onReset, showCreateColumn = false, showCategoryColumn = true, showMandatoryColumn = true, independentCreateView = false }: DetailViewConfigProps) {
  const [rows, setRows] = useState<DetailAttribute[]>(attributes);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const showLastColumn = !showCreateColumn || showMandatoryColumn;

  const toggleCreate = (id: string) => {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const next = !r.create;
      // When Create/View is turned off, also clear Mandatory
      return { ...r, create: next, view: next ? r.view : false };
    }));
    setIsDirty(true);
  };

  const toggleView = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, view: !r.view } : r));
    setIsDirty(true);
  };

  // Independent mode: Create toggles on its own, never touches View.
  const toggleCreateIndependent = (id: string) => {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id || r.createDisabled) return r;
      return { ...r, create: !r.create };
    }));
    setIsDirty(true);
  };

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
          {showCategoryColumn ? (
            <>
              Drag attributes to reorder. The category shown is sourced from{" "}
              <span className="font-medium text-bluegrey-800">Attribute Settings</span>.
            </>
          ) : (
            "Drag attributes to reorder."
          )}
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

      <div className={`grid gap-6 ${showPreview ? "grid-cols-[1fr_280px]" : "grid-cols-1"}`}>
        {/* Attribute list */}
        <div className="border border-bluegrey-200 rounded-md overflow-hidden">
          {/* Header */}
          <div className={`grid ${gridColsClass(showCategoryColumn, showCreateColumn, showLastColumn, independentCreateView)} bg-bluegrey-50 border-b border-bluegrey-200`}>
            <div className="px-3 py-3" />
            <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Attribute</div>
            {showCategoryColumn && (
              <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide">Category</div>
            )}
            {independentCreateView ? (
              <>
                <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide text-center">Create</div>
                <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide text-center">View</div>
              </>
            ) : (
              <>
                {showCreateColumn && (
                  <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide text-center">Create / View</div>
                )}
                {showLastColumn && (
                  <div className="px-4 py-3 text-xs font-semibold text-bluegrey-600 uppercase tracking-wide text-center">
                    {showCreateColumn ? "Mandatory attribute" : "View"}
                  </div>
                )}
              </>
            )}
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
                className={`grid ${
                  gridColsClass(showCategoryColumn, showCreateColumn, showLastColumn, independentCreateView)
                } border-b border-bluegrey-100 last:border-b-0 transition-colors ${
                  isDragging ? "opacity-40 bg-bluegrey-50"
                  : isOver   ? "bg-blue-50 border-l-2 border-l-blue-400"
                  :             "bg-white hover:bg-bluegrey-25"
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
                {showCategoryColumn && (
                  <div className="px-4 py-3 flex items-center">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${categoryColor(row.category)}`}>
                      {row.category}
                    </span>
                  </div>
                )}

                {independentCreateView && (
                  <>
                    {/* Create toggle — independent, locked for system-generated attrs */}
                    <div className="px-4 py-3 flex flex-col items-center justify-center gap-1">
                      <Switch
                        checked={row.create}
                        onCheckedChange={() => toggleCreateIndependent(row.id)}
                        disabled={row.createDisabled}
                        aria-label={`${row.label} create`}
                      />
                      {row.createDisabled && (
                        <span className="text-[10px] text-bluegrey-400">System</span>
                      )}
                    </div>
                    {/* View toggle — fully independent of Create */}
                    <div className="px-4 py-3 flex items-center justify-center">
                      <Switch
                        checked={row.view}
                        onCheckedChange={() => toggleView(row.id)}
                        aria-label={`${row.label} view`}
                      />
                    </div>
                  </>
                )}

                {!independentCreateView && (
                  <>
                    {/* Create toggle — Invitations only */}
                    {showCreateColumn && (
                      <div className="px-4 py-3 flex items-center justify-center">
                        <Switch
                          checked={row.create}
                          onCheckedChange={() => toggleCreate(row.id)}
                          aria-label={`${row.label} create`}
                        />
                      </div>
                    )}

                    {/* Mandatory / View toggle */}
                    {showLastColumn && (
                      <div className="px-4 py-3 flex items-center justify-center">
                        <Switch
                          checked={showCreateColumn ? (row.view && row.create) : row.view}
                          onCheckedChange={() => toggleView(row.id)}
                          disabled={showCreateColumn && !row.create}
                          aria-label={showCreateColumn ? `${row.label} mandatory` : `${row.label} view`}
                        />
                      </div>
                    )}
                  </>
                )}
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
