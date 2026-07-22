import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, PencilLine, GitBranch } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { AIAssistant } from "@/components/aiAssistant/AIAssistant";
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
import {
  ALL_ACCESS_ROLES,
  ORG_ACCESS_ROLE_ASSIGNMENTS,
  getAvailableRolesForOrg,
  type OrgAccessRoleAssignment,
  type RoleInheritanceConfig,
} from "@/components/organizations/accessRolesMockData";
import AddAccessRoleModal from "@/components/organizations/AddAccessRoleModal";
import { getDescendantOrgTree, findOrgNameById } from "@/components/organizations/orgTreeUtils";
import { baseOrganizations } from "@/components/OrganizationsTable";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findOrg(orgId: string) {
  for (const org of baseOrganizations) {
    if (org.id === orgId) return org;
    if (org.children) {
      const child = org.children.find((c) => c.id === orgId);
      if (child) return child;
    }
  }
  return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddAccessRolesToOrg() {
  const { id: orgId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const org = findOrg(orgId ?? "");
  const orgName = org?.name ?? orgId ?? "";
  const orgTree = getDescendantOrgTree(orgId ?? "");

  // Role assignments for this org — each with its own optional inheritance config
  const [assignments, setAssignments] = useState<OrgAccessRoleAssignment[]>(() =>
    (ORG_ACCESS_ROLE_ASSIGNMENTS[orgId ?? ""] ?? []).map((a) => ({ ...a })),
  );

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const availableRoles = getAvailableRolesForOrg(orgId ?? "", org?.parentId);
  const assignedIds = assignments.map((a) => a.roleId);

  // Roles selectable in the "Add access role" modal (exclude already-added, unless editing)
  const selectableRoles = useMemo(
    () => availableRoles.filter((r) => !assignedIds.includes(r.id) || r.id === editingRoleId),
    [availableRoles, assignedIds, editingRoleId],
  );

  const roleName = (roleId: string) =>
    ALL_ACCESS_ROLES.find((r) => r.id === roleId)?.name ?? roleId;
  const roleDescription = (roleId: string) =>
    ALL_ACCESS_ROLES.find((r) => r.id === roleId)?.description ?? "";

  // ── Actions ────────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingRoleId(null);
    setModalOpen(true);
  };

  const openEditModal = (roleId: string) => {
    setEditingRoleId(roleId);
    setModalOpen(true);
  };

  const handleSaveRole = (roleId: string, inheritance?: RoleInheritanceConfig) => {
    setAssignments((prev) => {
      const withoutRole = prev.filter((a) => a.roleId !== roleId);
      return [...withoutRole, { roleId, status: "active", inheritance }];
    });
  };

  const removeRole = (roleId: string) => {
    setAssignments((prev) => prev.filter((a) => a.roleId !== roleId));
  };

  const handleSave = () => {
    if (!orgId) return;
    ORG_ACCESS_ROLE_ASSIGNMENTS[orgId] = assignments.map((a) => ({
      roleId: a.roleId,
      status: "active" as const,
      inheritance: a.inheritance,
    }));
    // Propagate each role to its configured target organizations
    assignments.forEach((a) => {
      if (!a.inheritance?.enabled) return;
      a.inheritance.targetOrgIds.forEach((targetId) => {
        const existing = ORG_ACCESS_ROLE_ASSIGNMENTS[targetId] ?? [];
        if (existing.some((e) => e.roleId === a.roleId)) return;
        ORG_ACCESS_ROLE_ASSIGNMENTS[targetId] = [
          ...existing,
          { roleId: a.roleId, status: "active" as const },
        ];
      });
    });
    navigate(`/organizations/${orgId}?tab=access-roles`);
  };

  const handleCancel = () => {
    navigate(`/organizations/${orgId}?tab=access-roles`);
  };

  const editingAssignment = editingRoleId
    ? assignments.find((a) => a.roleId === editingRoleId)
    : undefined;

  const inheritedRoleCount = assignments.filter((a) => a.inheritance?.enabled).length;

  return (
    <>
      <Layout>
        <div className="min-h-screen bg-bluegrey-25">
          {/* Back link */}
          <div className="px-6 lg:px-8 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-sm text-bluegrey-600 hover:text-bluegrey-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to &ldquo;{orgName}&rdquo;
            </button>
          </div>

          {/* Heading */}
          <div className="px-6 lg:px-8 pt-4 pb-6">
            <h1 className="text-2xl font-normal text-bluegrey-900 leading-8">
              Add Access Roles to Organization
            </h1>
          </div>

          {/* Content */}
          <div className="px-6 lg:px-8 pb-10 space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-bluegrey-900">
                Access roles for &ldquo;{orgName}&rdquo;
              </h2>
              <Button onClick={openAddModal} className="gap-2">
                <Plus className="w-4 h-4" />
                Add access role
              </Button>
            </div>

            {/* Roles table — no inheritance details shown here */}
            <Table>
              <TableScroll>
                <TableContent>
                  <TableHeader>
                    <TableHeadRow>
                      <TableHeadCell>Access roles</TableHeadCell>
                      <TableHeadCell>Description</TableHeadCell>
                      <TableHeadCell className="w-24" />
                    </TableHeadRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableEmptyState
                        colSpan={3}
                        message='No access roles added yet. Click "Add access role" to get started.'
                      />
                    ) : (
                      assignments.map((a) => (
                        <TableRow key={a.roleId}>
                          <TableCell>
                            <span className="text-sm text-bluegrey-900">{roleName(a.roleId)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-bluegrey-500">{roleDescription(a.roleId)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(a.roleId)}
                                title="Edit"
                                className="p-1.5 rounded-md text-bluegrey-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <PencilLine className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRole(a.roleId)}
                                title="Remove"
                                className="p-1.5 rounded-md text-bluegrey-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </TableContent>
              </TableScroll>
            </Table>

            {/* Inheritance summary — separate from the main table */}
            {inheritedRoleCount > 0 && (
              <div className="rounded-lg border border-bluegrey-200 bg-white p-4 space-y-3">
                <p className="text-sm font-semibold text-bluegrey-700 flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-blue-500" />
                  Inheritance summary
                </p>
                <div className="space-y-2">
                  {assignments
                    .filter((a) => a.inheritance?.enabled)
                    .map((a) => (
                      <div key={a.roleId} className="flex items-start justify-between gap-3 rounded-md bg-bluegrey-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-bluegrey-900">{roleName(a.roleId)}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(a.inheritance?.targetOrgIds ?? []).map((tid) => (
                              <span key={tid} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800">
                                {findOrgNameById(tid)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-bluegrey-400 whitespace-nowrap">
                          {(a.inheritance?.targetOrgIds ?? []).length} org
                          {(a.inheritance?.targetOrgIds ?? []).length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={assignments.length === 0}>
                Save
              </Button>
              <Button variant="ghost" onClick={handleCancel} className="text-bluegrey-700">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Layout>

      <AddAccessRoleModal
        key={editingRoleId ?? "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveRole}
        availableRoles={selectableRoles}
        orgTree={orgTree}
        orgName={orgName}
        initialRoleId={editingAssignment?.roleId}
        initialInheritance={editingAssignment?.inheritance}
      />

      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
