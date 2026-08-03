import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, X, Filter, ChevronDown, Plus, Lock } from "lucide-react";
import type { AttributeCapability } from "./OverviewConfigMatrix";

// ─── Value source types ───────────────────────────────────────────────────────

export type ValueSourceType =
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
  // app-object
  appObjectRef?: AppObjectRef;
  appObjectAttribute?: string;
  // external-system
  externalSystemAttribute?: string;   // IDS attribute key, e.g. "userStatus"
  externalSystemFallback?: string[];  // admin-configured fallback values
  // — Filter behaviour ———————————————————————————————————————————————————————
  valueSelectType: "single" | "multiple";
  /** System attributes have a fixed source config that admins cannot edit. */
  locked?: boolean;
}

// ─── App object attribute catalogue ──────────────────────────────────────────

const APP_OBJECT_LABELS: Record<AppObjectRef, string> = {
  "access-roles":  "Access Roles",
  "organizations": "Organizations",
  "applications":  "Applications",
  "users":         "Users",
};

const APP_OBJECT_ATTRIBUTES: Record<AppObjectRef, { value: string; label: string }[]> = {
  "access-roles": [
    { value: "name",        label: "Access Role Name" },
    { value: "externalId",  label: "Access Role External ID" },
    { value: "description", label: "Description" },
    { value: "type",        label: "Role Type" },
  ],
  "organizations": [
    { value: "name",        label: "Organization Name" },
    { value: "orgId",       label: "Organization ID" },
    { value: "externalId",  label: "External ID" },
    { value: "referenceId", label: "Reference ID" },
    { value: "status",      label: "Status" },
  ],
  "applications": [
    { value: "name",        label: "Application Name" },
    { value: "clientId",    label: "Client ID" },
    { value: "description", label: "Description" },
    { value: "type",        label: "Application Type" },
  ],
  "users": [
    { value: "username",    label: "Username" },
    { value: "email",       label: "Email" },
    { value: "userId",      label: "User ID" },
    { value: "externalId",  label: "External ID" },
  ],
};

// ─── IDS attribute catalogue ──────────────────────────────────────────────────

interface IdsAttribute {
  value: string;
  label: string;
  predefinedValues?: string[];
}

const IDS_ATTRIBUTES: IdsAttribute[] = [
  {
    value: "userStatus",
    label: "User Status",
    predefinedValues: [
      "Active",
      "Blocked",
      "Grace",
      "Inactive",
      "Invited",
      "Invitation expired",
      "Invitation withdrawn",
    ],
  },
  { value: "userId",       label: "User ID" },
  { value: "userEmail",    label: "User Email" },
  { value: "userGroups",   label: "User Groups" },
  { value: "userRoles",    label: "User Roles" },
  { value: "department",   label: "Department" },
  { value: "employeeType", label: "Employee Type" },
  { value: "locale",       label: "Locale" },
  { value: "country",      label: "Country" },
];

// ─── Source type definitions ──────────────────────────────────────────────────

interface SourceDef {
  value: ValueSourceType;
  label: string;
  description: string;
}

