import { useState, useMemo } from "react";
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
  getAssignedRoleIds,
  getAvailableRolesForOrg,
} from "@/components/organizations/accessRolesMockData";
import { baseOrganizations } from "@/components/OrganizationsTable";

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

export default function AddAccessRolesToOrg() {
  const { id: orgId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const org = findOrg(orgId ?? "");
  const orgName = org?.name ?? orgId ?? "";

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(() =>
    getAssignedRoleIds(orgId ?? ""),
  );

  // Roles available for this org — child orgs are limited to parent's role catalogue
  const availableRoles = getAvailableRolesForOrg(orgId ?? "", org?.parentId);

  const filtered = useMemo(
    () =>
      availableRoles.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, availableRoles],
  );

  const toggleRole = (roleId: string) => {
    setSelected((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const handleSave = () => {
    if (!orgId) return;
    // Persist changes back to the mock store
    ORG_ACCESS_ROLE_ASSIGNMENTS[orgId] = selected.map((roleId) => ({
      roleId,
      status: "active" as const,
    }));
    navigate(`/organizations/${orgId}?tab=access-roles`);
  };

  const handleCancel = () => {
    navigate(`/organizations/${orgId}?tab=access-roles`);
  };

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
            <h2 className="text-base font-semibold text-bluegrey-900">
              Add access roles to &ldquo;{orgName}&rdquo;
            </h2>

            {/* Search */}
            <div className="relative max-w-xs">
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

            {/* Table */}
            <Table>
              <TableScroll>
                <TableContent>
                  <TableHeader>
                    <TableHeadRow>
                      {/* checkbox col */}
                      <TableHeadCell className="w-10" />
                      <TableHeadCell>Access roles</TableHeadCell>
                      <TableHeadCell>Description</TableHeadCell>
                    </TableHeadRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableEmptyState
                        colSpan={3}
                        message="No access roles match your search."
                      />
                    ) : (
                      filtered.map((role) => (
                        <TableRow
                          key={role.id}
                          className="cursor-pointer"
                          onClick={() => toggleRole(role.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selected.includes(role.id)}
                              onCheckedChange={() => toggleRole(role.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-bluegrey-900">
                              {role.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-bluegrey-500">
                              {role.description}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </TableContent>
              </TableScroll>
            </Table>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} className="gap-2">
                Save
              </Button>
              <Button variant="ghost" onClick={handleCancel} className="text-bluegrey-700">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Layout>
      <AIAssistant userData={{}} isOpen={false} />
    </>
  );
}
