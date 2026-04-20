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
import ScopeDrawer from "./ScopeDrawer";
import { type Scope, MOCK_SCOPES } from "./mockData";

const SCOPE_TYPE_STYLES: Record<
  Scope["type"],
  { bg: string; text: string }
> = {
  Global: { bg: "bg-blue-50", text: "text-blue-600" },
  Organization: { bg: "bg-green-50", text: "text-green-700" },
  Group: { bg: "bg-orange-50", text: "text-orange-700" },
};

export default function ScopesTab() {
  const [scopes, setScopes] = useState<Scope[]>(MOCK_SCOPES);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingScope, setEditingScope] = useState<Scope | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Scope | null>(null);

  const filtered = scopes.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingScope(null);
    setDrawerOpen(true);
  };

  const openEdit = (scope: Scope) => {
    setEditingScope(scope);
    setDrawerOpen(true);
  };

  const handleSave = (data: Omit<Scope, "id">) => {
    if (editingScope) {
      setScopes((prev) =>
        prev.map((s) => (s.id === editingScope.id ? { ...s, ...data } : s)),
      );
    } else {
      const newScope: Scope = {
        id: `scope-${Date.now()}`,
        ...data,
      };
      setScopes((prev) => [...prev, newScope]);
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
                <TableHeadCell>Type</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Included Entities</TableHeadCell>
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
                filtered.map((scope) => {
                  const style = SCOPE_TYPE_STYLES[scope.type];
                  return (
                    <TableRow key={scope.id}>
                      <TableCell>
                        <span className="font-medium text-bluegrey-900">
                          {scope.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 text-xs font-normal ${style.bg} ${style.text}`}
                        >
                          {scope.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-bluegrey-500 max-w-[200px] truncate block">
                          {scope.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {scope.entities.length === 0 ? (
                          <span className="text-sm text-bluegrey-400">All</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {scope.entities.slice(0, 2).map((e) => (
                              <Badge
                                key={e}
                                className="bg-bluegrey-50 text-bluegrey-700 border-0 text-xs font-normal"
                              >
                                {e}
                              </Badge>
                            ))}
                            {scope.entities.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs font-normal text-bluegrey-500"
                              >
                                +{scope.entities.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
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
                  );
                })
              )}
            </TableBody>
          </TableContent>
        </TableScroll>
      </Table>

      {/* Drawer */}
      <ScopeDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        scope={editingScope}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
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
