import { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
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
import { type Permission } from "@/lib/applicationsMockData";

// ─── Add permission modal ─────────────────────────────────────────────────────

function AddPermissionModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (p: Omit<Permission, "id">) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [identifier, setIdentifier] = useState("");

  if (!open) return null;

  const handleSave = () => {
    if (!displayName.trim() || !identifier.trim()) return;
    onSave({
      displayName: displayName.trim(),
      description: description.trim(),
      identifier: identifier.trim(),
    });
    setDisplayName("");
    setDescription("");
    setIdentifier("");
    onClose();
  };

  const handleClose = () => {
    setDisplayName("");
    setDescription("");
    setIdentifier("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bluegrey-100">
          <h3 className="text-base font-semibold text-bluegrey-900">Add permission</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-bluegrey-50 text-bluegrey-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-bluegrey-900">
              Display name <span className="text-red-500">*</span>
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter display name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-bluegrey-900">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-bluegrey-900">
              Permission identifier <span className="text-red-500">*</span>
            </label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. update_status"
              className="font-mono text-sm"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-bluegrey-100">
          <Button variant="ghost" onClick={handleClose} className="h-10 px-4 text-bluegrey-700">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!displayName.trim() || !identifier.trim()}
            className="bg-bluegrey-900 hover:bg-bluegrey-800 text-white h-10 px-4 rounded-sm"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Sort indicator ───────────────────────────────────────────────────────────

function SortHead({
  label,
  field,
  sort,
  onSort,
}: {
  label: string;
  field: string;
  sort: { field: string; dir: "asc" | "desc" };
  onSort: (f: string) => void;
}) {
  const active = sort.field === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-left group"
    >
      <span className="text-xs font-semibold text-bluegrey-600 uppercase tracking-wider group-hover:text-bluegrey-900">
        {label}
      </span>
      <span className="text-bluegrey-300 group-hover:text-bluegrey-500 text-xs">
        {active ? (sort.dir === "asc" ? "↑" : "↓") : "↑"}
      </span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PermissionsTabProps {
  permissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  isFederated: boolean;
}

export default function PermissionsTab({ permissions, onChange, isFederated }: PermissionsTabProps) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [sort, setSort] = useState<{ field: string; dir: "asc" | "desc" }>({
    field: "displayName",
    dir: "asc",
  });

  const handleSort = (field: string) => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  };

  const filtered = permissions
    .filter(
      (p) =>
        p.displayName.toLowerCase().includes(search.toLowerCase()) ||
        p.identifier.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const va = sort.field === "displayName" ? a.displayName : sort.field === "identifier" ? a.identifier : a.description;
      const vb = sort.field === "displayName" ? b.displayName : sort.field === "identifier" ? b.identifier : b.description;
      return sort.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  function handleAdd(p: Omit<Permission, "id">) {
    onChange([...permissions, { ...p, id: `p-${Date.now()}` }]);
  }

  function handleDelete(id: string) {
    onChange(permissions.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold text-bluegrey-900 mb-1">Permissions</h2>
        {isFederated && (
          <p className="text-sm text-bluegrey-500 max-w-2xl">
            Add permissions that the application is able to interpret when sent through the
            federation protocol (OIDC, SAML, OAuth). You configure these permissions in the
            roles that you can assign to users.
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-white hover:bg-bluegrey-25 border border-bluegrey-300 text-bluegrey-900 h-10 px-4 rounded-sm shadow-sm whitespace-nowrap"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          Add permission
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableScroll>
          <TableContent>
            <TableHeader>
              <TableHeadRow>
                <TableHeadCell>
                  <SortHead label="Display name" field="displayName" sort={sort} onSort={handleSort} />
                </TableHeadCell>
                <TableHeadCell>
                  <SortHead label="Description" field="description" sort={sort} onSort={handleSort} />
                </TableHeadCell>
                <TableHeadCell>
                  <SortHead label="Permission identifier" field="identifier" sort={sort} onSort={handleSort} />
                </TableHeadCell>
                <TableHeadCell />
              </TableHeadRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmptyState
                  colSpan={4}
                  message={search ? "No permissions match your search." : "No permissions added yet."}
                />
              ) : (
                filtered.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell>
                      <span className="text-sm font-medium text-bluegrey-900">{perm.displayName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-bluegrey-600">{perm.description || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-bluegrey-700 bg-bluegrey-50 px-1.5 py-0.5 rounded">
                        {perm.identifier}
                      </span>
                    </TableCell>
                    <TableActionCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded hover:bg-bluegrey-100 text-bluegrey-500 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2 text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(perm.id)}
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

      <AddPermissionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAdd}
      />
    </div>
  );
}
