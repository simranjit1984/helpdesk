import { useState } from "react";
import { Plus, Trash2, Save, RotateCcw, Globe, Tag, AlertCircle, Info, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Translation {
  language: string;
  label: string;
}

interface ValidationErrorTranslations {
  language: string;
  requiredMessage: string;
  formatMessage: string;
  uniqueMessage: string;
}

export interface IDSMetadata {
  mandatory: boolean;
  unique: boolean;
  identifier: boolean;
  regex?: string;
}

export interface GlobalAttributeSetting {
  id: string;
  defaultLabel: string;
  category: string;
  idsMetadata: IDSMetadata;
  translations: Translation[];
  validationTranslations: ValidationErrorTranslations[];
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Basic Info",
  "Contact Info",
  "Access Info",
  "Organization Info",
  "System",
];

const LANGUAGES = [
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "nl", label: "Dutch" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Basic Info":        "bg-blue-50 text-blue-700 border-blue-200",
  "Contact Info":      "bg-teal-50 text-teal-700 border-teal-200",
  "Access Info":       "bg-purple-50 text-purple-700 border-purple-200",
  "Organization Info": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "System":            "bg-bluegrey-100 text-bluegrey-600 border-bluegrey-200",
};

const DEFAULT_ATTRIBUTES: GlobalAttributeSetting[] = [
  {
    id: "firstName", defaultLabel: "First Name", category: "Basic Info",
    idsMetadata: { mandatory: true,  unique: false, identifier: false },
    translations: [], validationTranslations: [],
  },
  {
    id: "lastName", defaultLabel: "Last Name", category: "Basic Info",
    idsMetadata: { mandatory: true,  unique: false, identifier: false },
    translations: [], validationTranslations: [],
  },
  {
    id: "email", defaultLabel: "Email", category: "Contact Info",
    idsMetadata: { mandatory: true,  unique: true,  identifier: true,  regex: "^[\\w.+-]+@[\\w-]+\\.[\\w.]+$" },
    translations: [], validationTranslations: [],
  },
  {
    id: "phoneNumber", defaultLabel: "Phone Number", category: "Contact Info",
    idsMetadata: { mandatory: false, unique: false, identifier: false, regex: "^\\+?[0-9\\s\\-().]{7,20}$" },
    translations: [], validationTranslations: [],
  },
  {
    id: "status", defaultLabel: "Status", category: "System",
    idsMetadata: { mandatory: true,  unique: false, identifier: false },
    translations: [], validationTranslations: [],
  },
  {
    id: "title", defaultLabel: "Title", category: "Basic Info",
    idsMetadata: { mandatory: false, unique: false, identifier: false },
    translations: [], validationTranslations: [],
  },
  {
    id: "gender", defaultLabel: "Gender", category: "Basic Info",
    idsMetadata: { mandatory: false, unique: false, identifier: false },
    translations: [], validationTranslations: [],
  },
  {
    id: "address", defaultLabel: "Address", category: "Contact Info",
    idsMetadata: { mandatory: false, unique: false, identifier: false, regex: "^.{5,200}$" },
    translations: [], validationTranslations: [],
  },
];

// ─── IDS metadata badge ───────────────────────────────────────────────────────

function IDSBadge({ active, label }: { active: boolean; label: string }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
      {label}
    </span>
  );
}

// ─── Reusable translation row ─────────────────────────────────────────────────

interface LabelTranslationRowProps {
  translation: Translation;
  usedLanguages: string[];
  onChange: (t: Translation) => void;
  onRemove: () => void;
}

