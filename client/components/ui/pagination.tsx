import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        "flex h-[68px] items-center justify-between gap-4 bg-white px-4 py-3",
        className,
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-bluegrey-900">
            Items per page:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-11 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-11 w-px rounded-sm bg-bluegrey-100" />

        <span className="text-sm text-bluegrey-500">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in total
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Select
            value={String(currentPage)}
            onValueChange={(value) => onPageChange(Number(value))}
            disabled={totalPages <= 1}
          >
            <SelectTrigger
              className={cn(
                "h-11 w-[70px]",
                totalPages <= 1 &&
                  "bg-bluegrey-25 border-bluegrey-100 text-bluegrey-400 cursor-not-allowed",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <SelectItem key={page} value={String(page)}>
                    {page}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <span className="text-sm font-medium text-bluegrey-900">
            of {totalPages} page{totalPages !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="h-11 w-px rounded-sm bg-bluegrey-100" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-50"
            aria-label="First page"
          >
            <ChevronsLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-50"
            aria-label="Last page"
          >
            <ChevronsRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
