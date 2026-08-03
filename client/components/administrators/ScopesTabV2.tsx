import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import ScopeDrawerV2 from "./ScopeDrawerV2";
import { type Scope, MOCK_SCOPES_V2 } from "./mockData";
import { ALL_ACCESS_ROLES } from "@/components/organizations/accessRolesMockData";

function accessRoleSummary(scope: Scope): string {
  if (scope.accessRoleMode === "all") {
    return scope.accessRoleContext === "any" ? "Any access role" : "All access roles";
  }
  if (scope.accessRoleIds.length === 0) return "None selected";
  const names = scope.accessRoleIds
    .map((id) => ALL_ACCESS_ROLES.find((r) => r.id === id)?.name ?? id)
    .join(", ");
  return names.length > 40 ? `${names.slice(0, 40)}…` : names;
}

export default function ScopesTabV2() {
  const navigate = useNavigate();
  const [scopes, setScopes] = useState<Scope[]>(MOCK_SCOPES_V2);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingScope, setEditingScope] = useState<Scope | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Scope | null>(null);

  const filtered = scopes.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.organization.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingScope(null);
    setDrawerOpen(true);
  };

  const openEdit = (scope: Scope) => {
    navigate(`/administrators/scopes/${scope.id}`);
  };

  const handleSave = (data: Omit<Scope, "id">) => {
    if (editingScope) {
      setScopes((prev) =>
        prev.map((s) => (s.id === editingScope.id ? { ...s, ...data } : s)),
      );
    } else {
      setScopes((prev) => [...prev, { id: `scope-${Date.now()}`, ...data }]);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setScopes((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Search scopes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Scope
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableScroll>
          <TableContent>
            <TableHeader>
              <TableHeadRow>
                <TableHeadCell>Scope Name</TableHeadCell>
                <TableHeadCell>Organization</TableHeadCell>
                <TableHeadCell>Access Roles</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell />
              </TableHeadRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  message={
                    search ? "No scopes match your search." : "No scopes defined yet."
                  }
                />
              ) : (
                filtered.map((scope) => (
                  <TableRow key={scope.id}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => navigate(`/administrators/scopes/${scope.id}`)}
                        className="font-medium text-bluegrey-900 hover:text-blue-600 transition-colors text-left underline-offset-2 hover:underline"
                      >
                        {scope.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-700">{scope.organization}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-600">{accessRoleSummary(scope)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-500 max-w-[200px] truncate block">
                        {scope.description || "—"}
                      </span>
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
                            className="gap-2"
                            onClick={() => openEdit(scope)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-red-600 focus:text-red-600"
                            onClick={() => setDeleteTarget(scope)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
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

      <ScopeDrawerV2
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        scope={editingScope}
        onSave={handleSave}
      />

      <ConfirmationModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Scope"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        primaryAction={{ label: "Delete", onClick: handleDelete }}
        secondaryAction={{ label: "Cancel", onClick: () => setDeleteTarget(null) }}
      />
    </div>
  );
}
