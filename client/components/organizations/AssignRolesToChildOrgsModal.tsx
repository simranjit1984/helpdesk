import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import OrgDrillDownSelect, {
  collectAllOrgIds,
  collectDescendantIds,
  findOrgPath,
} from "./OrgDrillDownSelect";
import type { OrgTreeNode } from "./OrgTreeSelect";
import type { AccessRole } from "./accessRolesMockData";

type Step = "roles" | "organization";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (roleIds: string[], targetOrgIds: string[]) => void;
  availableRoles: (AccessRole & { status: "active" | "inactive" })[];
  orgTree: OrgTreeNode[];
  orgName: string;
}

export default function AssignRolesToChildOrgsModal({
  open,
  onClose,
  onSave,
  availableRoles,
  orgTree,
  orgName,
}: Props) {
  const [step, setStep] = useState<Step>("roles");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setStep("roles");
      setSelectedRoleIds([]);
      setSelectedOrgIds([]);
    }
  }, [open]);

  const toggleOrg = (id: string) => {
    setSelectedOrgIds((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id],
    );
  };

  const toggleRole = (id: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleAssign = () => {
    let targetOrgIds: string[];
    if (selectedOrgIds.length > 0) {
      const idSet = new Set<string>();
      selectedOrgIds.forEach((id) => {
        const path = findOrgPath(orgTree, id);
        const node = path?.[path.length - 1];
        if (!node) return;
        idSet.add(node.id);
        collectDescendantIds(node).forEach((d) => idSet.add(d));
      });
      targetOrgIds = Array.from(idSet);
    } else {
      targetOrgIds = collectAllOrgIds(orgTree);
    }
    onSave(selectedRoleIds, targetOrgIds);
    onClose();
  };

  const canGoNext = selectedRoleIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "roles"
              ? "Assign access roles to child organizations"
              : "Select organization"}
          </DialogTitle>
        </DialogHeader>

        {step === "roles" && (
          <div className="space-y-3">
            <p className="text-sm text-bluegrey-500">
              Select which access roles from &ldquo;{orgName}&rdquo; should be
              propagated to child organizations.
            </p>
            <div className="rounded-lg border border-bluegrey-200 divide-y divide-bluegrey-100 overflow-hidden">
              {availableRoles.length === 0 ? (
                <p className="px-4 py-6 text-sm text-bluegrey-400 italic text-center">
                  No access roles assigned to this organization yet.
                </p>
              ) : (
                availableRoles.map((role) => {
                  const checked = selectedRoleIds.includes(role.id);
                  return (
                    <label
                      key={role.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        checked ? "bg-blue-50" : "hover:bg-bluegrey-25"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <span className="text-sm font-medium text-bluegrey-900">
                        {role.name}
                      </span>
                      {role.description && (
                        <span className="text-xs text-bluegrey-500">
                          {role.description}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}

        {step === "organization" && (
          <div className="space-y-3">
            <p className="text-sm text-bluegrey-500">
              Choose which organizations to assign the selected role
              {selectedRoleIds.length > 1 ? "s" : ""} to. You can select
              multiple organizations; selecting a parent also includes
              everything underneath it. Leave nothing selected to apply to
              every child organization.
            </p>
            <OrgDrillDownSelect
              rootLabel={orgName}
              tree={orgTree}
              multiple
              selectedIds={selectedOrgIds}
              onToggle={toggleOrg}
            />
          </div>
        )}

        <DialogFooter>
          {step === "organization" ? (
            <Button
              variant="ghost"
              onClick={() => setStep("roles")}
              className="text-bluegrey-700 gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose} className="text-bluegrey-700">
              Cancel
            </Button>
          )}

          {step === "roles" ? (
            <Button
              onClick={() => setStep("organization")}
              disabled={!canGoNext}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleAssign}>Assign</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