function LabelTranslationRow({ translation, usedLanguages, onChange, onRemove }: LabelTranslationRowProps) {
  const available = LANGUAGES.filter(
    (l) => l.code === translation.language || !usedLanguages.includes(l.code)
  );
  return (
    <div className="flex items-center gap-2">
      <Select value={translation.language} onValueChange={(v) => onChange({ ...translation, language: v })}>
        <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Language" /></SelectTrigger>
        <SelectContent>
          {available.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <input
        type="text"
        value={translation.label}
        onChange={(e) => onChange({ ...translation, label: e.target.value })}
        placeholder="Translated label…"
        className="flex-1 h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <button type="button" onClick={onRemove} className="p-1.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Remove">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Validation translation row ───────────────────────────────────────────────

interface ValidationRowProps {
  row: ValidationErrorTranslations;
  usedLanguages: string[];
  showRequired: boolean;
  showFormat: boolean;
  showUnique: boolean;
  onChange: (r: ValidationErrorTranslations) => void;
  onRemove: () => void;
}

function ValidationTranslationRow({ row, usedLanguages, showRequired, showFormat, showUnique, onChange, onRemove }: ValidationRowProps) {
  const available = LANGUAGES.filter(
    (l) => l.code === row.language || !usedLanguages.includes(l.code)
  );
  return (
    <div className="flex items-start gap-2">
      <Select value={row.language} onValueChange={(v) => onChange({ ...row, language: v })}>
        <SelectTrigger className="w-36 h-8 text-sm shrink-0"><SelectValue placeholder="Language" /></SelectTrigger>
        <SelectContent>
          {available.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex-1 flex flex-col gap-1.5">
        {showRequired && (
          <input
            type="text"
            value={row.requiredMessage}
            onChange={(e) => onChange({ ...row, requiredMessage: e.target.value })}
            placeholder="Required error message…"
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        {showFormat && (
          <input
            type="text"
            value={row.formatMessage}
            onChange={(e) => onChange({ ...row, formatMessage: e.target.value })}
            placeholder="Format error message…"
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        {showUnique && (
          <input
            type="text"
            value={row.uniqueMessage}
            onChange={(e) => onChange({ ...row, uniqueMessage: e.target.value })}
            placeholder="Uniqueness error message…"
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>

      <button type="button" onClick={onRemove} className="p-1.5 mt-0.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Remove">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Config panel ─────────────────────────────────────────────────────────────

interface AttributeConfigPanelProps {
  attr: GlobalAttributeSetting;
  categories: string[];
  onAddCategory: (name: string) => void;
  onChange: (updated: GlobalAttributeSetting) => void;
}

function AttributeConfigPanel({ attr, categories, onAddCategory, onChange }: AttributeConfigPanelProps) {
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleConfirmCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    onAddCategory(trimmed);
    onChange({ ...attr, category: trimmed });
    setNewCategoryName("");
    setCreatingCategory(false);
  };

  const handleCancelCategory = () => {
    setNewCategoryName("");
    setCreatingCategory(false);
  };
  const { idsMetadata: ids } = attr;
  const hasValidation = ids.mandatory || !!ids.regex || ids.unique;

  const usedLabelLangs = attr.translations.map((t) => t.language);
  const usedValidLangs = attr.validationTranslations.map((t) => t.language);

  const addLabelTranslation = () => {
    const next = LANGUAGES.find((l) => !usedLabelLangs.includes(l.code));
    if (!next) return;
    onChange({ ...attr, translations: [...attr.translations, { language: next.code, label: "" }] });
  };

  const updateLabelTranslation = (i: number, t: Translation) => {
    const next = [...attr.translations];
    next[i] = t;
    onChange({ ...attr, translations: next });
  };

  const removeLabelTranslation = (i: number) => {
    onChange({ ...attr, translations: attr.translations.filter((_, idx) => idx !== i) });
  };

  const addValidationTranslation = () => {
    const next = LANGUAGES.find((l) => !usedValidLangs.includes(l.code));
    if (!next) return;
    onChange({
      ...attr,
      validationTranslations: [
        ...attr.validationTranslations,
        { language: next.code, requiredMessage: "", formatMessage: "", uniqueMessage: "" },
      ],
    });
  };

  const updateValidationTranslation = (i: number, r: ValidationErrorTranslations) => {
    const next = [...attr.validationTranslations];
    next[i] = r;
    onChange({ ...attr, validationTranslations: next });
  };

  const removeValidationTranslation = (i: number) => {
    onChange({ ...attr, validationTranslations: attr.validationTranslations.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="border border-bluegrey-200 rounded-md overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-bluegrey-50 border-b border-bluegrey-200 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <p className="text-sm font-semibold text-bluegrey-900">{attr.defaultLabel}</p>
        <span className="font-mono text-xs text-bluegrey-400 ml-1">{attr.id}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <IDSBadge active={ids.mandatory}   label="mandatory" />
          <IDSBadge active={ids.unique}      label="unique" />
          <IDSBadge active={ids.identifier}  label="identifier" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">

        {/* IDS metadata (read-only) */}
        <div className="rounded-md bg-amber-50 border border-amber-100 px-3 py-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <p className="text-xs font-semibold text-amber-700">IDS system metadata (read-only)</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-amber-800">
            <span>Mandatory: <strong>{ids.mandatory ? "Yes" : "No"}</strong></span>
            <span>Unique: <strong>{ids.unique ? "Yes" : "No"}</strong></span>
            <span>Identifier: <strong>{ids.identifier ? "Yes" : "No"}</strong></span>
            <span>
              Regex:{" "}
              {ids.regex
                ? <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10px] break-all">{ids.regex}</code>
                : <strong>—</strong>
              }
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-bluegrey-500" />
            <p className="text-sm font-medium text-bluegrey-900">Category</p>
          </div>
          <p className="text-xs text-bluegrey-500">Group this attribute under a logical category across all views.</p>
          <Select value={attr.category} onValueChange={(v) => onChange({ ...attr, category: v })}>
            <SelectTrigger className="w-full text-sm h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Create new category */}
          {creatingCategory ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                autoFocus
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmCategory();
                  if (e.key === "Escape") handleCancelCategory();
                }}
                placeholder="Category name…"
                className="flex-1 h-8 px-3 text-sm border border-blue-400 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleConfirmCategory}
                disabled={!newCategoryName.trim() || categories.includes(newCategoryName.trim())}
                className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Confirm"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelCategory}
                className="p-1.5 rounded border border-bluegrey-200 text-bluegrey-500 hover:bg-bluegrey-50 transition-colors"
                aria-label="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreatingCategory(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Create new category
            </button>
          )}
        </div>

        <div className="border-t border-bluegrey-100" />

        {/* Label translations */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-bluegrey-500" />
            <p className="text-sm font-medium text-bluegrey-900">Label translations</p>
          </div>
          <p className="text-xs text-bluegrey-500">Translate the attribute label. English is the default.</p>

          {/* English default */}
          <div className="flex items-center gap-2">
            <div className="w-36 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">English</div>
            <div className="flex-1 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500 gap-2">
              {attr.defaultLabel}
              <span className="text-[10px] text-bluegrey-400 bg-bluegrey-100 px-1.5 py-0.5 rounded">default</span>
            </div>
            <div className="w-7" />
          </div>

          {attr.translations.map((t, i) => (
            <LabelTranslationRow
              key={i}
              translation={t}
              usedLanguages={usedLabelLangs.filter((_, idx) => idx !== i)}
              onChange={(u) => updateLabelTranslation(i, u)}
              onRemove={() => removeLabelTranslation(i)}
            />
          ))}

          {attr.translations.length < LANGUAGES.length && (
            <button type="button" onClick={addLabelTranslation} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />Add language
            </button>
          )}
        </div>

        {/* Validation error translations */}
        {hasValidation && (
          <>
            <div className="border-t border-bluegrey-100" />
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-bluegrey-500" />
                <p className="text-sm font-medium text-bluegrey-900">Validation error translations</p>
              </div>
              <p className="text-xs text-bluegrey-500">
                Translate the error messages shown to users when validation fails.
                Active rules from IDS:{" "}
                {[ids.mandatory && "required", ids.regex && "format", ids.unique && "unique"]
                  .filter(Boolean).join(", ")}.
              </p>

              {/* English defaults (read-only) */}
              <div className="flex items-start gap-2">
                <div className="w-36 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500 shrink-0">English</div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {ids.mandatory && (
                    <div className="flex items-center gap-1.5 h-8 px-3 text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded shrink-0">required</span>
                      This field is required.
                    </div>
                  )}
                  {ids.regex && (
                    <div className="flex items-center gap-1.5 h-8 px-3 text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded shrink-0">format</span>
                      The value does not match the expected format.
                    </div>
                  )}
                  {ids.unique && (
                    <div className="flex items-center gap-1.5 h-8 px-3 text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded shrink-0">unique</span>
                      This value is already in use.
                    </div>
                  )}
                </div>
                <div className="w-7" />
              </div>

              {/* Translated rows */}
              {attr.validationTranslations.map((row, i) => (
                <ValidationTranslationRow
                  key={i}
                  row={row}
                  usedLanguages={usedValidLangs.filter((_, idx) => idx !== i)}
                  showRequired={ids.mandatory}
                  showFormat={!!ids.regex}
                  showUnique={ids.unique}
                  onChange={(u) => updateValidationTranslation(i, u)}
                  onRemove={() => removeValidationTranslation(i)}
                />
              ))}

              {attr.validationTranslations.length < LANGUAGES.length && (
                <button type="button" onClick={addValidationTranslation} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function AttributeGlobalConfig() {
  const [attributes, setAttributes] = useState<GlobalAttributeSetting[]>(DEFAULT_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_ATTRIBUTES[0].id);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [isDirty, setIsDirty] = useState(false);

  const selected = attributes.find((a) => a.id === selectedId) ?? null;

  const handleChange = (updated: GlobalAttributeSetting) => {
    setAttributes((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setIsDirty(true);
  };

  const handleAddCategory = (name: string) => {
    setCategories((prev) => [...prev, name]);
    setIsDirty(true);
  };

  const handleReset = () => {
    setAttributes(DEFAULT_ATTRIBUTES);
    setCategories(CATEGORIES);
    setSelectedId(DEFAULT_ATTRIBUTES[0].id);
    setIsDirty(false);
  };

  return (
    <div className="px-6 py-6 space-y-5">
      <p className="text-sm text-bluegrey-500 max-w-2xl">
        Global settings for each IDS attribute — applied regardless of where the attribute appears. Attribute constraints (mandatory, unique, identifier, regex) are read from IDS and shown for reference only.
      </p>

      <div className="grid grid-cols-[220px_1fr] gap-5">
        {/* Left: attribute list */}
        <div className="border border-bluegrey-200 rounded-md overflow-hidden self-start">
          {attributes.map((attr) => {
            const isActive = attr.id === selectedId;
            const colorClass = CATEGORY_COLORS[attr.category] ?? CATEGORY_COLORS["System"];
            return (
              <button
                key={attr.id}
                type="button"
                onClick={() => setSelectedId(attr.id)}
                className={`w-full text-left px-3 py-3 flex items-center justify-between gap-2 border-b border-bluegrey-100 last:border-b-0 transition-colors ${
                  isActive ? "bg-blue-50" : "bg-white hover:bg-bluegrey-25"
                }`}
              >
                <span className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-bluegrey-900"}`}>
                  {attr.defaultLabel}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${colorClass}`}>
                  {attr.category.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: config panel */}
        {selected ? (
          <AttributeConfigPanel
            key={selected.id}
            attr={selected}
            categories={categories}
            onAddCategory={handleAddCategory}
            onChange={handleChange}
          />
        ) : (
          <div className="border border-bluegrey-200 rounded-md px-4 py-8 text-center text-sm text-bluegrey-400">
            Select an attribute to configure it.
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button onClick={() => setIsDirty(false)} disabled={!isDirty} className="gap-2">
          <Save className="w-4 h-4" />Save attribute settings
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2 text-bluegrey-600">
          <RotateCcw className="w-4 h-4" />Reset to default
        </Button>
      </div>
    </div>
  );
}
