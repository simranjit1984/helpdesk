import { useState } from "react";
import { Info, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChildOrgInheritance } from "../types";

interface Props {
  parentOrgName: string;
  idpName: string;
  child: ChildOrgInheritance;
  claimName: string;
  onClose: () => void;
  onSave: (claimValue: string) => void;
}

export default function ChildClaimsDialog({
  parentOrgName,
  idpName,
  child,
  claimName,
  onClose,
  onSave,
}: Props) {
  const [claimValue, setClaimValue] = useState(child.orgClaimValue ?? "");

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bluegrey-200">
          <h3 className="text-sm font-semibold text-bluegrey-900">
            Configure claims — {child.orgName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-bluegrey-400 hover:text-bluegrey-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3 p-3 border border-bluegrey-200 rounded-md bg-bluegrey-25">
            <Lock className="w-4 h-4 text-bluegrey-400 shrink-0" />
            <div>
              <div className="text-sm font-medium text-bluegrey-900">{idpName}</div>
              <div className="text-xs text-bluegrey-500">
                Inherited from {parentOrgName}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
            <span>
              This organization uses the IDP inherited from {parentOrgName}, but
              organization claim, access role, admin role, and scope claims
              mapping can never be shared — they must always be defined for
              this organization.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-bluegrey-800">
              Organization claim value
            </label>
            <div className="text-xs text-bluegrey-500 mb-1">
              Claim name <code className="font-mono text-blue-700">{claimName || "—"}</code>{" "}
              is inherited and cannot be changed here.
            </div>
            <input
              type="text"
              value={claimValue}
              onChange={(e) => setClaimValue(e.target.value)}
              placeholder="e.g. https://api.acme-example.com"
              className="h-10 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-bluegrey-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(claimValue)}>Save claims</Button>
        </div>
      </div>
    </div>
  );
}
