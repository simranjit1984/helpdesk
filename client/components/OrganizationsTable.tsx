import { MoreVertical, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import ConfirmationModal from "./ConfirmationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
} from "./ui/table";
import { useToast } from "@/hooks/use-toast";

type StatusType =
  | "active"
  | "inactive"
  | "suspended"
  | "pending";

interface Organization {
  id: string;
  name: string;
  referenceId: string;
  status: StatusType;
}

export const baseOrganizations: Organization[] = [
  {
    id: "1",
    name: "Acme Corp",
    referenceId: "ORG-2024-001",
    status: "active",
  },
  {
    id: "2",
    name: "Tech Solutions",
    referenceId: "ORG-2024-002",
    status: "active",
  },
  {
    id: "3",
    name: "Global Services",
    referenceId: "ORG-2024-003",
    status: "active",
  },
  {
    id: "4",
    name: "Beta Industries",
    referenceId: "ORG-2024-004",
    status: "active",
  },
  {
    id: "5",
    name: "Gamma Ltd",
    referenceId: "ORG-2024-005",
    status: "inactive",
  },
  {
    id: "6",
    name: "Delta Partners",
    referenceId: "ORG-2024-006",
    status: "active",
  },
  {
    id: "7",
    name: "Epsilon Group",
    referenceId: "ORG-2024-007",
    status: "active",
  },
  {
    id: "8",
    name: "Zeta Enterprises",
    referenceId: "ORG-2024-008",
    status: "active",
  },
  {
    id: "9",
    name: "Theta Systems",
    referenceId: "ORG-2024-009",
    status: "suspended",
  },
  {
    id: "10",
    name: "Iota Solutions",
    referenceId: "ORG-2024-010",
    status: "active",
  },
  {
    id: "11",
    name: "Kappa Tech",
    referenceId: "ORG-2024-011",
    status: "active",
  },
  {
    id: "12",
    name: "Lambda Consulting",
    referenceId: "ORG-2024-012",
    status: "pending",
  },
  {
    id: "13",
    name: "Mu Digital",
    referenceId: "ORG-2024-013",
    status: "active",
  },
  {
    id: "14",
    name: "Nu Analytics",
    referenceId: "ORG-2024-014",
    status: "active",
  },
  {
    id: "15",
    name: "Xi Networks",
    referenceId: "ORG-2024-015",
    status: "active",
  },
  {
    id: "16",
    name: "Omicron Ventures",
    referenceId: "ORG-2024-016",
    status: "active",
  },
  {
    id: "17",
    name: "Pi Financial",
    referenceId: "ORG-2024-017",
    status: "inactive",
  },
  {
    id: "18",
    name: "Rho Marketing",
    referenceId: "ORG-2024-018",
    status: "active",
  },
  {
    id: "19",
    name: "Sigma Retail",
    referenceId: "ORG-2024-019",
    status: "active",
  },
  {
    id: "20",
    name: "Tau Logistics",
    referenceId: "ORG-2024-020",
    status: "suspended",
  },
];

type SortColumn = "name" | "referenceId" | "status";
type SortDirection = "asc" | "desc";

