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
import { MultiSelect } from "@/components/ui/multi-select";

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

export interface ColumnOptions {
  [columnValue: string]: Array<{ value: string; label: string }>;
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
  columnOptions?: ColumnOptions;
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
  columnOptions = {},
}: FilterBarProps) {
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);
  const [pendingFilter, setPendingFilter] = useState({
    column: columns[0]?.value || "",
    operator: operators[0]?.value || "contains",
    value: "",
  });
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const isDateField = (column: string) => {
    return column === "date" || column === "dateCreated";
  };

  const hasColumnOptions = (column: string) => {
    return columnOptions[column] && columnOptions[column].length > 0;
  };

  const getOperatorsForColumn = (column: string) => {
    if (hasColumnOptions(column)) {
      return [
        { value: "is", label: "is" },
        { value: "isNot", label: "is not" },
      ];
    }
    return operators;
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
    setSelectedValues([]);
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
    const hasOptions = hasColumnOptions(pendingFilter.column);

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
    } else if (hasOptions) {
      if (selectedValues.length > 0) {
        const newFilter: Filter = {
          id: Math.random().toString(36).substr(2, 9),
          column: pendingFilter.column,
          operator: pendingFilter.operator,
          value: selectedValues.join(","),
        };
        onFilterAdd(newFilter);
        setPendingFilter({
          column: columns[0]?.value || "",
          operator: operators[0]?.value || "contains",
          value: "",
        });
        setSelectedValues([]);
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
      const parseDate = (dateStr: string) => {
        const str = dateStr.trim();
        if (str.includes("T")) {
          return new Date(str).toLocaleDateString();
        }
        return new Date(str.replace(" ", "T")).toLocaleDateString();
      };
      const startDate = parseDate(start);
      const endDate = parseDate(end);
      return `${getColumnLabel(filter.column)} between ${startDate} and ${endDate}`;
    }

    if (filter.operator === "is" || filter.operator === "isNot") {
      const values = filter.value.split(",").map((v) => {
        const option = columnOptions[filter.column]?.find((opt) => opt.value === v);
        return option?.label || v;
      }).join(", ");
      return `${getColumnLabel(filter.column)} ${getOperatorLabel(filter.operator)} ${values}`;
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
              <>
                {getColumnLabel(filter.column)} between{" "}
                <strong className="font-bold">
                  {(() => {
                    const startStr = filter.value.split("|")[0].trim();
                    const dateStr = startStr.includes("T") ? startStr : startStr.replace(" ", "T");
                    return new Date(dateStr).toLocaleDateString();
                  })()}
                </strong>{" "}
                and{" "}
                <strong className="font-bold">
                  {(() => {
                    const endStr = filter.value.split("|")[1].trim();
                    const dateStr = endStr.includes("T") ? endStr : endStr.replace(" ", "T");
                    return new Date(dateStr).toLocaleDateString();
                  })()}
                </strong>
              </>
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
        <PopoverContent
          align="start"
          className="w-auto p-0 rounded-sm"
          style={{
            boxShadow: '0 8px 10px 0 rgba(1, 5, 50, 0.14), 0 3px 14px 0 rgba(1, 5, 50, 0.12), 0 4px 5px 0 rgba(1, 5, 50, 0.20)'
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && isMultiSelectOpen) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div className="flex flex-col gap-4 p-4">
            {/* Conditional rendering based on field type */}
            {hasColumnOptions(pendingFilter.column) ? (
              // Multi-select for columns with predefined options
              <>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1 w-60">
                    <label className="text-sm text-bluegrey-900 leading-5 font-normal">
                      Filter by
                    </label>
                    <Select
                      value={pendingFilter.column}
                      onValueChange={(value) => {
                        const firstOperator = getOperatorsForColumn(value)[0]?.value || "contains";
                        setPendingFilter((prev) => ({ ...prev, column: value, operator: firstOperator }));
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

                  {/* Operator for multi-select */}
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

                  {/* Multi-select value picker - same row */}
                  <div className="flex flex-col gap-1 w-60">
                    <MultiSelect
                      label="Values"
                      options={columnOptions[pendingFilter.column] || []}
                      selectedValues={selectedValues}
                      onChange={setSelectedValues}
                      placeholder=" "
                      onOpenChange={setIsMultiSelectOpen}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end items-start gap-4">
                  <button
                    onClick={() => setIsFilterPopoverOpen(false)}
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
            ) : isDateField(pendingFilter.column) ? (
              // Date range picker for date fields
              <>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1 w-60">
                    <label className="text-sm text-bluegrey-900 leading-5 font-normal">
                      Filter by
                    </label>
                    <Select
                      value={pendingFilter.column}
                      onValueChange={(value) => {
                        const firstOperator = getOperatorsForColumn(value)[0]?.value || "between";
                        setPendingFilter((prev) => ({ ...prev, column: value, operator: firstOperator }));
                        setDateRange({ start: "", end: "" });
                        if (value === "date" || value === "dateCreated") {
                          initializeDateRange();
                        }
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
                  onCancel={() => setIsFilterPopoverOpen(false)}
                />
              </>
            ) : (
              // Standard operator and value inputs for non-date fields
              <>
                <div className="flex items-start gap-4">
                  {/* Filter by */}
                  <div className="flex flex-col gap-1 w-60">
                    <label className="text-sm text-bluegrey-900 leading-5 font-normal">
                      Filter by
                    </label>
                    <Select
                      value={pendingFilter.column}
                      onValueChange={(value) => {
                        const firstOperator = getOperatorsForColumn(value)[0]?.value || "contains";
                        setPendingFilter((prev) => ({ ...prev, column: value, operator: firstOperator }));
                        setDateRange({ start: "", end: "" });
                        if (value === "date" || value === "dateCreated") {
                          initializeDateRange();
                        }
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

                  {/* Operator */}
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
                    <label htmlFor="filter-value" className="text-sm text-bluegrey-900 leading-5 font-normal">
                      Value
                    </label>
                    <input
                      id="filter-value"
                      name="filter-value"
                      type="text"
                      placeholder=" "
                      value={pendingFilter.value}
                      onChange={(e) =>
                        setPendingFilter((prev) => ({ ...prev, value: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          applyFilter();
                        }
                      }}
                      className="w-full h-11 px-2 py-3 text-sm text-bluegrey-900 placeholder:text-bluegrey-500 border border-[#5D607E] rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-normal"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end items-start gap-4">
                  <button
                    onClick={() => setIsFilterPopoverOpen(false)}
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
