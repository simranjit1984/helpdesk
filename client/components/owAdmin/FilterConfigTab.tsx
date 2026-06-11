import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, X, Filter, ChevronDown } from "lucide-react";
import type { AttributeCapability } from "./OverviewConfigMatrix";

// ─── Value source types ───────────────────────────────────────────────────────

export type ValueSourceType =
  | "user-defined"     // Admin types values manually
  | "app-object"       // Dynamically fetched from an application object
  | "external-system"; // Fetched from an external system (e.g. IDS)

export type AppObjectRef =
  | "access-roles"
  | "organizations"
  | "applications"
  | "users";

// ─── Per-attribute filter config ──────────────────────────────────────────────

export interface FilterAttributeConfig {
  id: string;
  label: string;
  // — Source of filter options ——————————————————————————————————————————————
  valueSource: ValueSourceType;
  appObjectRef?: AppObjectRef;       // when valueSource = "app-object"
  externalSystemRef?: string;        // when valueSource = "external-system"
  userDefinedValues?: string[];      // when valueSource = "user-defined": typed defaults
  // — Filter behaviour ———————————————————————————————————————————————————————
  valueSelectType: "single" | "multiple";
  allowSingleFilterOnly: boolean;
}

// ─── App object labels ────────────────────────────────────────────────────────

const APP_OBJECT_LABELS: Record<AppObjectRef, string> = {
  "access-roles":  "Access Roles",
  "organizations": "Organizations",
  "applications":  "Applications",
  "users":         "Users",
};

// ─── Source type definitions ──────────────────────────────────────────────────

interface SourceDef {
  value: ValueSourceType;
  label: string;
  description: string;
}

const SOURCE_TYPES: SourceDef[] = [
  {
    value: "user-defined",
    label: "User-defined",
    description: "Admin types specific values to pre-select when the filter opens.",
  },
  {
    value: "app-object",
    label: "Application object",
    description: "Options are fetched from an application entity (e.g. Access Roles, Organizations).",
  },
  {
    value: "external-system",
    label: "External system (IDS)",
    description: "Options are retrieved from an external identity data store at runtime.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourcePill({
  value,
  onChange,
}: {
  value: ValueSourceType;
  onChange: (v: ValueSourceType) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1">
      {SOURCE_TYPES.map((src) => (
        <button
          key={src.value}
          type="button"
          onClick={() => onChange(src.value)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors ${
            value === src.value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-bluegrey-600 border-bluegrey-300 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          {src.label}
        </button>
      ))}
    </div>
  );
}

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const t = input.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setInput("");
  }

  return (
    <div className="min-h-[34px] flex flex-wrap gap-1.5 px-2.5 py-1.5 border border-bluegrey-300 rounded-sm bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-blue-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          else if (e.key === "Backspace" && !input) onChange(values.slice(0, -1));
        }}
        onBlur={add}
        placeholder={values.length === 0 ? (placeholder ?? "Type a value, press Enter…") : ""}
        className="flex-1 min-w-[100px] text-xs bg-transparent focus:outline-none placeholder:text-bluegrey-400 text-bluegrey-900"
      />
    </div>
  );
}

function StyledSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value as T)}
        className={`w-full h-9 pl-3 pr-8 text-xs border border-bluegrey-300 rounded-sm bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${!value ? "text-bluegrey-400" : "text-bluegrey-900"}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bluegrey-400 pointer-events-none" />
    </div>
  );
}

// ─── Source config panel ──────────────────────────────────────────────────────

function SourceConfig({
  cfg,
  onChange,
}: {
  cfg: FilterAttributeConfig;
  onChange: (patch: Partial<FilterAttributeConfig>) => void;
}) {
  return (
    <div className="space-y-2">
      {/* Source type picker */}
      <SourcePill
        value={cfg.valueSource}
        onChange={(v) => onChange({ valueSource: v })}
      />

      {/* Source-specific config */}
      {cfg.valueSource === "user-defined" && (
        <div className="space-y-1">
          <TagInput
            values={cfg.userDefinedValues ?? []}
            onChange={(v) => onChange({ userDefinedValues: v })}
            placeholder="Type values to pre-select, press Enter…"
          />
          <p className="text-[11px] text-bluegrey-400">
            Pre-selected when the filter opens. Leave empty for no preset.
          </p>
        </div>
      )}

      {cfg.valueSource === "app-object" && (
        <div className="space-y-1.5">
          <StyledSelect<AppObjectRef>
            value={cfg.appObjectRef}
            onChange={(v) => onChange({ appObjectRef: v })}
            options={Object.entries(APP_OBJECT_LABELS).map(([k, label]) => ({
              value: k as AppObjectRef,
              label,
            }))}
            placeholder="Select application object…"
          />
          <p className="text-[11px] text-bluegrey-400">
            Filter options will be dynamically populated from the selected object at runtime.
          </p>
        </div>
      )}

      {cfg.valueSource === "external-system" && (
        <div className="space-y-1.5">
          <input
            type="text"
            value={cfg.externalSystemRef ?? ""}
            onChange={(e) => onChange({ externalSystemRef: e.target.value })}
            placeholder="e.g. IDS.roles.name or https://ids.example.com/values"
            className="w-full h-9 px-3 text-xs border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
          />
          <p className="text-[11px] text-bluegrey-400">
            Attribute path or endpoint in the external identity system that provides the option list.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Select type toggle ───────────────────────────────────────────────────────

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
              ? "bg-blue-600 text-white"
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
  filterableAttrs: AttributeCapability[];
  initial: FilterAttributeConfig[];
  onSave: (configs: FilterAttributeConfig[]) => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildInitialConfig(
  attrs: AttributeCapability[],
  existing: FilterAttributeConfig[]
): FilterAttributeConfig[] {
  return attrs.map((attr) => {
    const prev = existing.find((c) => c.id === attr.id);
    if (prev) return { ...prev, label: attr.label };

    return {
      id: attr.id,
      label: attr.label,
      valueSource: "user-defined" as ValueSourceType,
      userDefinedValues: [],
      valueSelectType: "single",
      allowSingleFilterOnly: false,
    };
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FilterConfigTab({
  filterableAttrs,
  initial,
  onSave,
}: FilterConfigTabProps) {
  const [configs, setConfigs] = useState<FilterAttributeConfig[]>(() =>
    buildInitialConfig(filterableAttrs, initial)
  );
  const [isDirty, setIsDirty] = useState(false);

  const synced = buildInitialConfig(filterableAttrs, configs);

  function update(id: string, patch: Partial<FilterAttributeConfig>) {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
    setIsDirty(true);
  }

  function handleSave() {
    onSave(synced);
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
        <div className="grid grid-cols-[180px_1fr_160px_160px] gap-4 px-4 py-2.5 bg-bluegrey-50 border-b border-bluegrey-200 text-xs font-semibold text-bluegrey-500 uppercase tracking-wider items-center">
          <span>Attribute</span>
          <span>Default value source &amp; configuration</span>
          <span className="text-center">Value select type</span>
          <span className="text-center">Single filter only</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-bluegrey-100">
          {synced.map((cfg) => (
            <div
              key={cfg.id}
              className="grid grid-cols-[180px_1fr_160px_160px] gap-4 px-4 py-4 items-start bg-white hover:bg-bluegrey-25 transition-colors"
            >
              {/* Attribute name */}
              <div className="pt-1">
                <span className="text-sm font-medium text-bluegrey-900">{cfg.label}</span>
                <p className="text-[11px] text-bluegrey-400 mt-0.5">
                  {SOURCE_TYPES.find((s) => s.value === cfg.valueSource)?.description}
                </p>
              </div>

              {/* Source config */}
              <SourceConfig cfg={cfg} onChange={(patch) => update(cfg.id, patch)} />

              {/* Value select type */}
              <div className="flex justify-center pt-1">
                <SelectTypePill
                  value={cfg.valueSelectType}
                  onChange={(v) => update(cfg.id, { valueSelectType: v })}
                />
              </div>

              {/* Single filter only */}
              <div className="flex flex-col items-center gap-1 pt-1">
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
      <div className="grid grid-cols-3 gap-4 text-xs text-bluegrey-500 px-1 pt-1">
        <div>
          <span className="font-semibold text-bluegrey-700">User-defined</span>
          <p className="mt-0.5">Admin types specific pre-selected values manually.</p>
        </div>
        <div>
          <span className="font-semibold text-bluegrey-700">Application object</span>
          <p className="mt-0.5">Options populated dynamically from an entity in the application (Access Roles, Organizations, etc.).</p>
        </div>
        <div>
          <span className="font-semibold text-bluegrey-700">External system (IDS)</span>
          <p className="mt-0.5">Options fetched at runtime from an external identity data store via attribute path or endpoint.</p>
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
