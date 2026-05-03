import { useState } from "react";
import { X, ChevronDown, ShieldCheck, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ID_BROKER_IDPS, ORG_IDP_MAP, type IdpFromBroker } from "@/lib/federationMockData";

interface IdpMappingTabProps {
  orgId: string;
  orgName: string;
  readOnly?: boolean;
}

// ─── Small chip for a selected IdP ───────────────────────────────────────────

function IdpChip({
  idp,
  onRemove,
  disabled,
}: {
  idp: IdpFromBroker;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
      {idp.name}
      {!disabled && (
        <button
          onClick={onRemove}
          className="ml-0.5 w-5 h-5 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
          aria-label={`Remove ${idp.name}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// ─── Multi-select dropdown ────────────────────────────────────────────────────

function IdpMultiSelect({
  available,
  selected,
  onAdd,
  disabled,
}: {
  available: IdpFromBroker[];
  selected: string[];
  onAdd: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const unselected = available.filter((idp) => !selected.includes(idp.id));

  if (disabled) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={unselected.length === 0}
        className="inline-flex items-center gap-1.5 h-9 px-3 border border-dashed border-bluegrey-400 rounded-md text-sm text-bluegrey-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Add IdP
        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
      </button>

      {open && unselected.length > 0 && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 min-w-[260px] bg-white border border-bluegrey-200 rounded-md shadow-lg py-1 overflow-hidden">
            {unselected.map((idp) => (
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
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                    idp.status === "active"
                      ? "bg-green-50 text-green-700"
                      : "bg-bluegrey-100 text-bluegrey-500"
                  }`}
                >
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function IdpMappingTab({ orgId, orgName, readOnly }: IdpMappingTabProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Simulate fetching the org's already-mapped IdP ids
  const initialIds = ORG_IDP_MAP[orgId] ?? [];
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const allIdps = ID_BROKER_IDPS;
  const selectedIdps = allIdps.filter((idp) => selectedIds.includes(idp.id));

  function addIdp(id: string) {
    if (!selectedIds.includes(id)) {
      setSelectedIds((prev) => [...prev, id]);
    }
  }

  function removeIdp(id: string) {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  }

  async function handleSave() {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast({ title: "Success", description: "IDP mapping saved successfully" });
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-md bg-blue-50 border border-blue-100 text-sm text-blue-800">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
        <span>
          Identity Providers listed here are fetched dynamically from the{" "}
          <span className="font-semibold">ID Broker</span>. Selecting multiple IdPs allows users
          of <span className="font-semibold">{orgName}</span> to authenticate via any of the
          configured providers.
        </span>
      </div>

      {/* Select IdP section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-medium text-bluegrey-900">
            Select Identity Provider
            <span className="ml-1.5 text-xs font-normal text-bluegrey-500">(optional)</span>
          </label>
          {allIdps.length === 0 && (
            <span className="text-xs text-bluegrey-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              No Identity Providers available from ID Broker
            </span>
          )}
        </div>

        {/* Selected chips */}
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {selectedIdps.length === 0 && (
            <span className="text-sm text-bluegrey-400 italic self-center">
              No Identity Providers selected
            </span>
          )}
          {selectedIdps.map((idp) => (
            <IdpChip
              key={idp.id}
              idp={idp}
              onRemove={() => removeIdp(idp.id)}
              disabled={readOnly || isSaving}
            />
          ))}
        </div>

        {/* Add button */}
        {!readOnly && (
          <IdpMultiSelect
            available={allIdps}
            selected={selectedIds}
            onAdd={addIdp}
            disabled={isSaving}
          />
        )}
      </div>

      {/* Available IdPs reference table */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-bluegrey-400">
          Available from ID Broker ({allIdps.length})
        </p>
        {allIdps.length === 0 ? (
          <div className="py-10 text-center text-sm text-bluegrey-400 border border-dashed border-bluegrey-200 rounded-md">
            No Identity Providers available from ID Broker
          </div>
        ) : (
          <div className="border border-bluegrey-100 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bluegrey-25 border-b border-bluegrey-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-bluegrey-600 uppercase tracking-wider">
                    Mapped
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bluegrey-50">
                {allIdps.map((idp) => {
                  const isMapped = selectedIds.includes(idp.id);
                  return (
                    <tr key={idp.id} className={isMapped ? "bg-blue-50/40" : "bg-white"}>
                      <td className="px-4 py-3 font-medium text-bluegrey-900">
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-bluegrey-400 shrink-0" />
                          {idp.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-bluegrey-600">{idp.protocol}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            idp.status === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-bluegrey-100 text-bluegrey-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              idp.status === "active" ? "bg-green-500" : "bg-bluegrey-400"
                            }`}
                          />
                          {idp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isMapped ? (
                          <span className="text-xs font-semibold text-blue-600">✓ Selected</span>
                        ) : (
                          <span className="text-xs text-bluegrey-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save */}
      {!readOnly && (
        <div className="flex items-center gap-3">
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
