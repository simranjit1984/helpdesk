import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, X, Plus, Filter } from "lucide-react";
import type { AttributeCapability } from "./OverviewConfigMatrix";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterAttributeConfig {
  id: string;
  label: string;
  defaultValues: string[];
  valueSelectType: "single" | "multiple";
  allowSingleFilterOnly: boolean;
}

// ─── Value tag input ──────────────────────────────────────────────────────────

function ValueTagInput({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(values.filter((v) => v !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && input === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="min-h-[36px] flex flex-wrap gap-1.5 px-2.5 py-1.5 border border-bluegrey-300 rounded-sm bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
        >
          {v}
          <button
            type="button"
            onClick={() => removeTag(v)}
            className="hover:text-blue-900 transition-colors"
            aria-label={`Remove ${v}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={values.length === 0 ? "Type a value, press Enter…" : ""}
        className="flex-1 min-w-[120px] text-xs bg-transparent focus:outline-none placeholder:text-bluegrey-400 text-bluegrey-900"
      />
    </div>
  );
}

// ─── Select type pill toggle ──────────────────────────────────────────────────

function SelectTypePill({
  value,
  onChange,
}: {
  value: "single" | "multiple";
  onChange: (v: "single" | "multiple") => void;
}) {
  return (
    <div className="inline-flex rounded-sm border border-bluegrey-300 overflow-hidden">
      {(["single", "multiple"] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
            value === opt
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-bluegrey-600 hover:bg-bluegrey-50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterConfigTabProps {
  /** Live filterable attributes from the Overview matrix */
  filterableAttrs: AttributeCapability[];
  initial: FilterAttributeConfig[];
  onSave: (configs: FilterAttributeConfig[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialConfig(
  attrs: AttributeCapability[],
  existing: FilterAttributeConfig[]
): FilterAttributeConfig[] {
  return attrs.map((attr) => {
    const prev = existing.find((c) => c.id === attr.id);
    return prev ?? {
      id: attr.id,
      label: attr.label,
      defaultValues: [],
      valueSelectType: "single",
      allowSingleFilterOnly: false,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FilterConfigTab({
  filterableAttrs,
  initial,
  onSave,
}: FilterConfigTabProps) {
  const [configs, setConfigs] = useState<FilterAttributeConfig[]>(() =>
    buildInitialConfig(filterableAttrs, initial)
  );
  const [isDirty, setIsDirty] = useState(false);

  // Keep in sync when filterableAttrs change (e.g. user enables/disables filterable in Overview)
  const syncedConfigs = buildInitialConfig(filterableAttrs, configs);

  function update(id: string, patch: Partial<FilterAttributeConfig>) {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
    setIsDirty(true);
  }

  function handleSave() {
    onSave(syncedConfigs);
    setIsDirty(false);
  }

  if (filterableAttrs.length === 0) {
    return (
      <div className="py-14 flex flex-col items-center gap-3 text-center">
        <Filter className="w-8 h-8 text-bluegrey-300" />
        <p className="text-sm text-bluegrey-500">
          No attributes are marked as <strong>Filterable</strong> in the Overview configuration.
        </p>
        <p className="text-xs text-bluegrey-400">
          Enable "Filterable" for attributes in the Overview (Table View) tab to configure them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border border-bluegrey-200 rounded-md overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_2fr_160px_160px] gap-4 px-4 py-2.5 bg-bluegrey-50 border-b border-bluegrey-200 text-xs font-semibold text-bluegrey-500 uppercase tracking-wider items-center">
          <span>Attribute</span>
          <span>Default values</span>
          <span className="text-center">Value select type</span>
          <span className="text-center">Single filter only</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-bluegrey-100">
          {syncedConfigs.map((cfg) => (
            <div
              key={cfg.id}
              className="grid grid-cols-[1fr_2fr_160px_160px] gap-4 px-4 py-3.5 items-center bg-white hover:bg-bluegrey-25 transition-colors"
            >
              {/* Attribute label */}
              <div>
                <span className="text-sm font-medium text-bluegrey-900">{cfg.label}</span>
              </div>

              {/* Default values tag input */}
              <div>
                <ValueTagInput
                  values={cfg.defaultValues}
                  onChange={(v) => update(cfg.id, { defaultValues: v })}
                />
                <p className="text-[11px] text-bluegrey-400 mt-1">
                  Pre-selected values when the filter is opened. Leave empty for none.
                </p>
              </div>

              {/* Value select type */}
              <div className="flex justify-center">
                <SelectTypePill
                  value={cfg.valueSelectType}
                  onChange={(v) => update(cfg.id, { valueSelectType: v })}
                />
              </div>

              {/* Allow single filter only */}
              <div className="flex flex-col items-center gap-1">
                <Switch
                  checked={cfg.allowSingleFilterOnly}
                  onCheckedChange={(v) => update(cfg.id, { allowSingleFilterOnly: v })}
                  aria-label={`${cfg.label} single filter only`}
                />
                <span className="text-[10px] text-bluegrey-400">
                  {cfg.allowSingleFilterOnly ? "On" : "Off"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 text-xs text-bluegrey-500 px-1">
        <div>
          <span className="font-semibold text-bluegrey-700">Default values</span>
          <p className="mt-0.5">Values pre-selected when the filter panel opens. Users can change them.</p>
        </div>
        <div>
          <span className="font-semibold text-bluegrey-700">Value select type</span>
          <p className="mt-0.5">
            <strong>Single</strong> — only one value can be active. <strong>Multiple</strong> — multiple values can be combined.
          </p>
        </div>
        <div>
          <span className="font-semibold text-bluegrey-700">Single filter only</span>
          <p className="mt-0.5">When ON, only this filter can be active at a time — all other filters are cleared.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={!isDirty} className="gap-2">
          <Save className="w-4 h-4" />
          Save filter config
        </Button>
      </div>
    </div>
  );
}
