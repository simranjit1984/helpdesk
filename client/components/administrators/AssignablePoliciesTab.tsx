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
import PolicyDrawer from "./PolicyDrawer";
import { type AssignablePolicy, MOCK_POLICIES } from "./mockData";

const RULE_TYPE_STYLES: Record<
  AssignablePolicy["ruleType"],
  { bg: string; text: string }
> = {
  All: { bg: "bg-blue-50", text: "text-blue-600" },
  "Tag-based": { bg: "bg-green-50", text: "text-green-700" },
  Custom: { bg: "bg-orange-50", text: "text-orange-700" },
};

export default function AssignablePoliciesTab() {
  const [policies, setPolicies] = useState<AssignablePolicy[]>(MOCK_POLICIES);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AssignablePolicy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssignablePolicy | null>(null);

  const filtered = policies.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.ruleType.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingPolicy(null);
    setDrawerOpen(true);
  };

  const openEdit = (policy: AssignablePolicy) => {
    setEditingPolicy(policy);
    setDrawerOpen(true);
  };

  const handleSave = (data: Omit<AssignablePolicy, "id">) => {
    if (editingPolicy) {
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === editingPolicy.id ? { ...p, ...data } : p,
        ),
      );
    } else {
      const newPolicy: AssignablePolicy = {
        id: `policy-${Date.now()}`,
        ...data,
      };
      setPolicies((prev) => [...prev, newPolicy]);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setPolicies((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Search policies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Policy
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableScroll>
          <TableContent>
            <TableHeader>
              <TableHeadRow>
                <TableHeadCell>Policy Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Rule Type</TableHeadCell>
                <TableHeadCell>Allowed Roles</TableHeadCell>
                <TableHeadCell />
              </TableHeadRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  message={
                    search
                      ? "No policies match your search."
                      : "No assignable policies defined yet."
                  }
                />
              ) : (
                filtered.map((policy) => {
                  const style = RULE_TYPE_STYLES[policy.ruleType];
                  return (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <span className="font-medium text-bluegrey-900">
                          {policy.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-bluegrey-500 max-w-[200px] truncate block">
                          {policy.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 text-xs font-normal ${style.bg} ${style.text}`}
                        >
                          {policy.ruleType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {policy.allowedRoles.slice(0, 2).map((r) => (
                            <Badge
                              key={r}
                              className="bg-bluegrey-50 text-bluegrey-700 border-0 text-xs font-normal"
                            >
                              {r}
                            </Badge>
                          ))}
                          {policy.allowedRoles.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal text-bluegrey-500"
                            >
                              +{policy.allowedRoles.length - 2} more
                            </Badge>
                          )}
                        </div>
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
                              onClick={() => openEdit(policy)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-red-600 focus:text-red-600"
                              onClick={() => setDeleteTarget(policy)}
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
      <PolicyDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        policy={editingPolicy}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Policy"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        primaryAction={{ label: "Delete", onClick: handleDelete }}
        secondaryAction={{ label: "Cancel", onClick: () => setDeleteTarget(null) }}
      />
    </div>
  );
}
