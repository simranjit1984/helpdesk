import { MoreVertical, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
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
  parentId?: string;
  children?: Organization[];
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
    children: [
      {
        id: "4-1",
        name: "Beta Manufacturing",
        referenceId: "ORG-2024-004-001",
        status: "active",
        parentId: "4",
      },
      {
        id: "4-2",
        name: "Beta Research & Development",
        referenceId: "ORG-2024-004-002",
        status: "active",
        parentId: "4",
      },
      {
        id: "4-3",
        name: "Beta Logistics",
        referenceId: "ORG-2024-004-003",
        status: "active",
        parentId: "4",
      },
      {
        id: "4-4",
        name: "Beta Sales Division",
        referenceId: "ORG-2024-004-004",
        status: "active",
        parentId: "4",
      },
      {
        id: "4-5",
        name: "Beta Customer Support",
        referenceId: "ORG-2024-004-005",
        status: "active",
        parentId: "4",
      },
      {
        id: "4-6",
        name: "Beta IT Services",
        referenceId: "ORG-2024-004-006",
        status: "active",
        parentId: "4",
      },
      {
        id: "4-7",
        name: "Beta Finance",
        referenceId: "ORG-2024-004-007",
        status: "active",
        parentId: "4",
      },
    ],
  },
  {
    id: "5",
    name: "Gamma Ltd",
    referenceId: "ORG-2024-005",
    status: "inactive",
    children: [
      {
        id: "5-1",
        name: "Gamma North America",
        referenceId: "ORG-2024-005-001",
        status: "active",
        parentId: "5",
      },
      {
        id: "5-2",
        name: "Gamma Europe",
        referenceId: "ORG-2024-005-002",
        status: "active",
        parentId: "5",
      },
      {
        id: "5-3",
        name: "Gamma Asia Pacific",
        referenceId: "ORG-2024-005-003",
        status: "inactive",
        parentId: "5",
      },
      {
        id: "5-4",
        name: "Gamma Latin America",
        referenceId: "ORG-2024-005-004",
        status: "suspended",
        parentId: "5",
      },
      {
        id: "5-5",
        name: "Gamma Middle East",
        referenceId: "ORG-2024-005-005",
        status: "active",
        parentId: "5",
      },
      {
        id: "5-6",
        name: "Gamma Africa",
        referenceId: "ORG-2024-005-006",
        status: "pending",
        parentId: "5",
      },
    ],
  },
  {
    id: "6",
    name: "Delta Partners",
    referenceId: "ORG-2024-006",
    status: "active",
    children: [
      {
        id: "6-1",
        name: "Delta Ventures Capital",
        referenceId: "ORG-2024-006-001",
        status: "active",
        parentId: "6",
      },
      {
        id: "6-2",
        name: "Delta Asset Management",
        referenceId: "ORG-2024-006-002",
        status: "active",
        parentId: "6",
      },
      {
        id: "6-3",
        name: "Delta Private Equity",
        referenceId: "ORG-2024-006-003",
        status: "active",
        parentId: "6",
      },
      {
        id: "6-4",
        name: "Delta Wealth Management",
        referenceId: "ORG-2024-006-004",
        status: "active",
        parentId: "6",
      },
      {
        id: "6-5",
        name: "Delta Investment Banking",
        referenceId: "ORG-2024-006-005",
        status: "active",
        parentId: "6",
      },
      {
        id: "6-6",
        name: "Delta Securities",
        referenceId: "ORG-2024-006-006",
        status: "suspended",
        parentId: "6",
      },
      {
        id: "6-7",
        name: "Delta Trading",
        referenceId: "ORG-2024-006-007",
        status: "active",
        parentId: "6",
      },
      {
        id: "6-8",
        name: "Delta Real Estate",
        referenceId: "ORG-2024-006-008",
        status: "active",
        parentId: "6",
      },
    ],
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
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const toggleExpand = (orgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const matchesFilter = (org: Organization): boolean => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        org.name?.toLowerCase().includes(query) ||
        org.referenceId?.toLowerCase().includes(query) ||
        org.status?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    for (const filter of filters) {
      const fieldValue = (org[filter.column as keyof typeof org] || "")
        .toString()
        .toLowerCase();

      let matches = true;
      switch (filter.operator) {
        case "is": {
          const selectedValues = filter.value.split(",").map((v) => v.toLowerCase());
          matches = selectedValues.includes(fieldValue);
          break;
        }
        case "isNot": {
          const selectedValues = filter.value.split(",").map((v) => v.toLowerCase());
          matches = !selectedValues.includes(fieldValue);
          break;
        }
        case "contains":
          matches = fieldValue.includes(filter.value.toLowerCase());
          break;
        case "equals":
          matches = fieldValue === filter.value.toLowerCase();
          break;
        case "startsWith":
          matches = fieldValue.startsWith(filter.value.toLowerCase());
          break;
        case "endsWith":
          matches = fieldValue.endsWith(filter.value.toLowerCase());
          break;
      }
      
      if (!matches) return false;
    }

    return true;
  };

  const getFilteredOrganizations = () => {
    return baseOrganizations.filter(matchesFilter);
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

  const getFlattenedOrganizations = () => {
    const sorted = getSortedOrganizations();
    const flattened: Array<Organization & { level: number }> = [];

    sorted.forEach((org) => {
      flattened.push({ ...org, level: 0 });
      
      if (org.children && expandedOrgs.has(org.id)) {
        const filteredChildren = org.children.filter(matchesFilter);
        filteredChildren.forEach((child) => {
          flattened.push({ ...child, level: 1 });
        });
      }
    });

    return flattened;
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
            {getFlattenedOrganizations().map((org) => (
              <TableRow key={org.id}>
                <TableCell sticky className="w-56">
                  <div className="flex items-center gap-2" style={{ paddingLeft: `${org.level * 24}px` }}>
                    {org.level === 0 && org.children && org.children.length > 0 ? (
                      <button
                        onClick={(e) => toggleExpand(org.id, e)}
                        className="w-5 h-5 flex items-center justify-center hover:bg-bluegrey-100 rounded transition-colors flex-shrink-0"
                      >
                        {expandedOrgs.has(org.id) ? (
                          <ChevronDown className="w-4 h-4 text-bluegrey-900" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-bluegrey-900" />
                        )}
                      </button>
                    ) : (
                      <div className="w-5 h-5 flex-shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/organizations/${org.id}`)}
                      className="text-sm text-bluegrey-900 group-hover:text-blue-500 truncate transition-colors text-left"
                    >
                      {org.name}
                    </button>
                  </div>
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