function OrganizationActionsMenu({ organization }: { organization: Organization }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    label: string;
    action: string;
  } | null>(null);

  const handleAction = (item: { label: string; action: string }) => {
    if (item.action === "View details") {
      navigate(`/organizations/${organization.id}`);
      return;
    }

    setPendingAction(item);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      toast({
        title: pendingAction.action,
        description: `Action performed for ${organization.name}`,
      });
      setIsModalOpen(false);
      setPendingAction(null);
    }
  };

  const handleCancelAction = () => {
    setIsModalOpen(false);
    setPendingAction(null);
  };

  const getMenuItems = () => {
    switch (organization.status) {
      case "active":
        return [
          { label: "View details", action: "View details" },
          { label: "Edit organization", action: "Edit organization" },
          { label: "Suspend organization", action: "Suspend organization" },
          { label: "Delete organization", action: "Delete organization" },
        ];
      case "inactive":
        return [
          { label: "View details", action: "View details" },
          { label: "Activate organization", action: "Activate organization" },
          { label: "Delete organization", action: "Delete organization" },
        ];
      case "suspended":
        return [
          { label: "View details", action: "View details" },
          { label: "Reactivate organization", action: "Reactivate organization" },
          { label: "Delete organization", action: "Delete organization" },
        ];
      case "pending":
        return [
          { label: "View details", action: "View details" },
          { label: "Approve organization", action: "Approve organization" },
          { label: "Reject organization", action: "Reject organization" },
        ];
      default:
        return [];
    }
  };

  const items = getMenuItems();

  if (items.length === 0) {
    return (
      <button className="w-10 h-10 flex items-center justify-center rounded hover:bg-bluegrey-100 transition-colors">
        <MoreVertical className="w-6 h-6 text-blue-500" />
      </button>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${isOpen ? "bg-bluegrey-100" : "hover:bg-bluegrey-100"}`}
          >
            <MoreVertical className="w-6 h-6 text-blue-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item) => (
            <DropdownMenuItem
              key={item.action}
              onClick={() => handleAction(item)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={pendingAction?.label || ""}
        description={`Are you sure you want to ${pendingAction?.label?.toLowerCase()} for this organization?`}
        tertiaryAction={{
          label: "Cancel",
          onClick: handleCancelAction,
        }}
        primaryAction={{
          label: "Continue",
          onClick: handleConfirmAction,
        }}
      />
    </>
  );
}

interface OrganizationsTableProps {
  searchQuery?: string;
  filters?: Array<{
    id: string;
    column: string;
    operator: string;
    value: string;
  }>;
}

export default function OrganizationsTable({
  searchQuery = "",
  filters = [],
}: OrganizationsTableProps) {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getFilteredOrganizations = () => {
    let filtered = baseOrganizations;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name?.toLowerCase().includes(query) ||
          org.referenceId?.toLowerCase().includes(query) ||
          org.status?.toLowerCase().includes(query)
      );
    }

    filters.forEach((filter) => {
      filtered = filtered.filter((org) => {
        const fieldValue = (org[filter.column as keyof typeof org] || "")
          .toString()
          .toLowerCase();

        switch (filter.operator) {
          case "is": {
            const selectedValues = filter.value.split(",").map((v) => v.toLowerCase());
            return selectedValues.includes(fieldValue);
          }
          case "isNot": {
            const selectedValues = filter.value.split(",").map((v) => v.toLowerCase());
            return !selectedValues.includes(fieldValue);
          }
          case "contains":
            return fieldValue.includes(filter.value.toLowerCase());
          case "equals":
            return fieldValue === filter.value.toLowerCase();
          case "startsWith":
            return fieldValue.startsWith(filter.value.toLowerCase());
          case "endsWith":
            return fieldValue.endsWith(filter.value.toLowerCase());
          default:
            return true;
        }
      });
    });

    return filtered;
  };

  const getSortedOrganizations = () => {
    const filteredOrganizations = getFilteredOrganizations();
    const sorted = [...filteredOrganizations].sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const SortHeader = ({
    column,
    label,
  }: {
    column: SortColumn;
    label: string;
  }) => {
    const isActive = sortColumn === column;
    return (
      <button
        onClick={() => handleSort(column)}
        className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer"
      >
        <span className="text-sm font-bold text-bluegrey-900">{label}</span>
        <div className="w-4 h-4">
          {isActive &&
            (sortDirection === "asc" ? (
              <ChevronUp className="w-4 h-4 text-blue-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-500" />
            ))}
        </div>
      </button>
    );
  };

  return (
    <Table variant="flat">
      <TableScroll>
        <TableContent>
          <TableHeader>
            <TableHeadRow>
              <TableHeadCell sticky className="w-64">
                <SortHeader column="name" label="Organization name" />
              </TableHeadCell>
              <TableHeadCell>
                <SortHeader column="referenceId" label="Reference ID" />
              </TableHeadCell>
              <TableHeadCell>
                <SortHeader column="status" label="Status" />
              </TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableHeadRow>
          </TableHeader>
          <TableBody>
            {getSortedOrganizations().map((org) => (
              <TableRow key={org.id}>
                <TableCell sticky className="w-56">
                  <button
                    type="button"
                    onClick={() => navigate(`/organizations/${org.id}`)}
                    className="text-sm text-bluegrey-900 group-hover:text-blue-500 truncate transition-colors text-left w-full"
                  >
                    {org.name}
                  </button>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-bluegrey-900 truncate">
                    {org.referenceId}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={org.status} />
                </TableCell>
                <TableActionCell>
                  <OrganizationActionsMenu organization={org} />
                </TableActionCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContent>
      </TableScroll>
    </Table>
  );
}
