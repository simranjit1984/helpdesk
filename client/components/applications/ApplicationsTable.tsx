import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronDown, MoreHorizontal, Pencil, Trash2, Search, CheckCircle2 } from "lucide-react";
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
import SelectFederatedAppModal from "./SelectFederatedAppModal";
import { type Application } from "@/lib/applicationsMockData";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Application["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        status === "active"
          ? "bg-green-50 text-green-700"
          : "bg-bluegrey-100 text-bluegrey-600"
      }`}
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Add application split-button ─────────────────────────────────────────────

function AddAppDropdown({
  onFederated,
  onNonFederated,
}: {
  onFederated: () => void;
  onNonFederated: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 h-10 px-4 bg-bluegrey-800 hover:bg-bluegrey-900 text-white rounded-sm transition-colors text-sm font-medium whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Add application
          <ChevronDown className="w-4 h-4 ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0 shadow-lg">
        <button
          onClick={onFederated}
          className="w-full text-left px-4 py-3.5 hover:bg-bluegrey-25 transition-colors border-b border-bluegrey-100 group"
        >
          <p className="text-sm font-semibold text-bluegrey-900 group-hover:text-blue-600">
            Federated application
          </p>
          <p className="text-xs text-bluegrey-500 mt-0.5">
            Integrated with SAML, OIDC, or OAuth
          </p>
        </button>
        <button
          onClick={onNonFederated}
          className="w-full text-left px-4 py-3.5 hover:bg-bluegrey-25 transition-colors group"
        >
          <p className="text-sm font-semibold text-bluegrey-900 group-hover:text-blue-600">
            Non-federated application
          </p>
          <p className="text-xs text-bluegrey-500 mt-0.5">
            Integrated through APIs
          </p>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Sort indicator ───────────────────────────────────────────────────────────

function SortableHeader({
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
      className="flex items-center gap-1 group text-xs font-semibold text-bluegrey-600 uppercase tracking-wider hover:text-bluegrey-900"
    >
      {label}
      <span className="text-bluegrey-300 group-hover:text-bluegrey-500">
        {active ? (sort.dir === "asc" ? "↑" : "↓") : "↑"}
      </span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ApplicationsTableProps {
  apps: Application[];
  onDelete: (id: string) => void;
}

export default function ApplicationsTable({ apps, onDelete }: ApplicationsTableProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ field: string; dir: "asc" | "desc" }>({
    field: "displayName",
    dir: "asc",
  });
  const [selectFederatedOpen, setSelectFederatedOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  const handleSort = (field: string) => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  };

  const filtered = apps
    .filter(
      (a) =>
        a.displayName.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const va = sort.field === "displayName" ? a.displayName : a.description;
      const vb = sort.field === "displayName" ? b.displayName : b.description;
      return sort.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-xs w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bluegrey-400 pointer-events-none" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-xs"
          />
        </div>
        <AddAppDropdown
          onFederated={() => setSelectFederatedOpen(true)}
          onNonFederated={() => navigate("/applications/new?type=non-federated")}
        />
      </div>

      {/* Table */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <Table>
          <TableScroll>
            <TableContent>
              <TableHeader>
                <TableHeadRow>
                  <TableHeadCell>
                    <SortableHeader
                      label="Application"
                      field="displayName"
                      sort={sort}
                      onSort={handleSort}
                    />
                  </TableHeadCell>
                  <TableHeadCell>
                    <SortableHeader
                      label="Description"
                      field="description"
                      sort={sort}
                      onSort={handleSort}
                    />
                  </TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell />
                </TableHeadRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableEmptyState
                    colSpan={4}
                    message={
                      search
                        ? "No applications match your search."
                        : "No applications found."
                    }
                  />
                ) : (
                  filtered.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer hover:bg-bluegrey-25"
                      onClick={() => navigate(`/applications/${app.id}`)}
                    >
                      <TableCell>
                        <span className="font-medium text-bluegrey-900 text-sm">
                          {app.displayName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-bluegrey-600">
                          {app.description || ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableActionCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded hover:bg-bluegrey-100 text-bluegrey-500 transition-colors"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/applications/${app.id}`);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-red-600 focus:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(app);
                              }}
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
      </div>

      {/* Federated selection modal */}
      <SelectFederatedAppModal
        open={selectFederatedOpen}
        onClose={() => setSelectFederatedOpen(false)}
        onContinue={(appId) =>
          navigate(`/applications/new?type=federated&appId=${appId}`)
        }
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Application"
        description={`Are you sure you want to delete "${deleteTarget?.displayName}"? This action cannot be undone.`}
        primaryAction={{
          label: "Delete",
          onClick: () => {
            if (deleteTarget) onDelete(deleteTarget.id);
            setDeleteTarget(null);
          },
        }}
        secondaryAction={{ label: "Cancel", onClick: () => setDeleteTarget(null) }}
      />
    </>
  );
}
