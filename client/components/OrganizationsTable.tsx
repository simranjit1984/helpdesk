import { MoreVertical, ChevronDown, ChevronRight, Plus, PlusCircle, X, Search } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import ConfirmationModal from "./ConfirmationModal";
import DateRangePicker from "./DateRangePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  DataGrid,
  DataGridRow,
  DataGridCell,
} from "@onewelcome/react-lib-components";
import type { HeaderCell } from "@onewelcome/react-lib-components";
import { useToast } from "@/hooks/use-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
];

const SEARCH_FIELDS = [
  { value: "all", label: "All fields" },
  { value: "name", label: "Organization name" },
  { value: "referenceId", label: "Reference ID" },
];

const FILTER_COLUMNS = [
  { value: "status", label: "Status" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusType = "active" | "inactive";

export type OrgFilter = {
  id: string;
  column: string;
  operator: string;
  value: string;
};

interface Organization {
  id: string;
  name: string;
  referenceId: string;
  status: StatusType;
  parentId?: string;
  children?: Organization[];
}

// ─── Organization data ────────────────────────────────────────────────────────

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
        status: "inactive",
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
        status: "active",
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
        status: "inactive",
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
    status: "inactive",
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
    status: "active",
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
    status: "inactive",
  },
];

// ─── Add Filter Popover ───────────────────────────────────────────────────────

interface AddFilterPopoverProps {
  columns: Array<{ value: string; label: string }>;
  columnOptions: Record<string, Array<{ value: string; label: string }>>;
  onFilterAdd: (filter: OrgFilter) => void;
}

