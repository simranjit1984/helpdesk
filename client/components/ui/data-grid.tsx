import React, { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "./button";
import SearchBar from "../SearchBar";
import { Pagination } from "./pagination";
import { cn } from "@/lib/utils";

interface DataGridProps {
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onAddItem?: () => void;
  addButtonLabel?: string;
  showAddButton?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function DataGrid({
  children,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search items",
  onAddItem,
  addButtonLabel = "Add item",
  showAddButton = true,
  showSearch = true,
  showPagination = true,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  pageSizeOptions,
  className,
}: DataGridProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded bg-white",
        className,
      )}
    >
      {/* Toolbar */}
      {(showSearch || showAddButton) && (
        <div className="flex items-center justify-between gap-3 bg-white p-3">
          {/* Left Section - Search */}
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {showSearch && (
              <SearchBar
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                width="w-full sm:w-[400px]"
              />
            )}
          </div>

          {/* Right Section - Add Button */}
          {showAddButton && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={onAddItem}
                className="h-10 gap-2 rounded-sm bg-blue-500 px-3 text-sm font-medium text-bluegrey-25 hover:bg-blue-500/90"
              >
                <Plus className="h-5 w-5" />
                {addButtonLabel}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table Content */}
      <div className="flex flex-col">{children}</div>

      {/* Pagination */}
      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

export { Pagination };
