import { useState } from "react";
import {
  Plus, Trash2, RotateCcw, Globe, AlertCircle,
  Lock, Check, X, Code, ToggleLeft, Hash, Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Translation {
  language: string;
  label: string;
}

interface ValidationTranslation {
  language: string;
  requiredMessage: string;
  uniqueMessage: string;
  minLengthMessage: string;
  maxLengthMessage: string;
  formatMessage: string;
}

export type AttributeType = "string" | "number" | "boolean";

export interface OrgAttribute {
  id: string;
  defaultLabel: string;
  isSystem: boolean;
  type: AttributeType;
  required: boolean;
  unique: boolean;
  minLength: number | "";
  maxLength: number | "";
  regex: string;
  translations: Translation[];
  validationTranslations: ValidationTranslation[];
}

const ATTRIBUTE_TYPES: { value: AttributeType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "string",  label: "String",  icon: Type,        description: "Text value" },
  { value: "number",  label: "Number",  icon: Hash,        description: "Numeric value" },
  { value: "boolean", label: "Boolean", icon: ToggleLeft,  description: "True / false toggle" },
];

// ─── Static data ──────────────────────────────────────────────────────────────

export const SYSTEM_ORG_ATTRIBUTES: OrgAttribute[] = [
  {
    id: "orgName", defaultLabel: "Organization Name", isSystem: true,
    type: "string", required: true, unique: true, minLength: 2, maxLength: 100, regex: "",
    translations: [], validationTranslations: [],
  },
  {
    id: "description", defaultLabel: "Description", isSystem: true,
    type: "string", required: false, unique: false, minLength: "", maxLength: 500, regex: "",
    translations: [], validationTranslations: [],
  },
];

const LANGUAGES = [
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "nl", label: "Dutch" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
];

// ─── English default messages ─────────────────────────────────────────────────

const ENGLISH_DEFAULTS = {
  required:  "This field is required.",
  unique:    "This value is already in use.",
  minLength: (n: number | "") => `Must be at least ${n} characters.`,
  maxLength: (n: number | "") => `Must be no more than ${n} characters.`,
  format:    "The value does not match the expected format.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function activeRules(attr: OrgAttribute) {
  const isString = attr.type === "string";
  return {
    required:  attr.required,
    unique:    attr.unique,
    minLength: isString && attr.minLength !== "",
    maxLength: isString && attr.maxLength !== "",
    format:    isString && !!attr.regex,
  };
}

// ─── Translation row ──────────────────────────────────────────────────────────

