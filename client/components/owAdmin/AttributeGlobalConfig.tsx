import { useState } from "react";
import { Plus, Trash2, Save, RotateCcw, Globe, Tag } from "lucide-react";
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

export interface GlobalAttributeSetting {
  id: string;
  defaultLabel: string;
  category: string;
  translations: Translation[];
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
  { id: "firstName",   defaultLabel: "First Name",   category: "Basic Info",        translations: [] },
  { id: "lastName",    defaultLabel: "Last Name",    category: "Basic Info",        translations: [] },
  { id: "email",       defaultLabel: "Email",        category: "Contact Info",      translations: [] },
  { id: "phoneNumber", defaultLabel: "Phone Number", category: "Contact Info",      translations: [] },
  { id: "role",        defaultLabel: "Role",         category: "Access Info",       translations: [] },
  { id: "status",      defaultLabel: "Status",       category: "System",            translations: [] },
  { id: "organization",defaultLabel: "Organization", category: "Organization Info", translations: [] },
  { id: "invitedBy",   defaultLabel: "Invited By",   category: "Access Info",       translations: [] },
  { id: "expiryDate",  defaultLabel: "Expiry Date",  category: "System",            translations: [] },
];

// ─── Translation row editor ───────────────────────────────────────────────────

interface TranslationRowProps {
  translation: Translation;
  usedLanguages: string[];
  onChange: (t: Translation) => void;
  onRemove: () => void;
}

function TranslationRow({ translation, usedLanguages, onChange, onRemove }: TranslationRowProps) {
  const availableLanguages = LANGUAGES.filter(
    (l) => l.code === translation.language || !usedLanguages.includes(l.code)
  );

  return (
    <div className="flex items-center gap-2">
      <Select
        value={translation.language}
        onValueChange={(v) => onChange({ ...translation, language: v })}
      >
        <SelectTrigger className="w-36 h-8 text-sm">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((l) => (
            <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        type="text"
        value={translation.label}
        onChange={(e) => onChange({ ...translation, label: e.target.value })}
        placeholder="Translated label…"
        className="flex-1 h-8 px-3 text-sm border border-bluegrey-200 rounded-md bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />

      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label="Remove translation"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Right-hand config panel ──────────────────────────────────────────────────

interface AttributeConfigPanelProps {
  attr: GlobalAttributeSetting;
  onChange: (updated: GlobalAttributeSetting) => void;
}

function AttributeConfigPanel({ attr, onChange }: AttributeConfigPanelProps) {
  const usedLanguages = attr.translations.map((t) => t.language);
  const canAddMore = attr.translations.length < LANGUAGES.length;

  const addTranslation = () => {
    const nextLang = LANGUAGES.find((l) => !usedLanguages.includes(l.code));
    if (!nextLang) return;
    onChange({
      ...attr,
      translations: [...attr.translations, { language: nextLang.code, label: "" }],
    });
  };

  const updateTranslation = (index: number, t: Translation) => {
    const next = [...attr.translations];
    next[index] = t;
    onChange({ ...attr, translations: next });
  };

  const removeTranslation = (index: number) => {
    onChange({ ...attr, translations: attr.translations.filter((_, i) => i !== index) });
  };

  return (
    <div className="border border-bluegrey-200 rounded-md overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-3 bg-bluegrey-50 border-b border-bluegrey-200 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <p className="text-sm font-semibold text-bluegrey-900">{attr.defaultLabel}</p>
        <span className="ml-auto text-xs text-bluegrey-400 font-mono">{attr.id}</span>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Category */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Tag className="w-3.5 h-3.5 text-bluegrey-500" />
            <p className="text-sm font-medium text-bluegrey-900">Category</p>
          </div>
          <p className="text-xs text-bluegrey-500">
            Group this attribute under a logical category across all views.
          </p>
          <Select
            value={attr.category}
            onValueChange={(v) => onChange({ ...attr, category: v })}
          >
            <SelectTrigger className="w-full text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border-t border-bluegrey-100" />

        {/* Translations */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-bluegrey-500" />
            <p className="text-sm font-medium text-bluegrey-900">Translations</p>
          </div>
          <p className="text-xs text-bluegrey-500">
            Provide the label for this attribute in other languages. English is the default.
          </p>

          {/* English default (read-only) */}
          <div className="flex items-center gap-2">
            <div className="w-36 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">
              English
            </div>
            <div className="flex-1 h-8 px-3 flex items-center text-sm border border-bluegrey-100 rounded-md bg-bluegrey-50 text-bluegrey-500">
              {attr.defaultLabel}
              <span className="ml-2 text-[10px] text-bluegrey-400 bg-bluegrey-100 px-1.5 py-0.5 rounded">default</span>
            </div>
            <div className="w-7" />
          </div>

          {/* Additional translations */}
          {attr.translations.map((t, i) => (
            <TranslationRow
              key={i}
              translation={t}
              usedLanguages={usedLanguages.filter((_, idx) => idx !== i)}
              onChange={(updated) => updateTranslation(i, updated)}
              onRemove={() => removeTranslation(i)}
            />
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={addTranslation}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add language
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AttributeGlobalConfig() {
  const [attributes, setAttributes] = useState<GlobalAttributeSetting[]>(DEFAULT_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_ATTRIBUTES[0].id);
  const [isDirty, setIsDirty] = useState(false);

  const selected = attributes.find((a) => a.id === selectedId) ?? null;

  const handleChange = (updated: GlobalAttributeSetting) => {
    setAttributes((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setIsDirty(true);
  };

  const handleReset = () => {
    setAttributes(DEFAULT_ATTRIBUTES);
    setIsDirty(false);
  };

  return (
    <div className="px-6 py-6 space-y-5">
      {/* Section description */}
      <div>
        <p className="text-sm text-bluegrey-500 max-w-2xl">
          Global settings applied to each attribute regardless of where it appears — in the Users table, Invitations list, detail views, or any future entity. Configure the display category and translations here once; they propagate everywhere.
        </p>
      </div>

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
                  isActive
                    ? "bg-blue-50"
                    : "bg-white hover:bg-bluegrey-25"
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
            onChange={handleChange}
          />
        ) : (
          <div className="border border-bluegrey-200 rounded-md px-4 py-8 text-center text-sm text-bluegrey-400">
            Select an attribute to configure it.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button onClick={() => setIsDirty(false)} disabled={!isDirty} className="gap-2">
          <Save className="w-4 h-4" />
          Save attribute settings
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2 text-bluegrey-600">
          <RotateCcw className="w-4 h-4" />
          Reset to default
        </Button>
      </div>
    </div>
  );
}
