import { useState } from "react";
import {
  Plus, Trash2, RotateCcw, Globe, AlertCircle,
  Lock, Check, X, Code, ToggleLeft, Hash, Type, CalendarClock, ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
}

interface FormatTranslation {
  language: string;
  message: string;
}

export type AttributeType = "string" | "number" | "boolean" | "datetime";

export type AccessLevel = "immutable" | "readOnly" | "readWrite" | "writeOnly";

export interface OrgAttribute {
  id: string;
  defaultLabel: string;
  description: string;
  isSystem: boolean;
  type: AttributeType;
  accessLevel: AccessLevel;
  identifier: boolean;
  required: boolean;
  unique: boolean;
  caseSensitive: boolean;
  possibleValues: string[];
  minLength: number | "";
  maxLength: number | "";
  regex: string;
  translations: Translation[];
  validationTranslations: ValidationTranslation[];
  formatTranslations: FormatTranslation[];
}

const ATTRIBUTE_TYPES: { value: AttributeType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "string",   label: "String",    icon: Type,          description: "Text value" },
  { value: "number",   label: "Number",    icon: Hash,          description: "Numeric value" },
  { value: "boolean",  label: "Boolean",   icon: ToggleLeft,    description: "True / false toggle" },
  { value: "datetime", label: "Date/Time", icon: CalendarClock, description: "Date and/or time value" },
];

const ACCESS_LEVELS: { value: AccessLevel; label: string; description: string }[] = [
  { value: "immutable", label: "immutable", description: "Set once and can never be changed afterwards." },
  { value: "readOnly",  label: "readOnly",  description: "Value can be viewed but never written by users." },
  { value: "readWrite", label: "readWrite", description: "Value can be viewed and updated." },
  { value: "writeOnly", label: "writeOnly", description: "Value can be set but not read back." },
];

const BOOLEAN_POSSIBLE_VALUES = ["TRUE", "FALSE"];

// ─── Static data ──────────────────────────────────────────────────────────────