function AddFilterPopover({ columns, columnOptions, onFilterAdd }: AddFilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const multiSelectOpenRef = useRef(false);

  const [pendingFilter, setPendingFilter] = useState({
    column: columns[0]?.value || "",
    operator: "contains",
    value: "",
  });
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const isDateField = (col: string) => col === "date" || col === "dateCreated";

  const hasColumnOptions = (col: string) => !!(columnOptions[col]?.length);

  const getOperatorsForColumn = (col: string) =>
    hasColumnOptions(col)
      ? [
          { value: "is", label: "is" },
          { value: "isNot", label: "is not" },
        ]
      : DEFAULT_OPERATORS;

  const initializeDateRange = () => {
    const now = new Date();
    const endIso = now.toISOString().slice(0, 16);
    setDateRange({ start: "", end: endIso });
  };

  const resetState = () => {
    setPendingFilter({
      column: columns[0]?.value || "",
      operator: "contains",
      value: "",
    });
    setSelectedValues([]);
    initializeDateRange();
  };

  const handleStartDateChange = useCallback(
    (date: string) => setDateRange((prev) => ({ ...prev, start: date })),
    [],
  );

  const handleEndDateChange = useCallback(
    (date: string) => setDateRange((prev) => ({ ...prev, end: date })),
    [],
  );

  const applyFilter = () => {
    const isDate = isDateField(pendingFilter.column);
    const hasOptions = hasColumnOptions(pendingFilter.column);

    if (isDate) {
      if (dateRange.start && dateRange.end) {
        onFilterAdd({
          id: Math.random().toString(36).substr(2, 9),
          column: pendingFilter.column,
          operator: "between",
          value: `${dateRange.start}|${dateRange.end}`,
        });
        resetState();
        setIsOpen(false);
      }
    } else if (hasOptions) {
      if (selectedValues.length > 0) {
        onFilterAdd({
          id: Math.random().toString(36).substr(2, 9),
          column: pendingFilter.column,
          operator: pendingFilter.operator,
          value: selectedValues.join(","),
        });
        resetState();
        setIsOpen(false);
      }
    } else {
      if (pendingFilter.value.trim()) {
        onFilterAdd({
          id: Math.random().toString(36).substr(2, 9),
          column: pendingFilter.column,
          operator: pendingFilter.operator,
          value: pendingFilter.value,
        });
        resetState();
        setIsOpen(false);
      }
    }
  };

  const currentColumnHasOptions = hasColumnOptions(pendingFilter.column);
  const currentColumnIsDate = isDateField(pendingFilter.column);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && multiSelectOpenRef.current) return;
        setIsOpen(open);
        if (open) resetState();
        else setDateRange({ start: "", end: "" });
      }}
    >
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 px-3 py-1 bg-bluegrey-100 rounded-full hover:bg-bluegrey-200 transition-colors cursor-pointer">
          <PlusCircle className="w-4 h-4 text-bluegrey-900" />
          <span className="text-sm font-normal text-bluegrey-900">Add filter</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-0 rounded-sm"
        style={{
          boxShadow:
            "0 8px 10px 0 rgba(1,5,50,0.14), 0 3px 14px 0 rgba(1,5,50,0.12), 0 4px 5px 0 rgba(1,5,50,0.20)",
        }}
      >
        <div className="flex flex-col gap-4 p-4">
          {currentColumnHasOptions ? (
            <>
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 w-60">
                  <label className="text-sm text-bluegrey-900 leading-5 font-normal">
                    Filter by
                  </label>
                  <Select
                    value={pendingFilter.column}
                    onValueChange={(value) => {
                      const firstOp = getOperatorsForColumn(value)[0]?.value || "contains";
                      setPendingFilter((prev) => ({ ...prev, column: value, operator: firstOp }));
                      setSelectedValues([]);
                      setDateRange({ start: "", end: "" });
                    }}
                  >
                    <SelectTrigger className="w-full h-11 px-2 py-3 border-[#5D607E] rounded-sm text-sm font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.value} value={col.value}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1 w-[130px]">
                  <label className="text-sm text-bluegrey-900 leading-5 font-normal">
                    Operator
                  </label>
                  <Select
                    value={pendingFilter.operator || "is"}
                    onValueChange={(value) =>
                      setPendingFilter((prev) => ({ ...prev, operator: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-11 px-2 py-3 border-[#5D607E] rounded-sm text-sm font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorsForColumn(pendingFilter.column).map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1 w-60">
                  <MultiSelect
                    label="Values"
                    options={columnOptions[pendingFilter.column] || []}
                    selectedValues={selectedValues}
                    onChange={setSelectedValues}
                    placeholder=" "
                    isOpenRef={multiSelectOpenRef}
                  />
                </div>
              </div>

              <div className="flex justify-end items-start gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-10 px-3 py-2 text-sm font-medium text-[#383A4B] hover:bg-bluegrey-50 rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilter}
                  disabled={selectedValues.length === 0}
                  className="h-10 px-3 py-2 bg-[#041295] hover:bg-[#041295]/90 text-[#F7F7F9] rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </>
          ) : currentColumnIsDate ? (
            <>
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 w-60">
                  <label className="text-sm text-bluegrey-900 leading-5 font-normal">
                    Filter by
                  </label>
                  <Select
                    value={pendingFilter.column}
                    onValueChange={(value) => {
                      const firstOp = getOperatorsForColumn(value)[0]?.value || "between";
                      setPendingFilter((prev) => ({ ...prev, column: value, operator: firstOp }));
                      setDateRange({ start: "", end: "" });
                      if (isDateField(value)) initializeDateRange();
                    }}
                  >
                    <SelectTrigger className="w-full h-11 px-2 py-3 border-[#5D607E] rounded-sm text-sm font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.value} value={col.value}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onApply={applyFilter}
                onCancel={() => setIsOpen(false)}
              />
            </>
          ) : (
            <>
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 w-60">
                  <label className="text-sm text-bluegrey-900 leading-5 font-normal">
                    Filter by
                  </label>
                  <Select
                    value={pendingFilter.column}
                    onValueChange={(value) => {
                      const firstOp = getOperatorsForColumn(value)[0]?.value || "contains";
                      setPendingFilter((prev) => ({ ...prev, column: value, operator: firstOp }));
                      setDateRange({ start: "", end: "" });
                      if (isDateField(value)) initializeDateRange();
                    }}
                  >
                    <SelectTrigger className="w-full h-11 px-2 py-3 border-[#5D607E] rounded-sm text-sm font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.value} value={col.value}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1 w-[130px]">
                  <label className="text-sm text-bluegrey-900 leading-5 font-normal">
                    Operator
                  </label>
                  <Select
                    value={pendingFilter.operator || "contains"}
                    onValueChange={(value) =>
                      setPendingFilter((prev) => ({ ...prev, operator: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-11 px-2 py-3 border-[#5D607E] rounded-sm text-sm font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1 w-60">
                  <label
                    htmlFor="org-filter-value"
                    className="text-sm text-bluegrey-900 leading-5 font-normal"
                  >
                    Value
                  </label>
                  <input
                    id="org-filter-value"
                    name="org-filter-value"
                    type="text"
                    placeholder=" "
                    value={pendingFilter.value}
                    onChange={(e) =>
                      setPendingFilter((prev) => ({ ...prev, value: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyFilter();
                    }}
                    className="w-full h-11 px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-500 border border-[#5D607E] rounded-sm bg-white font-normal"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="flex justify-end items-start gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-10 px-3 py-2 text-sm font-medium text-[#383A4B] hover:bg-bluegrey-50 rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilter}
                  disabled={!pendingFilter.value.trim()}
                  className="h-10 px-3 py-2 bg-[#041295] hover:bg-[#041295]/90 text-[#F7F7F9] rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Format filter chip label ─────────────────────────────────────────────────

function formatFilterDisplay(
  filter: OrgFilter,
  columnOptions: Record<string, Array<{ value: string; label: string }>>,
  columns: Array<{ value: string; label: string }>,
) {
  const getColumnLabel = (v: string) =>
    columns.find((c) => c.value === v)?.label ?? v;
  const getOperatorLabel = (v: string) =>
    DEFAULT_OPERATORS.find((o) => o.value === v)?.label ?? v;

  if (filter.operator === "between") {
    const [startStr, endStr] = filter.value.split("|");
    const parseDate = (s: string) => {
      const clean = s.trim().includes("T") ? s.trim() : s.trim().replace(" ", "T");
      return new Date(clean).toLocaleDateString();
    };
    return (
      <>
        {getColumnLabel(filter.column)} between{" "}
        <strong className="font-bold">{parseDate(startStr)}</strong> and{" "}
        <strong className="font-bold">{parseDate(endStr)}</strong>
      </>
    );
  }

  if (filter.operator === "is" || filter.operator === "isNot") {
    const opLabel = filter.operator === "is" ? "is" : "is not";
    const valueLabels = filter.value
      .split(",")
      .map((v) => columnOptions[filter.column]?.find((o) => o.value === v)?.label ?? v)
      .join(", ");
    return (
      <>
        {getColumnLabel(filter.column)} {opLabel}{" "}
        <strong className="font-bold">{valueLabels}</strong>
      </>
    );
  }

  return (
    <>
      {getColumnLabel(filter.column)} {getOperatorLabel(filter.operator)}{" "}
      <strong className="font-bold">{filter.value}</strong>
    </>
  );
}

// ─── Organization actions menu ────────────────────────────────────────────────

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
    if (item.action === "View organization") {
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
          { label: "View organization", action: "View organization" },
          { label: "Switch organization", action: "Switch organization" },
          { label: "Set to inactive", action: "Set to inactive" },
        ];
      case "inactive":
        return [
          { label: "View organization", action: "View organization" },
          { label: "Switch organization", action: "Switch organization" },
          { label: "Set to active", action: "Set to active" },
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
            <DropdownMenuItem key={item.action} onClick={() => handleAction(item)}>
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

// ─── Column definitions ───────────────────────────────────────────────────────

const HEADERS: HeaderCell[] = [
  { name: "name",        headline: "Organization name" },
  { name: "referenceId", headline: "Reference ID" },
  { name: "status",      headline: "Status" },
  { name: "actions",     headline: "", disableSorting: true },
];

const INITIAL_SORT: Array<{ name: string; direction: "ASC" | "DESC" }> = [
  { name: "name", direction: "ASC" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrganizationsTable() {
  const navigate = useNavigate();

  // ── Toolbar state ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filters, setFilters] = useState<OrgFilter[]>([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // ── Sort + expand state ───────────────────────────────────────────────────
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("ASC");
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  const columnOptions = { status: STATUS_OPTIONS };

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
      let matchesSearch = false;
      if (searchField === "name") {
        matchesSearch = org.name?.toLowerCase().includes(query) ?? false;
      } else if (searchField === "referenceId") {
        matchesSearch = org.referenceId?.toLowerCase().includes(query) ?? false;
      } else {
        matchesSearch =
          org.name?.toLowerCase().includes(query) ||
          org.referenceId?.toLowerCase().includes(query) ||
          org.status?.toLowerCase().includes(query);
      }
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

  const getFilteredOrganizations = () => baseOrganizations.filter(matchesFilter);

  const getSortedOrganizations = () => {
    const filteredOrganizations = getFilteredOrganizations();
    return [...filteredOrganizations].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof Organization];
      let bVal: any = b[sortColumn as keyof Organization];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDir === "ASC" ? -1 : 1;
      if (aVal > bVal) return sortDir === "ASC" ? 1 : -1;
      return 0;
    });
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-4">
      {/* Active filter chips */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-bluegrey-100 rounded-full"
            >
              <span className="text-base text-bluegrey-900">
                {formatFilterDisplay(filter, columnOptions, FILTER_COLUMNS)}
              </span>
              <button
                onClick={() => setFilters(filters.filter((f) => f.id !== filter.id))}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-bluegrey-500/10 transition-colors"
              >
                <X className="w-4 h-4 text-bluegrey-900" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setFilters([])}
            className="text-base text-blue-500 hover:text-blue-600 underline transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Toolbar row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          {/* Composite search: field dropdown + text input */}
          <div
            className={`flex items-center h-10 border rounded-sm bg-white transition-all ${
              isSelectOpen
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-bluegrey-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
            }`}
          >
            <Select
              value={searchField}
              onValueChange={(v) => setSearchField(v)}
              onOpenChange={setIsSelectOpen}
            >
              <SelectTrigger className="h-full w-40 border-0 border-r border-bluegrey-300 rounded-none rounded-l-sm text-sm font-normal text-bluegrey-900 bg-transparent focus:ring-0 focus:outline-none px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEARCH_FIELDS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5 px-2">
              <Search className="w-4 h-4 text-bluegrey-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations"
                className="w-44 text-sm font-normal leading-5 text-bluegrey-900 placeholder:text-bluegrey-400 outline-none bg-transparent font-[inherit]"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-bluegrey-400 hover:text-bluegrey-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <AddFilterPopover
            columns={FILTER_COLUMNS}
            columnOptions={columnOptions}
            onFilterAdd={(f) => setFilters((prev) => [...prev, f])}
          />
        </div>

        <div className="ml-auto">
          <button
            onClick={() => navigate("/organizations/new")}
            className="flex items-center gap-2 h-10 px-3 bg-blue-500 hover:bg-blue-600 text-bluegrey-25 rounded-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Add organization</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="orgs-datagrid-wrapper">
        <DataGrid
          headers={HEADERS}
          data={getFlattenedOrganizations()}
          initialSort={INITIAL_SORT}
          onSort={(sorts) => {
            if (sorts && sorts.length > 0) {
              setSortColumn(sorts[0].name);
              setSortDir(sorts[0].direction as "ASC" | "DESC");
            } else {
              setSortColumn("name");
              setSortDir("ASC");
            }
          }}
          disableContextMenuColumn={true}
          emptyLabel="No organizations found"
        >
          {({ item: org }) => (
            <DataGridRow
              key={org.id}
              item={org}
              headers={HEADERS}
              disableContextMenuColumn={true}
            >
              {/* Organization name — expand/collapse + indent */}
              <DataGridCell>
                <div
                  className="flex items-center gap-2"
                  style={{ paddingLeft: `${org.level * 24}px` }}
                >
                  {org.level === 0 && org.children && org.children.length > 0 ? (
                    <button
                      onClick={(e) => toggleExpand(org.id, e)}
                      className="w-5 h-5 flex items-center justify-center hover:bg-bluegrey-100 rounded transition-colors flex-shrink-0"
                    >
                      {expandedOrgs.has(org.id)
                        ? <ChevronDown className="w-4 h-4 text-bluegrey-900" />
                        : <ChevronRight className="w-4 h-4 text-bluegrey-900" />}
                    </button>
                  ) : (
                    <div className="w-5 h-5 flex-shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/organizations/${org.id}`)}
                    className="text-sm text-bluegrey-900 hover:text-blue-500 truncate transition-colors text-left"
                  >
                    {org.name}
                  </button>
                </div>
              </DataGridCell>

              {/* Reference ID */}
              <DataGridCell>
                <span className="text-sm text-bluegrey-900">{org.referenceId}</span>
              </DataGridCell>

              {/* Status */}
              <DataGridCell>
                <StatusBadge status={org.status} />
              </DataGridCell>

              {/* Actions */}
              <DataGridCell>
                <OrganizationActionsMenu organization={org} />
              </DataGridCell>
            </DataGridRow>
          )}
        </DataGrid>
      </div>
    </div>
  );
}
