import { useState } from "react";
import {
  Plus, Trash2, Save, RotateCcw, Globe, AlertCircle,
  Lock, Check, X, Code,
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
  formatMessage: string;
}

export interface OrgAttribute {
  id: string;
  defaultLabel: string;
  isSystem: boolean;      // cannot be removed
  mandatory: boolean;
  regex: string;
  translations: Translation[];
  validationTranslations: ValidationTranslation[];
}

// ─── Static data ──────────────────────────────────────────────────────────────

export const SYSTEM_ORG_ATTRIBUTES: OrgAttribute[] = [
  {
    id: "orgName", defaultLabel: "Organization Name", isSystem: true,
    mandatory: true, regex: "",
    translations: [], validationTranslations: [],
  },
  {
    id: "description", defaultLabel: "Description", isSystem: true,
    mandatory: false, regex: "",
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

// ─── Translation row ──────────────────────────────────────────────────────────

function LabelTranslationRow({
  t, usedLanguages, onChange, onRemove,
}: {
  t: Translation;
  usedLanguages: string[];
  onChange: (t: Translation) => void;
  onRemove: () => void;
}) {
  const available = LANGUAGES.filter(
    (l) => l.code === t.language || !usedLanguages.includes(l.code)
  );
  return (
    <div className="flex items-center gap-2">
      <Select value={t.language} onValueChange={(v) => onChange({ ...t, language: v })}>
        <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Language" /></SelectTrigger>
        <SelectContent>
          {available.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <input
        type="text" value={t.label}
        onChange={(e) => onChange({ ...t, label: e.target.value })}
        placeholder="Translated label…"
        className="flex-1 h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <button type="button" onClick={onRemove}
        className="p-1.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Validation translation row ───────────────────────────────────────────────

function ValidationRow({
  row, usedLanguages, showRequired, showFormat, onChange, onRemove,
}: {
  row: ValidationTranslation;
  usedLanguages: string[];
  showRequired: boolean;
  showFormat: boolean;
  onChange: (r: ValidationTranslation) => void;
  onRemove: () => void;
}) {
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
          <input type="text" value={row.requiredMessage}
            onChange={(e) => onChange({ ...row, requiredMessage: e.target.value })}
            placeholder="Required error message…"
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        {showFormat && (
          <input type="text" value={row.formatMessage}
            onChange={(e) => onChange({ ...row, formatMessage: e.target.value })}
            placeholder="Format error message…"
            className="w-full h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>
      <button type="button" onClick={onRemove}
        className="p-1.5 mt-0.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Config panel ─────────────────────────────────────────────────────────────

function AttributePanel({
  attr, onChange, onDelete,
}: {
  attr: OrgAttribute;
  onChange: (a: OrgAttribute) => void;
  onDelete: () => void;
}) {
  const usedLabelLangs = attr.translations.map((t) => t.language);
  const usedValidLangs = attr.validationTranslations.map((t) => t.language);
  const hasValidation = attr.mandatory || !!attr.regex;

  const addLabel = () => {
    const next = LANGUAGES.find((l) => !usedLabelLangs.includes(l.code));
    if (!next) return;
    onChange({ ...attr, translations: [...attr.translations, { language: next.code, label: "" }] });
  };

  const updateLabel = (i: number, t: Translation) => {
    const next = [...attr.translations]; next[i] = t;
    onChange({ ...attr, translations: next });
  };

  const removeLabel = (i: number) =>
    onChange({ ...attr, translations: attr.translations.filter((_, idx) => idx !== i) });

  const addValidation = () => {
    const next = LANGUAGES.find((l) => !usedValidLangs.includes(l.code));
    if (!next) return;
    onChange({ ...attr, validationTranslations: [...attr.validationTranslations, { language: next.code, requiredMessage: "", formatMessage: "" }] });
  };

  const updateValidation = (i: number, r: ValidationTranslation) => {
    const next = [...attr.validationTranslations]; next[i] = r;
    onChange({ ...attr, validationTranslations: next });
  };

  const removeValidation = (i: number) =>
    onChange({ ...attr, validationTranslations: attr.validationTranslations.filter((_, idx) => idx !== i) });

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
            className="ml-auto p-1.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Delete attribute">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="px-4 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* Mandatory */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-bluegrey-900">Mandatory</p>
            <p className="text-xs text-bluegrey-500 mt-0.5">Require this field when creating an organization</p>
          </div>
          <Switch
            checked={attr.mandatory}
            onCheckedChange={(v) => onChange({ ...attr, mandatory: v })}
            disabled={attr.isSystem && attr.id === "orgName"}
          />
        </div>

        <div className="border-t border-bluegrey-100" />

        {/* Regex */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-bluegrey-500" />
            <p className="text-sm font-medium text-bluegrey-900">Validation regex</p>
          </div>
          <p className="text-xs text-bluegrey-500">Optional. Leave empty for no format restriction.</p>
          <input
            type="text"
            value={attr.regex}
            onChange={(e) => onChange({ ...attr, regex: e.target.value })}
            placeholder="e.g. ^[A-Za-z0-9 ]{2,100}$"
            className="w-full h-9 px-3 text-sm font-mono border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="border-t border-bluegrey-100" />

        {/* Label translations */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-bluegrey-500" />
            <p className="text-sm font-medium text-bluegrey-900">Label translations</p>
          </div>
          <p className="text-xs text-bluegrey-500">English is the default label.</p>

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

        {/* Validation translations */}
        {hasValidation && (
          <>
            <div className="border-t border-bluegrey-100" />
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-bluegrey-500" />
                <p className="text-sm font-medium text-bluegrey-900">Validation error translations</p>
              </div>
              <p className="text-xs text-bluegrey-500">
                Active rules:{" "}
                {[attr.mandatory && "required", attr.regex && "format"].filter(Boolean).join(", ")}.
              </p>

              {/* English defaults (read-only) */}
              <div className="flex items-start gap-2">
                <div className="w-36 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500 shrink-0">English</div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {attr.mandatory && (
                    <div className="flex items-center gap-1.5 h-8 px-3 text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded shrink-0">required</span>
                      This field is required.
                    </div>
                  )}
                  {attr.regex && (
                    <div className="flex items-center gap-1.5 h-8 px-3 text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded shrink-0">format</span>
                      The value does not match the expected format.
                    </div>
                  )}
                </div>
                <div className="w-7" />
              </div>

              {attr.validationTranslations.map((row, i) => (
                <ValidationRow key={i} row={row}
                  usedLanguages={usedValidLangs.filter((_, idx) => idx !== i)}
                  showRequired={attr.mandatory}
                  showFormat={!!attr.regex}
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
    onAdd({ id, defaultLabel: trimmed, isSystem: false, mandatory: false, regex: "", translations: [], validationTranslations: [] });
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
      <input
        autoFocus type="text" value={label}
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
      <div className="space-y-1.5 max-w-2xl">
        <p className="text-sm text-bluegrey-500">
          Configure attributes for the Organization entity. System attributes (Organization Name, Description) are always present and cannot be removed. Add custom attributes as needed — configure regex, translations and validation messages for each.
        </p>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-5">
        {/* Left: attribute list */}
        <div className="border border-bluegrey-200 rounded-md overflow-hidden self-start">
          {attributes.map((attr) => {
            const isActive = attr.id === selectedId;
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
                {attr.mandatory && !attr.isSystem && (
                  <span className="text-[10px] font-medium px-1 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 shrink-0">req</span>
                )}
              </button>
            );
          })}
          <AddAttributeForm onAdd={handleAdd} />
        </div>

        {/* Right: config panel */}
        {selected ? (
          <AttributePanel
            key={selected.id}
            attr={selected}
            onChange={handleChange}
            onDelete={() => handleDelete(selected.id)}
          />
        ) : (
          <div className="border border-bluegrey-200 rounded-md px-4 py-8 text-center text-sm text-bluegrey-400">
            Select an attribute to configure it.
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button variant="outline" onClick={onReset} className="gap-2 text-bluegrey-600">
          <RotateCcw className="w-4 h-4" />Reset to default
        </Button>
      </div>
    </div>
  );
}