export const SYSTEM_ORG_ATTRIBUTES: OrgAttribute[] = [
  {
    id: "orgName", defaultLabel: "Organization Name",
    description: "The organization's display name.",
    isSystem: true,
    type: "string", accessLevel: "readWrite", identifier: false, required: true, unique: true, caseSensitive: false,
    possibleValues: [], minLength: 2, maxLength: 100, regex: "",
    translations: [], validationTranslations: [], formatTranslations: [],
  },
  {
    id: "description", defaultLabel: "Description",
    description: "A short free-text description of the organization.",
    isSystem: true,
    type: "string", accessLevel: "readWrite", identifier: false, required: false, unique: false, caseSensitive: false,
    possibleValues: [], minLength: "", maxLength: 500, regex: "",
    translations: [], validationTranslations: [], formatTranslations: [],
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

// ─── Restrictions ─────────────────────────────────────────────────────────────

const RESTRICTIONS: {
  key: "identifier" | "required" | "unique" | "caseSensitive";
  label: string;
  description: string;
  stringOnly?: boolean;
}[] = [
  {
    key: "identifier",
    label: "Identifier",
    description: "The attribute must be a unique identifier, such as a user ID or email address.",
  },
  {
    key: "required",
    label: "Required",
    description: "The attribute must have a value, which prevents empty entries.",
  },
  {
    key: "unique",
    label: "Unique",
    description: "The value must be unique across all organizations.",
  },
  {
    key: "caseSensitive",
    label: "Case sensitive",
    description: "Attribute values are case-sensitive. For example, \"onewelcome\" and \"OneWelcome\" are different values.",
    stringOnly: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function activeRules(attr: OrgAttribute) {
  const isString = attr.type === "string";
  return {
    required:  attr.required,
    unique:    attr.unique,
    minLength: isString && attr.minLength !== "",
    maxLength: isString && attr.maxLength !== "",
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
      </div>
      <button type="button" onClick={onRemove} className="p-1.5 mt-0.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Inline format translation row ───────────────────────────────────────────

function FormatTranslationRow({
  row, usedLanguages, onChange, onRemove,
}: {
  row: FormatTranslation; usedLanguages: string[];
  onChange: (r: FormatTranslation) => void; onRemove: () => void;
}) {
  const available = LANGUAGES.filter((l) => l.code === row.language || !usedLanguages.includes(l.code));
  return (
    <div className="flex items-center gap-2">
      <Select value={row.language} onValueChange={(v) => onChange({ ...row, language: v })}>
        <SelectTrigger className="w-32 h-8 text-sm shrink-0"><SelectValue placeholder="Language" /></SelectTrigger>
        <SelectContent>{available.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
      </Select>
      <input type="text" value={row.message} onChange={(e) => onChange({ ...row, message: e.target.value })}
        placeholder={ENGLISH_DEFAULTS.format}
        className="flex-1 h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <button type="button" onClick={onRemove} className="p-1.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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

// ─── Restrictions checkbox row ────────────────────────────────────────────────

function RestrictionRow({
  label, description, checked, disabled, onChange,
}: {
  label: string; description: string; checked: boolean; disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-start gap-2.5 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-bluegrey-900">{label}</p>
        <p className="text-xs text-bluegrey-500">{description}</p>
      </div>
    </label>
  );
}

// ─── Possible values editor ───────────────────────────────────────────────────

function PossibleValuesEditor({ attr, onChange }: {
  attr: OrgAttribute; onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const isBoolean = attr.type === "boolean";
  const values = isBoolean ? BOOLEAN_POSSIBLE_VALUES : attr.possibleValues;

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...attr.possibleValues, trimmed]);
    setDraft("");
  };
  const removeValue = (v: string) => onChange(attr.possibleValues.filter((x) => x !== v));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <ListChecks className="w-3.5 h-3.5 text-bluegrey-500" />
        <p className="text-sm font-medium text-bluegrey-900">Possible values</p>
        <span className="text-[10px] text-bluegrey-400 ml-auto">optional</span>
      </div>
      <p className="text-xs text-bluegrey-500">
        {isBoolean
          ? "Boolean attributes automatically accept these two values."
          : "Restrict this attribute to a specific set of values, e.g. ACTIVE, INACTIVE, DISABLED. Leave empty to accept any value."}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {values.length === 0 && (
          <span className="text-xs text-bluegrey-400 italic">Any value is accepted.</span>
        )}
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-bluegrey-100 text-bluegrey-700">
            {v}
            {!isBoolean && (
              <button type="button" onClick={() => removeValue(v)} className="text-bluegrey-400 hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {!isBoolean && (
        <div className="flex items-center gap-2">
          <input
            type="text" value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addValue(); } }}
            placeholder="Add a value and press Enter…"
            className="flex-1 h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <button type="button" onClick={addValue} disabled={!draft.trim()}
            className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
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
    onChange({ ...attr, validationTranslations: [...attr.validationTranslations, { language: next.code, requiredMessage: "", uniqueMessage: "", minLengthMessage: "", maxLengthMessage: "" }] });
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

        {/* ── Description ── */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-bluegrey-900">Attribute description</p>
          <textarea
            value={attr.description}
            onChange={(e) => onChange({ ...attr, description: e.target.value })}
            placeholder="Describe what this attribute is used for…"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="border-t border-bluegrey-100" />

        {/* ── Validation constraints ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-bluegrey-500 uppercase tracking-wide">Validation constraints</p>

          {/* Type selector — dropdown */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-bluegrey-900">Attribute type</p>
            <p className="text-xs text-bluegrey-500">Determines what kind of value this attribute holds.</p>
            <Select
              value={attr.type}
              disabled={attr.isSystem}
              onValueChange={(v) => onChange({ ...attr, type: v as AttributeType, minLength: "", maxLength: "", regex: "", possibleValues: [] })}
            >
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ATTRIBUTE_TYPES.map(({ value, label, icon: Icon, description }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-bluegrey-500" />
                      {label}
                      <span className="text-xs text-bluegrey-400">— {description}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Access level */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-bluegrey-900">Access level</p>
            <p className="text-xs text-bluegrey-500">Controls whether this attribute can be read and/or written.</p>
            <Select
              value={attr.accessLevel}
              onValueChange={(v) => onChange({ ...attr, accessLevel: v as AccessLevel })}
            >
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_LEVELS.map(({ value, label, description }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex flex-col">
                      <span>{label}</span>
                      <span className="text-xs text-bluegrey-400">{description}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-bluegrey-100" />

          {/* Restrictions */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-bluegrey-900">Restrictions</p>
            <div className="space-y-3">
              {RESTRICTIONS.map((r) => {
                const disabled =
                  (r.stringOnly && attr.type !== "string") ||
                  (r.key === "required" && attr.isSystem && attr.id === "orgName");
                return (
                  <RestrictionRow
                    key={r.key}
                    label={r.label}
                    description={r.description}
                    checked={r.stringOnly && attr.type !== "string" ? false : attr[r.key]}
                    disabled={disabled}
                    onChange={(v) => onChange({ ...attr, [r.key]: v })}
                  />
                );
              })}
            </div>
          </div>

          <div className="border-t border-bluegrey-100" />

          {/* Possible values */}
          <PossibleValuesEditor
            attr={attr}
            onChange={(values) => onChange({ ...attr, possibleValues: values })}
          />

          {/* Min / Max length — string only */}
          {attr.type === "string" && (
            <div className="space-y-2 pt-1">
              <NumInput label="Minimum length" value={attr.minLength}
                onChange={(v) => onChange({ ...attr, minLength: v })} min={0} />
              <NumInput label="Maximum length" value={attr.maxLength}
                onChange={(v) => onChange({ ...attr, maxLength: v })} min={0} />
            </div>
          )}

          {/* Regex + inline format translations — string only */}
          {attr.type === "string" && (
            <div className="space-y-3 pt-1 border border-bluegrey-100 rounded-md px-3 py-3 bg-bluegrey-25">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-bluegrey-500" />
                  <p className="text-sm font-medium text-bluegrey-900">Format check (regex)</p>
                  <span className="text-[10px] text-bluegrey-400 ml-auto">optional</span>
                </div>
                <input type="text" value={attr.regex}
                  onChange={(e) => onChange({ ...attr, regex: e.target.value })}
                  placeholder="e.g. ^[A-Za-z0-9 ]{2,100}$"
                  className="w-full h-9 px-3 text-sm font-mono border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Inline format error translations */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-bluegrey-600">Format error translations</p>
                {/* English default (read-only) */}
                <div className="flex items-center gap-2">
                  <div className="w-32 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-white text-bluegrey-500 shrink-0">English</div>
                  <div className="flex-1 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-white text-bluegrey-500 gap-1.5">
                    <span className={`text-[10px] font-semibold px-1 py-0.5 rounded border shrink-0 ${RULE_BADGE.format}`}>format</span>
                    {attr.regex ? ENGLISH_DEFAULTS.format : <span className="italic text-bluegrey-400">Enter a regex above to activate</span>}
                  </div>
                  <div className="w-7" />
                </div>

                {attr.formatTranslations.map((row, i) => (
                  <FormatTranslationRow key={i} row={row}
                    usedLanguages={attr.formatTranslations.filter((_, idx) => idx !== i).map((t) => t.language)}
                    onChange={(u) => {
                      const next = [...attr.formatTranslations]; next[i] = u;
                      onChange({ ...attr, formatTranslations: next });
                    }}
                    onRemove={() => onChange({ ...attr, formatTranslations: attr.formatTranslations.filter((_, idx) => idx !== i) })}
                  />
                ))}

                {attr.formatTranslations.length < LANGUAGES.length && (
                  <button type="button"
                    onClick={() => {
                      const usedLangs = attr.formatTranslations.map((t) => t.language);
                      const next = LANGUAGES.find((l) => !usedLangs.includes(l.code));
                      if (!next) return;
                      onChange({ ...attr, formatTranslations: [...attr.formatTranslations, { language: next.code, message: "" }] });
                    }}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    <Plus className="w-3.5 h-3.5" />Add language
                  </button>
                )}
              </div>
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
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = trimmed.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/\s/g, "").replace(/^./, (c) => c.toLowerCase());
    onAdd({
      id, defaultLabel: trimmed, description: description.trim(), isSystem: false,
      type: "string", accessLevel: "readWrite", identifier: false, required: false, unique: false, caseSensitive: false,
      possibleValues: [], minLength: "", maxLength: "", regex: "",
      translations: [], validationTranslations: [], formatTranslations: [],
    });
    setLabel("");
    setDescription("");
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
    <div className="px-3 py-2.5 border-t border-bluegrey-100 space-y-2">
      <input autoFocus type="text" value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        placeholder="Attribute label…"
        className="w-full h-8 px-3 text-sm border border-blue-400 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <textarea value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Attribute description…"
        rows={2}
        className="w-full px-3 py-2 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
      />
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleAdd} disabled={!label.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <Check className="w-3.5 h-3.5" />Add
        </button>
        <button type="button" onClick={() => { setLabel(""); setDescription(""); setOpen(false); }}
          className="p-1.5 h-8 w-8 flex items-center justify-center rounded border border-bluegrey-200 text-bluegrey-500 hover:bg-bluegrey-50 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
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
