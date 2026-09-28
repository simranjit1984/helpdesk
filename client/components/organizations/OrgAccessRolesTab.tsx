import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreHorizontal, Trash2, ChevronLeft, ChevronRight, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  TableActionCell,
  TableEmptyState,
} from "@/components/ui/table";
import ConfirmationModal from "@/components/ConfirmationModal";
import AssignRolesToChildOrgsModal from "./AssignRolesToChildOrgsModal";
import { getDescendantOrgTree } from "./orgTreeUtils";
import {
  getOrgAccessRoles,
  ORG_ACCESS_ROLE_ASSIGNMENTS,
} from "./accessRolesMockData";

const PAGE_SIZE = 10;

interface OrgAccessRolesTabProps {
  orgId: string;
  orgName: string;
}

export default function OrgAccessRolesTab({ orgId, orgName }: OrgAccessRolesTabProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [assignToChildrenOpen, setAssignToChildrenOpen] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);
  const [, forceRefresh] = useState(0);

  // Derive roles from (potentially mutated) global mock store — re-reads on render
  const allRoles = getOrgAccessRoles(orgId);
  const orgTree = getDescendantOrgTree(orgId);
  const assignments = ORG_ACCESS_ROLE_ASSIGNMENTS[orgId] ?? [];

  const filtered = useMemo(
    () =>
      allRoles.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [allRoles, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleRemove = () => {
    if (!removeTarget) return;
    const assignments = ORG_ACCESS_ROLE_ASSIGNMENTS[orgId];
    if (assignments) {
      const idx = assignments.findIndex((a) => a.roleId === removeTarget);
      if (idx !== -1) assignments.splice(idx, 1);
    }
    setRemoveTarget(null);
  };

  const removingRole = allRoles.find((r) => r.id === removeTarget);

  const allPagedSelected =
    paged.length > 0 && paged.every((r) => selectedRoleIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allPagedSelected) {
      setSelectedRoleIds((prev) =>
        prev.filter((id) => !paged.some((r) => r.id === id)),
      );
    } else {
      setSelectedRoleIds((prev) =>
        Array.from(new Set([...prev, ...paged.map((r) => r.id)])),
      );
    }
  };

  const toggleSelectRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const handleBulkRemove = () => {
    const list = ORG_ACCESS_ROLE_ASSIGNMENTS[orgId];
    if (list) {
      selectedRoleIds.forEach((roleId) => {
        const idx = list.findIndex((a) => a.roleId === roleId);
        if (idx !== -1) list.splice(idx, 1);
      });
    }
    setSelectedRoleIds([]);
    setBulkRemoveOpen(false);
  };

  const handleAssignRolesToChildren = (
    roleIds: string[],
    targetOrgIds: string[],
    mode: "add" | "replace",
  ) => {
    const list = ORG_ACCESS_ROLE_ASSIGNMENTS[orgId];
    if (list) {
      roleIds.forEach((roleId) => {
        const idx = list.findIndex((a) => a.roleId === roleId);
        if (idx !== -1) {
          const existingTargetOrgIds =
            mode === "add" ? (list[idx].inheritance?.targetOrgIds ?? []) : [];
          const mergedTargetOrgIds = Array.from(
            new Set([...existingTargetOrgIds, ...targetOrgIds]),
          );
          list[idx] = {
            ...list[idx],
            inheritance: { enabled: true, targetOrgIds: mergedTargetOrgIds },
          };
        }
      });
    }
    forceRefresh((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bluegrey-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 max-w-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedRoleIds.length > 0 && (
            <Button
              variant="outline"
              className="gap-2 whitespace-nowrap text-red-600 hover:text-red-600"
              onClick={() => setBulkRemoveOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Remove selected ({selectedRoleIds.length})
            </Button>
          )}
          <Button
            className="gap-2 whitespace-nowrap"
            onClick={() =>
              navigate(`/organizations/${orgId}/access-roles/add`)
            }
          >
            <Plus className="h-4 w-4" />
            Add access roles to organization
          </Button>
          {orgTree.length > 0 && (
            <Button
              variant="outline"
              className="gap-2 whitespace-nowrap"
              onClick={() => setAssignToChildrenOpen(true)}
            >
              <GitBranch className="h-4 w-4" />
              Cascade access roles to child orgs
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableScroll>
          <TableContent>
            <TableHeader>
              <TableHeadRow>
                <TableHeadCell className="w-10">
                  {paged.length > 0 && (
                    <Checkbox
                      checked={allPagedSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all access roles"
                    />
                  )}
                </TableHeadCell>
                <TableHeadCell>Access roles</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell />
              </TableHeadRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  message={
                    search
                      ? "No access roles match your search."
                      : "No access roles assigned to this organization yet."
                  }
                />
              ) : (
                paged.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={() => toggleSelectRole(role.id)}
                        aria-label={`Select ${role.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-bluegrey-900">
                          {role.name}
                        </span>
                        {assignments.find((a) => a.roleId === role.id)?.inheritance?.enabled && (
                          <span
                            title="Inherited to child organizations"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700"
                          >
                            <GitBranch className="h-3 w-3" />
                            Inherited
                          </span>
                        )}
                      </div>
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
                    <TableActionCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded hover:bg-bluegrey-50 text-bluegrey-500 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2 text-red-600 focus:text-red-600"
                            onClick={() => setRemoveTarget(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableActionCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </TableContent>
        </TableScroll>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="gap-1 h-8 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="gap-1 h-8 px-3"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Remove confirmation */}
      <ConfirmationModal
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove Access Role"
        description={`Remove "${removingRole?.name}" from ${orgName}? This will revoke access for all users in this organization with this role.`}
        primaryAction={{ label: "Remove", onClick: handleRemove }}
        secondaryAction={{ label: "Cancel", onClick: () => setRemoveTarget(null) }}
      />

      {/* Bulk remove confirmation */}
      <ConfirmationModal
        open={bulkRemoveOpen}
        onOpenChange={(open) => !open && setBulkRemoveOpen(false)}
        title="Remove Access Roles"
        description={`Remove ${selectedRoleIds.length} selected access role${selectedRoleIds.length > 1 ? "s" : ""} from ${orgName}? This will revoke access for all users in this organization with ${selectedRoleIds.length > 1 ? "these roles" : "this role"}.`}
        primaryAction={{ label: "Remove", onClick: handleBulkRemove }}
        secondaryAction={{ label: "Cancel", onClick: () => setBulkRemoveOpen(false) }}
      />

      {/* Assign access roles to child organizations */}
      <AssignRolesToChildOrgsModal
        open={assignToChildrenOpen}
        onClose={() => setAssignToChildrenOpen(false)}
        onSave={handleAssignRolesToChildren}
        availableRoles={allRoles}
        orgTree={orgTree}
        orgName={orgName}
      />
    </div>
  );
}