function LabelTranslationRow({
  t, usedLanguages, onChange, onRemove,
}: {
  t: Translation; usedLanguages: string[];
  onChange: (t: Translation) => void; onRemove: () => void;
}) {
  const available = LANGUAGES.filter((l) => l.code === t.language || !usedLanguages.includes(l.code));
  return (
    <div className="flex items-center gap-2">
      <Select value={t.language} onValueChange={(v) => onChange({ ...t, language: v })}>
        <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="Language" /></SelectTrigger>
        <SelectContent>{available.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
      </Select>
      <input type="text" value={t.label} onChange={(e) => onChange({ ...t, label: e.target.value })}
        placeholder="Translated label…"
        className="flex-1 h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <button type="button" onClick={onRemove} className="p-1.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Validation translation row ───────────────────────────────────────────────

const RULE_BADGE: Record<string, string> = {
  required:  "bg-red-50 text-red-700 border-red-200",
  unique:    "bg-amber-50 text-amber-700 border-amber-200",
  minLength: "bg-blue-50 text-blue-700 border-blue-200",
  maxLength: "bg-blue-50 text-blue-700 border-blue-200",
  format:    "bg-purple-50 text-purple-700 border-purple-200",
};

function ValidationTranslationRow({
  row, usedLanguages, rules, attr, onChange, onRemove,
}: {
  row: ValidationTranslation; usedLanguages: string[];
  rules: ReturnType<typeof activeRules>; attr: OrgAttribute;
  onChange: (r: ValidationTranslation) => void; onRemove: () => void;
}) {
  const available = LANGUAGES.filter((l) => l.code === row.language || !usedLanguages.includes(l.code));
  return (
    <div className="flex items-start gap-2">
      <Select value={row.language} onValueChange={(v) => onChange({ ...row, language: v })}>
        <SelectTrigger className="w-32 h-8 text-sm shrink-0"><SelectValue placeholder="Language" /></SelectTrigger>
        <SelectContent>{available.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
      </Select>
      <div className="flex-1 flex flex-col gap-1.5">
        {rules.required && (
          <input type="text" value={row.requiredMessage} onChange={(e) => onChange({ ...row, requiredMessage: e.target.value })}
            placeholder={ENGLISH_DEFAULTS.required}
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        {rules.unique && (
          <input type="text" value={row.uniqueMessage} onChange={(e) => onChange({ ...row, uniqueMessage: e.target.value })}
            placeholder={ENGLISH_DEFAULTS.unique}
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        {rules.minLength && (
          <input type="text" value={row.minLengthMessage} onChange={(e) => onChange({ ...row, minLengthMessage: e.target.value })}
            placeholder={ENGLISH_DEFAULTS.minLength(attr.minLength)}
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        {rules.maxLength && (
          <input type="text" value={row.maxLengthMessage} onChange={(e) => onChange({ ...row, maxLengthMessage: e.target.value })}
            placeholder={ENGLISH_DEFAULTS.maxLength(attr.maxLength)}
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        {rules.format && (
          <input type="text" value={row.formatMessage} onChange={(e) => onChange({ ...row, formatMessage: e.target.value })}
            placeholder={ENGLISH_DEFAULTS.format}
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>
      <button type="button" onClick={onRemove} className="p-1.5 mt-0.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Number input ─────────────────────────────────────────────────────────────

function NumInput({ label, value, onChange, min = 0 }: {
  label: string; value: number | ""; onChange: (v: number | "") => void; min?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-bluegrey-600 w-28 shrink-0">{label}</span>
      <input
        type="number" min={min}
        value={value === "" ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Math.max(min, parseInt(e.target.value, 10) || 0))}
        placeholder="—"
        className="w-24 h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      {value !== "" && (
        <button type="button" onClick={() => onChange("")} className="text-xs text-bluegrey-400 hover:text-red-500 transition-colors">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ─── English default row ──────────────────────────────────────────────────────

function EnglishDefaultRow({ ruleKey, text }: { ruleKey: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5 min-h-8 px-3 text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">
      <span className={`text-[10px] font-semibold px-1 py-0.5 rounded border shrink-0 ${RULE_BADGE[ruleKey]}`}>
        {ruleKey}
      </span>
      {text}
    </div>
  );
}

// ─── Config panel ─────────────────────────────────────────────────────────────

function AttributePanel({ attr, onChange, onDelete }: {
  attr: OrgAttribute; onChange: (a: OrgAttribute) => void; onDelete: () => void;
}) {
  const usedLabelLangs = attr.translations.map((t) => t.language);
  const usedValidLangs = attr.validationTranslations.map((t) => t.language);
  const rules = activeRules(attr);
  const hasAnyValidation = Object.values(rules).some(Boolean);

  const addLabel = () => {
    const next = LANGUAGES.find((l) => !usedLabelLangs.includes(l.code));
    if (!next) return;
    onChange({ ...attr, translations: [...attr.translations, { language: next.code, label: "" }] });
  };
  const updateLabel = (i: number, t: Translation) => {
    const next = [...attr.translations]; next[i] = t;
    onChange({ ...attr, translations: next });
  };
  const removeLabel = (i: number) => onChange({ ...attr, translations: attr.translations.filter((_, idx) => idx !== i) });

  const addValidation = () => {
    const next = LANGUAGES.find((l) => !usedValidLangs.includes(l.code));
    if (!next) return;
    onChange({ ...attr, validationTranslations: [...attr.validationTranslations, { language: next.code, requiredMessage: "", uniqueMessage: "", minLengthMessage: "", maxLengthMessage: "", formatMessage: "" }] });
  };
  const updateValidation = (i: number, r: ValidationTranslation) => {
    const next = [...attr.validationTranslations]; next[i] = r;
    onChange({ ...attr, validationTranslations: next });
  };
  const removeValidation = (i: number) => onChange({ ...attr, validationTranslations: attr.validationTranslations.filter((_, idx) => idx !== i) });

  return (
    <div className="border border-bluegrey-200 rounded-md overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-bluegrey-50 border-b border-bluegrey-200 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <p className="text-sm font-semibold text-bluegrey-900">{attr.defaultLabel}</p>
        <span className="font-mono text-xs text-bluegrey-400 ml-1">{attr.id}</span>
        {attr.isSystem && (
          <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-bluegrey-100 text-bluegrey-600 border-bluegrey-200">
            <Lock className="w-2.5 h-2.5" /> system
          </span>
        )}
        {!attr.isSystem && (
          <button type="button" onClick={onDelete}
            className="ml-auto p-1.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="px-4 py-5 space-y-5 overflow-y-auto max-h-[calc(100vh-280px)]">

        {/* ── Validation constraints ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Validation constraints</p>

          {/* Type selector */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-bluegrey-900">Attribute type</p>
            <p className="text-xs text-bluegrey-500">Determines what kind of value this attribute holds.</p>
            <div className="flex gap-2">
              {ATTRIBUTE_TYPES.map(({ value, label, icon: Icon, description }) => {
                const isActive = attr.type === value;
                const isDisabled = attr.isSystem;
                return (
                  <button
                    key={value} type="button"
                    disabled={isDisabled}
                    onClick={() => onChange({ ...attr, type: value, minLength: "", maxLength: "", regex: "" })}
                    className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-md border-2 text-xs font-medium transition-colors ${
                      isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    } ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-bluegrey-200 bg-white text-bluegrey-600 hover:border-bluegrey-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    <span className={`text-[10px] font-normal ${isActive ? "text-blue-500" : "text-bluegrey-400"}`}>{description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-bluegrey-100" />

          {/* Required */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bluegrey-900">Required</p>
              <p className="text-xs text-bluegrey-500">Field must be filled when creating an organization</p>
            </div>
            <Switch checked={attr.required}
              onCheckedChange={(v) => onChange({ ...attr, required: v })}
              disabled={attr.isSystem && attr.id === "orgName"}
            />
          </div>

          {/* Unique */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-bluegrey-900">Unique</p>
              <p className="text-xs text-bluegrey-500">Value must be unique across all organizations</p>
            </div>
            <Switch checked={attr.unique} onCheckedChange={(v) => onChange({ ...attr, unique: v })} />
          </div>

          {/* Min / Max length — string only */}
          {attr.type === "string" && (
            <div className="space-y-2 pt-1">
              <NumInput label="Minimum length" value={attr.minLength}
                onChange={(v) => onChange({ ...attr, minLength: v })} min={0} />
              <NumInput label="Maximum length" value={attr.maxLength}
                onChange={(v) => onChange({ ...attr, maxLength: v })} min={0} />
            </div>
          )}

          {/* Regex — string only */}
          {attr.type === "string" && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-bluegrey-500" />
                <p className="text-sm font-medium text-bluegrey-900">Regex pattern</p>
              </div>
              <input type="text" value={attr.regex}
                onChange={(e) => onChange({ ...attr, regex: e.target.value })}
                placeholder="e.g. ^[A-Za-z0-9 ]{2,100}$  (optional)"
                className="w-full h-9 px-3 text-sm font-mono border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        <div className="border-t border-bluegrey-100" />

        {/* ── Label translations ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-bluegrey-500" />
            <p className="text-sm font-medium text-bluegrey-900">Label translations</p>
          </div>
          <p className="text-xs text-bluegrey-500">English is the default.</p>

          {/* English default */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">English</div>
            <div className="flex-1 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500 gap-2">
              {attr.defaultLabel}
              <span className="text-[10px] text-bluegrey-400 bg-bluegrey-100 px-1.5 py-0.5 rounded">default</span>
            </div>
            <div className="w-7" />
          </div>

          {attr.translations.map((t, i) => (
            <LabelTranslationRow key={i} t={t}
              usedLanguages={usedLabelLangs.filter((_, idx) => idx !== i)}
              onChange={(u) => updateLabel(i, u)}
              onRemove={() => removeLabel(i)}
            />
          ))}
          {attr.translations.length < LANGUAGES.length && (
            <button type="button" onClick={addLabel}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />Add language
            </button>
          )}
        </div>

        {/* ── Validation error translations ── */}
        {hasAnyValidation && (
          <>
            <div className="border-t border-bluegrey-100" />
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-bluegrey-500" />
                <p className="text-sm font-medium text-bluegrey-900">Validation error translations</p>
              </div>
              <p className="text-xs text-bluegrey-500">
                Translate the error messages shown when validation fails. Active rules:{" "}
                <span className="font-medium text-bluegrey-700">
                  {Object.entries(rules).filter(([, v]) => v).map(([k]) => k).join(", ")}
                </span>.
              </p>

              {/* English defaults (read-only) */}
              <div className="flex items-start gap-2">
                <div className="w-32 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500 shrink-0">English</div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {rules.required  && <EnglishDefaultRow ruleKey="required"  text={ENGLISH_DEFAULTS.required} />}
                  {rules.unique    && <EnglishDefaultRow ruleKey="unique"    text={ENGLISH_DEFAULTS.unique} />}
                  {rules.minLength && <EnglishDefaultRow ruleKey="minLength" text={ENGLISH_DEFAULTS.minLength(attr.minLength)} />}
                  {rules.maxLength && <EnglishDefaultRow ruleKey="maxLength" text={ENGLISH_DEFAULTS.maxLength(attr.maxLength)} />}
                  {rules.format    && <EnglishDefaultRow ruleKey="format"    text={ENGLISH_DEFAULTS.format} />}
                </div>
                <div className="w-7" />
              </div>

              {attr.validationTranslations.map((row, i) => (
                <ValidationTranslationRow key={i} row={row}
                  usedLanguages={usedValidLangs.filter((_, idx) => idx !== i)}
                  rules={rules} attr={attr}
                  onChange={(u) => updateValidation(i, u)}
                  onRemove={() => removeValidation(i)}
                />
              ))}
              {attr.validationTranslations.length < LANGUAGES.length && (
                <button type="button" onClick={addValidation}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  <Plus className="w-3.5 h-3.5" />Add language
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Add attribute form ───────────────────────────────────────────────────────

function AddAttributeForm({ onAdd }: { onAdd: (a: OrgAttribute) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = trimmed.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/\s/g, "").replace(/^./, (c) => c.toLowerCase());
    onAdd({ id, defaultLabel: trimmed, isSystem: false, type: "string", required: false, unique: false, minLength: "", maxLength: "", regex: "", translations: [], validationTranslations: [] });
    setLabel("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border-t border-bluegrey-100 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
        <Plus className="w-3.5 h-3.5" />Add attribute
      </button>
    );
  }

  return (
    <div className="px-3 py-2.5 border-t border-bluegrey-100 flex items-center gap-2">
      <input autoFocus type="text" value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setOpen(false); }}
        placeholder="Attribute label…"
        className="flex-1 h-8 px-3 text-sm border border-blue-400 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button type="button" onClick={handleAdd} disabled={!label.trim()}
        className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <Check className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => { setLabel(""); setOpen(false); }}
        className="p-1.5 rounded border border-bluegrey-200 text-bluegrey-500 hover:bg-bluegrey-50 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface OrgAttributeSettingsProps {
  attributes: OrgAttribute[];
  onChange: (attrs: OrgAttribute[]) => void;
  onReset: () => void;
}

export default function OrgAttributeSettings({ attributes, onChange, onReset }: OrgAttributeSettingsProps) {
  const [selectedId, setSelectedId] = useState(attributes[0]?.id ?? "");

  const selected = attributes.find((a) => a.id === selectedId) ?? null;

  const handleChange = (updated: OrgAttribute) =>
    onChange(attributes.map((a) => (a.id === updated.id ? updated : a)));

  const handleDelete = (id: string) => {
    const next = attributes.filter((a) => a.id !== id);
    onChange(next);
    setSelectedId(next[0]?.id ?? "");
  };

  const handleAdd = (attr: OrgAttribute) => {
    onChange([...attributes, attr]);
    setSelectedId(attr.id);
  };

  return (
    <div className="px-6 py-6 space-y-5">
      <p className="text-sm text-bluegrey-500 max-w-2xl">
        Configure attributes for the Organization entity. System attributes (Organization Name, Description) are always present and cannot be removed. Add custom attributes and configure their validation rules, translations and error messages.
      </p>

      <div className="grid grid-cols-[220px_1fr] gap-5">
        {/* Left: attribute list */}
        <div className="border border-bluegrey-200 rounded-md overflow-hidden self-start">
          {attributes.map((attr) => {
            const isActive = attr.id === selectedId;
            const rules = activeRules(attr);
            const activeCount = Object.values(rules).filter(Boolean).length;
            return (
              <button key={attr.id} type="button" onClick={() => setSelectedId(attr.id)}
                className={`w-full text-left px-3 py-3 flex items-center gap-2 border-b border-bluegrey-100 last:border-b-0 transition-colors ${
                  isActive ? "bg-blue-50" : "bg-white hover:bg-bluegrey-25"
                }`}
              >
                <span className={`text-sm font-medium flex-1 ${isActive ? "text-blue-700" : "text-bluegrey-900"}`}>
                  {attr.defaultLabel}
                </span>
                {attr.isSystem && <Lock className="w-3 h-3 text-bluegrey-400 shrink-0" />}
                {activeCount > 0 && !attr.isSystem && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                    {activeCount}
                  </span>
                )}
              </button>
            );
          })}
          <AddAttributeForm onAdd={handleAdd} />
        </div>

        {/* Right: config panel */}
        {selected ? (
          <AttributePanel key={selected.id} attr={selected} onChange={handleChange} onDelete={() => handleDelete(selected.id)} />
        ) : (
          <div className="border border-bluegrey-200 rounded-md px-4 py-8 text-center text-sm text-bluegrey-400">
            Select an attribute to configure it.
          </div>
        )}
      </div>

      <Button variant="outline" onClick={onReset} className="gap-2 text-bluegrey-600">
        <RotateCcw className="w-4 h-4" />Reset to default
      </Button>
    </div>
  );
}
