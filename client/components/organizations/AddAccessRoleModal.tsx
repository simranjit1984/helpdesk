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
import OrgDrillDownSelect, {
  collectAllOrgIds,
  collectDescendantIds,
  findOrgPath,
} from "./OrgDrillDownSelect";
import type { OrgTreeNode } from "./OrgTreeSelect";
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
  // The org currently selected via the breadcrumb drill-down — null means the
  // root org itself (i.e. "all" descendants) is the effective scope.
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(() => {
    const firstTarget = initialInheritance?.targetOrgIds?.[0];
    if (!firstTarget) return null;
    // Only honor it if it still resolves to a node in the current tree.
    return findOrgPath(orgTree, firstTarget) ? firstTarget : null;
  });

  const hasChildren = orgTree.length > 0;

  useEffect(() => {
    if (open) {
      setRoleId(initialRoleId || "");
      setInheritEnabled(Boolean(initialInheritance && initialInheritance.enabled));
      const firstTarget = initialInheritance?.targetOrgIds?.[0];
      setSelectedOrgId(firstTarget && findOrgPath(orgTree, firstTarget) ? firstTarget : null);
    }
  }, [open, initialRoleId, initialInheritance, orgTree]);

  const handleSave = () => {
    if (!roleId) return;

    let inheritance: RoleInheritanceConfig | undefined;
    if (inheritEnabled) {
      if (selectedOrgId) {
        const path = findOrgPath(orgTree, selectedOrgId);
        const selectedNode = path?.[path.length - 1];
        const targetOrgIds = selectedNode
          ? [selectedNode.id, ...collectDescendantIds(selectedNode)]
          : [];
        inheritance = { enabled: true, targetOrgIds };
      } else {
        // No specific org drilled into — cascade to every descendant org.
        inheritance = { enabled: true, targetOrgIds: collectAllOrgIds(orgTree) };
      }
    }

    onSave(roleId, inheritance);
    onClose();
  };

  const canSave = !!roleId;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
                      if (!v) setSelectedOrgId(null);
                    }}
                    aria-label="Inherit to child organizations"
                  />
                </div>
              </div>

              {inheritEnabled && (
                <div className="p-3">
                  <OrgDrillDownSelect
                    rootLabel={orgName}
                    tree={orgTree}
                    value={selectedOrgId}
                    onChange={setSelectedOrgId}
                  />
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