const SOURCE_TYPES: SourceDef[] = [
  {
    value: "app-object",
    label: "Application object",
    description: "Options are fetched from an application entity attribute (e.g. Access Role Name, Org ID).",
  },
  {
    value: "external-system",
    label: "External system (IDS)",
    description: "Options are retrieved from an IDS attribute. Fallback values apply if IDS returns nothing.",
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

function StyledSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
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

// ─── Predefined value checklist (IDS fallback) ────────────────────────────────

function PredefinedChecklist({
  pool,
  selected,
  onChange,
}: {
  pool: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {pool.map((v) => {
        const checked = selected.includes(v);
        return (
          <label
            key={v}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors select-none ${
              checked
                ? "bg-blue-50 border-blue-400 text-blue-700"
                : "bg-white border-bluegrey-300 text-bluegrey-600 hover:border-blue-300"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                onChange(checked ? selected.filter((x) => x !== v) : [...selected, v])
              }
              className="sr-only"
            />
            {v}
          </label>
        );
      })}
    </div>
  );
}

// ─── Auto-derived source (Organizations) ──────────────────────────────────────

function AutoSourceConfig({ possibleValues }: { possibleValues: string[] }) {
  if (possibleValues.length === 0) {
    return (
      <p className="text-xs text-bluegrey-500 italic">
        No fixed possible values are configured for this attribute. Filter values will be fetched dynamically at runtime.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-bluegrey-500">
        Values come from this attribute&apos;s <span className="font-medium text-bluegrey-700">Possible values</span> (configured in Attribute Settings):
      </p>
      <div className="flex flex-wrap gap-1.5">
        {possibleValues.map((v) => (
          <span key={v} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bluegrey-100 text-bluegrey-700">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Locked source summary (system attributes) ────────────────────────────────

function LockedSourceSummary({ cfg }: { cfg: FilterAttributeConfig }) {
  const selectedIdsAttr = IDS_ATTRIBUTES.find((a) => a.value === cfg.externalSystemAttribute);
  const attrLabel = cfg.appObjectRef
    ? APP_OBJECT_ATTRIBUTES[cfg.appObjectRef].find((a) => a.value === cfg.appObjectAttribute)?.label
    : undefined;
  const fallbackValues = selectedIdsAttr?.predefinedValues ?? cfg.externalSystemFallback ?? [];

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-bluegrey-500 flex items-center gap-1">
        <Lock className="w-3 h-3" />
        Fixed for this system attribute, not editable.
      </p>

      {cfg.valueSource === "app-object" && cfg.appObjectRef && (
        <p className="text-xs text-bluegrey-700">
          <span className="font-medium">{APP_OBJECT_LABELS[cfg.appObjectRef]}</span>
          {attrLabel ? " - " + attrLabel : ""}
        </p>
      )}

      {cfg.valueSource === "external-system" && selectedIdsAttr && (
        <div className="space-y-1.5">
          <p className="text-xs text-bluegrey-700 font-medium">{selectedIdsAttr.label}</p>
          {fallbackValues.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {fallbackValues.map((v) => (
                <span key={v} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bluegrey-100 text-bluegrey-700">
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Source config panel ──────────────────────────────────────────────────────

function SourceConfig({
  cfg,
  onChange,
  autoValueSource,
  possibleValues,
}: {
  cfg: FilterAttributeConfig;
  onChange: (patch: Partial<FilterAttributeConfig>) => void;
  autoValueSource?: boolean;
  possibleValues?: string[];
}) {
  const selectedIdsAttr = IDS_ATTRIBUTES.find((a) => a.value === cfg.externalSystemAttribute);

  if (autoValueSource) {
    return <AutoSourceConfig possibleValues={possibleValues ?? []} />;
  }

  if (cfg.locked) {
    return <LockedSourceSummary cfg={cfg} />;
  }

  return (
    <div className="space-y-2">
      {/* Source type picker */}
      <SourcePill
        value={cfg.valueSource}
        onChange={(v) => onChange({ valueSource: v })}
      />

      {/* ── Application object ── */}
      {cfg.valueSource === "app-object" && (
        <div className="space-y-2">
          {/* Step 1: object type */}
          <StyledSelect<AppObjectRef>
            value={cfg.appObjectRef}
            onChange={(v) => onChange({ appObjectRef: v, appObjectAttribute: undefined })}
            options={Object.entries(APP_OBJECT_LABELS).map(([k, label]) => ({
              value: k as AppObjectRef,
              label,
            }))}
            placeholder="Select object type…"
          />

          {/* Step 2: attribute (shown once object is selected) */}
          {cfg.appObjectRef && (
            <StyledSelect<string>
              value={cfg.appObjectAttribute}
              onChange={(v) => onChange({ appObjectAttribute: v })}
              options={APP_OBJECT_ATTRIBUTES[cfg.appObjectRef]}
              placeholder="Select attribute…"
            />
          )}

          <p className="text-[11px] text-bluegrey-400">
            Filter options will be populated from the selected object attribute at runtime.
          </p>
        </div>
      )}

      {/* ── External system (IDS) ── */}
      {cfg.valueSource === "external-system" && (
        <div className="space-y-2">
          {/* IDS attribute picker */}
          <StyledSelect<string>
            value={cfg.externalSystemAttribute}
            onChange={(v) =>
              onChange({
                externalSystemAttribute: v,
                externalSystemFallback: [],
              })
            }
            options={IDS_ATTRIBUTES.map((a) => ({ value: a.value, label: a.label }))}
            placeholder="Select IDS attribute…"
          />

          {/* Once attribute is chosen */}
          {selectedIdsAttr && (
            <div className="space-y-2 rounded-md border border-bluegrey-200 bg-bluegrey-25 p-3">
              {selectedIdsAttr.predefinedValues && selectedIdsAttr.predefinedValues.length > 0 ? (
                <>
                  <p className="text-[11px] font-medium text-bluegrey-600">
                    Pre-defined values for <span className="font-semibold text-bluegrey-800">{selectedIdsAttr.label}</span> — check which should be pre-selected by default:
                  </p>
                  <PredefinedChecklist
                    pool={selectedIdsAttr.predefinedValues}
                    selected={cfg.externalSystemFallback ?? []}
                    onChange={(v) => onChange({ externalSystemFallback: v })}
                  />
                  <p className="text-[11px] text-bluegrey-400">
                    These values are used as fallback defaults if IDS returns no data at runtime.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-medium text-bluegrey-600">
                    No pre-defined values for <span className="font-semibold text-bluegrey-800">{selectedIdsAttr.label}</span>. Configure fallback values:
                  </p>
                  <TagInput
                    values={cfg.externalSystemFallback ?? []}
                    onChange={(v) => onChange({ externalSystemFallback: v })}
                    placeholder="Type fallback values, press Enter…"
                  />
                  <p className="text-[11px] text-bluegrey-400">
                    Shown as defaults if IDS returns nothing. Leave empty to show no preset.
                  </p>
                </>
              )}
            </div>
          )}

          {!selectedIdsAttr && (
            <p className="text-[11px] text-bluegrey-400">
              Select an IDS attribute to configure default / fallback values.
            </p>
          )}
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
  autoValueSource?: boolean;
  attributePossibleValues?: Record<string, string[]>;
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
      valueSource: "app-object" as ValueSourceType,
      valueSelectType: "single",
    };
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FilterConfigTab({
  filterableAttrs,
  initial,
  onSave,
  autoValueSource = false,
  attributePossibleValues = {},
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
        <div className="grid grid-cols-[180px_1fr_160px] gap-4 px-4 py-2.5 bg-bluegrey-50 border-b border-bluegrey-200 text-xs font-semibold text-bluegrey-500 uppercase tracking-wider items-center">
          <span>Attribute</span>
          <span>Default value source &amp; configuration</span>
          <span className="text-center">Value select type</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-bluegrey-100">
          {synced.map((cfg) => (
            <div
              key={cfg.id}
              className="grid grid-cols-[180px_1fr_160px] gap-4 px-4 py-4 items-start bg-white hover:bg-bluegrey-25 transition-colors"
            >
              {/* Attribute name */}
              <div className="pt-1">
                <span className="text-sm font-medium text-bluegrey-900">{cfg.label}</span>
                {!autoValueSource && (
                  <p className="text-[11px] text-bluegrey-400 mt-0.5">
                    {SOURCE_TYPES.find((s) => s.value === cfg.valueSource)?.label}
                  </p>
                )}
              </div>

              {/* Source config */}
              <SourceConfig
                cfg={cfg}
                onChange={(patch) => update(cfg.id, patch)}
                autoValueSource={autoValueSource}
                possibleValues={attributePossibleValues[cfg.id]}
              />

              {/* Value select type */}
              <div className="flex justify-center pt-1">
                <SelectTypePill
                  value={cfg.valueSelectType}
                  onChange={(v) => update(cfg.id, { valueSelectType: v })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      {autoValueSource && (
        <p className="text-xs text-bluegrey-500 px-1 pt-1">
          Filter values are derived automatically from each attribute&apos;s configuration: attributes with <strong>Possible values</strong> defined show those as options; others fetch their values dynamically at runtime.
        </p>
      )}

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
