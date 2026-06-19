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
import InheritanceOptions, { ChildOrg, InheritMode } from "@/components/organizations/InheritanceOptions";
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

function findChildOrgs(orgId: string): ChildOrg[] {
  const org = baseOrganizations.find((o) => o.id === orgId);
  if (!org?.children) return [];
  return org.children.map((c) => ({
    id: c.id,
    name: c.name,
    referenceId: c.referenceId,
  }));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddAccessRolesToOrg() {
  const { id: orgId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const org = findOrg(orgId ?? "");
  const orgName = org?.name ?? orgId ?? "";
  const childOrgs = findChildOrgs(orgId ?? "");
  const hasChildren = childOrgs.length > 0;

  // Role selection
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(() =>
    getAssignedRoleIds(orgId ?? "")
  );

  // Inheritance
  const [inheritEnabled, setInheritEnabled] = useState(false);
  const [inheritMode, setInheritMode] = useState<InheritMode>("none");
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  // Tooltip hover state (role id → boolean)
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  // Available roles for this org (filtered by parent hierarchy)
  const availableRoles = getAvailableRolesForOrg(orgId ?? "", org?.parentId);

  const filtered = useMemo(
    () =>
      availableRoles.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase())
      ),
    [search, availableRoles]
  );

  // ── Inheritance computation ─────────────────────────────────────────────────

  /** Whether a selected role will be inherited (toggle on and mode is not "none") */
  const willInherit = inheritEnabled && inheritMode !== "none";

  /** The child orgs that will receive the roles */
  const targetChildren: ChildOrg[] = useMemo(() => {
    if (!inheritEnabled || inheritMode === "none") return [];
    if (inheritMode === "all") return childOrgs;
    return childOrgs.filter((c) => selectedChildren.includes(c.id));
  }, [inheritEnabled, inheritMode, selectedChildren, childOrgs]);

  /** Total target orgs = current org + inheriting children */
  const targetOrgs = [{ id: orgId ?? "", name: orgName }, ...targetChildren];

  // ── Actions ────────────────────────────────────────────────────────────────

  const toggleRole = (roleId: string) => {
    setSelected((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = () => {
    if (!orgId) return;
    ORG_ACCESS_ROLE_ASSIGNMENTS[orgId] = selected.map((roleId) => ({
      roleId,
      status: "active" as const,
    }));
    // Propagate to children if inheritance is active
    if (willInherit) {
      for (const child of targetChildren) {
        ORG_ACCESS_ROLE_ASSIGNMENTS[child.id] = selected.map((roleId) => ({
          roleId,
          status: "active" as const,
        }));
      }
    }
    navigate(`/organizations/${orgId}?tab=access-roles`);
  };

  const handleCancel = () => {
    navigate(`/organizations/${orgId}?tab=access-roles`);
  };

  // ── Save button label & tooltip ────────────────────────────────────────────

  const saveLabel =
    inheritEnabled && inheritMode !== "none" ? "Save & Inherit" : "Save";

  const saveTooltip =
    targetOrgs.length > 1
      ? `This will assign selected roles to ${targetOrgs.length} organization${
          targetOrgs.length !== 1 ? "s" : ""
        }`
      : undefined;

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

            {/* Roles table */}
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
                    {filtered.length === 0 ? (
                      <TableEmptyState
                        colSpan={3}
                        message="No access roles match your search."
                      />
                    ) : (
                      filtered.map((role) => {
                        const isSelected = selected.includes(role.id);
                        const showInheritedBadge = willInherit && isSelected;

                        return (
                          <TableRow
                            key={role.id}
                            className="cursor-pointer"
                            onClick={() => toggleRole(role.id)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleRole(role.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell>
                              <div
                                className="flex items-center gap-2 flex-wrap"
                                onMouseEnter={() =>
                                  showInheritedBadge && setHoveredRole(role.id)
                                }
                                onMouseLeave={() => setHoveredRole(null)}
                              >
                                <span className="text-sm text-bluegrey-900">
                                  {role.name}
                                </span>
                                {showInheritedBadge && (
                                  <div className="relative inline-flex">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                                      Inherited
                                    </span>
                                    {hoveredRole === role.id && (
                                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-20 bg-bluegrey-900 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap shadow-lg pointer-events-none">
                                        This role will be inherited to{" "}
                                        {targetChildren.length === childOrgs.length
                                          ? "all child organizations"
                                          : targetChildren
                                              .map((c) => c.name)
                                              .join(", ") || "no children selected"}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-bluegrey-500">
                                {role.description}
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

            {/* Inheritance options — only shown when org has children */}
            {hasChildren && (
              <InheritanceOptions
                enabled={inheritEnabled}
                onEnabledChange={(v) => {
                  setInheritEnabled(v);
                  if (!v) setInheritMode("none");
                }}
                inheritMode={inheritMode}
                onInheritModeChange={setInheritMode}
                childOrgs={childOrgs}
                selectedChildren={selectedChildren}
                onSelectedChildrenChange={setSelectedChildren}
              />
            )}

            {/* Summary box */}
            {selected.length > 0 && (
              <div className="rounded-lg border border-bluegrey-200 bg-white p-4 space-y-3">
                <p className="text-sm font-semibold text-bluegrey-700">Summary</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-bluegrey-50 px-3 py-2">
                    <p className="text-xs text-bluegrey-500 mb-0.5">Roles to assign</p>
                    <p className="text-lg font-semibold text-bluegrey-900">
                      {selected.length}
                    </p>
                  </div>
                  <div className="rounded-md bg-bluegrey-50 px-3 py-2">
                    <p className="text-xs text-bluegrey-500 mb-0.5">
                      Target organizations
                    </p>
                    <p className="text-lg font-semibold text-bluegrey-900">
                      {targetOrgs.length}
                    </p>
                  </div>
                </div>

                {/* Target org list */}
                <div>
                  <p className="text-xs text-bluegrey-500 mb-1.5">
                    {targetOrgs.length === 1
                      ? `Assigning ${selected.length} role${
                          selected.length !== 1 ? "s" : ""
                        } to ${orgName}`
                      : `Assigning ${selected.length} role${
                          selected.length !== 1 ? "s" : ""
                        } to ${orgName} + ${targetChildren.length} child organization${
                          targetChildren.length !== 1 ? "s" : ""
                        }`}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {targetOrgs.map((o) => (
                      <span
                        key={o.id}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          o.id === orgId
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {o.name}
                        {o.id !== orgId && (
                          <span className="ml-1 text-purple-500 text-[9px]">inherited</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Button onClick={handleSave} className="gap-2">
                  {saveLabel}
                </Button>
                {saveTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 bg-bluegrey-900 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap shadow-lg pointer-events-none">
                    {saveTooltip}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-bluegrey-700"
              >
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
