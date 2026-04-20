import { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import AdminRoleDrawer from "./AdminRoleDrawer";
import { type AdminRole, MOCK_ADMIN_ROLES } from "./mockData";

export default function AdminRolesTab() {
  const [roles, setRoles] = useState<AdminRole[]>(MOCK_ADMIN_ROLES);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null);

  const filtered = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingRole(null);
    setDrawerOpen(true);
  };

  const openEdit = (role: AdminRole) => {
    setEditingRole(role);
    setDrawerOpen(true);
  };

  const handleSave = (data: Omit<AdminRole, "id" | "createdDate">) => {
    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id ? { ...r, ...data } : r,
        ),
      );
    } else {
      const newRole: AdminRole = {
        id: `role-${Date.now()}`,
        createdDate: new Date().toISOString().split("T")[0],
        ...data,
      };
      setRoles((prev) => [...prev, newRole]);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Role
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableScroll>
          <TableContent>
            <TableHeader>
              <TableHeadRow>
                <TableHeadCell>Role Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Permissions</TableHeadCell>
                <TableHeadCell>Created Date</TableHeadCell>
                <TableHeadCell />
              </TableHeadRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  message={
                    search
                      ? "No roles match your search."
                      : "No administrator roles defined yet."
                  }
                />
              ) : (
                filtered.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <span className="font-medium text-bluegrey-900">
                        {role.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-500 max-w-[240px] truncate block">
                        {role.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 2).map((p) => (
                          <Badge
                            key={p}
                            className="bg-blue-50 text-blue-700 border-0 text-xs font-normal"
                          >
                            {p}
                          </Badge>
                        ))}
                        {role.permissions.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal text-bluegrey-500"
                          >
                            +{role.permissions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-500">
                        {role.createdDate}
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
                            onClick={() => openEdit(role)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-red-600 focus:text-red-600"
                            onClick={() => setDeleteTarget(role)}
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

      {/* Drawer */}
      <AdminRoleDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        role={editingRole}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Role"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        primaryAction={{ label: "Delete", onClick: handleDelete }}
        secondaryAction={{ label: "Cancel", onClick: () => setDeleteTarget(null) }}
      />
    </div>
  );
}
