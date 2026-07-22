import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import OrgTreeSelect, { OrgTreeNode } from "./OrgTreeSelect";
import type { AccessRole, RoleInheritanceConfig } from "./accessRolesMockData";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (roleId: string, inheritance?: RoleInheritanceConfig) => void;
  availableRoles: AccessRole[];
  orgTree: OrgTreeNode[];
  orgName: string;
  initialRoleId?: string;
  initialInheritance?: RoleInheritanceConfig;
}

export default function AddAccessRoleModal({
  open,
  onClose,
  onSave,
  availableRoles,
  orgTree,
  orgName,
  initialRoleId,
  initialInheritance,
}: Props) {
  const isEditing = Boolean(initialRoleId);
  const [roleId, setRoleId] = useState(initialRoleId || "");
  const [inheritEnabled, setInheritEnabled] = useState(Boolean(initialInheritance && initialInheritance.enabled));
  const [targetOrgIds, setTargetOrgIds] = useState<string[]>(
    initialInheritance ? initialInheritance.targetOrgIds : []
  );

  const hasChildren = orgTree.length > 0;

  useEffect(() => {
    if (open) {
      setRoleId(initialRoleId || "");
      setInheritEnabled(Boolean(initialInheritance && initialInheritance.enabled));
      setTargetOrgIds(initialInheritance ? initialInheritance.targetOrgIds : []);
    }
  }, [open, initialRoleId, initialInheritance]);

  const handleSave = () => {
    if (!roleId) return;
    onSave(
      roleId,
      inheritEnabled ? { enabled: true, targetOrgIds } : undefined,
    );
    onClose();
  };

  const canSave = !!roleId && (!inheritEnabled || targetOrgIds.length > 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit access role" : "Add access role"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Role selection */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-bluegrey-600 mb-1">
              Access role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={isEditing}
              className="w-full border border-bluegrey-300 rounded-md px-3 py-2 text-sm text-bluegrey-900 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white disabled:bg-bluegrey-50 disabled:text-bluegrey-500"
            >
              <option value="">Select an access role…</option>
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {availableRoles.length === 0 && (
              <p className="text-xs text-bluegrey-400 italic">
                All available access roles have already been added to &ldquo;{orgName}&rdquo;.
              </p>
            )}
          </div>

          {/* Inheritance toggle — only relevant if org has children */}
          {hasChildren && (
            <div className="rounded-lg border border-bluegrey-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-bluegrey-50 border-b border-bluegrey-200">
                <div>
                  <p className="text-sm font-semibold text-bluegrey-900">
                    Inherit to child organizations
                  </p>
                  <p className="text-xs text-bluegrey-500 mt-0.5">
                    Propagate this role to selected child organizations.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-bluegrey-500">{inheritEnabled ? "On" : "Off"}</span>
                  <Switch
                    checked={inheritEnabled}
                    onCheckedChange={(v) => {
                      setInheritEnabled(v);
                      if (!v) setTargetOrgIds([]);
                    }}
                    aria-label="Inherit to child organizations"
                  />
                </div>
              </div>

              {inheritEnabled && (
                <div className="p-3">
                  <OrgTreeSelect tree={orgTree} selectedIds={targetOrgIds} onChange={setTargetOrgIds} />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-bluegrey-700">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isEditing ? "Save changes" : "Add role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
