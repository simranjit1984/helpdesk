import { useState } from "react";
import { X, ShieldCheck, AlertCircle, Plus, ChevronDown, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ID_BROKER_IDPS, ORG_IDP_MAP, type IdpFromBroker } from "@/lib/federationMockData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IdpMapping {
  idpId: string;
  claimName: string;
  claimValues: string[];   // e.g. ["entraread", "entrawrite"]
}

interface IdpMappingTabProps {
  orgId: string;
  orgName: string;
  readOnly?: boolean;
}

// ─── Mock initial mappings per org ────────────────────────────────────────────

function getInitialMappings(orgId: string): IdpMapping[] {
  return (ORG_IDP_MAP[orgId] ?? []).map((idpId) => ({
    idpId,
    claimName: "",
    claimValues: [],
  }));
}

// ─── Claim value tag input ────────────────────────────────────────────────────

function ClaimValuesInput({
  values,
  onChange,
  disabled,
}: {
  values: string[];
  onChange: (vals: string[]) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  }

  function remove(v: string) {
    onChange(values.filter((x) => x !== v));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && input === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div
      className={`min-h-[40px] flex flex-wrap gap-1.5 px-2 py-1.5 border rounded-sm bg-white transition-colors ${
        disabled ? "bg-bluegrey-25 cursor-not-allowed border-bluegrey-200" : "border-bluegrey-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
      }`}
    >
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
        >
          {v}
          {!disabled && (
            <button
              type="button"
              onClick={() => remove(v)}
              className="hover:text-blue-900 transition-colors ml-0.5"
              aria-label={`Remove ${v}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={add}
          placeholder={values.length === 0 ? "Type a value and press Enter…" : ""}
          className="flex-1 min-w-[140px] text-sm bg-transparent focus:outline-none placeholder:text-bluegrey-400 text-bluegrey-900 py-0.5"
        />
      )}
      {disabled && values.length === 0 && (
        <span className="text-sm text-bluegrey-400 italic py-0.5">No values</span>
      )}
    </div>
  );
}

// ─── Add IdP dropdown ─────────────────────────────────────────────────────────

function AddIdpDropdown({
  available,
  onAdd,
}: {
  available: IdpFromBroker[];
  onAdd: (idpId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (available.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 h-9 px-3 border border-dashed border-bluegrey-400 rounded-md text-sm text-bluegrey-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add IdP mapping
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 min-w-[280px] bg-white border border-bluegrey-200 rounded-md shadow-lg py-1">
            {available.map((idp) => (
              <button
                key={idp.id}
                type="button"
                onClick={() => {
                  onAdd(idp.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bluegrey-900 hover:bg-blue-50 transition-colors text-left"
              >
                <ShieldCheck className="w-4 h-4 text-bluegrey-400 shrink-0" />
                <span className="flex-1">{idp.name}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                  idp.status === "active" ? "bg-green-50 text-green-700" : "bg-bluegrey-100 text-bluegrey-500"
                }`}>
                  {idp.status}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Single IdP mapping card ──────────────────────────────────────────────────

function IdpMappingCard({
  mapping,
  idp,
  onChange,
  onRemove,
  disabled,
}: {
  mapping: IdpMapping;
  idp: IdpFromBroker;
  onChange: (updated: IdpMapping) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="border border-bluegrey-200 rounded-md overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bluegrey-25 border-b border-bluegrey-100">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-sm font-semibold text-bluegrey-900">{idp.name}</span>
          <span className="text-xs text-bluegrey-500">{idp.protocol}</span>
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
            idp.status === "active" ? "bg-green-50 text-green-700" : "bg-bluegrey-100 text-bluegrey-500"
          }`}>
            {idp.status}
          </span>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 rounded-md flex items-center justify-center text-bluegrey-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Remove IdP mapping"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Card body — claim config */}
      <div className="px-4 py-4 grid grid-cols-[1fr_1.6fr] gap-4">
        {/* Claim name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            Claim name
          </label>
          <input
            type="text"
            value={mapping.claimName}
            onChange={(e) => onChange({ ...mapping, claimName: e.target.value })}
            disabled={disabled}
            placeholder="e.g. role"
            className="h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-bluegrey-25 disabled:cursor-not-allowed font-mono"
          />
          <p className="text-xs text-bluegrey-400">Name of the claim in the token</p>
        </div>

        {/* Claim values */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
            Claim values
          </label>
          <ClaimValuesInput
            values={mapping.claimValues}
            onChange={(vals) => onChange({ ...mapping, claimValues: vals })}
            disabled={disabled}
          />
          <p className="text-xs text-bluegrey-400">
            Values expected in the claim (press Enter or comma to add)
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IdpMappingTab({ orgId, orgName, readOnly }: IdpMappingTabProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [mappings, setMappings] = useState<IdpMapping[]>(getInitialMappings(orgId));

  const allIdps = ID_BROKER_IDPS;
  const mappedIds = mappings.map((m) => m.idpId);
  const unmappedIdps = allIdps.filter((idp) => !mappedIds.includes(idp.id));

  function addMapping(idpId: string) {
    setMappings((prev) => [...prev, { idpId, claimName: "", claimValues: [] }]);
  }

  function updateMapping(idpId: string, updated: IdpMapping) {
    setMappings((prev) => prev.map((m) => (m.idpId === idpId ? updated : m)));
  }

  function removeMapping(idpId: string) {
    setMappings((prev) => prev.filter((m) => m.idpId !== idpId));
  }

  async function handleSave() {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast({ title: "Success", description: "IDP mapping saved successfully" });
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-md bg-blue-50 border border-blue-100 text-sm text-blue-800">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
        <span>
          For each Identity Provider, define the <strong>claim name</strong> sent in the token
          and the expected <strong>claim values</strong> that grant access to{" "}
          <strong>{orgName}</strong>. These are used to match incoming tokens from the IdP.
        </span>
      </div>

      {/* Mappings list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-bluegrey-900">
            Identity Provider Mappings
            {mappings.length > 0 && (
              <span className="ml-2 text-xs font-normal text-bluegrey-400">
                ({mappings.length} configured)
              </span>
            )}
          </h3>
          {!readOnly && (
            <AddIdpDropdown available={unmappedIdps} onAdd={addMapping} />
          )}
        </div>

        {mappings.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-bluegrey-200 rounded-md">
            <ShieldCheck className="w-8 h-8 text-bluegrey-300 mx-auto mb-2" />
            <p className="text-sm text-bluegrey-500">No Identity Providers mapped yet.</p>
            {!readOnly && (
              <p className="text-xs text-bluegrey-400 mt-1">
                Use the "Add IdP mapping" button above to get started.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mappings.map((mapping) => {
              const idp = allIdps.find((i) => i.id === mapping.idpId);
              if (!idp) return null;
              return (
                <IdpMappingCard
                  key={mapping.idpId}
                  mapping={mapping}
                  idp={idp}
                  onChange={(updated) => updateMapping(mapping.idpId, updated)}
                  onRemove={() => removeMapping(mapping.idpId)}
                  disabled={readOnly || isSaving}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Save */}
      {!readOnly && (
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-[2px]"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
