import React, { useState, useCallback } from "react";
import { X, PlusCircle } from "lucide-react";
import SearchBar from "./SearchBar";
import DateRangePicker from "./DateRangePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Filter {
  id: string;
  column: string;
  operator: string;
  value: string;
}

export interface FilterColumn {
  value: string;
  label: string;
}

export interface FilterOperator {
  value: string;
  label: string;
}

interface FilterBarProps {
  columns: FilterColumn[];
  operators?: FilterOperator[];
  filters: Filter[];
  onFilterAdd: (filter: Filter) => void;
  onFilterRemove: (filterId: string) => void;
  onClearFilters: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const DEFAULT_OPERATORS: FilterOperator[] = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
];

export default function FilterBar({
  columns,
  operators = DEFAULT_OPERATORS,
  filters,
  onFilterAdd,
  onFilterRemove,
  onClearFilters,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search",
}: FilterBarProps) {
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [pendingFilter, setPendingFilter] = useState({
    column: columns[0]?.value || "",
    operator: operators[0]?.value || "contains",
    value: "",
  });
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const isDateField = (column: string) => {
    return column === "date" || column === "dateCreated";
  };

  const initializeDateRange = () => {
    const now = new Date();
    const endIso = now.toISOString().slice(0, 16);
    setDateRange({
      start: "",
      end: endIso,
    });
  };

  const resetFilterState = () => {
    setPendingFilter({
      column: columns[0]?.value || "",
      operator: operators[0]?.value || "contains",
      value: "",
    });
    initializeDateRange();
  };

  const handleStartDateChange = useCallback(
    (date: string) => setDateRange((prev) => ({ ...prev, start: date })),
    []
  );

  const handleEndDateChange = useCallback(
    (date: string) => setDateRange((prev) => ({ ...prev, end: date })),
    []
  );

  const applyFilter = () => {
    const isDate = isDateField(pendingFilter.column);

    if (isDate) {
      if (dateRange.start && dateRange.end) {
        const newFilter: Filter = {
          id: Math.random().toString(36).substr(2, 9),
          column: pendingFilter.column,
          operator: "between",
          value: `${dateRange.start}|${dateRange.end}`,
        };
        onFilterAdd(newFilter);
        setPendingFilter({
          column: columns[0]?.value || "",
          operator: operators[0]?.value || "contains",
          value: "",
        });
        setDateRange({ start: "", end: "" });
        setIsFilterPopoverOpen(false);
      }
    } else {
      if (pendingFilter.value.trim()) {
        const newFilter: Filter = {
          id: Math.random().toString(36).substr(2, 9),
          column: pendingFilter.column,
          operator: pendingFilter.operator,
          value: pendingFilter.value,
        };
        onFilterAdd(newFilter);
        setPendingFilter({
          column: columns[0]?.value || "",
          operator: operators[0]?.value || "contains",
          value: "",
        });
        setIsFilterPopoverOpen(false);
      }
    }
  };

  const getColumnLabel = (columnValue: string) => {
    return columns.find((col) => col.value === columnValue)?.label || columnValue;
  };

  const getOperatorLabel = (operatorValue: string) => {
    return operators.find((op) => op.value === operatorValue)?.label || operatorValue;
  };

  const formatFilterDisplay = (filter: Filter) => {
    if (filter.operator === "between") {
      const [start, end] = filter.value.split("|");
      const startDate = new Date(start).toLocaleDateString();
      const endDate = new Date(end).toLocaleDateString();
      return `${getColumnLabel(filter.column)} between ${startDate} and ${endDate}`;
    }
    return `${getColumnLabel(filter.column)} ${getOperatorLabel(filter.operator)} ${filter.value}`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onSearchChange && (
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          width="w-60"
        />
      )}

      {/* Applied Filter Chips */}
      {filters.map((filter) => (
        <div
          key={filter.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-bluegrey-100 rounded-full"
        >
          <span className="text-base text-bluegrey-900">
            {filter.operator === "between" ? (
              formatFilterDisplay(filter)
            ) : (
              <>
                {getColumnLabel(filter.column)} {getOperatorLabel(filter.operator)}{" "}
                <strong className="font-bold">{filter.value}</strong>
              </>
            )}
          </span>
          <button
            onClick={() => onFilterRemove(filter.id)}
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-bluegrey-500/10 transition-colors"
          >
            <X className="w-4 h-4 text-bluegrey-900" />
          </button>
        </div>
      ))}

      {/* Add Filter Popover */}
      <Popover
        open={isFilterPopoverOpen}
        onOpenChange={(open) => {
          setIsFilterPopoverOpen(open);
          if (open) {
            // Reset to initial state when opening
            resetFilterState();
          } else {
            // Clear state when closing
            setDateRange({ start: "", end: "" });
          }
        }}
      >
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1 px-3 py-1 bg-bluegrey-100 rounded-full hover:bg-bluegrey-200 transition-colors cursor-pointer">
            <PlusCircle className="w-5 h-5 text-bluegrey-900" />
            <span className="text-base text-bluegrey-900">Add filter</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-4 shadow-lg">
          <div className="flex flex-col gap-4">
            {/* Filter by - always shown */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1 w-60">
                <label className="text-sm text-bluegrey-900 leading-5">
                  Filter by
                </label>
                <Select
                  value={pendingFilter.column}
                  onValueChange={(value) => {
                    setPendingFilter((prev) => ({ ...prev, column: value }));
                    // Reset date range when column changes
                    setDateRange({ start: "", end: "" });
                    // Reinitialize date range if selecting a date field
                    if (value === "date" || value === "dateCreated") {
                      initializeDateRange();
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-11 px-2 border-bluegrey-500 rounded-sm">
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

            {/* Conditional rendering based on field type */}
            {isDateField(pendingFilter.column) ? (
              // Date range picker for date fields
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onApply={applyFilter}
                onCancel={() => setIsFilterPopoverOpen(false)}
              />
            ) : (
              // Standard operator and value inputs for non-date fields
              <div className="flex items-start gap-4">
                {/* Operator */}
                <div className="flex flex-col gap-1 w-32">
                  <label className="text-sm text-bluegrey-900 leading-5">
                    Operator
                  </label>
                  <Select
                    value={pendingFilter.operator}
                    onValueChange={(value) =>
                      setPendingFilter((prev) => ({ ...prev, operator: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-11 px-2 border-bluegrey-500 rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Value */}
                <div className="flex flex-col gap-1 w-60">
                  <label htmlFor="filter-value" className="text-sm text-bluegrey-900 leading-5">
                    Value
                  </label>
                  <input
                    id="filter-value"
                    name="filter-value"
                    type="text"
                    placeholder="Enter filter value"
                    value={pendingFilter.value}
                    onChange={(e) =>
                      setPendingFilter((prev) => ({ ...prev, value: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applyFilter();
                      }
                    }}
                    className="w-full h-11 px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-500 border border-bluegrey-500 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear All Filters */}
      {filters.length > 0 && (
        <button
          onClick={onClearFilters}
          className="text-base text-blue-500 hover:text-blue-600 underline transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
