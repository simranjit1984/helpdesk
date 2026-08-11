import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  ORG_ACCESS_ROLE_ASSIGNMENTS,
  getAvailableRolesForOrg,
  getAssignedRoleIds,
} from "@/components/organizations/accessRolesMockData";
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

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Roles that can be added — the full catalogue available to this org, minus
  // roles already assigned. Inheritance for individual roles can still be
  // configured afterwards from the organization's Access Roles list.
  const assignedIds = getAssignedRoleIds(orgId ?? "");
  const availableRoles = useMemo(
    () =>
      getAvailableRolesForOrg(orgId ?? "", org?.parentId).filter(
        (r) => !assignedIds.includes(r.id),
      ),
    [orgId, org?.parentId, assignedIds],
  );

  const filteredRoles = useMemo(
    () =>
      availableRoles.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [availableRoles, search],
  );

  const toggleRole = (roleId: string) => {
    setSelectedIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const handleCancel = () => {
    navigate(`/organizations/${orgId}?tab=access-roles`);
  };

  const handleSave = () => {
    if (!orgId || selectedIds.length === 0) return;
    const existing = ORG_ACCESS_ROLE_ASSIGNMENTS[orgId] ?? [];
    ORG_ACCESS_ROLE_ASSIGNMENTS[orgId] = [
      ...existing,
      ...selectedIds.map((roleId) => ({ roleId, status: "active" as const })),
    ];
    navigate(`/organizations/${orgId}?tab=access-roles`);
  };

  return (
    <>
      <Layout>
        <div className="min-h-screen bg-bluegrey-25 flex flex-col">
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
          <div className="px-6 lg:px-8 pb-28 flex-1">
            <h2 className="text-base font-semibold text-bluegrey-900 mb-4">
              Add access roles to &ldquo;{orgName}&rdquo;
            </h2>

            {/* Search */}
            <div className="relative max-w-sm mb-4">
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
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Checkbox list */}
            <Table>
              <TableScroll>
                <TableContent>
                  <TableHeader>
                    <TableHeadRow>
                      <TableHeadCell className="w-10" />
                      <TableHeadCell>Access roles</TableHeadCell>
                      <TableHeadCell>Description</TableHeadCell>
                    </TableHeadRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length === 0 ? (
                      <TableEmptyState
                        colSpan={3}
                        message={
                          search
                            ? "No access roles match your search."
                            : "All available access roles have already been added to this organization."
                        }
                      />
                    ) : (
                      filteredRoles.map((role) => {
                        const checked = selectedIds.includes(role.id);
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
                                aria-label={`Select ${role.name}`}
                              />
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-bluegrey-900">{role.name}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-bluegrey-500">
                                {role.description || ""}
                              </span>
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

          {/* Sticky footer actions */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-bluegrey-200 px-6 lg:px-8 py-4 flex items-center gap-3">
            <Button onClick={handleSave} disabled={selectedIds.length === 0}>
              Save
            </Button>
            <Button variant="ghost" onClick={handleCancel} className="text-bluegrey-700">
              Cancel
            </Button>
          </div>
        </div>
      </Layout>

      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
