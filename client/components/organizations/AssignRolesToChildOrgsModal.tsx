import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableScroll,
  TableContent,
  TableHeader,
  TableHeadRow,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyState,
} from "@/components/ui/table";
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
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [applyToAllChildren, setApplyToAllChildren] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("roles");
      setRoleSearch("");
      setSelectedRoleIds([]);
      setSelectedOrgId(null);
      setApplyToAllChildren(false);
    }
  }, [open]);

  const selectedOrgDescendantCount = useMemo(() => {
    if (!selectedOrgId) return collectAllOrgIds(orgTree).length;
    const path = findOrgPath(orgTree, selectedOrgId);
    const selectedNode = path?.[path.length - 1];
    return selectedNode ? collectDescendantIds(selectedNode).length : 0;
  }, [orgTree, selectedOrgId]);

  const toggleRole = (id: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return availableRoles;
    return availableRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    );
  }, [availableRoles, roleSearch]);

  const handleAssign = () => {
    let targetOrgIds: string[];
    if (selectedOrgId) {
      const path = findOrgPath(orgTree, selectedOrgId);
      const selectedNode = path?.[path.length - 1];
      if (selectedNode) {
        targetOrgIds = applyToAllChildren
          ? [selectedNode.id, ...collectDescendantIds(selectedNode)]
          : [selectedNode.id];
      } else {
        targetOrgIds = [];
      }
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

            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bluegrey-400" />
              <input
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search"
                className="w-full h-10 pl-9 pr-3 text-sm border border-bluegrey-300 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <Table>
              <TableScroll>
                <TableContent>
                  <TableHeader>
                    <TableHeadRow>
                      <TableHeadCell className="w-10" />
                      <TableHeadCell>Access roles</TableHeadCell>
                      <TableHeadCell>Description</TableHeadCell>
                      <TableHeadCell>Status</TableHeadCell>
                    </TableHeadRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length === 0 ? (
                      <TableEmptyState
                        colSpan={4}
                        message={
                          roleSearch
                            ? "No access roles match your search."
                            : "No access roles assigned to this organization yet."
                        }
                      />
                    ) : (
                      filteredRoles.map((role) => {
                        const checked = selectedRoleIds.includes(role.id);
                        return (
                          <TableRow
                            key={role.id}
                            className="cursor-pointer"
                            onClick={() => toggleRole(role.id)}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleRole(role.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium text-bluegrey-900">
                                {role.name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-bluegrey-500">
                                {role.description || ""}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  role.status === "active"
                                    ? "border-0 text-xs font-normal bg-green-50 text-green-700 gap-1.5"
                                    : "border-0 text-xs font-normal bg-bluegrey-50 text-bluegrey-500 gap-1.5"
                                }
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    role.status === "active" ? "bg-green-600" : "bg-bluegrey-400"
                                  }`}
                                />
                                {role.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </TableContent>
              </TableScroll>
            </Table>
          </div>
        )}

        {step === "organization" && (
          <div className="space-y-3">
            <p className="text-sm text-bluegrey-500">
              Choose which organization to assign the selected role
              {selectedRoleIds.length > 1 ? "s" : ""} to.
            </p>
            <OrgDrillDownSelect
              rootLabel={orgName}
              tree={orgTree}
              value={selectedOrgId}
              onChange={setSelectedOrgId}
            />

            {selectedOrgDescendantCount > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-bluegrey-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-bluegrey-900">
                    Add to all child orgs of this org
                  </p>
                  <p className="text-xs text-bluegrey-500 mt-0.5">
                    Also apply the selected role
                    {selectedRoleIds.length > 1 ? "s" : ""} to every organization
                    underneath the one selected above.
                  </p>
                </div>
                <Switch
                  checked={applyToAllChildren}
                  onCheckedChange={setApplyToAllChildren}
                  aria-label="Add to all child orgs of this org"
                />
              </div>
            )}
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
